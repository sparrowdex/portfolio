# Archive: Mobile Glass Bubbles (Optimized & Polished)

This file preserves the highly optimized, 60fps version of the interactive, poppable 2D glass bubbles for the mobile layout. 

### Key Features of this version:
1. **GPU-Accelerated Physics**: Uses a `useRef` physics engine and `translate3d` Vanilla DOM updates instead of React state loops to guarantee perfectly smooth 60fps movement without layout recalculations.
2. **Optimized Glass Rendering**: Replaces the extremely heavy `backdrop-filter: blur()` with a hyper-performant `radial-gradient` that achieves an identical glassy aesthetic with zero GPU composite cost.
3. **Ghost-Ring Pop Animation**: Clicking a bubble causes the glossy inner gradient to shrink and vanish instantly, while leaving behind a satisfying outer glass ring that slowly expands and fades into the background over 1 full second.
4. **Endless Mode**: Once all 12 bubbles are popped, a fresh set spawns automatically after a 1-second delay.

## React Component

```tsx
import { useState, useEffect, useRef } from 'react';

export function MobileGlassBubbles() {
  const [bubbles, setBubbles] = useState<any[]>([]);
  const physicsRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const spawn = () => {
      const newBubbles = Array.from({ length: 12 }).map((_, i) => {
        const size = 40 + Math.random() * 50;
        return {
          id: Date.now() + i,
          x: Math.random() * (window.innerWidth - size),
          y: Math.random() * (window.innerHeight - size),
          size,
          vx: (Math.random() - 0.5) * 3.5, // Faster, bouncy speed
          vy: (Math.random() - 0.5) * 3.5,
          popped: false
        };
      });
      physicsRef.current = newBubbles;
      setBubbles(newBubbles); // Render DOM nodes once
    };

    spawn();

    let animationId: number;
    const animate = () => {
      if (!physicsRef.current || !containerRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const nodes = containerRef.current.children;
      let allPopped = true;

      physicsRef.current.forEach((b, i) => {
        if (!b.popped) {
          allPopped = false;
          b.x += b.vx;
          b.y += b.vy;

          if (b.x <= 0 || b.x >= window.innerWidth - b.size) b.vx *= -1;
          if (b.y <= 0 || b.y >= window.innerHeight - b.size) b.vy *= -1;

          const el = nodes[i] as HTMLDivElement;
          if (el) {
            // Hardware-accelerated movement via the GPU
            el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) scale(1)`;
          }
        }
      });

      if (allPopped && physicsRef.current.length > 0) {
        physicsRef.current = []; // clear to prevent multi-trigger
        setTimeout(spawn, 1000);
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  const popBubble = (index: number) => {
    if (physicsRef.current[index] && !physicsRef.current[index].popped) {
      physicsRef.current[index].popped = true;
      const el = containerRef.current?.children[index] as HTMLDivElement;
      if (el) {
        el.style.pointerEvents = 'none';
        
        const surface = el.querySelector('.bubble-surface') as HTMLDivElement;
        const outline = el.querySelector('.bubble-outline') as HTMLDivElement;
        
        if (surface) {
          surface.style.opacity = '0';
          surface.style.transform = 'scale(0.8)';
        }
        if (outline) {
          outline.style.opacity = '0';
          outline.style.transform = 'scale(1.15)'; // Slight expansion for a satisfying pop ring
        }
      }
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] pointer-events-none md:hidden overflow-hidden">
      {bubbles.map((b, i) => (
        <div
          key={b.id}
          className="absolute pointer-events-auto cursor-pointer"
          onTouchStart={() => popBubble(i)}
          onMouseDown={() => popBubble(i)}
          style={{
            left: 0,
            top: 0,
            width: b.size,
            height: b.size,
            transform: `translate3d(${b.x}px, ${b.y}px, 0)`
          }}
        >
          {/* The lingering outline ring (Fades slowly over 1s) */}
          <div 
            className="bubble-outline absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(255,255,255,0.4)',
              transition: 'opacity 1s ease-out, transform 1s ease-out',
            }}
          />

          {/* The glossy surface of the bubble (Pops instantly) */}
          <div 
            className="bubble-surface absolute inset-0 rounded-full transition-all duration-150"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.0))',
              boxShadow: 'inset 0 0 10px rgba(255,255,255,0.2), inset 4px 4px 10px rgba(255,255,255,0.4), inset -4px -4px 10px rgba(0,0,0,0.15), 0 4px 10px rgba(0,0,0,0.15)',
            }}
          >
            <div className="absolute top-[15%] left-[20%] w-[35%] h-[15%] rounded-full bg-white opacity-60 blur-[1px] rotate-[-45deg]" />
          </div>
        </div>
      ))}
    </div>
  );
}
```
