'use client';

import React, { useRef, useState } from 'react';

interface Y2KWindowProps {
  title: string;
  icon?: string;
  /** Re-skins title bar, border and shadow. Defaults to the global hot pink. */
  accent?: string;
  /** Drag by the title bar (pointer: fine devices only). */
  draggable?: boolean;
  className?: string;
  bodyClassName?: string;
  style?: React.CSSProperties;
  /** Turns the red title-bar dot into a working close button. */
  onClose?: () => void;
  /** Fired when the user grabs / releases the title bar (draggable windows only). */
  onDragStart?: () => void;
  onDragEnd?: () => void;
  children: React.ReactNode;
}

/** A Windows-98-meets-Aqua window with a glossy chrome title bar. */
export function Y2KWindow({
  title,
  icon = '✦',
  accent,
  draggable = false,
  className = '',
  bodyClassName = 'p-4',
  style,
  onClose,
  onDragStart,
  onDragEnd,
  children,
}: Y2KWindowProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [minimised, setMinimised] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);

  const canDrag = () =>
    draggable && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canDrag() || (e.target as HTMLElement).closest('button')) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture not available: dragging still works while over the bar */
    }
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseX: offset.x, baseY: offset.y };
    onDragStart?.();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    setOffset({ x: d.baseX + e.clientX - d.startX, y: d.baseY + e.clientY - d.startY });
  };
  const endDrag = () => {
    if (dragRef.current) onDragEnd?.();
    dragRef.current = null;
  };

  return (
    <div
      className={`y2k-window overflow-hidden ${className}`}
      style={{
        ...(accent ? ({ '--accent': accent } as React.CSSProperties) : {}),
        ...style,
        translate: offset.x || offset.y ? `${offset.x}px ${offset.y}px` : undefined,
      }}
    >
      <div
        className={`y2k-titlebar flex items-center justify-between gap-2 px-2.5 py-1.5 select-none ${
          draggable ? 'md:cursor-grab md:active:cursor-grabbing' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={() => setOffset({ x: 0, y: 0 })}
      >
        <span className="font-pixel text-lg leading-none text-white truncate [text-shadow:1px_1px_0_rgba(0,0,0,0.35)]">
          <span aria-hidden className="mr-1.5">{icon}</span>
          {title}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            aria-label={minimised ? 'Restore window' : 'Minimise window'}
            onClick={() => setMinimised((m) => !m)}
            className="y2k-dot w-3.5 h-3.5 rounded-full"
            style={{ '--dot': '#ffd84a' } as React.CSSProperties}
          />
          <span aria-hidden className="y2k-dot w-3.5 h-3.5 rounded-full" style={{ '--dot': '#5ee08a' } as React.CSSProperties} />
          {onClose ? (
            <button
              type="button"
              aria-label="Close window"
              onClick={onClose}
              className="y2k-dot w-5 h-5 rounded-full text-[11px] leading-none text-white font-bold flex items-center justify-center"
              style={{ '--dot': '#ff5a7a' } as React.CSSProperties}
            >
              ×
            </button>
          ) : (
            <span aria-hidden className="y2k-dot w-3.5 h-3.5 rounded-full" style={{ '--dot': '#ff5a7a' } as React.CSSProperties} />
          )}
        </div>
      </div>
      {!minimised && <div className={bodyClassName}>{children}</div>}
    </div>
  );
}
