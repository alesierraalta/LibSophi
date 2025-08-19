import { Variants, Transition } from 'framer-motion';

// Common animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const scaleIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
};

export const slideInFromBottom: Variants = {
  hidden: { 
    y: '100%',
    opacity: 0 
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const slideInFromTop: Variants = {
  hidden: { 
    y: '-100%',
    opacity: 0 
  },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const slideInFromLeft: Variants = {
  hidden: { 
    x: '-100%',
    opacity: 0 
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

export const slideInFromRight: Variants = {
  hidden: { 
    x: '100%',
    opacity: 0 
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

// Stagger animations for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
};

// Modal and overlay animations
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: { duration: 0.2 }
  },
};

// Button and interactive animations
export const buttonHover: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export const cardHover: Variants = {
  rest: { 
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 }
  },
};

// Page transitions
export const pageTransition: Variants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    x: 20,
    transition: { duration: 0.3 }
  },
};

// Loading animations
export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Notification animations
export const notificationSlide: Variants = {
  hidden: { 
    x: '100%',
    opacity: 0 
  },
  visible: { 
    x: 0,
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  exit: { 
    x: '100%',
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

// Drawer/Sidebar animations
export const drawer: Variants = {
  closed: { 
    x: '-100%',
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  },
  open: { 
    x: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 }
  },
};

// Text animations
export const textReveal: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  },
};

export const typewriter = {
  hidden: { width: 0 },
  visible: { 
    width: 'auto',
    transition: { 
      duration: 2,
      ease: 'easeInOut'
    }
  },
};

// Common transition presets
export const transitions: Record<string, Transition> = {
  smooth: { duration: 0.3, ease: 'easeOut' },
  quick: { duration: 0.15, ease: 'easeOut' },
  slow: { duration: 0.6, ease: 'easeOut' },
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  bounce: { type: 'spring', stiffness: 400, damping: 10 },
};

// Gesture configurations
export const dragConstraints = {
  top: -50,
  left: -50,
  right: 50,
  bottom: 50,
};

// Animation utilities
export const createStaggerAnimation = (delay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
      delayChildren: delay,
    },
  },
});

export const createFadeInAnimation = (direction: 'up' | 'down' | 'left' | 'right' = 'up', distance = 20) => {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return {
    hidden: { 
      opacity: 0, 
      ...directions[direction]
    },
    visible: { 
      opacity: 1, 
      x: 0,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
  };
};

export const createSlideAnimation = (direction: 'up' | 'down' | 'left' | 'right') => {
  const directions = {
    up: { y: '100%' },
    down: { y: '-100%' },
    left: { x: '100%' },
    right: { x: '-100%' },
  };

  return {
    hidden: { 
      opacity: 0,
      ...directions[direction]
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
  };
};
