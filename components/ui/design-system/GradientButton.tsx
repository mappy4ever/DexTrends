import React from 'react';
import { motion } from 'framer-motion';

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'electric' | 'type';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  typeGradient?: { from: string; to: string };
}

const variantGradients = {
  primary: 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600',
  secondary: 'from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500',
  success: 'from-green-400 to-teal-400 hover:from-green-500 hover:to-teal-500',
  danger: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
  electric: 'from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600',
  type: '' // Custom type gradient
};

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  type = 'button',
  icon,
  typeGradient
}) => {
  const gradientClass = typeGradient 
    ? `from-${typeGradient.from} to-${typeGradient.to} hover:from-${typeGradient.from} hover:to-${typeGradient.to}`
    : variantGradients[variant];

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        font-semibold text-white
        bg-gradient-to-r ${gradientClass}
        rounded-full
        shadow-lg hover:shadow-xl
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span className="inline-block">{icon}</span>}
        {children}
      </span>
    </motion.button>
  );
};

export default GradientButton;