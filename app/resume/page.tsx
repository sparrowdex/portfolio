'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Resume() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-300 font-sans selection:bg-[#4ade80]/30 selection:text-white pb-24 relative overflow-hidden print:bg-white print:text-black">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#4ade80]/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#3b82f6]/5 blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="relative z-20 pt-10 px-6 md:px-12 flex justify-between items-center max-w-5xl mx-auto print:hidden">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-[#4ade80]/50 transition-all duration-500 text-xs tracking-widest text-white/70 hover:text-[#4ade80] backdrop-blur-md font-mono flex items-center gap-2 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> HOME
        </Link>
        <a
          href="/assets/resume-june-2026.pdf"
          download="Sreeja_Das_Resume.pdf"
          className="px-5 py-2.5 bg-transparent border border-white/10 hover:border-[#4ade80]/50 hover:text-[#4ade80] transition-all duration-300 text-xs tracking-widest text-white/70 backdrop-blur-md font-mono flex items-center gap-2 group"
        >
          DOWNLOAD PDF <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
        </a>
      </header>

      {/* Main Resume Container */}
      <div className="relative z-10 max-w-4xl mx-auto mt-12 px-6 md:px-12">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 md:p-16 shadow-2xl rounded-sm print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          
          {/* Resume Header */}
          <div className="flex flex-col items-center md:items-start border-b border-white/10 pb-8 mb-8 print:border-black/20">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase mb-4 print:text-black">
              Sreeja Das
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 text-xs md:text-sm font-mono text-neutral-400 print:text-black/80">
              <span>New Delhi, India</span>
              <span className="opacity-30">|</span>
              <a href="mailto:sreejadas0405@gmail.com" className="hover:text-[#4ade80] transition-colors">sreejadas0405@gmail.com</a>
            </div>
            <div className="flex gap-4 mt-4 text-xs font-mono font-bold tracking-widest text-white/60 print:text-black">
              <a href="https://linkedin.com/in/sreeja-das" target="_blank" rel="noreferrer" className="hover:text-[#3b82f6] transition-colors border-b border-transparent hover:border-[#3b82f6]">LINKEDIN</a>
              <a href="https://github.com/sparrowdex" target="_blank" rel="noreferrer" className="hover:text-white transition-colors border-b border-transparent hover:border-white">GITHUB</a>
            </div>
          </div>

          {/* Education */}
          <section className="mb-12">
            <h2 className="text-lg font-mono font-bold tracking-[0.2em] text-[#4ade80] uppercase mb-6 flex items-center gap-4 print:text-black print:border-b print:border-black/20 print:pb-2">
              Education
              <div className="flex-1 h-px bg-white/10 print:hidden" />
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <h3 className="text-xl font-bold text-white print:text-black">SRM Institute of Science & Technology</h3>
                <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">Aug 2023 — May 2027</span>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-neutral-300 print:text-black/80">
                <span>Bachelor of Technology in Computer Science (Core) | <strong className="text-white print:text-black">CGPA: 8.95</strong></span>
                <span className="text-xs text-neutral-500 mt-1 md:mt-0">Delhi-NCR, India</span>
              </div>
            </div>
          </section>

          {/* Technical Skills */}
          <section className="mb-12">
            <h2 className="text-lg font-mono font-bold tracking-[0.2em] text-[#4ade80] uppercase mb-6 flex items-center gap-4 print:text-black print:border-b print:border-black/20 print:pb-2">
              Technical Skills
              <div className="flex-1 h-px bg-white/10 print:hidden" />
            </h2>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-mono text-[#4ade80] mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">Frontend & Animation:</strong> Next.js, React.js, Three.js, React Three Fiber, Framer Motion, GSAP, HTML/CSS</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[#4ade80] mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">Backend & Cloud:</strong> Node.js, Express, PostgreSQL (Neon), Prisma ORM, Firebase</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[#4ade80] mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">Languages:</strong> JavaScript (ES6+), TypeScript, Python, SQL</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono text-[#4ade80] mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">Design & Tools:</strong> Figma, Canva, UI/UX Prototyping, Git/GitHub, Postman</p>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section className="mb-12">
            <h2 className="text-lg font-mono font-bold tracking-[0.2em] text-[#4ade80] uppercase mb-6 flex items-center gap-4 print:text-black print:border-b print:border-black/20 print:pb-2">
              Experience
              <div className="flex-1 h-px bg-white/10 print:hidden" />
            </h2>
            
            <div className="flex flex-col gap-10">
              {/* Inner Voice */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                  <h3 className="text-xl font-bold text-white print:text-black">Inner Voice <span className="font-normal text-sm text-neutral-400 print:text-black/60">(Mental Health AI Startup)</span></h3>
                  <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">July 2025 — Present</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm mb-4">
                  <span className="italic text-[#4ade80] print:text-black font-semibold">Founder & Lead Developer</span>
                  <span className="text-xs text-neutral-500 mt-1 md:mt-0">Remote, India</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-neutral-300 print:text-black/80">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Architected a full-stack wellness platform utilizing Next.js and Firebase, designing an anonymous interaction model to ensure secure emotional support and accessible UX.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Engineered a custom "Trusted Friends" network with complex boundary-setting logic. This feature enables supporters to visually manage their emotional availability and mitigate burnout without explicit refusal.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Guided the product roadmap with a strong emphasis on UX research, interaction design, and planning migrations to proprietary LLMs.</span>
                  </li>
                </ul>
              </div>

              {/* The Diecast Store */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                  <h3 className="text-xl font-bold text-white print:text-black">The Diecast Store <span className="font-normal text-sm text-neutral-400 print:text-black/60">| <a href="https://www.thediecaststore.in" target="_blank" rel="noreferrer" className="hover:text-[#4ade80] transition-colors border-b border-transparent hover:border-[#4ade80]">www.thediecaststore.in</a></span></h3>
                  <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">Jan 2026 — May 2026</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm mb-4">
                  <span className="italic text-[#4ade80] print:text-black font-semibold">Lead Developer</span>
                  <span className="text-xs text-neutral-500 mt-1 md:mt-0">Remote, India</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-neutral-300 print:text-black/80">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Architected a fully functional, serverless full-stack e-commerce platform tailored for diecast hobbyists using Next.js, TypeScript, and Prisma.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Engineered a premium, responsive UI featuring Bento Grid layouts and fluid animations, successfully integrating production endpoints for payment and shipping gateways (Razorpay/Shiprocket).</span>
                  </li>
                </ul>
              </div>

              {/* NIC */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                  <h3 className="text-xl font-bold text-white print:text-black">National Informatics Centre (NIC)</h3>
                  <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">June 2025 — July 2025</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm mb-4">
                  <span className="italic text-[#4ade80] print:text-black font-semibold">Web Development Intern</span>
                  <span className="text-xs text-neutral-500 mt-1 md:mt-0">New Delhi, India</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-neutral-300 print:text-black/80">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Executed an 8-week internship within the e-Office Project Division, directly contributing to the digitalization of government workflows.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Evaluated the product suite architecture to identify UI optimizations for secure, large-scale document management systems.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Projects */}
          <section className="mb-12">
            <h2 className="text-lg font-mono font-bold tracking-[0.2em] text-[#4ade80] uppercase mb-6 flex items-center gap-4 print:text-black print:border-b print:border-black/20 print:pb-2">
              Projects
              <div className="flex-1 h-px bg-white/10 print:hidden" />
            </h2>
            
            <div className="flex flex-col gap-8">
              {/* Photobooth Web App */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                  <h3 className="text-xl font-bold text-white print:text-black">Photobooth Web App</h3>
                  <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">2026</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm mb-4">
                  <span className="italic text-neutral-400 print:text-black/80 font-mono text-xs">React 18, Vite, p5.js, GSAP, Capacitor</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-neutral-300 print:text-black/80">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Architected a responsive, web-based retro photobooth, enabling users to stack multiple CSS filters, generate automated GIFs, and design custom photo strips.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Implemented complex asynchronous camera timing and recursive animation logic using GSAP and html2canvas, ensuring seamless UI responsiveness.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Leveraged Capacitor to wrap the web codebase into a native Android application, delivering a high-performance cross-platform experience.</span>
                  </li>
                </ul>
              </div>

              {/* Christmas Spirit */}
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                  <h3 className="text-xl font-bold text-white print:text-black">Christmas Spirit <span className="font-normal text-sm text-neutral-400 print:text-black/60">| <a href="https://ghostsofchristmas.vercel.app" target="_blank" rel="noreferrer" className="text-[#3b82f6] hover:underline transition-all">Live Link</a></span></h3>
                  <span className="text-xs font-mono text-neutral-500 mt-1 md:mt-0">Dec 2025</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center text-sm mb-4">
                  <span className="italic text-neutral-400 print:text-black/80 font-mono text-xs">JavaScript, Web Audio API, DeviceMotionEvent</span>
                </div>
                <ul className="flex flex-col gap-2 text-sm text-neutral-300 print:text-black/80">
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Engineered an interactive web app featuring real-time microphone-triggered snowfall effects and cross-platform motion detection.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-mono text-[#4ade80]/50 mt-1 text-[8px] print:text-black">▹</span>
                    <span>Secured a <strong>Top 10 Finish</strong> out of 90 individuals in the 4-hour Girls Leading Tech Hackathon through this creative technical implementation.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Achievements & Certifications */}
          <section>
            <h2 className="text-lg font-mono font-bold tracking-[0.2em] text-[#4ade80] uppercase mb-6 flex items-center gap-4 print:text-black print:border-b print:border-black/20 print:pb-2">
              Achievements & Certifications
              <div className="flex-1 h-px bg-white/10 print:hidden" />
            </h2>
            <div className="flex flex-col gap-4 text-sm text-neutral-300 print:text-black/80">
              <div className="flex items-start gap-3">
                <span className="font-mono text-[#4ade80]/50 mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">IBM Data Science Professional Certificate:</strong> Completed March 2026. Specialized in Data Visualization, Machine Learning, and SQL-driven EDA.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-[#4ade80]/50 mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">NPTEL Certification in Natural Language Processing:</strong> Specialized in text processing, language modeling, syntactic parsing, and semantic analysis concepts.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-mono text-[#4ade80]/50 mt-1 text-[10px] print:text-black">■</span>
                <p><strong className="text-white print:text-black">Technical Volunteer (BAJSS):</strong> Mentored 20+ adolescent girls in coding (Scratch, VSCode) and digital literacy workshops to bridge the technical proficiency gap.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
