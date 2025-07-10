import React from 'react';

// Simple animation components for consistent animations across the app

/**
 * Renders children with a fade-in animation.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} [props.delay=0] - Delay in milliseconds before the animation starts.
 * @param {number} [props.duration=500] - Duration of the animation in milliseconds.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} The animated content.
 */
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = ({ children, delay = 0, duration = 500, className = '' }: FadeInProps) => {
  return (
    <div 
      className={`animate-fadeIn ${className}`}
      style={{ 
        animationDuration: `${duration}ms`, 
        animationDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

/**
 * Renders children with a slide-up animation.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} [props.delay=0] - Delay in milliseconds before the animation starts.
 * @param {number} [props.duration=500] - Duration of the animation in milliseconds.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} The animated content.
 */
interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideUp = ({ children, delay = 0, duration = 500, className = '' }: SlideUpProps) => {
  return (
    <div 
      className={`animate-slideUp ${className}`}
      style={{ 
        animationDuration: `${duration}ms`, 
        animationDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

/**
 * Renders children with a scaling animation.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} [props.delay=0] - Delay in milliseconds before the animation starts.
 * @param {number} [props.duration=500] - Duration of the animation in milliseconds.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} The animated content.
 */
interface ScaleProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const Scale = ({ children, delay = 0, duration = 500, className = '' }: ScaleProps) => {
  return (
    <div 
      className={`animate-scale ${className}`}
      style={{ 
        animationDuration: `${duration}ms`, 
        animationDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

/**
 * Applies a hover effect (scaling and shadow) to children elements.
 * Useful for card-like UI elements to indicate interactivity.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to apply the hover effect to.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @param {function} [props.onClick=()=>{}] - Optional click handler for the component.
 * @returns {JSX.Element} The content with hover effects.
 */
interface CardHoverProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const CardHover = ({ children, className = '', onClick }: CardHoverProps) => {
  return (
    <div 
      className={`transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer ${className}`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        // Handle click events
        
        // Check if this is a navigation card
        const isCardNav = e.currentTarget.closest('[data-pokemon-card="true"]');
        if (isCardNav) {
          // Pokemon card navigation
        }
        
        // Always call the onClick prop to maintain expected behavior
        if (onClick) {
          onClick(e);
        }
      }}
      data-card-hover="true"
    >
      {children}
    </div>
  );
};

/**
 * Renders children with a pulse animation.
 * Useful for highlighting elements or indicating loading states.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} [props.delay=0] - Delay in milliseconds before the animation starts.
 * @param {number} [props.duration=1500] - Duration of one pulse cycle in milliseconds.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} The animated content.
 */
interface PulseProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const Pulse = ({ children, delay = 0, duration = 1500, className = '' }: PulseProps) => {
  return (
    <div 
      className={`animate-pulse ${className}`}
      style={{ 
        animationDuration: `${duration}ms`, 
        animationDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

/**
 * Renders children with a bounce animation.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The content to be animated.
 * @param {number} [props.delay=0] - Delay in milliseconds before the animation starts.
 * @param {number} [props.duration=1000] - Duration of the bounce animation in milliseconds.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} The animated content.
 */
interface BounceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const Bounce = ({ children, delay = 0, duration = 1000, className = '' }: BounceProps) => {
  return (
    <div 
      className={`animate-bounce ${className}`}
      style={{ 
        animationDuration: `${duration}ms`, 
        animationDelay: `${delay}ms` 
      }}
    >
      {children}
    </div>
  );
};

/**
 * Animates direct children components with a staggered delay.
 * It clones each child and applies an incremental `animationDelay`.
 * Useful for list animations where items appear one after another.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child elements to be animated.
 * @param {number} [props.baseDelay=100] - The base delay in milliseconds, which is multiplied by the child's index.
 * @param {string} [props.className=''] - Additional CSS classes to apply to the wrapper div.
 * @returns {JSX.Element} A div containing the children with staggered animation delays.
 */
interface StaggeredChildrenProps {
  children: React.ReactNode;
  baseDelay?: number;
  className?: string;
}

export const StaggeredChildren = ({ children, baseDelay = 100, className = '' }: StaggeredChildrenProps) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        // Ensure child is a valid React element before cloning
        if (!React.isValidElement(child)) {
          return child;
        }
        const delay = baseDelay * index;
        const childElement = child as React.ReactElement<{ style?: React.CSSProperties }>;
        return React.cloneElement(childElement, {
          style: {
            ...(childElement.props.style || {}),
            animationDelay: `${delay}ms`,
          }
        });
      })}
    </div>
  );
};

// Removed the default export to allow named imports
// export default {
//   FadeIn,
//   SlideUp,
//   Scale,
//   CardHover,
//   Pulse,
//   Bounce,
//   StaggeredChildren
// };
