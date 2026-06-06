'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Project {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  colors: string[];
  colorLabels: string[];
  tech: string[];
  features: string[];
  featuredHighlight?: string;
  specialBadge?: string;
  imageFallback: string;
}

const PROJECTS_DATA: Project[] = [
  {
    id: 1,
    title: 'Photobooth App',
    subtitle: 'My First Proper Project',
    desc: 'An interactive digital capture experience with real-time filters and custom overlay frame styles.',
    longDesc: 'The Photobooth App was my first ever proper project. It serves as a major milestone where I mastered web cameras, HTML5 Canvas rendering, and complex async state. Users can capture photos, apply retro filters, customize templates, and download creations instantly.',
    colors: ['#ff66b2', '#ff007f', '#800040'],
    colorLabels: ['Neon Pink', 'Fuchsia', 'Deep Berry'],
    tech: ['HTML5 Canvas', 'WebRTC Camera API', 'CSS Grid', 'JavaScript'],
    features: ['Real-time filters & effects', 'Custom overlay frame styles', 'High-quality instant downloads'],
    featuredHighlight: 'Custom asynchronous pipeline rendering that cleanly processes pixel filters instantly.',
    imageFallback: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Inner Voice App',
    subtitle: 'Mental Health Platform',
    desc: 'A calming mental wellness workspace focusing on journaling, guided mindfulness, and emotional trackers.',
    longDesc: 'Inner Voice is a dedicated mental wellness platform built to provide a safe space for mindfulness, self-reflection, and guided emotional wellness exercises.',
    colors: ['#87ceeb', '#4169e1', '#9370db'],
    colorLabels: ['Light Blue', 'Royal Blue', 'Soft Purple'],
    tech: ['React', 'Next.js', 'Chart.js', 'Web Audio API'],
    features: ['Mindful mood journal logging', 'Visual emotional tracking charts', 'Ambient soundscapes'],
    featuredHighlight: 'Dynamic browser layout engine utilizing customized modular local context nodes.',
    imageFallback: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Diecast Store',
    subtitle: 'Premium E-Commerce Showcase',
    desc: 'A sleek e-commerce platform for collectibles featuring an interactive 3D product showcase.',
    longDesc: 'A high-fidelity e-commerce experience tailored specifically for diecast model car collectors. It features dynamic custom 3D model showcases where users can rotate, inspect, and configure vehicles.',
    colors: ['#ff0000', '#ff8c00', '#aaaaaa', '#0a0a0a'],
    colorLabels: ['Crimson Red', 'Blaze Orange', 'Metallic Grey', 'Obsidian Black'],
    tech: ['Three.js', 'React Three Fiber', 'Next.js', 'Stripe API'],
    features: ['Interactive 3D model inspector', 'Advanced multi-tier product filter', 'Sleek dark mode interfaces'],
    featuredHighlight: 'Procedural non-aliased glass shader configuration projecting realistic reflections.',
    imageFallback: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Armatrix',
    subtitle: 'Special Interactive Startup Page',
    desc: 'An award-winning replication of the Armatrix startup team page with highly interactive, cybernetic grids.',
    longDesc: 'Armatrix was a special project designed to replicate a futuristic, interactive team directory page for the Armatrix startup company.',
    colors: ['#39ff14', '#6b7280', '#000000'],
    colorLabels: ['Neon Green', 'Tech Grey', 'Pure Black'],
    tech: ['React', 'CSS Grid & Flexbox', 'Framer Motion', 'Custom Shaders'],
    features: ['Dynamic mouse-reactive bio cards', 'Cybernetic neon layout styles', 'Performance-optimized rendering'],
    specialBadge: 'Most Creative Submission',
    featuredHighlight: 'Complex kinetic mouse-relative tracking vectors linked into hardware-accelerated grid layers.',
    imageFallback: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Flowers for Beloved',
    subtitle: 'Experimental WebGL Systems & Gift Art',
    desc: 'An interactive exploration of parametric mathematics, structural flower generation, and real-time canvas code.',
    longDesc: 'Built strictly to practice deep WebGL mesh layout logic, math pipelines, and hardware-accelerated movement. This project builds intricate, multi-layered organic plant nodes.',
    colors: ['#8A9A5B', '#ffb7c5', '#ffd700', '#4b0082'],
    colorLabels: ['Sage Green Base', 'Blossom Pink', 'Golden Flora', 'Deep Violet'],
    tech: ['Three.js', 'Custom GLSL Shaders', 'React Three Fiber', 'Web Audio API'],
    features: ['Multi-layered Rose Curve procedural blooms', 'Dynamic screen color synchronization loops', 'Zero-overhead non-aliased gradient math'],
    featuredHighlight: 'Custom GPU-bound fragment shader architecture calculating realistic Fresnel reflection bands.',
    imageFallback: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=600&auto=format&fit=crop'
  }
];

