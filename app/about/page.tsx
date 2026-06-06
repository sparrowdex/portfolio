'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function About() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [panelTab, setPanelTab] = useState<number | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (activeTab !== null) {
      timeoutId = setTimeout(() => {
        setPanelTab(activeTab);
      }, 1200);
    } else {
      setPanelTab(null);
    }
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  const activeIdx = activeTab !== null ? activeTab : hoveredItem;

  const mindmapConfig = useMemo(() => {
    if (activeIdx === 0) {
      return {
        centerX: 55,
        centerY: 30,
        color: '#ff3366',
        rotation: 100, // Set this value to rotate the entire pink mindmap structure (e.g. -15 or 15)
        skills: [
          { name: 'Next.js', dx: -5, dy: -20 },
          { name: 'React.js', dx: -17, dy: -16 },
          { name: 'Three.js', dx: -26, dy: -6 },
          { name: 'R3F', dx: -24, dy: 4 },
          { name: 'Framer Motion', dx: -18, dy: 14 },
          { name: 'GSAP', dx: -8, dy: 20 }
        ]
      };
    }
    if (activeIdx === 1) {
      return {
        centerX: 48,
        centerY: 52,
        color: '#ff7700',
        rotation: 0, // Set this value to rotate the entire orange mindmap structure
        skills: [
          { name: 'Node.js', dx: -16, dy: -15 },
          { name: 'Express', dx: -24, dy: -6 },
          { name: 'PostgreSQL', dx: -26, dy: 6 },
          { name: 'Prisma', dx: -20, dy: 16 },
          { name: 'Firebase', dx: -8, dy: -20 },
          { name: 'Python', dx: 8, dy: -18 }
        ]
      };
    }
    if (activeIdx === 2) {
      return {
        centerX: 55,
        centerY: 70,
        color: '#00d2ff',
        rotation: 0, // Set this value to rotate the entire blue mindmap structure
        skills: [
          { name: 'Data Science', dx: 12, dy: -12 },
          { name: 'NLP', dx: 17, dy: -3 },
          { name: 'Machine Learning', dx: 18, dy: 16 },
          { name: 'UX Research', dx: -3, dy: -15 },
          { name: 'Interaction Design', dx: -25, dy: -2 }
        ]
      };
    }
    return null;
  }, [activeIdx]);

  /* Mapped resume data sections matching the resume image */
  const resumeSections = [
    {
      title: 'Frontend & Animation',
      short: 'Crafting rich, interactive visual experiences using Next.js, WebGL (Three.js/R3F), and fluid kinetic physics with Framer Motion.',
      skills: ['Next.js', 'React.js', 'Three.js', 'React Three Fiber', 'Framer Motion', 'GSAP', 'HTML/CSS'],
      projects: [
        {
          name: 'The Diecast Store',
          desc: 'Architected a fully functional, serverless full-stack e-commerce platform tailored for diecast hobbyists. Engineered a premium, responsive UI featuring Bento Grid layouts and fluid animations, successfully integrating Razorpay & Shiprocket payment and shipping gateways.',
          tech: 'Next.js, TypeScript, Prisma, Framer Motion',
          link: 'http://www.thediecaststore.in'
        },
        {
          name: 'Christmas Spirit',
          desc: 'Engineered an interactive web app featuring real-time microphone-triggered snowfall effects and cross-platform motion detection. Secured a Top 10 Finish out of 90 individuals in the 4-hour Girls Leading Tech Hackathon.',
          tech: 'JavaScript, Web Audio API, DeviceMotionEvent'
        }
      ]
    },
    {
      title: 'Backend & Cloud Systems',
      short: 'Architecting performant APIs, relational database schemas, and scalable serverless backends powered by Node.js, Prisma, and PostgreSQL.',
      skills: ['Node.js', 'Express', 'PostgreSQL (Neon)', 'Prisma ORM', 'Firebase', 'Python', 'SQL', 'TypeScript', 'JavaScript (ES6+)'],
      projects: [
        {
          name: 'Inner Voice (Mental Health AI Startup)',
          desc: 'Architected a full-stack wellness platform utilizing Next.js and Firebase, designing an anonymous interaction model to ensure emotional support and accessible UX.',
          tech: 'Next.js, Firebase'
        }
      ]
    },
    {
      title: 'Experience & Achievements',
      short: 'Founder of Inner Voice, National Informatics Centre intern, and B.Tech honors student building human-centric software solutions.',
      education: {
        school: 'SRM Institute of Science & Technology',
        degree: 'Bachelor of Technology in Computer Science (Core) | Aug 2023 - May 2027',
        metrics: 'CGPA: 8.95 | Delhi-NCR, India'
      },
      experience: [
        {
          role: 'Founder & Lead Developer',
          company: 'Inner Voice (Mental Health AI Startup) | July 2025 - Present',
          bullets: [
            'Architected a full-stack wellness platform utilizing Next.js and Firebase, designing an anonymous interaction model to ensure emotional support and accessible UX.',
            'Engineered a custom "Trusted Friends" network with complex boundary-setting logic. This feature enables supporters to visually manage their emotional availability and mitigate burnout without explicit refusal.',
            'Guided the product roadmap with a strong emphasis on UX research, interaction design, and planning migrations to proprietary LLMs.'
          ]
        },
        {
          role: 'Web Development Intern',
          company: 'National Informatics Centre (NIC) | June 2025 - July 2025',
          bullets: [
            'Executed an 8-week internship within the e-Office Project Division, directly contributing to the digitalization of government workflows.',
            'Evaluated the product suite architecture to identify UI optimizations for secure, large-scale document management systems.'
          ]
        }
      ],
      achievements: [
        {
          name: 'IBM Data Science Professional Certificate',
          desc: 'Completed March 2026. Specialized in Data Visualization, Machine Learning, and SQL-driven EDA.'
        },
        {
          name: 'NPTEL Certification in Natural Language Processing',
          desc: 'Specialized in text processing, language modeling, syntactic parsing, and semantic analysis concepts.'
        },
        {
          name: 'Technical Volunteer (BAJSS)',
          desc: 'Mentored 20+ adolescent girls in coding (Scratch, VSCode) and digital literacy workshops to bridge the technical proficiency gap.'
        }
      ],
      skills: ['Data Science', 'Natural Language Processing', 'Data Visualization', 'Machine Learning', 'SQL-driven EDA', 'UX Research', 'Interaction Design']
    }
  ];

  /* All skills categories categorized for the consolidated view */
  const allSkillsCategories = [
    {
      category: 'Frontend & Animation',
      skills: ['Next.js', 'React.js', 'Three.js', 'React Three Fiber', 'Framer Motion', 'GSAP', 'HTML/CSS']
    },
    {
      category: 'Backend & Cloud',
      skills: ['Node.js', 'Express', 'PostgreSQL (Neon)', 'Prisma ORM', 'Firebase']
    },
    {
      category: 'Languages',
      skills: ['JavaScript (ES6+)', 'TypeScript', 'Python', 'SQL']
    },
    {
      category: 'Design & Tools',
      skills: ['Figma', 'Canva', 'UI/UX Prototyping', 'Git/GitHub', 'Postman']
    }
  ];



  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">

      {/* ── Custom Animations for the Mindmap ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes line-crawl {
          to {
            stroke-dashoffset: -20;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.8;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translate(-50%, -30%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        .mindmap-line {
          stroke-dasharray: 4, 4;
          animation: line-crawl 1.5s linear infinite;
        }
        .pulse-dot {
          transform-origin: center;
          animation: pulse-glow 2s infinite ease-in-out;
        }
        .skill-node-tag {
          animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* ── Page Entrance Animations ── */
        @keyframes about-entrance {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes her-entrance {
          0% {
            opacity: 0;
            transform: translateX(-120px) scale(0.7);
          }
          30% {
            opacity: 0;
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes pillar-entrance {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes flower-entrance {
          from {
            opacity: 0;
            transform: scale(0.97) translate(1%, 1%);
          }
          to {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
        .animate-about {
          animation: about-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-her {
          animation: her-entrance 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pillar {
          opacity: 0;
          animation: pillar-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-flower {
          opacity: 0;
          animation: flower-entrance 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* ── Flower Accent & Mindmap ── */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 bottom-0 md:left-auto md:translate-x-0 md:top-auto md:translate-y-0 md:right-[5%] md:bottom-[-6%] w-[130vw] h-[130vw] md:w-[55vw] md:h-[55vw] max-w-[750px] max-h-[750px] opacity-80 md:opacity-95 pointer-events-none select-none z-0 transition-all duration-700 animate-flower origin-bottom"
        style={{ animationDelay: '0.8s' }}
      >
        <div className="relative w-full h-full">
          {/* Mobile Clickable Tags */}
          <div className="absolute inset-0 z-30 md:hidden pointer-events-auto flex flex-col justify-center items-center">
             <button onClick={() => setActiveTab(0)} className={`absolute top-[20%] left-[50%] -translate-x-1/2 bg-black/60 border border-[#ff3366]/50 text-[#ff3366] px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest backdrop-blur-md transition-opacity ${activeTab !== null && activeTab !== 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>FRONTEND</button>
             <button onClick={() => setActiveTab(1)} className={`absolute top-[45%] left-[50%] -translate-x-1/2 bg-black/60 border border-[#ff7700]/50 text-[#ff7700] px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest backdrop-blur-md transition-opacity ${activeTab !== null && activeTab !== 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>BACKEND</button>
             <button onClick={() => setActiveTab(2)} className={`absolute top-[70%] left-[50%] -translate-x-1/2 bg-black/60 border border-[#00d2ff]/50 text-[#00d2ff] px-4 py-1.5 rounded-full font-mono text-[10px] tracking-widest backdrop-blur-md transition-opacity ${activeTab !== null && activeTab !== 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>EXPERIENCE</button>
          </div>
          {/* SVG Canvas for Lines (Layered behind the flower images) */}
          {mindmapConfig && (
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ overflow: 'visible' }}>
              {/* Center glowing circle */}
              <circle
                cx={`${mindmapConfig.centerX}%`}
                cy={`${mindmapConfig.centerY}%`}
                r="6"
                fill={mindmapConfig.color}
                className="opacity-60"
              />
              <circle
                cx={`${mindmapConfig.centerX}%`}
                cy={`${mindmapConfig.centerY}%`}
                r="3"
                fill="#ffffff"
              />

              {mindmapConfig.skills.map((skill) => {
                const rad = ((mindmapConfig.rotation || 0) * Math.PI) / 180;
                const rotatedDx = skill.dx * Math.cos(rad) - skill.dy * Math.sin(rad);
                const rotatedDy = skill.dx * Math.sin(rad) + skill.dy * Math.cos(rad);
                const targetX = mindmapConfig.centerX + rotatedDx;
                const targetY = mindmapConfig.centerY + rotatedDy;
                return (
                  <g key={skill.name}>
                    {/* Dashed Connector Line */}
                    <line
                      x1={`${mindmapConfig.centerX}%`}
                      y1={`${mindmapConfig.centerY}%`}
                      x2={`${targetX}%`}
                      y2={`${targetY}%`}
                      stroke={mindmapConfig.color}
                      strokeWidth="1"
                      className="mindmap-line opacity-40"
                    />
                    {/* Endpoint Dot */}
                    <circle
                      cx={`${targetX}%`}
                      cy={`${targetY}%`}
                      r="2.5"
                      fill={mindmapConfig.color}
                      className="opacity-80"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Base grayscale flower */}
          <img
            src="/images/flower.svg"
            alt="Flower Base"
            className="w-full h-full object-contain relative z-10"
          />

          {/* Top Flower Layer (Red) */}
          <img
            src="/images/flower_red.svg"
            alt="Top Flower Colored"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 z-10"
            style={{
              opacity: (activeTab === 0 || (activeTab === null && hoveredItem === 0)) ? 1 : 0
            }}
          />

          {/* Middle Flower Layer (Orange) */}
          <img
            src="/images/flower_orange.svg"
            alt="Middle Flower Colored"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 z-10"
            style={{
              opacity: (activeTab === 1 || (activeTab === null && hoveredItem === 1)) ? 1 : 0
            }}
          />

          {/* Bottom Flower Layer (Blue) */}
          <img
            src="/images/flower_blue.svg"
            alt="Bottom Flower Colored"
            className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 z-10"
            style={{
              opacity: (activeTab === 2 || (activeTab === null && hoveredItem === 2)) ? 1 : 0
            }}
          />

          {/* HTML Tags for Skill Labels (Layered on top of the flower images) */}
          {mindmapConfig && (
            <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
              {mindmapConfig.skills.map((skill, sIdx) => {
                const rad = ((mindmapConfig.rotation || 0) * Math.PI) / 180;
                const rotatedDx = skill.dx * Math.cos(rad) - skill.dy * Math.sin(rad);
                const rotatedDy = skill.dx * Math.sin(rad) + skill.dy * Math.cos(rad);
                const targetX = mindmapConfig.centerX + rotatedDx;
                const targetY = mindmapConfig.centerY + rotatedDy;
                return (
                  <div
                    key={skill.name}
                    className="absolute skill-node-tag"
                    style={{
                      left: `${targetX}%`,
                      top: `${targetY}%`,
                      animationDelay: `${sIdx * 0.08}s`,
                      opacity: 0,
                    }}
                  >
                    <div
                      className="px-2 py-0.5 bg-black/90 border backdrop-blur-md text-[9px] font-mono whitespace-nowrap"
                      style={{
                        borderColor: `${mindmapConfig.color}33`,
                        boxShadow: `0 0 10px ${mindmapConfig.color}11`,
                        color: '#e2e8f0'
                      }}
                    >
                      {skill.name}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Ultra-subtle CRT scan-line overlay ── */}
      <div
        className="absolute inset-0 z-30 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.06) 1px, rgba(255,255,255,0.06) 2px)',
          backgroundSize: '100% 3px',
        }}
      />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-20 pt-10 px-6 pb-4 md:p-12 flex justify-end items-center pointer-events-none">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white/5 border border-white/15 hover:border-white/60 transition-all duration-500 text-xs tracking-widest text-white/70 hover:text-white backdrop-blur-md font-mono pointer-events-auto"
        >
          &larr; BACK
        </Link>
      </header>

      {/* ── Left Side: Core Interactive Menu ── */}
      <div className="absolute inset-0 z-10 flex items-start md:items-center p-8 pt-28 md:p-24 pointer-events-none">
        <div className="max-w-md w-full flex flex-col pointer-events-auto">

          <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-white leading-[1.1] mb-6 flex items-baseline select-none">
            <span className="inline-block animate-about">
              About
            </span>
            <span className="inline-block animate-her font-playfair italic text-[#e2e8f0] tracking-wide font-normal ml-3 relative z-[-1]">
              Her
            </span>
          </h1>

          <p className="text-[11px] font-mono text-white/40 tracking-wider mb-8 uppercase leading-relaxed hidden md:block">
            Select a pillar below to inspect credentials, or click the button below to view all technical skills.
          </p>

          {/* Interactive Menu Items */}
          <div className="space-y-6 hidden md:block">
            {resumeSections.map((sec, idx) => {
              const isActive = activeTab === idx;
              const accentColors = [
                { border: 'border-[#ff3366]/80 bg-[#ff3366]/5', text: 'text-[#ff3366]' },
                { border: 'border-[#ff7700]/80 bg-[#ff7700]/5', text: 'text-[#ff7700]' },
                { border: 'border-[#00d2ff]/80 bg-[#00d2ff]/5', text: 'text-[#00d2ff]' },
              ];
              const curAccent = accentColors[idx];
              return (
                <button
                  key={sec.title}
                  onMouseEnter={() => setHoveredItem(idx)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    setActiveTab(isActive ? null : idx);
                    setShowAllSkills(false);
                  }}
                  className={`w-full text-left border-l pl-6 py-3 transition-all duration-500 group focus:outline-none animate-pillar ${isActive
                    ? curAccent.border
                    : 'border-white/10 hover:border-white/40 hover:bg-white/[0.01]'
                    }`}
                  style={{ animationDelay: `${1.1 + idx * 0.2}s` }}
                >
                  <h3 className={`font-mono text-xs tracking-widest uppercase mb-2 transition-all duration-300 transform group-hover:translate-x-1 ${isActive ? curAccent.text : 'text-white/40 group-hover:text-white/80'
                    }`}>
                    {sec.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-neutral-500 group-hover:text-neutral-300 font-sans transition-all duration-300 transform group-hover:translate-x-1">
                    {sec.short}
                  </p>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setShowAllSkills(!showAllSkills);
              setActiveTab(null);
            }}
            className={`mt-8 self-start px-6 py-3 border font-mono text-[10px] tracking-wider uppercase transition-all duration-500 animate-pillar hidden md:block ${showAllSkills
              ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/5'
              : 'border-white/10 text-white/50 hover:border-white/40 hover:text-white'
              }`}
            style={{ animationDelay: '1.7s' }}
          >
            {showAllSkills ? 'Hide All Skills' : 'View All Skills Dashboard'}
          </button>

        </div>
      </div>

      {/* ── Sliding Panel: Detailed Credentials ── */}
      <div
        className={`absolute bottom-0 md:top-0 right-0 h-screen w-full md:w-[600px] bg-[#0c0c0c]/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/[0.08] z-30 transition-all duration-700 ease-in-out p-8 pt-16 md:p-16 overflow-y-auto ${
          panelTab !== null 
            ? 'translate-y-0 md:translate-y-0 md:translate-x-0' 
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
        }`}
      >
        {panelTab !== null && (
          <div className="relative h-full flex flex-col justify-between text-white font-sans">

            {/* Close Button */}
            <button
              onClick={() => setActiveTab(null)}
              className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center border border-white/15 hover:border-white/50 rounded-full text-white/50 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-8 pr-2">
              {/* Category Title */}
              <div>
                <span className={`font-mono text-[9px] tracking-[0.25em] uppercase transition-colors duration-300 ${panelTab === 0 ? 'text-[#ff3366]' : panelTab === 1 ? 'text-[#ff7700]' : 'text-[#00d2ff]'
                  }`}>
                  Pillar 0{panelTab + 1}
                </span>
                <h2 className="text-3xl font-light tracking-tight mt-1 text-[#e2e8f0]">
                  {resumeSections[panelTab].title}
                </h2>
              </div>

              {/* SECTION: SKILLS */}
              {resumeSections[panelTab].skills && (
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3">Tech Stack & Skills</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {resumeSections[panelTab].skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3.5 py-1.5 bg-white/5 border border-white/[0.08] hover:border-white/30 text-white/80 hover:text-white rounded-none font-mono text-[11px] transition-all duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: PROJECTS */}
              {resumeSections[panelTab].projects && (
                <div className="space-y-6">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">Featured Projects</h4>
                  {resumeSections[panelTab].projects.map((proj) => (
                    <div key={proj.name} className="border-t border-white/[0.06] pt-4">
                      <div className="flex justify-between items-baseline">
                        <h5 className="text-sm font-medium text-white/95">{proj.name}</h5>
                        <span className="font-mono text-[10px] text-white/30">{proj.tech}</span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-neutral-400 mt-2">
                        {proj.desc}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: EDUCATION (for Tab 2) */}
              {panelTab === 2 && resumeSections[panelTab].education && (
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3">Education</h4>
                  <div className="border-t border-white/[0.06] pt-4">
                    <h5 className="text-sm font-medium text-white/95">{resumeSections[panelTab].education.school}</h5>
                    <p className="text-[12px] text-neutral-400 mt-1 font-mono text-[11px]">{resumeSections[panelTab].education.degree}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{resumeSections[panelTab].education.metrics}</p>
                  </div>
                </div>
              )}

              {/* SECTION: PROFESSIONAL EXPERIENCE (for Tab 2) */}
              {panelTab === 2 && resumeSections[panelTab].experience && (
                <div className="space-y-6">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">Experience</h4>
                  {resumeSections[panelTab].experience.map((exp) => (
                    <div key={exp.company} className="border-t border-white/[0.06] pt-4">
                      <h5 className="text-sm font-medium text-white/95">{exp.role}</h5>
                      <span className="font-mono text-[10px] mt-0.5 block transition-colors duration-300 text-[#00d2ff]/80">
                        {exp.company}
                      </span>
                      <ul className="list-disc pl-4 mt-2.5 space-y-1.5">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="text-[12px] leading-relaxed text-neutral-400">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* SECTION: ACHIEVEMENTS & CERTIFICATIONS (for Tab 2) */}
              {panelTab === 2 && resumeSections[panelTab].achievements && (
                <div className="space-y-4">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">Achievements & Certs</h4>
                  <div className="border-t border-white/[0.06] pt-4 space-y-4">
                    {resumeSections[panelTab].achievements.map((ach, achIdx) => (
                      <div key={achIdx}>
                        <h5 className="text-[13px] font-medium text-white/90">{ach.name}</h5>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{ach.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


          </div>
        )}
      </div>

      {/* ── Consolidated Skills Dashboard Overlay ── */}
      <div
        className={`absolute inset-0 bg-black/90 backdrop-blur-2xl z-40 transition-all duration-700 flex flex-col justify-between p-12 md:p-24 ${showAllSkills ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}
      >
        {/* Dashboard Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <h2 className="text-4xl font-extralight text-white">
              Sreeja Das <span className="font-playfair italic text-white/60">Skills</span>
            </h2>
          </div>
          <button
            onClick={() => setShowAllSkills(false)}
            className="w-10 h-10 flex items-center justify-center border border-white/15 hover:border-white/50 rounded-full text-white/50 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dashboard Grid Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-8 overflow-y-auto pr-2 no-scrollbar">
          {allSkillsCategories.map((cat, idx) => (
            <div key={cat.category} className="border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-500 group">
              <div>
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest block mb-4">
                  0{idx + 1} {cat.category.split(' ')[0]}
                </span>
                <h3 className="text-xl font-light text-white mb-6 group-hover:text-[#39ff14] transition-colors duration-500">
                  {cat.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-white/5 border border-white/[0.04] text-white/70 font-mono text-[10px] hover:text-[#39ff14] hover:border-[#39ff14]/30 transition-all duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Footer / Contact Info */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 font-mono text-[10px]">
          <div className="flex gap-6">
            <span>EMAIL: sreejadas0405@gmail.com</span>
            <span>PHONE: +91 7428437763</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#39ff14] transition-colors">GITHUB</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#39ff14] transition-colors">LINKEDIN</a>
          </div>
        </div>
      </div>



    </main>
  );
}
