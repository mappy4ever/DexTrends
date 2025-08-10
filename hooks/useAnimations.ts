import { useContext } from 'react';
import { AnimationContext } from '../components/providers/AnimationProvider';
import logger from '../utils/logger';

export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    logger.warn('useAnimations must be used within AnimationProvider');
    return null;
  }
  return context;
};