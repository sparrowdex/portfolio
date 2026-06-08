"use client";

import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import assistantData from '../data/assistantKnowledge.json';

const SYNONYMS: Record<string, string> = {
  "difficulties": "challenge",
  "hardest part": "challenge",
  "hurdles": "challenge",
  "bugs": "challenge",
  "challenges": "challenge",
  "stack": "tech stack",
  "frameworks": "tech stack",
  "technologies": "tech stack",
  "pitch": "summary",
  "about": "summary",
};

// Simple text parser to handle bold (**text**) and links ([text](url))
const parseMarkdownText = (text: string) => {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);

  return parts.map((part, i) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return (
        <a
          key={i}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline decoration-white/30 hover:decoration-white transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, j) => {
      const boldMatch = bPart.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        return <strong key={`${i}-${j}`} className="font-bold text-white">{boldMatch[1]}</strong>;
      }
      return <span key={`${i}-${j}`}>{bPart.split('\n').map((line, k, arr) => (
        <React.Fragment key={k}>
          {line}
          {k < arr.length - 1 && <br />}
        </React.Fragment>
      ))}</span>;
    });
  });
};

const TypewriterMessage = ({ content, speed = 15, onComplete }: { content: string, speed?: number, onComplete?: () => void }) => {
  const [displayed, setDisplayed] = useState('');

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed(content.slice(0, i));
      i++;
      if (i > content.length) {
        clearInterval(interval);
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [content, speed]);

  return <>{parseMarkdownText(displayed)}</>;
};

export const InfoIndexAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! What would you like to know about my projects?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js
  const fuse = new Fuse(assistantData, {
    keys: [
      { name: 'projectId', weight: 3 },
      { name: 'tags', weight: 2 },
      { name: 'question', weight: 1 }
    ],
    threshold: 0.6,
    ignoreLocation: true,
    includeScore: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const sendQuery = (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMsg = userText.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    let processedMsg = userMsg.toLowerCase();
    
    // Direct intercepts for the suggestion buttons to guarantee a 100% exact match
    if (processedMsg === "what was the tech stack?") processedMsg = "tech stack";
    if (processedMsg === "what were the challenges?") processedMsg = "challenge";
    if (processedMsg === "how did you build it?") processedMsg = "process";
    if (processedMsg === "what is the pitch?") processedMsg = "summary";

    Object.entries(SYNONYMS).forEach(([synonym, replacement]) => {
      processedMsg = processedMsg.replace(new RegExp(`\\b${synonym}\\b`, 'gi'), replacement);
    });

    const projectKeywords = ['photobooth', 'inner voice', 'innervoice', 'diecast', 'diecast store', 'diecaststore', 'armatrix', 'flowers for beloved', 'flowers', 'flowersforbeloved', 'spice vault', 'spicevault', 'timeless', 'snow globe', 'snowglobe'];
    let detectedProject = projectKeywords.find(p => processedMsg.includes(p));

    let newActiveProject = activeProject;
    if (detectedProject) {
      newActiveProject = detectedProject;
      setActiveProject(detectedProject);
    }

    const lastAssistantMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const wasAskedToClarify = lastAssistantMsg && lastAssistantMsg.content.includes("Which project are you curious about?");

    let searchQuery = processedMsg;
    if (wasAskedToClarify && !detectedProject) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      searchQuery = `${lastUserMsg} ${processedMsg}`;
    }

    // Filter the knowledge base to only general questions + the active project's questions
    let filteredData = assistantData;
    if (newActiveProject) {
      const mappedId = newActiveProject.replace(/\s+/g, '');
      
      // Filter data to only include the active project and general items (but exclude the vague catcher since we already know the project context!)
      filteredData = assistantData.filter((item: any) => {
        if (item.projectId === mappedId) return true;
        if (item.projectId === 'general' && !item.question.includes('Vague Project Question Catcher')) return true;
        return false;
      });
      
      // Remove the project keyword from the query so it doesn't skew results
      searchQuery = searchQuery.replace(new RegExp(newActiveProject, 'gi'), '').trim();
      
      // If the user just typed the project name, default to searching for its summary
      if (searchQuery === '') {
        searchQuery = 'summary';
      }
    }

    // Create a dynamic Fuse instance with the filtered data
    const dynamicFuse = new Fuse(filteredData, {
      keys: [
        { name: 'tags', weight: 2 },
        { name: 'question', weight: 1 }
      ],
      threshold: 0.6,
      ignoreLocation: true,
      includeScore: true,
    });

    const results = dynamicFuse.search(searchQuery);

    setTimeout(() => {
      if (results.length > 0 && results[0].score && results[0].score < 0.6) {
        setMessages(prev => [...prev, { role: 'assistant', content: results[0].item.answer }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I haven't been programmed with an answer for that yet! Try asking me about my **experience**, my **design philosophy**, or dive into the **tech stack** and **challenges** behind my projects." 
        }]);
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className={`${isExpanded ? 'w-[90vw] h-[85vh] md:w-[70vw]' : 'w-80 sm:w-96 h-[500px] max-h-[80vh]'} flex flex-col bg-neutral-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 opacity-100`}>

          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-white font-bold tracking-wide uppercase text-sm">Information Index</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Ask about my projects</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${isExpanded ? 'max-w-[70%]' : 'max-w-[85%]'} ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
              >
                <span className="text-[10px] text-neutral-500 font-mono uppercase mb-1 px-1">
                  {msg.role === 'user' ? 'You' : 'Index'}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-white/10 text-white rounded-tr-sm border border-white/5'
                    : 'bg-transparent text-neutral-300 rounded-tl-sm border border-white/10'
                    }`}
                >
                  {msg.role === 'assistant' && idx > 0 ? (
                    idx === messages.length - 1 && isTyping ? (
                      <TypewriterMessage 
                        content={msg.content} 
                        onComplete={() => setIsTyping(false)} 
                      />
                    ) : (
                      parseMarkdownText(msg.content)
                    )
                  ) : (
                    msg.role === 'user' ? msg.content : parseMarkdownText(msg.content)
                  )}
                </div>
                
                {msg.role === 'assistant' && idx === messages.length - 1 && !isTyping && activeProject && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={() => sendQuery("What was the tech stack?")} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/5 transition-colors font-mono">Tech Stack</button>
                    <button onClick={() => sendQuery("What were the challenges?")} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/5 transition-colors font-mono">Challenges</button>
                    <button onClick={() => sendQuery("How did you build it?")} className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/5 transition-colors font-mono">Process</button>
                  </div>
                )}
              </div>
            ))}
            {isTyping && messages[messages.length - 1].role === 'user' && (
               <div className="self-start px-4 py-3 bg-transparent text-neutral-500 rounded-2xl border border-white/5 text-sm flex gap-1">
                 <span className="animate-pulse">.</span><span className="animate-pulse delay-75">.</span><span className="animate-pulse delay-150">.</span>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-neutral-950">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={activeProject ? `Ask about ${activeProject}...` : "Type your question..."}
                disabled={isTyping}
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors font-mono disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-white text-black px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white p-4 rounded-full shadow-2xl hover:border-white/30 transition-all duration-300 group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-white text-neutral-400 group-hover:text-black transition-colors shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-[300px] group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out flex items-center">
            <span className="font-mono text-xs uppercase tracking-widest font-bold whitespace-nowrap">Too lazy to read? Index</span>
          </div>
        </button>
      )}
    </div>
  );
};
