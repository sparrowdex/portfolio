'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

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
          vec3 chromeGradient = mix(vec3(0.18, 0.2, 0.25), vec3(0.98, 0.99, 1.0), vec3(fresnel + pow(shine, 4.0)));
          
          vec3 finalColor = mix(uColor, chromeGradient, uIsChrome);
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

export default function Home() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const [showHoverHint, setShowHoverHint] = useState(false);
  const [hintHasBeenShown, setHintHasBeenShown] = useState(false);
  const slides = ['SEE CREATIVITY', 'SEE PROJECTS', 'GET TO KNOW HER'];

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slides.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleStructureClick = () => {
    if (!hasClicked) setHasClicked(true);
    setThemeIdx((prev) => (prev + 1) % APP_THEMES.length);
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

      {/* 1. Dynamic WebGL Canvas Container placed underneath HTML layer */}
      <div
        className="absolute inset-0 z-0 cursor-pointer"
        onClick={handleStructureClick}
        onMouseEnter={handleCanvasMouseEnter}
      >
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
          <InteractiveEcosystem currentThemeColor={currentTheme} themeIdx={themeIdx} />
        </Canvas>
      </div>

      {/* Navigation header without mix-blend-difference for readability */}
      <div className="absolute top-0 left-0 right-0 z-20 p-12 pointer-events-none">
        <header className="flex justify-end items-start w-full pointer-events-auto">
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

          <div className="relative h-4 w-full empty:hidden">
            {showHoverHint && (
              <span
                className="absolute top-0 left-0 font-mono text-[10px] tracking-widest font-bold block transition-all duration-500 ease-out animate-pulse opacity-50"
                style={{ color: themeIdx === 0 ? '#ffffff' : currentTheme }}
              >
                [ CLICK ON THE FLOWER TO INTERACT ]
              </span>
            )}
          </div>

          <p className="text-gray-400 font-mono text-xs max-w-xs leading-relaxed opacity-70 mt-0">
            Building interfaces, full-stack tools, and interactive visual frameworks.
          </p>
        </div>

        {/* Cleaned HUD Gutter Footer */}
        <footer className="w-full flex justify-between font-mono text-[10px] text-neutral-500 tracking-wider">
          <span>PORTFOLIO 2026</span>
          <span>SUBTLE SYSTEM</span>
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