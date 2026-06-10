# Archive: Concurrent Expanding Ripple Effect (Mobile)

This file documents the React logic and CSS keyframes used to create the 3-ring concurrent ripple effect on the mobile landing page. It was retired in favor of the 3D magnifying bubble, but is preserved here for future reference.

## CSS Keyframes & Classes

```css
@keyframes ripple-wave {
  0% {
    transform: translate(-50%, -50%) scale(0.1);
    opacity: 0.5;
    border-width: 4px;
    filter: blur(1px);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
    border-width: 1px;
    filter: blur(4px);
  }
}

.ripple-effect {
  position: absolute;
  border-style: solid;
  border-radius: 50%;
  pointer-events: none;
  transform-origin: center;
  animation: ripple-wave 2.5s cubic-bezier(0.1, 0.4, 0.2, 1) forwards;
  z-index: 5;
}
```

## React State & Event Handler

```tsx
const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

const handleStructureClick = (e: React.MouseEvent<HTMLDivElement>) => {
  // Capture coordinate of the click relative to the container
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const id = Date.now();
  
  setRipples((prev) => [...prev, { id, x, y }]);
  
  // Cleanup ripple from the DOM after the 2.5s animation finishes (with buffer)
  setTimeout(() => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, 4000);
};
```

## JSX Rendering

```tsx
{ripples.map((ripple) => (
  <div key={ripple.id} className="md:hidden">
    {/* Render 3 rings of different sizes that expand concurrently */}
    {[150, 300, 450].map((size, idx) => (
      <div
        key={idx}
        className="ripple-effect"
        style={{
          left: ripple.x,
          top: ripple.y,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: 'rgba(255, 255, 255, 0.25)'
        }}
      />
    ))}
  </div>
))}
```
