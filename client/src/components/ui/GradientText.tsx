'use client';

import { ReactNode, CSSProperties } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className = '',
  colors = ['#6366f1', '#a855f7', '#06b6d4', '#6366f1'],
  animationSpeed = 6,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(', ')})`,
    backgroundSize: '300% 300%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    animation: `gradient-shift ${animationSpeed}s ease infinite`,
    display: 'inline-block',
  };

  return (
    <>
      <span style={gradientStyle} className={className}>
        {children}
      </span>
      <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </>
  );
}
