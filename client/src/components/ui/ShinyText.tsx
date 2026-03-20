'use client';

import { CSSProperties } from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}
      style={
        {
          '--shiny-duration': animationDuration,
        } as CSSProperties
      }
    >
      {text}
      <style>{`
        .shiny-text {
          display: inline-block;
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 20%,
            rgba(255,255,255,0.9) 50%,
            rgba(255,255,255,0) 80%
          ),
          linear-gradient(120deg, #6366f1, #a855f7, #06b6d4);
          background-size: 200% 100%, 100% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }
        .shiny-text:not(.disabled) {
          animation: shiny-sweep var(--shiny-duration, 5s) linear infinite;
        }
        @keyframes shiny-sweep {
          0% { background-position: 200% center, 0 0; }
          100% { background-position: -200% center, 0 0; }
        }
      `}</style>
    </span>
  );
}
