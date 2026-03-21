'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
  onAnimationComplete?: () => void;
  variant?: {
    hidden: { filter: string; opacity: number; y: number };
    visible: { filter: string; opacity: number; y: number };
  };
  getTokenStyle?: (token: string, index: number) => React.CSSProperties;
  suffix?: React.ReactNode;
}

const defaultVariants: Variants = {
  hidden: { filter: 'blur(10px)', opacity: 0, y: 20 },
  visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
};

export function BlurText({
  text,
  delay = 50,
  className = '',
  animateBy = 'words',
  direction = 'top',
  onAnimationComplete,
  variant,
  getTokenStyle,
  suffix,
}: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const tokens = animateBy === 'words' ? text.split(' ') : text.split('');

  const variants = variant ?? {
    hidden: {
      filter: 'blur(10px)',
      opacity: 0,
      y: direction === 'top' ? -20 : 20,
    },
    visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (inView && !hasAnimated) {
      const totalDelay = tokens.length * delay;
      const timer = setTimeout(() => {
        setHasAnimated(true);
        onAnimationComplete?.();
      }, totalDelay + 600);
      return () => clearTimeout(timer);
    }
  }, [inView, hasAnimated, tokens.length, delay, onAnimationComplete]);

  return (
    <p ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap', gap: animateBy === 'words' ? '0.3em' : '0' }}>
      {tokens.map((token, i) => (
        <motion.span
          key={i}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          transition={{
            duration: 0.6,
            delay: i * (delay / 1000),
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          style={{ display: 'inline-block', willChange: 'filter, opacity, transform', ...(getTokenStyle ? getTokenStyle(token, i) : {}) }}
        >
          {token}{animateBy === 'words' ? '' : ''}
        </motion.span>
      ))}
      {suffix}
    </p>
  );
}
