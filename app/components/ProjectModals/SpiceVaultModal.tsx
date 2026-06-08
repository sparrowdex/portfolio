import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const SpiceVaultModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Opening + Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-12 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <div className="w-48 h-16 flex items-center justify-start overflow-hidden relative">
                <img src="/images/spicevault/logo.svg" alt="SpiceVault Logo" className="w-full h-full object-contain object-left" />
              </div>
              <h3 className="text-4xl md:text-6xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                Spice Vault, originally built during my 2nd year of university and heavily revamped, is a comprehensive full-stack web application designed as a centralized platform for recipe sharing and discovery. It combines traditional recipe browsing with an advanced machine learning-powered recommendation engine to create a highly personalized cooking experience.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                I wanted to create a more engaging, personalized cooking experience that goes beyond static recipe sites, offering intelligent recommendations and a community-driven platform for chefs and food enthusiasts.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://spice-vault.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 text-black font-bold text-xs tracking-widest transition-all duration-300 w-max hover:opacity-80" style={{ backgroundColor: selectedProject.colors[0] }}>
                  VISIT SPICE VAULT
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <a href="https://github.com/sparrowdex/SpiceVault.git" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-xs tracking-widest hover:bg-white/10 transition-all duration-300 w-max">
                  VIEW REPOSITORY
                </a>
              </div>
            </div>
            
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Tailwind CSS</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Prisma ORM</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">UploadThing</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>Palette</h4>
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
          <h3 className="text-3xl md:text-4xl tracking-wide font-serif italic capitalize mb-[-1rem]" style={{ color: selectedProject.colors[2] }}>Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px]" style={{ backgroundColor: selectedProject.colors[0] }} />
              <h4 className="text-3xl tracking-wide text-white font-serif italic capitalize">The ML Bridge</h4>
              <p className="text-base leading-relaxed font-serif italic opacity-95" style={{ color: selectedProject.colors[2] }}>
                "The most difficult challenge was bridging the gap between a complex, math-heavy Machine Learning backend and a snappy, responsive frontend. Handling the UI states for the recommendation engine (which could take time to process sparse matrices) required immense focus on optimistic updates and skeleton loading."
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>Modular Component System</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs" style={{ borderColor: `${selectedProject.colors[0]}4D`, color: selectedProject.colors[0], backgroundColor: `${selectedProject.colors[0]}0D` }}>Client UI</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[0]}4D, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Optimistic State</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${selectedProject.colors[0]}4D, ${selectedProject.colors[1]}4D)` }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs text-white font-bold shadow-[0_0_15px_rgba(255,102,0,0.2)]" style={{ borderColor: `${selectedProject.colors[1]}80`, backgroundColor: `${selectedProject.colors[1]}33` }}>Node.js API</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[1]}4D, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Express / Cron</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b" style={{ backgroundImage: `linear-gradient(to bottom, ${selectedProject.colors[1]}4D, ${selectedProject.colors[2]}80)` }}></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border rounded-full text-xs" style={{ borderColor: `${selectedProject.colors[2]}80`, color: selectedProject.colors[2], backgroundColor: `${selectedProject.colors[2]}33` }}>ML Engine</div>
                  <div className="flex-1 h-px bg-gradient-to-r to-transparent" style={{ backgroundImage: `linear-gradient(to right, ${selectedProject.colors[2]}80, transparent)` }}></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Sparse Matrices</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                I am particularly proud of the highly modular system I designed for the interactive filtering carousels and dynamic Chef Insights Dashboard. This allowed us to cleanly manage complex state without prop drilling or sacrificing performance.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide font-serif italic capitalize mb-[-1rem]" style={{ color: selectedProject.colors[2] }}>Core Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="relative w-full aspect-square bg-neutral-950/80 border hover:border-opacity-60 border-opacity-20 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl" style={{ borderColor: selectedProject.colors[2] }}>
              <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop" alt="SpiceVault Background" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="z-10 text-center flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${selectedProject.colors[2]}1A`, borderColor: `${selectedProject.colors[2]}4D` }}>
                    <svg className="w-8 h-8" style={{ color: selectedProject.colors[2] }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h4 className="text-2xl font-serif italic text-white">IG-Style Stories</h4>
                  <p className="text-sm text-neutral-400 font-sans">Custom full-screen, tap-to-navigate modal system with auto-progressing timers.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[2] }}>■</span>
                    <span><strong>Culinary Feed & Stories:</strong> A social timeline with rich-media updates and 24-hour temporary stories with auto-cleanup background cron jobs.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[2] }}>■</span>
                    <span><strong>Machine Learning Recommendations:</strong> A custom hybrid engine (Collaborative + Content-Based) that learns from views, likes, and ratings to provide tailored recipes.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs" style={{ color: selectedProject.colors[2] }}>■</span>
                    <span><strong>Chef Insights Dashboard:</strong> Advanced analytics for creators featuring 6-month rating trend charts and AI-generated personalized profile tips.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide font-serif italic capitalize" style={{ color: selectedProject.colors[2] }}>The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <p className="mt-2 leading-relaxed">I learned the crucial balance between complex data processing and delivering a snappy user experience. Building the UI for a machine learning application taught me how important loading states, error boundaries, and optimistic updates are to keeping users engaged while heavy backend calculations occur.</p>
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
