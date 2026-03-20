'use client';

import { ReactNode, CSSProperties, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  style?: CSSProperties;
}

export function FadeContent({
  children,
  blur = false,
  duration = 0.6,
  delay = 0,
  threshold = 0.1,
  className = '',
  direction = 'up',
  style,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  const directionMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
    none: { y: 0, x: 0 },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial={{ opacity: 0, x, y, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
      animate={inView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
