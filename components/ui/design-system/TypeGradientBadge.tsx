// Compatibility alias for TypeBadge with gradient variant
// This component exists for backward compatibility after Phase 8 consolidation
import React from 'react';
import { TypeBadge } from '../TypeBadge';

interface TypeGradientBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const TypeGradientBadge: React.FC<TypeGradientBadgeProps> = (props) => {
  return <TypeBadge {...props} variant="gradient" />;
};

export default TypeGradientBadge;