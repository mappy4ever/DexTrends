import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../utils/cn';

/**
 * Micro-interactions Component Library
 * Subtle animations that enhance user experience
 */

// Button click ripple effect
interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  onClick,
  className = '',
  variant = 'primary'
}) => {
  const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
    
    onClick?.();
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    secondary: 'bg-white/80 dark:bg-stone-800/80 text-stone-800 dark:text-white',
    ghost: 'bg-transparent hover:bg-white/10'
  };

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden rounded-xl px-6 py-3 font-semibold transition-all',
        variantClasses[variant],
        className
      )}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full bg-white/30"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ width: 300, height: 300, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
};

// Card with magnetic hover effect
interface MagneticCardProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticCard: React.FC<MagneticCardProps> = ({
  children,
  className = '',
  strength = 0.3
}) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) * strength;
    const y = (e.clientY - centerY) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15
      }}
    >
      {children}
    </motion.div>
  );
};

// Skeleton shimmer effect
interface ShimmerProps {
  className?: string;
}

export const Shimmer: React.FC<ShimmerProps> = ({ className = '' }) => {
  return (
    <motion.div
      className={cn(
        'absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent',
        className
      )}
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Success checkmark animation
export const SuccessCheck: React.FC<{ show: boolean }> = ({ show }) => {
  const checkVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 0.5, ease: "easeInOut" },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      initial="hidden"
      animate={show ? "visible" : "hidden"}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        variants={checkVariants}
      />
      <motion.path
        d="M8 12l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={checkVariants}
      />
    </motion.svg>
  );
};

// Loading spinner with morphing shapes
export const MorphingLoader: React.FC = () => {
  return (
    <motion.div
      className="w-12 h-12"
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <motion.div
        className="w-full h-full bg-gradient-to-r from-purple-600 to-pink-600"
        animate={{
          borderRadius: ["20%", "50%", "20%"],
          scale: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

// Tooltip with spring animation
interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <motion.div
        className={cn(
          'absolute z-50 px-3 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg whitespace-nowrap pointer-events-none',
          positionClasses[position]
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        {content}
      </motion.div>
    </div>
  );
};

// Animated counter
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setDisplayValue(Math.round(startValue + diff * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1.2, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
};

// Confetti burst animation
interface ConfettiBurstProps {
  trigger: boolean;
  particleCount?: number;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({
  trigger,
  particleCount = 20
}) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trigger && Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: colors[i % colors.length],
            left: '50%',
            top: '50%'
          }}
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 1, 0],
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400 - 100,
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: i * 0.02
          }}
        />
      ))}
    </div>
  );
};

// Elastic tab indicator
interface ElasticTabsProps {
  tabs: string[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const ElasticTabs: React.FC<ElasticTabsProps> = ({
  tabs,
  activeTab,
  onTabChange
}) => {
  return (
    <div className="relative flex space-x-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          onClick={() => onTabChange(index)}
          className={cn(
            'relative z-10 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === index
              ? 'text-white'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
          )}
        >
          {tab}
        </button>
      ))}
      <motion.div
        className="absolute inset-y-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-md"
        layoutId="activeTab"
        initial={false}
        animate={{
          x: `${activeTab * 100}%`,
          width: `${100 / tabs.length}%`
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      />
    </div>
  );
};