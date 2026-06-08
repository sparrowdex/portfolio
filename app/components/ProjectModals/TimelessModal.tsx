import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const TimelessModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Emotional Opening + Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-12 border-t border-white/10 pt-10">
          <div className="flex flex-col gap-6">
            <blockquote className="text-2xl md:text-4xl leading-snug text-white/90 font-serif italic max-w-3xl">
              "An interactive digital memory box that captures the warmth and joy of the holiday season, controlled entirely by your breath."
            </blockquote>
            <div className="w-8 h-[2px]" style={{ backgroundColor: selectedProject.colors[1] }} />
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <div className="w-48 h-24 flex items-center justify-start overflow-hidden relative">
                <img src="/images/christmas-spirit/globe.png" alt="Timeless Logo" className="w-full h-full object-contain object-left invert opacity-90" />
              </div>
              <h3 className="text-4xl md:text-6xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[1] }}>Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                Timeless: The Digital Snow Globe is an interactive 3D web experience built with React and Three.js. It takes users on a nostalgic journey through three distinct holiday eras—Past, Present, and Future. 
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                Featuring dynamic visuals, ElevenLabs AI-generated narration, and Web Audio API integration, the project allows users to physically blow into their microphone to swirl the digital snow inside the globe, creating a deeply immersive and magical holiday memory box. Built during a 4-hour hackathon, it successfully secured a Top 10 placement.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://ghostsofchristmas.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold text-xs tracking-widest hover:bg-[#ef4444] hover:text-white transition-all duration-300 w-max border border-white/10">
                  ENTER THE GLOBE
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[1] }}>Build Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Three.js</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Custom Shaders</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[1] }}>Palette</h4>
                <div className="flex flex-col gap-3 mt-2">
                  {selectedProject.colors.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="w-6 h-6 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: color }} />
                      <span className="text-xs text-neutral-400 font-bold font-mono">{selectedProject.colorLabels[idx]}<br /><span className="text-[10px] opacity-50">{color}</span></span>
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
          <h3 className="text-3xl md:text-4xl tracking-wide font-serif italic capitalize mb-[-1rem]" style={{ color: selectedProject.colors[1] }}>Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px]" style={{ backgroundColor: selectedProject.colors[2] }} />
              <h4 className="text-3xl tracking-wide text-white font-serif italic capitalize">The Hardware Interface Challenge</h4>
              <p className="text-base leading-relaxed font-serif italic opacity-95" style={{ color: selectedProject.colors[2] }}>
                "The biggest challenge was orchestrating the complex state synchronization across hardware inputs, 3D rendering, and audio playback. Specifically, acquiring microphone permissions robustly, smoothly translating raw audio frequency data into 3D particle physics, and managing era transitions without audio clipping or race conditions."
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[1] }}>Declarative Web Audio Hooks</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs" style={{ color: selectedProject.colors[1], borderColor: `${selectedProject.colors[1]}4D`, backgroundColor: `${selectedProject.colors[1]}1A` }}>Raw Audio Buffer</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[1]}4D, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">AnalyserNode</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6" style={{ backgroundImage: `linear-gradient(to bottom, ${selectedProject.colors[1]}4D, ${selectedProject.colors[2]}4D)` }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ borderColor: `${selectedProject.colors[2]}80`, backgroundColor: `${selectedProject.colors[2]}33` }}>useMicrophone() Hook</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[2]}4D, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Smoothing Algo</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6" style={{ backgroundImage: `linear-gradient(to bottom, ${selectedProject.colors[2]}4D, #ffffff4D)` }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-white/50 rounded-full text-xs text-white bg-white/20">Wind Physics Injector</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/50 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">R3F Render Loop</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                I isolated the hardware interactions into custom React hooks that utilize an `AudioContext` and `AnalyserNode` to calculate a smoothed "wind volume" state. This state is fed declaratively into the React Three Fiber `&lt;SnowGlobe&gt;` component, decoupling the DOM APIs from the pure 3D render loop.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide font-serif italic capitalize mb-[-1rem]" style={{ color: selectedProject.colors[1] }}>Core Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="relative w-full aspect-square bg-neutral-950/80 border hover:border-opacity-60 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl" style={{ borderColor: `${selectedProject.colors[1]}33` }}>
              <img src="/images/christmas-spirit/globe.png" alt="Timeless Background" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="z-10 text-center flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${selectedProject.colors[1]}1A`, borderColor: `${selectedProject.colors[1]}4D` }}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: selectedProject.colors[1] }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <h4 className="text-2xl font-serif italic text-white">Breath Control</h4>
                  <p className="text-sm text-neutral-400 font-sans">Using the Web Audio API, blowing into the microphone creates a blizzard inside the 3D globe.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[1] }}>■</span>
                    <span><strong>Interactive Snow Control:</strong> Physically blow into your device's microphone to agitate the physics simulation of the snow particles.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[1] }}>■</span>
                    <span><strong>Time Travel Eras:</strong> Dynamically shifts between three eras (1920s Sepia, 2024 Vibrant, 2099 Neon), updating lighting, shaders, and music smoothly.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[1] }}>■</span>
                    <span><strong>Immersive AI Audio:</strong> Three unique narrators generated via ElevenLabs AI are synchronized with the background soundscapes.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <p className="mt-2 leading-relaxed">I learned the critical importance of user interaction patterns when dealing with browser hardware APIs. Browsers require explicit user gestures before initializing an `AudioContext` or playing media, so designing a smooth "Microphone Permission" and "Intro" flow is just as important as the 3D graphics.</p>
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