// --- DYNAMIC CONSTELLATION MATH ENGINE ---
// Generates parametric shapes to morph the stars into when hovered
const NUM_STARS = 150;
function getConstellationShapes() {
  const shapes: Record<string, THREE.Vector3[]> = { random: [], camera: [], heart: [], car: [], am_logo: [], flower: [] };

  for (let i = 0; i < NUM_STARS; i++) {
    const t = (i / NUM_STARS) * Math.PI * 2;

    // 0. RANDOM (Scattered gracefully in background)
    shapes.random.push(new THREE.Vector3((Math.random() - 0.5) * 35, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15));

    // For shapes, we use fewer stars (e.g. 100) and let the rest drift as ambient particles
    // so not all stars gather, only the ones needed for the vertices.
    const isShapePart = i < 100;
    const st = isShapePart ? (i / 100) * Math.PI * 2 : 0;

    // 1. CAMERA (Photobooth) - Box and inner circle
    if (isShapePart) {
      if (i < 60) {
        const p = i / 60;
        const cx = p < 0.25 ? -3.5 + (p / 0.25) * 7 : p < 0.5 ? 3.5 : p < 0.75 ? 3.5 - ((p - 0.5) / 0.25) * 7 : -3.5;
        const cy = p < 0.25 ? 2.5 : p < 0.5 ? 2.5 - ((p - 0.25) / 0.25) * 5 : p < 0.75 ? -2.5 : -2.5 + ((p - 0.75) / 0.25) * 5;
        shapes.camera.push(new THREE.Vector3(cx, cy, 0));
      } else {
        const tc = ((i - 60) / 40) * Math.PI * 2;
        shapes.camera.push(new THREE.Vector3(1.5 * Math.cos(tc), 1.5 * Math.sin(tc), 0));
      }

      // 2. HEART (Inner Voice)
      const hx = 3.5 * Math.pow(Math.sin(st), 3);
      const hy = 3.5 * (Math.cos(st) - 0.4 * Math.cos(2 * st) - 0.2 * Math.cos(3 * st) - 0.1 * Math.cos(4 * st));
      // Shrunk to 90% and pushed down by 0.5 units to avoid overlapping the PROJECTS text
      shapes.heart.push(new THREE.Vector3(hx * 0.9, (hy * 0.9) - 0.5, 0));

      // 3. CAR (Diecast)
      if (i < 50) {
        const tc = i / 50;
        shapes.car.push(new THREE.Vector3(-5 + tc * 10, -1 + 2.5 * Math.sin(tc * Math.PI), 0));
      } else if (i < 75) {
        const tw = ((i - 50) / 25) * Math.PI * 2;
        shapes.car.push(new THREE.Vector3(-2.5 + 1.2 * Math.cos(tw), -1.5 + 1.2 * Math.sin(tw), 0));
      } else {
        const tw = ((i - 75) / 25) * Math.PI * 2;
        shapes.car.push(new THREE.Vector3(2.5 + 1.2 * Math.cos(tw), -1.5 + 1.2 * Math.sin(tw), 0));
      }

      // 4. ARMATRIX LOGO ("am") - Exact Geometric Skeleton
      const r_i = i;
      if (r_i < 12) {
        // 1. 'a' stem up: (-2.75, -1.5) to (-2.75, 1.5)
        const p = r_i / 12;
        shapes.am_logo.push(new THREE.Vector3(-2.75, -1.5 + p * 3.0, 0));
      } else if (r_i < 32) {
        // 2. 'a' curve: (-2.75, 1.5) through (-4.25, 0) to (-2.75, -1.5)
        const p = (r_i - 12) / 20;
        const angle = Math.PI / 2 + p * Math.PI; // PI/2 to 3PI/2
        shapes.am_logo.push(new THREE.Vector3(-2.75 + 1.5 * Math.cos(angle), 1.5 * Math.sin(angle), 0));
      } else if (r_i < 36) {
        // 3. jump: (-2.75, -1.5) to (-1.75, -1.5)
        const p = (r_i - 32) / 4;
        shapes.am_logo.push(new THREE.Vector3(-2.75 + p * 1.0, -1.5, 0));
      } else if (r_i < 42) {
        // 4. 'm' left leg up: (-1.75, -1.5) to (-1.75, 0.0)
        const p = (r_i - 36) / 6;
        shapes.am_logo.push(new THREE.Vector3(-1.75, -1.5 + p * 1.5, 0));
      } else if (r_i < 62) {
        // 5. 'm' arch 1: (-1.75, 0.0) through (-0.25, 1.5) to (1.25, 0.0)
        const p = (r_i - 42) / 20;
        const angle = Math.PI - p * Math.PI; // PI to 0
        shapes.am_logo.push(new THREE.Vector3(-0.25 + 1.5 * Math.cos(angle), 1.5 * Math.sin(angle), 0));
      } else if (r_i < 68) {
        // 6. 'm' mid down: (1.25, 0.0) to (1.25, -1.5)
        const p = (r_i - 62) / 6;
        shapes.am_logo.push(new THREE.Vector3(1.25, 0.0 - p * 1.5, 0));
      } else if (r_i < 74) {
        // 7. 'm' mid up: (1.25, -1.5) to (1.25, 0.0)
        const p = (r_i - 68) / 6;
        shapes.am_logo.push(new THREE.Vector3(1.25, -1.5 + p * 1.5, 0));
      } else if (r_i < 94) {
        // 8. 'm' arch 2: (1.25, 0.0) through (2.75, 1.5) to (4.25, 0.0)
        const p = (r_i - 74) / 20;
        const angle = Math.PI - p * Math.PI; // PI to 0
        shapes.am_logo.push(new THREE.Vector3(2.75 + 1.5 * Math.cos(angle), 1.5 * Math.sin(angle), 0));
      } else {
        // 9. 'm' right leg down: (4.25, 0.0) to (4.25, -1.5)
        const p = (r_i - 94) / 6;
        shapes.am_logo.push(new THREE.Vector3(4.25, 0.0 - p * 1.5, 0));
      }

      // 5. FLOWER (Flowers for Beloved)
      const r = 4.5 * Math.sin(5 * st);
      shapes.flower.push(new THREE.Vector3(Math.cos(st) * r, Math.sin(st) * r, 0));
    } else {
      // Unused stars for shapes just use their random drift position
      shapes.camera.push(shapes.random[i].clone());
      shapes.heart.push(shapes.random[i].clone());
      shapes.car.push(shapes.random[i].clone());
      shapes.am_logo.push(shapes.random[i].clone());
      shapes.flower.push(shapes.random[i].clone());
    }
  }
  return shapes;
}

