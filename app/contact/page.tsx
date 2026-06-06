'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────── Ambient Background Connection Dome ─────────────────── */
function ContactConnectionDome() {
  const domeRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    // Geodesic icosahedron for a techy network dome structure
    return new THREE.IcosahedronGeometry(5, 2);
  }, []);

  useFrame(() => {
    if (domeRef.current) {
      const time = performance.now() * 0.001;
      domeRef.current.rotation.y = time * 0.02;
      domeRef.current.rotation.x = Math.sin(time * 0.05) * 0.05;
    }
  });

  return (
    <group ref={domeRef} position={[0, -2.8, -2]}>
      {/* Wireframe net */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.04}
          depthWrite={false}
        />
      </mesh>
      {/* Vertex nodes */}
      <points geometry={geometry}>
        <pointsMaterial
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.15}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* ─────────────────── Typing Animation Hook ─────────────────── */
function useTypewriter(text: string, speed = 40, delay = 0, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);

    const timeout = setTimeout(() => {
      let idx = 0;
      const iv = setInterval(() => {
        idx++;
        setDisplayed(text.slice(0, idx));
        if (idx >= text.length) { setDone(true); clearInterval(iv); }
      }, speed);
      return () => clearInterval(iv);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, speed, delay, enabled]);

  return { displayed, done };
}

