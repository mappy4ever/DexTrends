import React from 'react';
import { motion } from 'framer-motion';
import { GlassContainer } from './GlassContainer';
import { cn } from '../../../utils/cn';

interface StandardGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  delay?: number;
  withMotion?: boolean;
}

// Standard GlassContainer configuration for consistent usage across tabs
export const StandardGlassContainer: React.FC<StandardGlassContainerProps> = ({
  children,
  className,
  animate = false,
  delay = 0,
  withMotion = true,
}) => {
  const container = (
    <GlassContainer 
      variant="default" 
      className={cn(
        "backdrop-blur-xl bg-white dark:bg-stone-900/50 border border-stone-200 dark:border-stone-700 shadow-xl",
        className
      )}
      animate={animate}
    >
      {children}
    </GlassContainer>
  );

  if (withMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
      >
        {container}
      </motion.div>
    );
  }

  return container;
};

// Standard section header for consistent styling
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconColorClass?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  iconColorClass = "from-amber-500/20 to-amber-600/10",
}) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={cn(
        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
        iconColorClass
      )}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// Standard card component for consistent hover effects
interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className,
  onClick,
}) => {
  return (
    <motion.div 
      className="group"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
    >
      <div className={cn(
        "h-full bg-white dark:bg-stone-900/50 rounded-2xl p-5 backdrop-blur-md",
        "border border-stone-200 dark:border-stone-700 shadow-lg transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}>
        {children}
      </div>
    </motion.div>
  );
};

// Export all components
export default {
  StandardGlassContainer,
  SectionHeader,
  HoverCard,
};