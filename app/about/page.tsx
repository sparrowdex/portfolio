'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────── 3D PEDESTAL SCENE ─────────────────── */
function PedestalScene({
  hoveredItem,
  setHoveredItem,
  activeTab,
  setActiveTab,
  showAllSkills,
  setShowAllSkills
}: {
  hoveredItem: number | null;
  setHoveredItem: (val: number | null) => void;
  activeTab: number | null;
  setActiveTab: (val: number | null) => void;
  showAllSkills: boolean;
  setShowAllSkills: (val: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const structureRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const time = performance.now() * 0.001;
    if (structureRef.current) {
      // Rotate faster if hovered or active
      const rotSpeed = hoveredItem !== null || activeTab !== null ? 0.6 : 0.25;
      structureRef.current.rotation.y = time * rotSpeed;
    }
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = -1.2 + Math.sin(time * 1.5) * 0.05;
    }

    const currentActive = activeTab !== null ? activeTab : hoveredItem;
    
    // Scale animations
    const targetCylinder = currentActive === 1 ? 1.1 : 0.03;
    const targetSphere = currentActive === 2 ? 1.1 : 0.03;
    const targetTorus = currentActive === 0 || (currentActive === null && !showAllSkills) ? 1.0 : 0.03;

    if (cylinderRef.current) {
      cylinderRef.current.scale.setScalar(THREE.MathUtils.lerp(cylinderRef.current.scale.x, targetCylinder * 1.0, 0.15));
      (cylinderRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (cylinderRef.current.material as THREE.MeshBasicMaterial).opacity,
        targetCylinder >= 1.0 ? 0.45 : 0.03,
        0.15
      );
    }
    if (sphereRef.current) {
      sphereRef.current.scale.setScalar(THREE.MathUtils.lerp(sphereRef.current.scale.x, targetSphere * 1.0, 0.15));
      (sphereRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (sphereRef.current.material as THREE.MeshBasicMaterial).opacity,
        targetSphere >= 1.0 ? 0.48 : 0.03,
        0.15
      );
      sphereRef.current.position.y = Math.sin(time * 2.0) * 0.15;
    }
    if (torusRef.current) {
      torusRef.current.scale.setScalar(THREE.MathUtils.lerp(torusRef.current.scale.x, targetTorus * 0.9, 0.15));
      (torusRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (torusRef.current.material as THREE.MeshBasicMaterial).opacity,
        targetTorus >= 1.0 ? 0.45 : 0.03,
        0.15
      );
      torusRef.current.rotation.x = time * 0.5;
    }
  });

  return (
    <group ref={groupRef} position={[1.5, -1.2, 0]}>
      {/* 3D Exhibition Plinth (Base Pedestal) */}
      <mesh
        position={[0, -0.6, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredItem(-1); // special hover code for base
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredItem(null);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowAllSkills(!showAllSkills);
          setActiveTab(null);
        }}
      >
        <cylinderGeometry args={[1.2, 1.3, 0.6, 32]} />
        <meshBasicMaterial
          color={showAllSkills || hoveredItem === -1 ? "#39ff14" : "#ffffff"}
          wireframe
          transparent
          opacity={showAllSkills ? 0.25 : hoveredItem === -1 ? 0.18 : 0.06}
        />
      </mesh>

      {/* Interactive Value Sculptures Group */}
      <group ref={structureRef} position={[0, 0.8, 0]}>
        {/* Frontend -> Torus Knot */}
        <mesh
          ref={torusRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredItem(0);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredItem(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab(activeTab === 0 ? null : 0);
            setShowAllSkills(false);
          }}
        >
          <torusGeometry args={[0.6, 0.2, 8, 32]} />
          <meshBasicMaterial
            color={activeTab === 0 || hoveredItem === 0 ? "#39ff14" : "#ffffff"}
            wireframe
            transparent
            opacity={activeTab === 0 || hoveredItem === 0 ? 0.45 : 0.1}
          />
        </mesh>

        {/* Backend -> Cylinder */}
        <mesh
          ref={cylinderRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredItem(1);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredItem(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab(activeTab === 1 ? null : 1);
            setShowAllSkills(false);
          }}
        >
          <cylinderGeometry args={[0.7, 0.7, 1.2, 16, 4]} />
          <meshBasicMaterial
            color={activeTab === 1 || hoveredItem === 1 ? "#39ff14" : "#ffffff"}
            wireframe
            transparent
            opacity={activeTab === 1 || hoveredItem === 1 ? 0.45 : 0.1}
          />
        </mesh>

        {/* Experience -> Geodesic Sphere */}
        <mesh
          ref={sphereRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredItem(2);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHoveredItem(null);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab(activeTab === 2 ? null : 2);
            setShowAllSkills(false);
          }}
        >
          <icosahedronGeometry args={[0.9, 2]} />
          <meshBasicMaterial
            color={activeTab === 2 || hoveredItem === 2 ? "#39ff14" : "#ffffff"}
            wireframe
            transparent
            opacity={activeTab === 2 || hoveredItem === 2 ? 0.48 : 0.1}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function About() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  /* Mapped resume data sections matching the resume image */
  const resumeSections = [
    {
      title: 'Frontend & Animation',
      short: 'Next.js, React.js, Three.js, React Three Fiber, Framer Motion, GSAP, HTML/CSS.',
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
      short: 'Node.js, Express, PostgreSQL (Neon), Prisma ORM, Firebase, Python, SQL.',
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
      short: 'SRM Institute of Science & Technology student, Founder, and NIC intern.',
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

  /* Clock */
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">
      
      {/* ── WebGL 3D Interactive Canvas ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} className="pointer-events-auto">
          <PedestalScene 
            hoveredItem={hoveredItem} 
            setHoveredItem={setHoveredItem}
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            showAllSkills={showAllSkills}
            setShowAllSkills={setShowAllSkills}
          />
        </Canvas>
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
      <header className="absolute top-0 left-0 right-0 z-20 p-12 flex justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white/5 border border-white/15 hover:border-white/60 transition-all duration-500 text-xs tracking-widest text-white/70 hover:text-white backdrop-blur-md font-mono pointer-events-auto"
        >
          &larr; BACK
        </Link>
        <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-white/25">
          {currentTime}&ensp;//&ensp;ABOUT SREEJA
        </span>
      </header>

      {/* ── Left Side: Core Interactive Menu ── */}
      <div className="absolute inset-0 z-10 flex items-center p-12 md:p-24 pointer-events-none">
        <div className="max-w-md w-full flex flex-col pointer-events-auto">
          
          <div className="flex items-center gap-3 mb-6 select-none">
            <span className="font-mono text-[9px] tracking-widest text-white/30 uppercase">
              Interactive Plinth
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20 animate-pulse" />
          </div>

          <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-white leading-[1.1] mb-6">
            About{' '}
            <span className="font-playfair italic text-[#e2e8f0] tracking-wide font-normal">
              Her
            </span>
          </h1>

          <p className="text-[11px] font-mono text-white/40 tracking-wider mb-8 uppercase leading-relaxed">
            Click shapes to inspect pillars, or click the <span className="text-[#39ff14] font-semibold">Pedestal Base</span> to view all technical skills.
          </p>

          {/* Interactive Menu Items */}
          <div className="space-y-6">
            {resumeSections.map((sec, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={sec.title}
                  onMouseEnter={() => setHoveredItem(idx)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => {
                    setActiveTab(isActive ? null : idx);
                    setShowAllSkills(false);
                  }}
                  className={`w-full text-left border-l pl-6 py-2 transition-all duration-500 group focus:outline-none ${
                    isActive 
                      ? 'border-[#39ff14]/80 bg-[#39ff14]/5' 
                      : 'border-white/10 hover:border-white/50 hover:bg-white/[0.02]'
                  }`}
                >
                  <h3 className={`font-mono text-xs tracking-widest uppercase mb-2 ${
                    isActive ? 'text-[#39ff14]' : 'text-white/40 group-hover:text-white/80'
                  }`}>
                    {sec.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-neutral-500 group-hover:text-neutral-400 font-sans">
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
            className={`mt-8 self-start px-6 py-3 border font-mono text-[10px] tracking-wider uppercase transition-all duration-500 ${
              showAllSkills
                ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/5'
                : 'border-white/10 text-white/50 hover:border-white/40 hover:text-white'
            }`}
          >
            {showAllSkills ? 'Hide All Skills' : 'View All Skills Dashboard'}
          </button>

        </div>
      </div>

      {/* ── Sliding Panel: Detailed Credentials ── */}
      <div 
        className={`absolute top-0 right-0 h-screen w-full md:w-[600px] bg-[#0c0c0c]/95 backdrop-blur-xl border-l border-white/[0.08] z-30 transition-transform duration-700 ease-in-out p-12 md:p-16 overflow-y-auto ${
          activeTab !== null ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {activeTab !== null && (
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
                <span className="font-mono text-[9px] tracking-[0.25em] text-[#39ff14] uppercase">
                  Pillar 0{activeTab + 1}
                </span>
                <h2 className="text-3xl font-light tracking-tight mt-1 text-[#e2e8f0]">
                  {resumeSections[activeTab].title}
                </h2>
              </div>

              {/* SECTION: SKILLS */}
              {resumeSections[activeTab].skills && (
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3">// Tech Stack & Skills</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {resumeSections[activeTab].skills.map((skill) => (
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
              {resumeSections[activeTab].projects && (
                <div className="space-y-6">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">// Featured Projects</h4>
                  {resumeSections[activeTab].projects.map((proj) => (
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
              {activeTab === 2 && resumeSections[activeTab].education && (
                <div>
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3">// Education</h4>
                  <div className="border-t border-white/[0.06] pt-4">
                    <h5 className="text-sm font-medium text-white/95">{resumeSections[activeTab].education.school}</h5>
                    <p className="text-[12px] text-neutral-400 mt-1 font-mono text-[11px]">{resumeSections[activeTab].education.degree}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{resumeSections[activeTab].education.metrics}</p>
                  </div>
                </div>
              )}

              {/* SECTION: PROFESSIONAL EXPERIENCE (for Tab 2) */}
              {activeTab === 2 && resumeSections[activeTab].experience && (
                <div className="space-y-6">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">// Experience</h4>
                  {resumeSections[activeTab].experience.map((exp) => (
                    <div key={exp.company} className="border-t border-white/[0.06] pt-4">
                      <h5 className="text-sm font-medium text-white/95">{exp.role}</h5>
                      <span className="font-mono text-[10px] text-[#39ff14]/70 mt-0.5 block">{exp.company}</span>
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
              {activeTab === 2 && resumeSections[activeTab].achievements && (
                <div className="space-y-4">
                  <h4 className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-2">// Achievements & Certs</h4>
                  <div className="border-t border-white/[0.06] pt-4 space-y-4">
                    {resumeSections[activeTab].achievements.map((ach, achIdx) => (
                      <div key={achIdx}>
                        <h5 className="text-[13px] font-medium text-white/90">{ach.name}</h5>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{ach.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel Prompt */}
            <div className="border-t border-white/[0.06] pt-6 mt-12 font-mono text-[9px] text-white/25 uppercase tracking-widest">
              // credentials loaded successfully
            </div>
          </div>
        )}
      </div>

      {/* ── Consolidated Skills Dashboard Overlay ── */}
      <div
        className={`absolute inset-0 bg-black/90 backdrop-blur-2xl z-40 transition-all duration-700 flex flex-col justify-between p-12 md:p-24 ${
          showAllSkills ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        }`}
      >
        {/* Dashboard Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-6">
          <div>
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#39ff14] uppercase">
              Consolidated Skill Matrix
            </span>
            <h2 className="text-4xl font-extralight text-white mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-8 overflow-y-auto pr-2">
          {allSkillsCategories.map((cat, idx) => (
            <div key={cat.category} className="border border-white/5 bg-white/[0.02] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-500 group">
              <div>
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest block mb-4">
                  0{idx + 1} / {cat.category.split(' ')[0]}
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
              <div className="mt-8 pt-4 border-t border-white/5 font-mono text-[8px] text-white/15 uppercase tracking-widest">
                // category active
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

      {/* ── Fixed Bottom HUD Footer ── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 p-12 flex justify-between items-center font-mono text-[10px] text-white/15 tracking-[0.25em] pointer-events-none">
        <span>PORTFOLIO 2026</span>
        <span>ABOUT EXHIBITION v3.0</span>
      </footer>

    </main>
  );
}
