'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame,
} from 'framer-motion';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface ScrollVelocityProps {
  texts: string[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
}

function VelocityText({
  children,
  baseVelocity,
  className,
  damping,
  stiffness,
  numCopies,
}: {
  children: string;
  baseVelocity: number;
  className?: string;
  damping: number;
  stiffness: number;
  numCopies: number;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping, stiffness });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const directionFactor = useRef(1);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = React.useState(0);

  useEffect(() => {
    if (scrollerRef.current) {
      setContentWidth(scrollerRef.current.scrollWidth / numCopies);
    }
  }, [numCopies]);

  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => {
    if (!contentWidth) return '0px';
    const wrapped = ((v % contentWidth) + contentWidth) % contentWidth;
    return `${-wrapped}px`;
  });

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <motion.div
        ref={scrollerRef}
        style={{ x, display: 'flex', whiteSpace: 'nowrap' }}
      >
        {Array.from({ length: numCopies }).map((_, i) => (
          <span key={i} className={className} style={{ marginRight: '2rem' }}>
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

import React from 'react';

export function ScrollVelocity({
  texts,
  velocity = 80,
  className = '',
  damping = 50,
  stiffness = 400,
  numCopies = 8,
}: ScrollVelocityProps) {
  return (
    <div>
      {texts.map((text, i) => (
        <VelocityText
          key={i}
          baseVelocity={i % 2 === 0 ? velocity : -velocity}
          className={className}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
        >
          {text}
        </VelocityText>
      ))}
    </div>
  );
}
