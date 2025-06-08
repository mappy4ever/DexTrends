import React from 'react';

// Simple animation components for consistent animations across the app

// Fade in animation component
export const FadeIn = ({ children, delay = 0, duration = 500, className = '' }) => {
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

// Slide up animation component
export const SlideUp = ({ children, delay = 0, duration = 500, className = '' }) => {
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

// Scale animation component
export const Scale = ({ children, delay = 0, duration = 500, className = '' }) => {
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

// Card hover animation (can be applied to any card)
export const CardHover = ({ children, className = '', onClick = () => {} }) => {
  return (
    <div 
      className={`transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Pulse animation component (useful for highlighting elements)
export const Pulse = ({ children, delay = 0, duration = 1500, className = '' }) => {
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

// Bounce animation component
export const Bounce = ({ children, delay = 0, duration = 1000, className = '' }) => {
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

// Staggered children animation (applies incremental delays to children)
export const StaggeredChildren = ({ children, baseDelay = 100, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        const delay = baseDelay * index;
        return React.cloneElement(child, {
          style: {
            ...child.props.style,
            animationDelay: `${delay}ms`,
          }
        });
      })}
    </div>
  );
};

export default {
  FadeIn,
  SlideUp,
  Scale,
  CardHover,
  Pulse,
  Bounce,
  StaggeredChildren
};
