'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { NowPlaying } from '../../utils/spotify';
import { retroAudio } from '../../utils/retroAudio';
import { Y2KWindow } from './Y2KWindow';
import { useOverlayOpen } from './visibility';

/**
 * A disc peeking out of the bottom-left corner, labelled with whatever Sreeja
 * is playing on Spotify. Click to see the track. Hidden entirely until the
 * Spotify env vars are set (see app/utils/spotify.ts).
 */

const POLL_MS = 30_000;

const mmss = (ms = 0) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function timeAgo(iso?: string) {
  if (!iso) return '';
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function NowPlayingDisc() {
  const [data, setData] = useState<NowPlaying | null>(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const overlay = useOverlayOpen();

  // Poll only while the tab is visible.
  useEffect(() => {
    let alive = true;
    let id: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
      try {
        const res = await fetch('/api/now-playing');
        const json: NowPlaying = await res.json();
        if (!alive) return;
        // A failed check comes back "not configured": keep showing the last song we had instead of hiding.
        setData((prev) => (!json.configured && prev?.title ? prev : json));
        if (json.configured) setProgress(json.progressMs ?? 0);
      } catch {
        /* offline: keep whatever we had */
      }
    };
    const start = () => {
      load();
      clearInterval(id);
      id = setInterval(load, POLL_MS);
    };
    const onVisibility = () => (document.hidden ? clearInterval(id) : start());
    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Tick the progress bar locally, only while the panel is open and a song is playing.
  useEffect(() => {
    if (!open || !data?.isPlaying) return;
    const id = setInterval(() => setProgress((p) => Math.min(p + 1000, data.durationMs ?? p)), 1000);
    return () => clearInterval(id);
  }, [open, data]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!data?.configured || !data.title || overlay) return null;

  const playing = data.isPlaying;

  return (
    <div ref={rootRef} className="fixed left-0 bottom-0 z-[64] pause-on-overlay">
      {open && (
        <div className="absolute left-3 bottom-[100px] sm:bottom-[112px] w-[min(300px,calc(100vw-1.5rem))] animate-pop-in origin-bottom-left">
          <Y2KWindow title="now_playing.exe" icon="🎧" onClose={() => setOpen(false)} bodyClassName="p-3">
            <div className="flex gap-3">
              {data.albumArt && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.albumArt} alt={`${data.album} cover`} className="w-20 h-20 rounded-lg border-2 border-ink object-cover shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`font-pixel text-base leading-none ${playing ? 'text-[#14a35a]' : 'text-ink/60'}`}>
                  {playing ? (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-blink mr-1" aria-hidden />
                      sreeja is listening to
                    </>
                  ) : (
                    <>■ last played · {timeAgo(data.playedAt)}</>
                  )}
                </p>
                <p className="font-bubble text-lg leading-tight text-ink mt-1 line-clamp-2">{data.title}</p>
                <p className="text-sm text-ink/75 truncate">{data.artist}</p>
                <p className="font-pixel text-base text-ink/50 truncate">{data.album}</p>
              </div>
            </div>

            {playing && data.durationMs ? (
              <div className="mt-3">
                <div className="y2k-lcd rounded-md h-3" style={{ '--accent': '#ff8fd8' } as React.CSSProperties}>
                  <div className="h-full bg-[#ff8fd8]" style={{ width: `${Math.min(100, (progress / data.durationMs) * 100)}%` }} />
                </div>
                <div className="flex justify-between font-pixel text-base text-ink/60 mt-0.5">
                  <span>{mmss(progress)}</span>
                  <span>{mmss(data.durationMs)}</span>
                </div>
              </div>
            ) : null}

            {data.url && (
              <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="y2k-gloss mt-3 flex items-center justify-center gap-2 rounded-full py-1.5 font-pixel text-lg"
                style={{ '--btn': '#1db954' } as React.CSSProperties}
              >
                open in Spotify ↗
              </a>
            )}
          </Y2KWindow>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          retroAudio.playCassetteInsert();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        aria-label={playing ? `Sreeja is listening to ${data.title} by ${data.artist}` : `Sreeja last played ${data.title} by ${data.artist}`}
        title={playing ? '♪ now playing' : '♪ last played'}
        // Tucked into the corner: only the top-right slice shows. Peeks out more on hover / when open.
        className={`group relative block w-28 h-28 sm:w-32 sm:h-32 transition-transform duration-300 ease-out ${
          open
            ? '-translate-x-[22%] translate-y-[22%]'
            : '-translate-x-[35%] translate-y-[35%] hover:-translate-x-[24%] hover:translate-y-[24%] focus-visible:-translate-x-[24%] focus-visible:translate-y-[24%]'
        }`}
      >
        <span
          className={`absolute inset-0 rounded-full overflow-hidden y2k-holo border-[3px] border-white shadow-[0_4px_16px_rgba(122,0,68,0.4)] ${playing ? 'animate-disc-spin' : ''}`}
          style={{ animationDuration: '3.5s' }}
        >
          {/* one picture disc: the cover printed edge to edge */}
          {data.albumArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.albumArt} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {/* faint grooves + shine so it reads as a disc, not a photo */}
          <span className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,transparent_0_3px,rgba(255,255,255,0.08)_3px_4px)]" />
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.55)_0%,transparent_30%,transparent_70%,rgba(255,255,255,0.25)_100%)]" />
          <span className="absolute inset-[40%] rounded-full bg-[#ffe1f1] border-2 border-white shadow-inner" />
        </span>
        {playing && (
          <span className="absolute -top-2 right-1 font-pixel text-xl text-hotpink [text-shadow:0_0_6px_#fff] animate-y2k-float" aria-hidden>
            ♪
          </span>
        )}
      </button>
    </div>
  );
}