const constellationShapes = getConstellationShapes();

function DynamicStarfieldEcosystem({ currentThemeColor, hoverTargetKey }: { currentThemeColor: string, hoverTargetKey: string }) {
  const bgStarsRef = useRef<THREE.Points>(null);
  const bgMatRef = useRef<THREE.ShaderMaterial>(null);
  const constGeoRef = useRef<THREE.BufferGeometry>(null);
  const constMatRef = useRef<THREE.LineBasicMaterial>(null);

  // Wide, slow ambient background starfield with a concentrated galaxy band
  const bgGeometry = useMemo(() => {
    const pCount = 6000; // Massively increased count to fill all corners
    const pos = new Float32Array(pCount * 3);
    const sca = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      if (i < 2500) {
        // Galactic band (Milky Way / Spiral feel)
        const radius = Math.pow(Math.random(), 1.5) * 50; // Dense core, tapering edges
        const theta = Math.random() * Math.PI * 2;
        const spiralAngle = theta + radius * 0.15; // Spiral arms

        let x = Math.cos(spiralAngle) * radius;
        let y = (Math.random() - 0.5) * 2.5 * Math.random(); // Flattened thin disk
        let z = Math.sin(spiralAngle) * radius;

        // Tilt the whole galaxy by ~30 degrees so it forms a dynamic diagonal band
        const tiltZ = 0.5;
        const tiltX = 0.2;

        let y1 = y * Math.cos(tiltZ) - x * Math.sin(tiltZ);
        let x1 = y * Math.sin(tiltZ) + x * Math.cos(tiltZ);

        let z1 = z * Math.cos(tiltX) - y1 * Math.sin(tiltX);
        let y2 = z * Math.sin(tiltX) + y1 * Math.cos(tiltX);

        pos[i * 3] = x1;
        pos[i * 3 + 1] = y2;
        pos[i * 3 + 2] = z1 - 10;
      } else {
        // Deep space scattered ambient stars (3500 stars to fill all empty space)
        pos[i * 3] = (Math.random() - 0.5) * 120; // Super wide X distribution
        pos[i * 3 + 1] = (Math.random() - 0.5) * 80;  // Super wide Y distribution
        pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 15;
      }

      // Extreme size variance: Math.pow makes 90% of stars tiny, 10% very large and bright
      sca[i] = Math.pow(Math.random(), 5) * 4.5 + 0.2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(sca, 1));
    return geo;
  }, []);

  // Initial array for the morphing constellation line
  const constellationPositions = useMemo(() => new Float32Array(NUM_STARS * 3), []);

  useFrame(() => {
    const time = performance.now() * 0.001;

    // Smooth, very slow rotation for background
    if (bgStarsRef.current) {
      bgStarsRef.current.rotation.y = time * 0.005;
      bgStarsRef.current.rotation.x = Math.sin(time * 0.02) * 0.02;
    }

    // Dynamic color lerping for gradients
    const tColor = new THREE.Color(currentThemeColor);
    if (bgMatRef.current) {
      bgMatRef.current.uniforms.uTime.value = time;
      bgMatRef.current.uniforms.uColor.value.lerp(tColor, 0.03);
      bgMatRef.current.uniforms.uIsChrome.value = THREE.MathUtils.lerp(bgMatRef.current.uniforms.uIsChrome.value, hoverTargetKey === 'random' ? 1.0 : 0.0, 0.03);
    }
    if (constMatRef.current) {
      constMatRef.current.color.lerp(tColor, 0.05);
      constMatRef.current.opacity = THREE.MathUtils.lerp(constMatRef.current.opacity, hoverTargetKey === 'random' ? 0.0 : 0.7, 0.05);
    }

    // Morph the constellation vertices toward the active target shape
    if (constGeoRef.current) {
      const positions = constGeoRef.current.attributes.position.array as Float32Array;
      const targetShape = constellationShapes[hoverTargetKey];
      for (let i = 0; i < NUM_STARS; i++) {
        // Fast, fluid sweeping motion like shooting stars organizing into a shape
        positions[i * 3] += (targetShape[i].x - positions[i * 3]) * 0.08;
        positions[i * 3 + 1] += (targetShape[i].y - positions[i * 3 + 1]) * 0.08;
        positions[i * 3 + 2] += (targetShape[i].z - positions[i * 3 + 2]) * 0.08;
      }
      constGeoRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    // Re-centered and perfectly positioned behind the typography
    <group position={[0, 1.5, -6]}>
      {/* Ambient dispersed starfield */}
      <points ref={bgStarsRef} geometry={bgGeometry}>
        <shaderMaterial
          ref={bgMatRef}
          uniforms={{
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#ffffff') },
            uIsChrome: { value: 1.0 }
          }}
          vertexShader={`
            uniform float uTime;
            attribute float aScale;
            varying float vAlpha;
            void main() {
              vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              gl_PointSize = (25.0 * aScale) * (1.0 / -mvPosition.z);
              vAlpha = aScale;
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            uniform float uIsChrome;
            varying float vAlpha;
            void main() {
              float d = distance(gl_PointCoord, vec2(0.5));
              float strength = 0.08 / d - 0.16;
              vec3 col = mix(uColor, vec3(0.9, 0.95, 1.0), uIsChrome);
              gl_FragColor = vec4(col, strength * vAlpha);
            }
          `}
          transparent depthWrite={false} blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Morphing String-Art Constellation - Scaled down for viewport */}
      <group scale={0.4}>
        <line>
          <bufferGeometry ref={constGeoRef}>
            <bufferAttribute attach="attributes-position" count={100} array={constellationPositions} itemSize={3} />
          </bufferGeometry>
          <lineBasicMaterial ref={constMatRef} color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} linewidth={2} />
        </line>
      </group>
    </group>
  );
}

