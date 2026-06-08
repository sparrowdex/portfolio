import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const FlowersModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Hero & Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-8 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              {selectedProject.logo && (
                <div className="w-56 h-20 flex items-center justify-start overflow-hidden relative">
                  <img src={selectedProject.logo} alt="Flowers for Beloved Logo" className="w-full h-full object-contain object-left" />
                </div>
              )}
              <h3 className="text-4xl md:text-6xl tracking-wide text-[#4ade80] font-serif italic capitalize">Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                A collection of digital, procedurally generated 3D flowers, hand-coded using React Three Fiber as deeply personal and unique birthday gifts for friends. Each flower represents a specific friend's personality — Peace Lily, Gladiolus, Pink Carnation, Blue Orchid, Sweet Pea, Lotus — complete with interactive 3D scenes, personalized messages, and an immersive atmosphere.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                This project was born from a desire to create something deeply personal. While learning creative coding and Three.js, I wanted to go beyond store-bought items and give gifts that represented a part of my coding journey while reflecting the unique personality of each friend. With each flower, I got better — and gained a deep understanding of how the GPU handles web models, memory leaks, and performance optimization.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://flowers-two-pi.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-[#4ade80] text-black font-bold text-xs tracking-widest hover:bg-[#22c55e] hover:text-white transition-all duration-300 w-max">
                  VISIT THE GARDEN
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <a href="https://github.com/sparrowdex/flowers" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-[#4ade80] text-[#4ade80] font-bold text-xs tracking-widest hover:bg-[#4ade80]/10 transition-all duration-300 w-max">
                  VIEW GITHUB REPO
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#4ade80] font-serif italic capitalize">Build Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">GSAP</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Drei</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Vite</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#4ade80] font-serif italic capitalize">Palette</h4>
                <div className="flex flex-col gap-3 mt-2">
                  {selectedProject.colors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                      <span className="text-xs text-neutral-400 font-bold font-mono">{selectedProject.colorLabels[idx]}<br /><span className="text-[10px] opacity-50">{color}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 2: The Heart Bloom Challenge */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#4ade80] font-serif italic capitalize mb-[-1rem]">The Heart Bloom</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px] bg-[#ff2d75]" />
              <h4 className="text-3xl tracking-wide text-white font-serif italic capitalize">Breath-Driven Bloom</h4>
              <p className="text-base leading-relaxed text-[#ff2d75] font-serif italic opacity-95">
                "Building the interactive Heart Bloom scene presented two major challenges: detecting a user's breath to trigger an animation without the background music interfering, and managing dozens of floating 3D hearts with persistent messages that needed to attach to the exact same physical heart across different sessions."
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide text-[#4ade80] font-serif italic capitalize">Frequency Isolation</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#4ade80]/30 rounded-full text-xs text-[#4ade80] bg-[#4ade80]/5">Microphone Input</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#4ade80]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">AudioContext</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#4ade80]/30 to-[#ff2d75]/30"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#ff2d75]/50 rounded-full text-xs text-white font-bold bg-[#ff2d75]/20 shadow-[0_0_15px_rgba(255,45,117,0.3)]">AnalyserNode Bins 0–25</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff2d75]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Wind Detection</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#ff2d75]/30 to-[#ffb7c5]/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#ffb7c5]/50 rounded-full text-xs text-[#ffb7c5] bg-[#ffb7c5]/10">Bloom Animation Trigger</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ffb7c5]/50 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Seeded RNG</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                Instead of looking at overall volume, I isolated the lowest frequency bins (0–25) to specifically detect the rumbling/wind noise of someone blowing into the mic, filtering out the background music. For persistent 3D messages, I used a seeded random number generator based on each heart's index to ensure deterministic positions across page loads.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Garden & Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#4ade80] font-serif italic capitalize mb-[-1rem]">The Garden</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="relative w-full aspect-square bg-neutral-950/80 border border-[#4ade80]/20 hover:border-[#4ade80]/60 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl">
              <img src={selectedProject.imageFallback} alt="Flowers Background" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="z-10 text-center flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 bg-[#4ade80]/10 rounded-full flex items-center justify-center border border-[#4ade80]/30">
                    <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="text-2xl font-serif italic text-white">Code as a Gift</h4>
                  <p className="text-sm text-neutral-400 font-sans">Each flower is hand-coded from scratch using mathematical functions, extrusions, and curves — no 3D models imported. Every petal is a piece of code.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#4ade80]">■</span>
                    <span><strong>Procedurally Generated 3D Botanicals:</strong> Hand-coded, unique 3D flower models built with React Three Fiber — Peace Lily, Gladiolus, Pink Carnation, Blue Orchid, Sweet Pea, Lotus — each tailored to a friend's personality.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ff2d75]">■</span>
                    <span><strong>Microphone-Driven Interactivity:</strong> A special "Heart Bloom" scene that uses the Web Audio API to detect blowing/wind noise, animating the flower's blooming process based on user breath.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ffb7c5]">■</span>
                    <span><strong>Real-Time Collaborative 3D Space:</strong> Persistent, floating 3D text messages synced instantly across sessions using Firebase Realtime Database, attached to deterministically positioned hearts.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#4ade80]">■</span>
                    <span><strong>State Machine Routing:</strong> Instead of a traditional router, the entire experience acts as a state machine (<em>input → message → animation</em>), dynamically mounting 3D components based on the user's text input.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide text-[#4ade80] font-serif italic capitalize">The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <p className="mt-2 leading-relaxed">I learned how powerful it is to combine mathematical, procedural generation with deeply emotional, human-centric design. It taught me that code isn't just for building utilities; it's a medium for expressing gratitude and creating art. Technically, this project gave me a deep understanding of GPU model handling, memory leak identification, and performance optimization in complex Three.js scenes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};
