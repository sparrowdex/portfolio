import { Project } from '../../types/project';
import { ScrollReveal } from '../ScrollReveal';
import { useState, useEffect } from 'react';

export const PhotoboothModal = ({ selectedProject }: { selectedProject: Project }) => {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const galleryCards = [
    { id: 0, src: "/images/photobooth/mobile_interface.jpeg", alt: "Mobile Interface" },
    { id: 1, src: "/images/photobooth/photo-strip.png", alt: "Photo Strip", objectFit: "object-contain" },
    { id: 2, src: "/images/photobooth/photobooth-gif.gif", alt: "Demo GIF" }
  ];
  return (
    <div className="flex flex-col gap-16 md:gap-32 pb-20 md:pb-32">
      {/* Slide 1: Hero & Overview */}
      <ScrollReveal>
        <div className="md:min-h-[60vh] flex flex-col justify-center gap-8 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 flex flex-col gap-6">
              <div className="w-24 h-24 flex items-center justify-center overflow-hidden relative">
                <img src="/images/photobooth/logo.png" alt="Photobooth Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-4xl md:text-6xl tracking-wide text-[#ff66b2] font-serif italic capitalize">Overview</h3>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                The Photobooth App is a cross-platform hybrid mobile application created to bring the nostalgic, physical photobooth experience into the digital era. This project is a major milestone for me because it was the first time I built something that interacts directly with device cameras, permissions, and real-time graphics.
              </p>
              <p className="text-sm md:text-base leading-relaxed text-neutral-300 font-sans opacity-90">
                Originally built as a fully responsive React web app, it was compiled into a native Android APK using Capacitor. Powered by p5.js and HTML5 Canvas elements, the app lets users take single photos or sequence layouts, apply retro styles, and export their captures as custom photo strips or animated GIFs across both web and mobile.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a href="https://pinkphotobooth.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff66b2] text-black font-bold text-xs tracking-widest hover:bg-[#ff007f] hover:text-white transition-all duration-300 w-max">
                  VISIT PINKPHOTOBOOTH.APP
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
                <a href="/photobooth/photobooth.apk" download className="inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-[#ff66b2] text-[#ff66b2] font-bold text-xs tracking-widest hover:bg-[#ff66b2]/10 transition-all duration-300 w-max">
                  DOWNLOAD ANDROID APK
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </a>
              </div>
            </div>
            <div className="w-full md:w-80 flex flex-col gap-8 bg-neutral-950/60 p-8 border border-white/5 backdrop-blur-md rounded-2xl">
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#ff66b2] font-serif italic capitalize">Build Tools</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.tech.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-xl tracking-wide text-[#ff66b2] font-serif italic capitalize">Palette</h4>
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

      {/* Slide 2: The Main Video/Demo */}
      <ScrollReveal>
        <div className="md:min-h-[80vh] flex flex-col justify-center gap-6">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#ff66b2] font-serif italic capitalize mb-6">The Demo</h3>
          <div className="relative w-full aspect-video bg-neutral-950/80 border border-[#ff66b2]/20 hover:border-[#ff66b2]/60 rounded-2xl overflow-hidden flex flex-col justify-center items-center group transition-colors duration-500 shadow-2xl">
            <video src="/images/photobooth/photobooth_demo.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 3: Personal Struggle & Architecture */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#ff66b2] font-serif italic capitalize mb-[-1rem]">Architecture</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="flex flex-col gap-6 p-8 md:p-10 bg-neutral-950 border border-white/5 relative overflow-hidden rounded-2xl">
              <div className="absolute top-0 left-0 h-full w-[3px] bg-[#ff66b2]" />
              <h4 className="text-3xl tracking-wide text-white font-serif italic capitalize">The Struggle</h4>
              <p className="text-base leading-relaxed text-[#ff66b2] font-serif italic opacity-95">
                "Since it was my first proper project, I struggled a lot. Building the camera countdown and figuring out how to trigger sequential shots in a perfect loop took me about half a month of debugging and constant adjustments. But overcoming that taught me so much—I realized that coding is not just about making functions work, but about making interactions feel smooth and beautiful. After getting through this first major hurdle, I noticed I got much faster at building and solving problems!"
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <h4 className="text-3xl tracking-wide text-[#ff66b2] font-serif italic capitalize">How Photos Are Rendered</h4>

              <div className="flex flex-col gap-2 bg-neutral-950 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#ff66b2]/30 rounded-full text-xs text-[#ff66b2] bg-[#ff66b2]/5">Camera Stream</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff66b2]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">getUserMedia()</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#ff66b2]/30 to-[#ff007f]/30"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#ff007f]/50 rounded-full text-xs text-white font-bold bg-[#ff007f]/20 shadow-[0_0_15px_rgba(255,0,127,0.3)]">Canvas & p5.js Filters</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#ff007f]/30 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Noir / Vintage</div>
                </div>
                <div className="flex items-center gap-4 ml-12">
                  <div className="w-px h-6 bg-gradient-to-b from-[#ff007f]/30 to-[#800040]/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 border border-[#800040]/50 rounded-full text-xs text-[#ff66b2] bg-[#800040]/20">Stitching & Overlays</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#800040]/50 to-transparent"></div>
                  <div className="px-4 py-2 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">Instant GIF</div>
                </div>
              </div>

              <p className="text-sm md:text-base leading-relaxed text-neutral-400 font-sans">
                I used canvas drawing tools and p5.js to stitch multiple camera capture streams together, overlay custom frames, and apply live filters on top of the pixel grid without slowing down the webpage.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Slide 4: Secondary Media & Features */}
      <ScrollReveal>
        <div className="md:min-h-[70vh] flex flex-col justify-center gap-12">
          <h3 className="text-3xl md:text-4xl tracking-wide text-[#ff66b2] font-serif italic capitalize mb-[-1rem]">Gallery & Features</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Automated Fan Gallery */}
            <div className="relative w-full h-[280px] sm:h-[350px] md:h-[500px] flex items-center justify-center perspective-[1200px]">
              {galleryCards.map((card, idx) => {
                const isActive = activeCard === idx;
                const isPrev = activeCard === (idx + 1) % 3;

                let translateX = 0;
                let translateZ = 0;
                let rotateY = 0;
                let zIndex = 10;
                let opacity = 1;

                if (isActive) {
                  translateX = 0;
                  translateZ = 50;
                  rotateY = 0;
                  zIndex = 30;
                  opacity = 1;
                } else if (isPrev) {
                  translateX = -35;
                  translateZ = -50;
                  rotateY = 15;
                  zIndex = 20;
                  opacity = 0.5;
                } else {
                  translateX = 35;
                  translateZ = -50;
                  rotateY = -15;
                  zIndex = 10;
                  opacity = 0.5;
                }

                return (
                  <div
                    key={card.id}
                    className="absolute h-[85%] max-w-[80%] transition-all duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] flex items-center justify-center"
                    style={{
                      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) ${isActive ? 'scale(1.05)' : 'scale(0.9)'}`,
                      zIndex: zIndex,
                      opacity: opacity,
                    }}
                  >
                    <img src={card.src} alt={card.alt} className="h-full w-auto object-contain" />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide text-[#ff66b2] font-serif italic capitalize">Key Features</h4>
                <ul className="flex flex-col gap-6 text-sm md:text-base font-sans text-neutral-400">
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ff66b2]">■</span>
                    <span><strong>Live Camera Feeds:</strong> Support for grids of 1, 3, 4, or 6 shots directly from the device's web camera.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ff66b2]">■</span>
                    <span><strong>Interactive Filters:</strong> Instant black-and-white noir, vintage tones, and a soft skin-smoothing effect.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ff66b2]">■</span>
                    <span><strong>Custom Message Overlay:</strong> Drag-and-drop handwriting text box that scales and tilts.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <span className="mt-1.5 font-mono text-xs text-[#ff66b2]">■</span>
                    <span><strong>GIF Export:</strong> Automatically compiles frames into a downloadable loop.</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-6">
                <h4 className="text-3xl tracking-wide text-[#ff66b2] font-serif italic capitalize">How I Solved It</h4>
                <div className="space-y-6 font-sans text-sm md:text-base text-neutral-400">
                  <div>
                    <strong className="text-white font-serif italic text-lg">Drag & Rotate Overlays</strong>
                    <p className="mt-2">I wrote custom mouse and touch-pointer logic that calculates coordinate math so users can drag, resize, and rotate handwritten-style letters directly on top of their photo strips.</p>
                  </div>
                  <div>
                    <strong className="text-white font-serif italic text-lg">Camera Permission & Sizing</strong>
                    <p className="mt-2">Managing device aspect ratios was difficult, especially on mobile. I used a custom auto-cropping algorithm that fits the user's camera feed directly into perfectly square Instagram-style bounding boxes.</p>
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