export default function Projects() {
  const [fanned, setFanned] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [activeExpandingIdx, setActiveExpandingIdx] = useState<number | null>(null);

  const totalDeckCount = 11;
  const titleLetters = ['P', 'r', 'o', 'j', 'e', 'c', 't', 's'];

  useEffect(() => { setTimeout(() => setFanned(true), 400); }, []);

  const deckAssignments = useMemo(() => Array.from({ length: totalDeckCount }).map((_, idx) => PROJECTS_DATA[idx % PROJECTS_DATA.length]), []);

  const handleCardSelect = (proj: Project, idx: number) => {
    setIsExpanding(true); setActiveExpandingIdx(idx);
    setTimeout(() => setSelectedProject(proj), 800);
  };

  const handleClosePanel = () => {
    setSelectedProject(null);
    setTimeout(() => { setIsExpanding(false); setActiveExpandingIdx(null); }, 150);
  };

  const activeHoveredProj = hoveredCardIdx !== null ? deckAssignments[hoveredCardIdx] : null;
  const activeColorTheme = activeHoveredProj ? activeHoveredProj.colors[0] : '#d5dbe3';

  // Maps the hovered card to the respective geometric constellation shape
  const targetShapesMap = ['camera', 'heart', 'car', 'am_logo', 'flower'];
  const hoverTargetKey = hoveredCardIdx === null ? 'random' : targetShapesMap[hoveredCardIdx % 5];

  return (
    <main className="relative w-screen h-screen bg-black text-white overflow-hidden select-none font-mono">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
          <DynamicStarfieldEcosystem currentThemeColor={activeColorTheme} hoverTargetKey={hoverTargetKey} />
        </Canvas>
      </div>

      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out opacity-30 blur-3xl z-0"
        style={{
          background: selectedProject
            ? `radial-gradient(circle at 50% 50%, ${selectedProject.colors[0]}44, transparent 70%)`
            : activeHoveredProj
              ? `radial-gradient(circle at 50% 50%, ${activeHoveredProj.colors[0]}33, transparent 60%)`
              : `radial-gradient(circle at 50% 50%, #ffffff0f, transparent 60%)`
        }}
      />

      <header className="absolute top-0 left-0 right-0 z-30 p-12 flex justify-between items-center pointer-events-auto mix-blend-difference text-white">
        <Link href="/" className="px-5 py-2.5 bg-white/5 border border-white/20 hover:border-white transition-all duration-300 rounded-none text-xs tracking-widest backdrop-blur-md">&larr; BACK</Link>
        <span className="text-[10px] tracking-widest font-bold uppercase opacity-80">PROJECT INDEX 2026</span>
      </header>

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-12 pb-0 pointer-events-none">

        <div className="absolute top-[30%] -translate-y-1/2 w-full flex justify-center items-center z-0 select-none mix-blend-difference text-white">
          <h1
            className="text-[16vw] tracking-tighter flex items-center justify-center relative leading-none mb-0 h-[15vw]"
            style={{ fontFamily: "'Dancing Script', 'Playfair Display', cursive", fontStyle: "italic" }}
          >
            {titleLetters.map((letter, i) => (
              <span key={i} className="transition-all cubic-bezier(0.19, 1, 0.22, 1) select-none inline-block drop-shadow-md" style={{
                transform: fanned ? `translateX(0)` : `translateX(${15 + i * 5}vw)`,
                opacity: fanned ? 1 : 0, transitionDuration: '1400ms', transitionDelay: fanned ? `${i * 80}ms` : '0ms'
              }}>{letter}</span>
            ))}
          </h1>
        </div>

        <div className="absolute bottom-[-110px] w-full max-w-7xl h-[480px] flex justify-center items-end pointer-events-auto card-perspective translate-x-[-24px]">
          {deckAssignments.map((proj, idx) => {
            const isHovered = hoveredCardIdx === idx;
            const isSelected = activeExpandingIdx === idx;

            const transX = fanned ? (idx - 5) * 82 : 1400;
            const transY = fanned ? Math.pow(idx - 5, 2) * 5.0 : 900;
            let hoverShiftX = 0; if (hoveredCardIdx !== null && !isHovered && !isExpanding) hoverShiftX = idx < hoveredCardIdx ? -60 : 60;

            const cardTransform = isSelected
              ? `scale(2.4) translateY(-24vh) translateX(0px) rotateY(0deg) rotateZ(0deg)`
              : `translateX(calc(${transX}px + ${hoverShiftX}px)) translateY(${isHovered ? transY - 60 : transY}px) translateZ(${isHovered ? 150 : 0}px) rotateY(${isHovered ? 0 : -50}deg) rotateZ(${isHovered ? 0 : fanned ? (idx - 5) * 5.2 : 90}deg) scale(${isHovered ? 1.15 : 1})`;

            return (
              <div
                key={idx} onClick={() => handleCardSelect(proj, idx)} onMouseEnter={() => !isExpanding && setHoveredCardIdx(idx)} onMouseLeave={() => !isExpanding && setHoveredCardIdx(null)}
                className={`absolute bottom-24 w-[200px] sm:w-[220px] md:w-[240px] h-[250px] sm:h-[270px] md:h-[280px] rounded-xl border flex flex-col justify-between select-none overflow-hidden cursor-pointer duration-[1100ms] cubic-bezier(0.16, 1, 0.3, 1) ${isSelected ? 'z-[200]' : ''}`}
                style={{
                  transform: cardTransform, transitionDelay: fanned && hoveredCardIdx === null && !isExpanding ? `${(10 - idx) * 95}ms` : '0ms',
                  background: isSelected ? 'linear-gradient(135deg, #09090b 0%, #18181b 100%)' : '#040404',
                  borderColor: isSelected || isHovered ? proj.colors[0] : 'rgba(255, 255, 255, 0.85)',
                  boxShadow: isSelected ? `0 60px 120px -20px ${proj.colors[0]}44, inset 0 0 0 1px rgba(255,255,255,0.05)` : isHovered ? `0 30px 60px -10px ${proj.colors[0]}55, inset 0 1px 0 rgba(255,255,255,0.1)` : '0 4px 20px rgba(0, 0, 0, 0.9), inset 0 0 0 1px rgba(255,255,255,0.05)',
                  zIndex: isSelected ? 300 : (isHovered ? 150 : idx + 10), opacity: fanned ? (isExpanding && !isSelected ? 0 : 1) : 0,
                }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-[48%] border-l border-white/5 overflow-hidden transition-all duration-500 z-0" style={{ opacity: isSelected ? 0.08 : 0.45 }}>
                  <img src={proj.imageFallback} className="w-full h-full object-cover grayscale contrast-125 filter brightness-75" />
                  <div className="absolute inset-0 mix-blend-color transition-opacity duration-500" style={{ backgroundColor: isHovered || isSelected ? proj.colors[0] : '#ffffff', opacity: isHovered || isSelected ? 0.35 : 0.05 }} />
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-[52%] flex flex-col justify-between p-4 z-10 transition-all duration-500 font-sans" style={{ transform: isSelected ? 'scale(0.95)' : 'scale(1)', opacity: isSelected ? 0.1 : 1 }}>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="font-mono text-[9px] font-bold text-white/40 tracking-wider">PROJECT 0{proj.id}</span>
                    <h3 className="text-sm font-bold tracking-tight text-white uppercase mt-1">{proj.title}</h3>
                  </div>
                  <p className="text-[10px] text-neutral-400 line-clamp-3 opacity-90 pr-1">{proj.desc}</p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center w-full font-mono">
                      <div className="flex gap-1">{proj.colors.map((c, cIdx) => <span key={cIdx} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c }} />)}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProject && (
        <div className="fixed inset-0 mountaineer-scroller z-50 overflow-y-auto bg-black flex justify-center items-start p-6 md:p-16 animate-fade-in pointer-events-auto">
          <div className="fixed inset-0 pointer-events-none opacity-30 z-0" style={{ background: `radial-gradient(circle at 80% 20%, ${selectedProject.colors[0]}33, transparent 60%), linear-gradient(to bottom, #000 50%, ${selectedProject.colors[0]}11 100%)` }} />
          <button onClick={handleClosePanel} className="fixed top-12 right-12 z-50 w-12 h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer text-sm font-bold tracking-widest">&times; CLOSE</button>
          <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col gap-10 py-12">
            <div className="flex gap-2 items-center text-xs font-bold text-white/30 tracking-widest">
              <span className="hover:text-white transition-colors cursor-pointer" onClick={handleClosePanel}>INDEX</span><span>/</span><span className="text-white">{selectedProject.title.toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-3">
              {selectedProject.specialBadge && <div className="flex"><span className="text-[9px] px-3 py-1 bg-[#39ff14]/5 border border-[#39ff14]/30 font-bold tracking-widest text-[#39ff14]">★ {selectedProject.specialBadge.toUpperCase()}</span></div>}
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">{selectedProject.title}</h2>
              <p className="text-xs md:text-sm tracking-wider uppercase font-bold" style={{ color: selectedProject.colors[0] }}>{selectedProject.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-10">
              <div className="md:col-span-2 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] tracking-widest text-white/30 font-bold uppercase">// OVERVIEW</h4>
                  <p className="text-sm leading-relaxed text-neutral-300 font-sans opacity-90">{selectedProject.longDesc}</p>
                </div>
                {selectedProject.featuredHighlight && (
                  <div className="flex flex-col gap-3 p-5 bg-neutral-950 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-[2px]" style={{ backgroundColor: selectedProject.colors[0] }} />
                    <h4 className="text-[10px] tracking-widest text-white/40 font-bold uppercase">// ARCHITECTURAL FEATURE HIGHLIGHT</h4>
                    <p className="text-xs leading-relaxed text-neutral-200 font-mono italic opacity-95">"{selectedProject.featuredHighlight}"</p>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] tracking-widest text-white/30 font-bold uppercase">// FEATURES</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-neutral-400">
                    {selectedProject.features.map((feat, fIdx) => <li key={fIdx} className="flex gap-2 items-start"><span style={{ color: selectedProject.colors[0] }} className="mt-0.5 font-mono text-xs">■</span><span>{feat}</span></li>)}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col gap-6 bg-neutral-950/60 p-6 border border-white/5 backdrop-blur-md">
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] tracking-widest text-white/30 font-bold uppercase">// BUILD TOOLS</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.tech.map((t, idx) => <span key={idx} className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-neutral-300 font-mono font-bold uppercase">{t}</span>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] tracking-widest text-white/30 font-bold uppercase">// PALETTE</h4>
                  <div className="flex flex-col gap-2">
                    {selectedProject.colors.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                        <span className="text-[10px] text-neutral-400 font-bold font-mono">{selectedProject.colorLabels[idx]} ({color})</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 mt-auto">
                  <button onClick={() => alert('Launching deployment frame for ' + selectedProject.title)} className="w-full py-3 bg-white text-black font-bold text-[10px] tracking-widest hover:bg-neutral-200 transition-colors duration-300">LAUNCH PRODUCTION DEMO</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}