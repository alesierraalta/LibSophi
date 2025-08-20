'use client';

import React from 'react';
import { motion, HTMLMotionProps, Variants } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations';

interface AnimatedWrapperProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'fadeInUp' | 'staggerContainer' | 'staggerItem' | 'custom';
  customVariant?: Variants;
  delay?: number;
  duration?: number;
  className?: string;
}

export const AnimatedWrapper: React.FC<AnimatedWrapperProps> = ({
  children,
  variant = 'fadeInUp',
  customVariant,
  delay = 0,
  duration,
  className,
  ...props
}) => {
  const getVariant = () => {
    if (customVariant) return customVariant;
    
    switch (variant) {
      case 'fadeInUp':
        return fadeInUp;
      case 'staggerContainer':
        return staggerContainer;
      case 'staggerItem':
        return staggerItem;
      default:
        return fadeInUp;
    }
  };

  let variants = getVariant();
  
  // Modify transition if duration or delay is provided
  if (duration || delay) {
    const modifiedVariants = { ...variants };
    if (modifiedVariants.visible && typeof modifiedVariants.visible === 'object') {
      modifiedVariants.visible = {
        ...modifiedVariants.visible,
        transition: {
          ...(modifiedVariants.visible.transition || {}),
          ...(duration && { duration }),
          ...(delay && { delay }),
        },
      };
    }
    variants = modifiedVariants;
  }

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedWrapper;