/* ─────────────────── Main Page ─────────────────── */
export default function Contact() {
  const [detected, setDetected] = useState(false);
  const [isApple, setIsApple] = useState(true);
  const [bootPhase, setBootPhase] = useState(0);       // 0→4 for typing sequence
  const [formValues, setFormValues] = useState({ name: '', email: '', message: '' });
  const [activeField, setActiveField] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showForm, setShowForm] = useState(false);

  /* OS Detection */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const platform = navigator.platform?.toLowerCase() || '';
      const userAgent = navigator.userAgent?.toLowerCase() || '';
      const isMac = platform.indexOf('mac') !== -1 || userAgent.indexOf('mac') !== -1 || userAgent.indexOf('iphone') !== -1 || userAgent.indexOf('ipad') !== -1;
      setIsApple(isMac);
      setDetected(true);
    }
  }, []);

  /* Boot sequence lines dynamically configured by detected OS */
  const bootLines = isApple ? [
    { prefix: '$', text: 'establishing_connection...' },
    { prefix: '▸', text: 'connection secured ✓' },
    { prefix: '$', text: 'loading contact_protocol...' },
    { prefix: '▸', text: 'ready. awaiting transmission.' },
  ] : [
    { prefix: 'C:\\Users\\hp>', text: 'establish_connection.exe' },
    { prefix: '▸', text: 'Connection secured.' },
    { prefix: 'C:\\Users\\hp>', text: 'load_protocol.bat' },
    { prefix: '▸', text: 'Ready. Awaiting transmission.' },
  ];

  /* Individual typewriter hooks */
  const t0 = useTypewriter(bootLines[0].text, 30, 600, detected && bootPhase >= 0);
  const t1 = useTypewriter(bootLines[1].text, 25, 300, detected && bootPhase >= 1);
  const t2 = useTypewriter(bootLines[2].text, 30, 200, detected && bootPhase >= 2);
  const t3 = useTypewriter(bootLines[3].text, 25, 200, detected && bootPhase >= 3);
  const typewriters = [t0, t1, t2, t3];

  /* Dynamic symbols for form input lines */
  const promptSymbol = isApple ? '$' : 'C:\\Users\\hp>';
  const promptWidth = isApple ? 'w-12' : 'w-36';
  const arrowSymbol = isApple ? '→' : '=';
  const labelName = isApple ? 'name' : 'set name';
  const labelEmail = isApple ? 'email' : 'set email';
  const labelMsg = isApple ? 'msg' : 'set message';

  /* Advance boot phases */
  useEffect(() => { if (t0.done && bootPhase === 0) setBootPhase(1); }, [t0.done, bootPhase]);
  useEffect(() => { if (t1.done && bootPhase === 1) setBootPhase(2); }, [t1.done, bootPhase]);
  useEffect(() => { if (t2.done && bootPhase === 2) setBootPhase(3); }, [t2.done, bootPhase]);
  useEffect(() => {
    if (t3.done && bootPhase === 3) {
      setBootPhase(4);
      setTimeout(() => setShowForm(true), 400);
    }
  }, [t3.done, bootPhase]);

  /* Clock */
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = useCallback(() => {
    if (formValues.name && formValues.email && formValues.message) {
      setSubmitted(true);
    }
  }, [formValues]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden flex flex-col justify-between">

      {/* ── WebGL Connection Dome Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <ContactConnectionDome />
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

      {/* ── Ambient light bloom ── */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 25% 45%, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
      />

      {/* ── Header ── */}
      <header className="absolute top-0 left-0 right-0 z-20 pt-10 px-6 pb-4 md:p-12 flex justify-end md:justify-between items-center pointer-events-none">
        <Link
          href="/"
          className="px-5 py-2.5 bg-white/5 border border-white/15 hover:border-white/60 transition-all duration-500 text-xs tracking-widest text-white/70 hover:text-white backdrop-blur-md font-mono pointer-events-auto"
        >
          &larr; BACK
        </Link>
        <span className="text-[10px] tracking-[0.25em] font-mono uppercase text-white/25 hidden md:inline">
          {currentTime}&ensp;//&ensp;CONTACT
        </span>
      </header>

      {/* ── Main Content Container ── */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-8 md:px-16 pb-12 pointer-events-none">
        <div className="max-w-xl md:max-w-2xl w-full flex flex-col items-center pointer-events-auto">

          {/* ── Elegant Title ── */}
          <div className="mb-10 w-full">
            <h1 className="text-5xl md:text-7xl font-extralight tracking-tight text-white leading-[1.1]">
              Say{' '}
              <span className="font-playfair italic text-[#e2e8f0] tracking-wide font-normal">
                Hello
              </span>
            </h1>
            <p className="text-white/50 text-base mt-3 tracking-wide" style={{ fontFamily: "'Dancing Script', 'Playfair Display', cursive", fontStyle: "italic" }}>
              let&apos;s build something together
            </p>
          </div>

          {/* ── Terminal Window ── */}
          <div className="w-full border border-white/[0.07] bg-[#0c0c0c]/90 backdrop-blur-md shadow-2xl">

            {/* Dynamic Window Title Bar */}
            {isApple ? (
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.015]">
                <div className="w-2 h-2 rounded-full bg-white/15" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <span className="ml-4 text-[9px] font-mono text-white/20 tracking-[0.3em] uppercase">
                  contact.sh
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#1e1e1e]/60 h-10 select-none">
                {/* Windows Terminal Style Tabs */}
                <div className="flex items-center h-full">
                  <div className="flex items-center gap-2 px-4 h-full bg-[#0c0c0c] border-r border-white/[0.06] text-white/50">
                    <svg className="w-2.5 h-2.5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="4 17 10 11 4 5"></polyline>
                      <line x1="12" y1="19" x2="20" y2="19"></line>
                    </svg>
                    <span className="text-[10px] font-mono tracking-wide">Command Prompt</span>
                    <span className="text-[9px] opacity-40 ml-1 hover:opacity-100 transition-opacity cursor-default">✕</span>
                  </div>
                  <div className="flex items-center justify-center w-8 h-full text-white/30 hover:text-white/60 hover:bg-white/[0.03] transition-all cursor-default">
                    <span className="text-sm font-light">+</span>
                  </div>
                </div>
                {/* Windows Window Controls */}
                <div className="flex items-center h-full text-white/30 font-sans text-[10px]">
                  <span className="flex items-center justify-center w-11 h-full hover:bg-white/[0.05] transition-colors cursor-default">─</span>
                  <span className="flex items-center justify-center w-11 h-full hover:bg-white/[0.05] transition-colors cursor-default">⬜</span>
                  <span className="flex items-center justify-center w-11 h-full hover:bg-red-600 hover:text-white transition-colors cursor-default text-xs">✕</span>
                </div>
              </div>
            )}

            {/* Terminal body */}
            <div className="p-6 md:p-8 font-mono text-[13px] leading-relaxed space-y-2.5 min-h-[280px]">

              {/* Windows CMD Header */}
              {!isApple && detected && (
                <div className="text-white/30 mb-4 text-[12px] leading-relaxed">
                  Microsoft Windows [Version 10.0.26200.8457]<br />
                  (c) Microsoft Corporation. All rights reserved.
                </div>
              )}

              {/* Boot typing sequence */}
              {detected && bootLines.map((line, idx) => {
                if (bootPhase < idx) return null;
                const tw = typewriters[idx];
                return (
                  <div key={idx} className="flex gap-3 items-center">
                    <span className="text-white/20 shrink-0">{line.prefix}</span>
                    <span className={line.prefix === '▸' ? 'text-white/50' : 'text-white/30'}>
                      {tw.displayed}
                      {!tw.done && <span className="animate-pulse ml-0.5 text-white/40">▎</span>}
                    </span>
                  </div>
                );
              })}

              {/* Divider */}
              {showForm && (
                <div className="border-t border-white/[0.05] !my-5" />
              )}

              {/* ── Form Fields ── */}
              {showForm && !submitted && (
                <div
                  className="space-y-4 transition-opacity duration-700"
                  style={{ animation: 'fade-in 0.6s ease-out forwards' }}
                >
                  {/* Name */}
                  <div className="flex gap-3 items-center">
                    <span className="text-white/20 shrink-0">{promptSymbol}</span>
                    <span className={`text-white/40 shrink-0 ${promptWidth}`}>{labelName}</span>
                    <span className="text-white/15 shrink-0">{arrowSymbol}</span>
                    <input
                      id="contact-name"
                      type="text"
                      value={formValues.name}
                      onChange={(e) => setFormValues(p => ({ ...p, name: e.target.value }))}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField(null)}
                      className="bg-transparent border-none outline-none text-white/80 flex-1 caret-white/50 placeholder:text-white/10 font-mono text-[13px]"
                      placeholder="your name"
                      autoComplete="off"
                    />
                    {activeField === 'name' && (
                      <span className="animate-pulse text-white/30 text-xs">▎</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex gap-3 items-center">
                    <span className="text-white/20 shrink-0">{promptSymbol}</span>
                    <span className={`text-white/40 shrink-0 ${promptWidth}`}>{labelEmail}</span>
                    <span className="text-white/15 shrink-0">{arrowSymbol}</span>
                    <input
                      id="contact-email"
                      type="email"
                      value={formValues.email}
                      onChange={(e) => setFormValues(p => ({ ...p, email: e.target.value }))}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField(null)}
                      className="bg-transparent border-none outline-none text-white/80 flex-1 caret-white/50 placeholder:text-white/10 font-mono text-[13px]"
                      placeholder="you@domain.com"
                      autoComplete="off"
                    />
                    {activeField === 'email' && (
                      <span className="animate-pulse text-white/30 text-xs">▎</span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex gap-3 items-start">
                    <span className="text-white/20 shrink-0 mt-0.5">{promptSymbol}</span>
                    <span className={`text-white/40 shrink-0 ${promptWidth} mt-0.5`}>{labelMsg}</span>
                    <span className="text-white/15 shrink-0 mt-0.5">{arrowSymbol}</span>
                    <textarea
                      id="contact-message"
                      value={formValues.message}
                      onChange={(e) => setFormValues(p => ({ ...p, message: e.target.value }))}
                      onFocus={() => setActiveField('message')}
                      onBlur={() => setActiveField(null)}
                      rows={3}
                      className="bg-transparent border-none outline-none text-white/80 flex-1 caret-white/50 resize-none placeholder:text-white/10 font-mono text-[13px] leading-relaxed"
                      placeholder="what's on your mind?"
                    />
                    {activeField === 'message' && (
                      <span className="animate-pulse text-white/30 text-xs mt-0.5">▎</span>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="pt-3">
                    <button
                      id="contact-submit"
                      onClick={handleSubmit}
                      disabled={!formValues.name || !formValues.email || !formValues.message}
                      className="group flex gap-3 items-center cursor-pointer transition-all duration-500 disabled:opacity-20 disabled:cursor-default hover:opacity-100 opacity-60"
                    >
                      <span className="text-white/20 shrink-0">{promptSymbol}</span>
                      <span className="text-white tracking-[0.15em] group-hover:tracking-[0.25em] transition-all duration-500">
                        {isApple ? 'transmit' : 'transmit.exe'}
                      </span>
                      <span className="text-white/20 group-hover:text-white/50 transition-colors duration-500">↵</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Success State ── */}
              {submitted && (
                <div
                  className="space-y-3"
                  style={{ animation: 'fade-in 0.8s ease-out forwards' }}
                >
                  <div className="flex gap-3 items-center">
                    <span className="text-white/20 shrink-0">{isApple ? '▸' : '>>'}</span>
                    <span className="text-white/70">message transmitted successfully ✓</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="text-white/20 shrink-0">{isApple ? '▸' : '>>'}</span>
                    <span className="text-white/35">sreeja will get back to you soon.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── Decoupled Glass Footer (No Clashing) ── */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 px-12 py-6 flex justify-center md:justify-between items-center bg-[#050505]/80 backdrop-blur-md border-t border-white/[0.04] font-mono text-[10px] text-white/20 tracking-[0.2em] pointer-events-none">
        <span className="hidden md:inline">PORTFOLIO 2026</span>

        {/* Floating Social Icons */}
        <div className="flex gap-8 pointer-events-auto">
          {[
            {
              label: 'github',
              href: 'https://github.com/sparrowdex',
              icon: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              )
            },
            {
              label: 'linkedin',
              href: 'https://linkedin.com/in/sreeja-das',
              icon: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              )
            },
            {
              label: 'email',
              href: 'mailto:sreejadas0405@gmail.com',
              icon: (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              )
            },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex items-center gap-2 text-white/30 hover:text-white/80 transition-all duration-300 pointer-events-auto border-b border-transparent hover:border-white/20 pb-0.5"
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}
        </div>

        <span className="hidden md:inline">CONTACT TERMINAL v1.0</span>
      </footer>

    </main>
  );
}
