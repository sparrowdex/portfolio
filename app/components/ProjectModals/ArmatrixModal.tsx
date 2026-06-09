import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';
import { DemoVideo } from './DemoVideo';

export const ArmatrixModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Opening + Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-12 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <h3 className="text-4xl md:text-6xl tracking-wide font-mono uppercase" style={{ color: selectedProject.colors[0] }}>Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-zinc-400 font-sans opacity-90">
                Armatrix is a dynamic, cinematic personnel directory and management interface. It merges full-stack engineering with procedural 3D graphics and fluid motion design to create a highly immersive, sci-fi-inspired user experience.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-zinc-400 font-sans opacity-90">
                This project was originally built as a technical qualification assignment for an internship at Armatrix, where the specific task was to design and build a new "Team Page" for their existing website. My goal was to push the boundaries of standard web interfaces by exploring the intersection of art and engineering.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://armatrix-team-page-delta.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 text-black font-bold text-xs tracking-widest transition-all duration-300 w-max hover:opacity-80" style={{ backgroundColor: selectedProject.colors[0] }}>
                  INITIALIZE FRONTEND
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <a href="https://huggingface.co/spaces/sparrowdex/armatrix-backend" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-xs tracking-widest hover:bg-white/10 transition-all duration-300 w-max">
                  ACCESS BACKEND API
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-80 flex flex-col gap-8 bg-[#030303]/80 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-mono uppercase" style={{ color: selectedProject.colors[0] }}>Sys.Specs</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-300 font-mono font-bold uppercase rounded-full">FastAPI</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-300 font-mono font-bold uppercase rounded-full">Three.js</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-mono uppercase" style={{ color: selectedProject.colors[0] }}>Color Matrix</h4>
                <div className="flex flex-col gap-3 mt-2">
                  {selectedProject.colors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                      <span className="text-xs text-zinc-400 font-bold font-mono">{selectedProject.colorLabels[idx]}<br /><span className="text-[10px] opacity-50">{color}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 2: Architecture */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide font-mono uppercase mb-[-1rem]" style={{ color: selectedProject.colors[0] }}>Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-[#0a0a0a] border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px]" style={{ backgroundColor: selectedProject.colors[0] }} />
              <h4 className="text-3xl tracking-wide text-white font-mono uppercase">2D / 3D Synchronization</h4>
              <p className="text-base leading-relaxed font-mono opacity-95" style={{ color: selectedProject.colors[0] }}>
                "The hardest technical challenge was synchronizing complex 2D DOM animations with 3D WebGL rendering without breaking visual continuity. Specifically, calculating the exact span of a user's viewport to procedurally rig a perfectly arched 3D ring, and maintaining layout morphing persistence as cards fly out of a carousel."
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide font-mono uppercase" style={{ color: selectedProject.colors[0] }}>Kinematic Interface</h4>

              <div className="flex flex-col gap-2 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs font-mono" style={{ borderColor: `${selectedProject.colors[0]}4D`, color: selectedProject.colors[0], backgroundColor: `${selectedProject.colors[0]}0D` }}>Recursive Segments</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[0]}4D, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">React Three Fiber</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${selectedProject.colors[0]}4D, rgba(255,255,255,0.1))` }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-white/20 rounded-full text-xs text-white font-bold bg-white/5">LayoutId Morphing</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Framer Motion</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-zinc-600 rounded-full text-xs text-zinc-300 bg-zinc-900">Live Uplink Sync</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-zinc-600 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">FastAPI Docker</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-zinc-400 font-sans">
                Instead of static 3D models, I implemented mathematical 3D rigging and recursive scaling logic so the arm "shoots out" dynamically. For the UI, I used Framer Motion’s `layoutId` ensuring that as a card transitions from the dynamic carousel into the expanded decryption view, the browser interpolates the position smoothly.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide font-mono uppercase mb-[-1rem]" style={{ color: selectedProject.colors[0] }}>Core Systems</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="flex flex-col gap-6 w-full">
              <div className="w-full aspect-video rounded-2xl overflow-hidden border shadow-2xl bg-[#0a0a0a] relative" style={{ borderColor: `${selectedProject.colors[0]}33` }}>
                <DemoVideo 
                  src="/images/armatrix/Armatrix_team_page.mp4"
                  skipStartTime={84}
                  skipEndTime={110}
                  className="w-full h-full [&>video]:object-cover"
                />
              </div>

              <div className="flex flex-col items-center text-center gap-4 p-8 bg-[#0a0a0a]/80 border hover:border-opacity-60 border-opacity-20 rounded-2xl shadow-2xl transition-colors duration-500" style={{ borderColor: selectedProject.colors[0] }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border bg-black" style={{ borderColor: `${selectedProject.colors[0]}4D` }}>
                    <svg className="w-8 h-8" style={{ color: selectedProject.colors[0] }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h4 className="text-2xl font-mono uppercase text-white">Validation</h4>
                  <p className="text-sm text-zinc-400 font-sans">The prototype was cited as one of the most creative submissions received. The team later pivoted their official site to incorporate 3D elements, validating the architectural approach.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-zinc-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[0] }}>&gt;</span>
                    <span><strong>Cinematic 3D Interaction Engine:</strong> A procedural, endlessly slithering robotic arm built with React Three Fiber that adapts to screen sizes and maintains a persistent background orbit.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[0] }}>&gt;</span>
                    <span><strong>Kinetic Interface & Shutter Cards:</strong> Framer Motion-driven mechanical iris reveals that seamlessly morph personnel cards from a fanned carousel into detailed "Decryption View" overlays.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[0] }}>&gt;</span>
                    <span><strong>Live Admin Uplink:</strong> A secure CRUD admin panel connected to a FastAPI backend that instantly synchronizes personnel record changes to the 3D frontend interface.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide font-mono uppercase" style={{ color: selectedProject.colors[0] }}>The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-zinc-400">
                  <div>
                    <p className="mt-2 leading-relaxed">Mastering the precise orchestration required to blend complex 3D WebGL canvases with heavy 2D DOM animations, proving that high-fidelity, cinematic web experiences can be performant and fully responsive if engineered with strict mathematical logic and layout persistence.</p>
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
