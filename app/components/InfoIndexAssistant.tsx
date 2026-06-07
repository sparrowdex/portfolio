"use client";

import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import assistantData from '../data/assistantKnowledge.json';

// Simple text parser to handle bold (**text**) and links ([text](url))
const parseMarkdownText = (text: string) => {
  // First handle links
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

    // Handle bold within text parts
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, j) => {
      const boldMatch = bPart.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        return <strong key={`${i}-${j}`} className="font-bold text-white">{boldMatch[1]}</strong>;
      }
      // Handle newlines
      return <span key={`${i}-${j}`}>{bPart.split('\n').map((line, k, arr) => (
        <React.Fragment key={k}>
          {line}
          {k < arr.length - 1 && <br />}
        </React.Fragment>
      ))}</span>;
    });
  });
};

export const InfoIndexAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! What would you like to know about my projects?' }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse.js
  const fuse = new Fuse(assistantData, {
    keys: [
      { name: 'tags', weight: 2 },
      { name: 'question', weight: 1 }
    ],
    threshold: 0.6, // More lenient matching for natural language sentences
    ignoreLocation: true, // Don't penalize if the match is at the end
    includeScore: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');

    // Handle conversational context for vague questions
    const lastAssistantMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    const wasAskedToClarify = lastAssistantMsg && lastAssistantMsg.content.includes("Which project are you curious about?");
    
    let searchQuery = userMsg;
    if (wasAskedToClarify) {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
      searchQuery = `${lastUserMsg} ${userMsg}`;
    }

    // Search for answer
    const results = fuse.search(searchQuery);

    setTimeout(() => {
      // Changed threshold check to 0.6 to match the new leniency
      if (results.length > 0 && results[0].score && results[0].score < 0.6) {
        // Found a good match
        setMessages(prev => [...prev, { role: 'assistant', content: results[0].item.answer }]);
      } else {
        // Fallback
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I haven't been programmed with an answer for that yet! Try asking me about my **experience**, my **design philosophy**, or dive into the **tech stack** and **challenges** behind my projects." 
        }]);
      }
    }, 400); // Small delay to feel more natural
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div className="w-80 sm:w-96 h-[500px] max-h-[80vh] flex flex-col bg-neutral-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100 opacity-100">

          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <div>
              <h3 className="text-white font-bold tracking-wide uppercase text-sm">Information Index</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Ask about my projects</p>
            </div>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
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
                  {msg.role === 'user' ? msg.content : parseMarkdownText(msg.content)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-neutral-950">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={!input.trim()}
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
