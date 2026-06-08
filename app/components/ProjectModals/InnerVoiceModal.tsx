import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const InnerVoiceModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Emotional Opening + Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-12 border-t border-white/10 pt-10">
          {/* Large emotional quote as the hook — sets the tone immediately */}
          <div className="flex flex-col gap-6">
            <blockquote className="text-2xl md:text-4xl leading-snug text-white/90 font-serif italic max-w-3xl">
              "I built this to create a gentle space for friends who hesitate to reach out, afraid of overwhelming the people they care about."
            </blockquote>
            <div className="w-8 h-[2px] bg-[#99cce6]" />
          </div>

          {/* Content + Sidebar — similar structure to Photobooth but shifted rhythm */}
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <div className="w-48 h-16 flex items-center justify-start overflow-hidden relative">
                <img src="/images/innervoice/InnerVoice_dark.png" alt="Inner Voice Logo" className="w-full h-full object-contain object-left" />
              </div>
              <h3 className="text-4xl md:text-6xl tracking-wide text-[#99cce6] font-serif italic capitalize">Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                InnerVoice is a comprehensive emotional support platform that bridges the gap between AI companionship and real human connection. It provides a safe, boundary-respecting space for users to express their feelings, supported by a network of trusted friends and a structured community system.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                Even when someone is comfortable opening up, their friends might not have the emotional bandwidth to listen due to their own problems. I wanted to build an app that acts as a comfortable barrier and boundary — ensuring no one feels unsafe, friends aren't overwhelmed, and everyone gets a fair chance to be heard.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://theinnervoice.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-[#99cce6] text-black font-bold text-xs tracking-widest hover:bg-[#2997cc] hover:text-white transition-all duration-300 w-max">
                  VISIT THEINNERVOICE.APP
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#99cce6] font-serif italic capitalize">Build Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Firebase</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Clerk Auth</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Google Genkit</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#99cce6] font-serif italic capitalize">Palette</h4>
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
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#99cce6] font-serif italic capitalize mb-[-1rem]">Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px] bg-[#99cce6]" />
              <h4 className="text-3xl tracking-wide text-white font-serif italic capitalize">The Great Refactor</h4>
              <p className="text-base leading-relaxed text-[#99cce6] font-serif italic opacity-95">
                "Because this was only my 3rd ever project, early iterations had messy folder structures and systems that weren't quite working. I had to undergo a massive architectural shift — transitioning the app from legacy code into a scalable, production-ready system. This meant overhauling Firestore structures, migrating fully to Next.js App Router, and seamlessly integrating complex business logic without breaking the existing UX."
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide text-[#99cce6] font-serif italic capitalize">Choice-Based System</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#99cce6]/30 rounded-full text-xs text-[#99cce6] bg-[#99cce6]/5">Client Request</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#99cce6]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Clerk JWT</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#99cce6]/30 to-[#2997cc]/30"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#2997cc]/50 rounded-full text-xs text-white font-bold bg-[#2997cc]/20 shadow-[0_0_15px_rgba(41,151,204,0.3)]">Next.js Server Action</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#2997cc]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Gemini Genkit</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#2997cc]/30 to-[#8b5cf6]/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#8b5cf6]/50 rounded-full text-xs text-[#99cce6] bg-[#8b5cf6]/20">Firestore Analytics</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#8b5cf6]/50 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Strict Relational Data</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                I centralized the business logic and AI interactions into Next.js Server Actions to ensure security and reduce client-side bloat, and ensured the site reflects strict community boundaries — allowing users to opt-in or opt-out of being a supporter to protect their own peace.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#99cce6] font-serif italic capitalize mb-[-1rem]">Ecosystem Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="relative w-full aspect-square bg-neutral-950/80 border border-[#99cce6]/20 hover:border-[#99cce6]/60 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop" alt="InnerVoice Background" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="z-10 text-center flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 bg-[#99cce6]/10 rounded-full flex items-center justify-center border border-[#99cce6]/30">
                    <svg className="w-8 h-8 text-[#99cce6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <h4 className="text-2xl font-serif italic text-white">Help & Be Helped</h4>
                  <p className="text-sm text-neutral-400 font-sans">A Supporter can be added as a Trusted Friend, and a User can eventually heal and become a Supporter themselves.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#99cce6]">■</span>
                    <span><strong>The Supporter Network:</strong> A boundary-respecting system where users can share their struggles with a curated list of "Trusted Friends" only when those friends have the emotional bandwidth to engage.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#99cce6]">■</span>
                    <span><strong>AI Emotional Companion:</strong> An AI proxy that acts as an immediate, safe sounding board for users to vent and process emotions before bringing them to human peers.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#99cce6]">■</span>
                    <span><strong>Anonymous Community Forum:</strong> A safe, judgment-free space where users can connect with others, share experiences, and receive mutual support anonymously.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide text-[#99cce6] font-serif italic capitalize">The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <p className="mt-2 leading-relaxed">I learned that while technical innovation matters, <em>how</em> you go about it matters just as much. Every architectural and design decision you make has a direct impact on the person using your software. Building InnerVoice taught me that balancing empathy, user psychology, and strict boundaries is just as critical as writing clean code.</p>
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
