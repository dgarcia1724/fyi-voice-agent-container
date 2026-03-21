'use client';

import { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  delay?: number;
  threshold?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  style?: CSSProperties;
  once?: boolean;
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
  once = false,
}: FadeContentProps) {
  const directionMap = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { y: 0, x: 50 },
    right: { y: 0, x: -50 },
    none: { y: 0, x: 0 },
  };

  const { x, y } = directionMap[direction];

  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, x, y, filter: blur ? 'blur(8px)' : 'blur(0px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount: threshold }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}
