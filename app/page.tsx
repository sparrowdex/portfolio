'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import Image from 'next/image';

const APP_THEMES = [
  '#d5dbe3', // 1. Initial State: Reflective Chrome Silver Core
  '#ff007f', // Fuchsia Pink
  '#4169e1', // Royal Blue
  '#87ceeb', // Light Blue
  '#fffdd0', // Cream
  '#39ff14'  // Neon Green
];

function InteractiveEcosystem({ currentThemeColor, themeIdx }: { currentThemeColor: string; themeIdx: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);

  const petalLayers = useMemo(() => {
    const layers = [];
    const totalLayers = 8;
    for (let l = 0; l < totalLayers; l++) {
      const radius = 0.5 + l * 0.12;
      const tubeRadius = 0.012 - l * 0.001;
      const geometry = new THREE.TorusKnotGeometry(radius, tubeRadius, 200, 16, 4, 7);
      layers.push(geometry);
    }
    return layers;
  }, []);

  const customShaderMaterial = useMemo(() => {
    return {
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uIsChrome;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          
          float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
          float shine = max(dot(reflect(-viewDir, normal), vec3(0.5, 0.5, 1.0)), 0.0);
          
          // Chrome theme (high contrast grayscale)
          vec3 chromeGradient = mix(vec3(0.18, 0.2, 0.25), vec3(0.98, 0.99, 1.0), vec3(fresnel + pow(shine, 4.0)));
          
          // Colored themes (apply lighting, shadow, and specular shine to uColor)
          vec3 colored3D = mix(uColor * 0.3, uColor * 1.5, vec3(fresnel)); 
          colored3D += pow(shine, 4.0) * uColor * 0.8;
          
          vec3 finalColor = mix(colored3D, chromeGradient, uIsChrome);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    };
  }, []);

  useFrame(() => {
    const time = performance.now() * 0.001;
    if (groupRef.current) {
      groupRef.current.rotation.z = time * 0.03;
      groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.04;
    }

    const targetColor = new THREE.Color(currentThemeColor);
    const isChromeTarget = themeIdx === 0 ? 1.0 : 0.0;

    materialsRef.current.forEach((mat) => {
      if (mat && mat.uniforms) {
        mat.uniforms.uColor.value.lerp(targetColor, 0.08);
        mat.uniforms.uIsChrome.value = THREE.MathUtils.lerp(mat.uniforms.uIsChrome.value, isChromeTarget, 0.08);
      }
    });
  });

  return (
    <group>
      <group ref={groupRef} position={[2.8, 0, -1.0]} scale={[1.9, 1.9, 1.9]}>
        {petalLayers.map((geom, idx) => (
          <mesh key={idx} geometry={geom}>
            <shaderMaterial
              ref={(el) => {
                if (el) materialsRef.current[idx] = el as THREE.ShaderMaterial;
              }}
              vertexShader={customShaderMaterial.vertexShader}
              fragmentShader={customShaderMaterial.fragmentShader}
              wireframe
              transparent
              uniforms={useMemo(() => ({
                uColor: { value: new THREE.Color(currentThemeColor) },
                uIsChrome: { value: themeIdx === 0 ? 1.0 : 0.0 }
              }), [])}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function MobileAccordionFlowers() {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setMounted(true);
      setExpanded(true);
    }, 400); // Small delay for the dramatic accordion open
    return () => clearTimeout(t);
  }, []);

  const images = [
    { src: '/images/flower_red.svg', z: 10 },
    { src: '/images/flower_orange.svg', z: 20 },
    { src: '/images/flower_blue.svg', z: 30 },
    { src: '/images/flower.png', z: 40 },
  ];

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-auto md:hidden overflow-hidden z-0"
      style={{ perspective: '1200px' }}
    >
      <div
        className="relative w-[40vw] h-[60vw] max-w-[200px] max-h-[280px] min-w-[150px] min-h-[210px] select-none transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'translateY(8vh) rotateX(55deg) rotateZ(-40deg)',
        }}
      >
        {images.map((img, i) => {
          // Accordion effect: Stacked closely when collapsed, fanned out widely on Z-axis when expanded
          const offsetZ = expanded ? i * 55 : i * 12;
          const offsetX = expanded ? i * -12 : 0;
          const offsetY = expanded ? i * 12 : 0;

          return (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] rounded-3xl border border-white/20 bg-[#0d0d0d]/80 backdrop-blur-md flex items-center justify-center overflow-hidden"
              style={{
                transform: `translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px)`,
                zIndex: img.z,
                boxShadow: expanded
                  ? '-30px 30px 40px rgba(0,0,0,0.9), inset 1px 1px 0px rgba(255,255,255,0.15)'
                  : '-10px 10px 20px rgba(0,0,0,0.7), inset 1px 1px 0px rgba(255,255,255,0.1)',
              }}
            >
              {/* Glass reflection highlight */}
              <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              <div className="relative w-[85%] h-[85%] opacity-90 drop-shadow-2xl">
                <Image
                  src={img.src}
                  alt={`Flower Layer ${i}`}
                  fill
                  sizes="(max-width: 768px) 40vw, 200px"
                  priority={true}
                  className="object-contain"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showHoverHint, setShowHoverHint] = useState(false);
  const [hintHasBeenShown, setHintHasBeenShown] = useState(false);
  const [baseFrequency, setBaseFrequency] = useState(0.015);
  const [distortionScale, setDistortionScale] = useState(22);
  const slides = ['SEE CREATIVITY', 'SEE PROJECTS', 'GET TO KNOW HER'];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Dynamic SVG liquid distortion animation loop
  useEffect(() => {
    let animationFrameId: number;
    const tick = () => {
      const time = performance.now() * 0.0008;
      setBaseFrequency(0.012 + Math.sin(time * 1.8) * 0.003);

      // Decay scale back to 22 smoothly
      setDistortionScale((prev) => {
        if (prev > 22.1) {
          return prev + (22 - prev) * 0.025; // Slower, more natural wave decay
        }
        return 22;
      });

      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleStructureClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasClicked) setHasClicked(true);
    setThemeIdx((prev) => (prev + 1) % APP_THEMES.length);
    setDistortionScale(80); // Surge distortion for liquid splash feel
  };

  const handleCanvasMouseEnter = () => {
    if (!hintHasBeenShown) {
      setShowHoverHint(true);
      setHintHasBeenShown(true);
      setTimeout(() => {
        setShowHoverHint(false);
      }, 4000);
    }
  };

  const currentTheme = APP_THEMES[themeIdx];

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">


      {/* 1. Background Interactive Area */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        onMouseEnter={handleCanvasMouseEnter}
      >
        <MobileAccordionFlowers />

        {/* Desktop WebGL Canvas */}
        <div
          className="hidden md:block w-full h-full cursor-pointer"
          onClick={handleStructureClick}
        >
          <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
            <InteractiveEcosystem currentThemeColor={currentTheme} themeIdx={themeIdx} />
          </Canvas>
        </div>
      </div>

      {/* SVG Liquid Distortion Filter */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-distortion">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${baseFrequency} ${baseFrequency * 1.4}`}
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={distortionScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Navigation header aligned to center on mobile, right on desktop */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 md:p-12 pointer-events-none">
        <header className="flex justify-center md:justify-end items-start w-full pointer-events-auto">
          <nav className="flex gap-4 font-mono text-xs">
            <a
              href="/projects"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white transition-all duration-300 rounded-full backdrop-blur-md shadow-lg tracking-wider font-medium"
            >
              Projects
            </a>
            <a
              href="/about"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white transition-all duration-300 rounded-full backdrop-blur-md shadow-lg tracking-wider font-medium"
            >
              About
            </a>
            <a
              href="/contact"
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white transition-all duration-300 rounded-full backdrop-blur-md shadow-lg tracking-wider font-medium"
            >
              Contact
            </a>
          </nav>
        </header>
      </div>

      {/* 2. Unified HTML Interface Overlay using global mix-blend-difference for crisp cuts */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-12 pointer-events-none text-white mix-blend-difference">

        <div className="h-12" />

        <div className="max-w-4xl pointer-events-auto flex flex-col gap-2 my-auto">
          <div className="flex flex-col gap-1 cursor-default">
            <span className="font-mono text-xs tracking-widest uppercase opacity-60">Welcome to</span>
            <h1 className="text-5xl font-light tracking-tight leading-none md:text-7xl">
              <span className="font-playfair italic text-[#e2e8f0] font-normal tracking-wide pl-1">Sreeja's</span> Portfolio
            </h1>
          </div>

          {/* Shifting automated line descriptor */}
          <div className="h-6 overflow-hidden relative w-full">
            <div
              className="transition-transform duration-700 ease-in-out flex flex-col"
              style={{ transform: `translateY(-${slideIdx * 24}px)` }}
            >
              {slides.map((text, i) => (
                <span
                  key={i}
                  className="font-mono text-xs tracking-widest font-semibold h-6 flex items-center transition-colors duration-500"
                  style={{ color: currentTheme }}
                >
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div
            className={`relative w-full hidden md:block transition-all duration-500 ease-in-out ${showHoverHint ? 'h-4 opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}
          >
            <span
              className="absolute top-0 left-0 font-mono text-[10px] tracking-widest font-bold block transition-all duration-500 ease-out animate-pulse opacity-50 whitespace-nowrap"
              style={{ color: themeIdx === 0 ? '#ffffff' : currentTheme }}
            >
              [ CLICK ON THE FLOWER TO INTERACT ]
            </span>
          </div>

          <p className="text-gray-400 font-mono text-xs max-w-xs leading-relaxed opacity-70 mt-0">
            Building interfaces, full-stack tools, and interactive visual frameworks.
          </p>
        </div>

        {/* Cleaned HUD Gutter Footer */}
        <footer className="w-full flex justify-between font-mono text-[10px] text-neutral-500 tracking-wider">
          <span>PORTFOLIO 2026</span>
        </footer>
      </div>

      {/* Faded Background Bottom Glow Wave */}
      <div
        className="absolute bottom-0 left-0 w-full h-36 pointer-events-none transition-all duration-1000 ease-out opacity-20 blur-3xl z-0"
        style={{
          background: `linear-gradient(to top, ${currentTheme}, transparent)`
        }}
      />

    </main>
  );
}