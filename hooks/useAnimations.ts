import { useContext } from 'react';
import { AnimationContext } from '../components/providers/AnimationProvider';

export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    console.warn('useAnimations must be used within AnimationProvider');
    return null;
  }
  return context;
};