import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';

export const DiecastModal = ({ selectedProject }: { selectedProject: Project }) => {
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Hero & Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-8 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              {selectedProject.logo && (
                <div className="w-64 h-20 flex items-center justify-start overflow-hidden relative">
                  <img src={selectedProject.logo} alt="Diecast Store Logo" className="w-full h-full object-contain object-left" />
                </div>
              )}
              <h3 className="text-4xl md:text-6xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase">Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                A high-performance e-commerce platform built specifically for diecast collectors. Designed with F1 telemetry and automotive precision aesthetics, it manages the entire lifecycle of high-value exhibits — from a stock-aware "Vault" (cart) to real-time logistics tracking and automated PDF manifesto generation.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                I approached this project with a design-first mindset since it was for an actual user base. I first mapped out the design theme — opting for a strict, high-contrast palette to prevent eye strain while maintaining a premium, brutalist aesthetic — and built an interactive prototype. Once the client was satisfied, I iteratively added complex features like robust variant state management, a cinematic "Journal" section, and gamified logistics telemetry.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://www.thediecaststore.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-[#FF1E1E] text-white font-bold text-xs tracking-widest hover:bg-white hover:text-[#0A0A0A] transition-all duration-300 w-max">
                  VISIT THEDIECASTSTORE.IN
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase">Build Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Prisma</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Razorpay</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Shiprocket</span>
                  <span className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">Clerk Auth</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase">Palette</h4>
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

      {/* Slide 2: Core Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase mb-[-1rem]">Core Telemetry</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px] bg-[#FF1E1E]" />
              <h4 className="text-3xl tracking-tighter text-white font-sans font-black uppercase">Zero-Trust Security</h4>
              <p className="text-base leading-relaxed text-[#EF4444] font-sans opacity-95">
                "Building a bulletproof 'Zero-Trust' security system while simultaneously integrating third-party APIs (Razorpay and Shiprocket). Ensuring that no bad actor could bypass payment verification, manipulate order states, or exploit guest checkouts required extremely meticulous state management and strict server-side validation."
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase">The Lock-and-Verify Pattern</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#FF1E1E]/30 rounded-full text-xs text-[#FF1E1E] bg-[#FF1E1E]/5">Collector Vault</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#FF1E1E]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Stock Lock</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#FF1E1E]/30 to-[#EF4444]/30"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#EF4444]/50 rounded-full text-xs text-white font-bold bg-[#EF4444]/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]">Razorpay Handshake</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#EF4444]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Server Verify</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#EF4444]/30 to-[#A6A6A6]/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#A6A6A6]/50 rounded-full text-xs text-[#E2E2E2] bg-[#A6A6A6]/10">Shiprocket Dispatch</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#A6A6A6]/50 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Auto-Heal AWB</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                I implemented a strict checkout pattern that validates stock server-side before initiating the Razorpay handshake. I also audited and patched several edge cases — like enforcing strict user ID validation on Server Actions to prevent IDOR attacks, and completely locking down guest checkout flows to prevent unauthorized order takeovers.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Features & Architecture */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase mb-[-1rem]">Architecture & Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            <div className="relative w-full aspect-square bg-neutral-950/80 border border-[#FF1E1E]/20 hover:border-[#FF1E1E]/60 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl">
              <img src={selectedProject.imageFallback} alt="Diecast Background" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale mix-blend-screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
              <div className="z-10 text-center flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 bg-[#FF1E1E]/10 rounded-full flex items-center justify-center border border-[#FF1E1E]/30">
                    <svg className="w-8 h-8 text-[#FF1E1E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <h4 className="text-2xl font-sans font-black uppercase text-white">Precision Engineering</h4>
                  <p className="text-sm text-neutral-400 font-sans">From the "Pit Wall" store toggle to defensive UI design — every detail is tuned for reliability and performance.</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#FF1E1E]">■</span>
                    <span><strong>The Vault & Checkout:</strong> A stock-aware Collector Vault dashboard with real-time inventory locking, variant-level tracking, and a secure payment handshake.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#FF1E1E]">■</span>
                    <span><strong>Delivery Telemetry:</strong> A visual "Race Track" progress bar for real-time order tracking (GRID_POSITION → PIT_LANE → ON_TRACK → CHECKERED_FLAG) synced with Shiprocket logistics.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#FF1E1E]">■</span>
                    <span><strong>Digital Collector Identity:</strong> Personalized F1-inspired identity cards, unlocking gamified achievements, and automated PDF generation for acquisition documents.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#FF1E1E]">■</span>
                    <span><strong>Custom Journal Editor:</strong> A bespoke text writer tailored for the cinematic "Journal" section, giving admins fine-grained control over storytelling aesthetics.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-tighter text-[#FF1E1E] font-sans font-black uppercase">The Biggest Lesson</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <p className="mt-2 leading-relaxed">I learned that just designing a beautiful website is not enough — security and state awareness are absolutely paramount. You need to be hyper-aware of every source of state and every action your site takes. Patching vulnerabilities like guest order takeovers and IDOR taught me how to make a full-stack application truly bulletproof.</p>
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
