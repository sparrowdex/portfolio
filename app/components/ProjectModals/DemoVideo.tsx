'use client';
import { useState, useRef } from 'react';

export const DemoVideo = ({ src, startTime = 0, endTime, skipStartTime, skipEndTime, autoPlay = true, loop = true, className = "", spinnerColor }: { src: string, startTime?: number, endTime?: number, skipStartTime?: number, skipEndTime?: number, autoPlay?: boolean, loop?: boolean, className?: string, spinnerColor?: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const handleEnded = () => {
    if (videoRef.current && loop) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;

      // Handle skip range
      if (skipStartTime !== undefined && skipEndTime !== undefined && currentTime >= skipStartTime && currentTime < skipEndTime) {
        videoRef.current.currentTime = skipEndTime;
      }

      // Handle custom end time loop
      if (endTime && currentTime >= endTime) {
        if (loop) {
          videoRef.current.currentTime = startTime;
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }
  };

  return (
    <div className={`relative group overflow-hidden bg-neutral-900 ${className}`}>
      {/* Loading Placeholder */}
      {(!isLoaded || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 text-white/70 transition-opacity duration-300 pointer-events-none">
          <svg className={`w-8 h-8 animate-spin ${spinnerColor ? '' : 'text-neutral-500'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={spinnerColor ? { color: spinnerColor } : {}}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => {
          setIsLoaded(true);
          setIsBuffering(false);
        }}
        onLoadedMetadata={() => {
          if (videoRef.current && startTime > 0) {
            videoRef.current.currentTime = startTime;
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {isLoaded && (
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 p-3 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 z-20"
        >
          {isMuted ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      )}
    </div>
  );
};
