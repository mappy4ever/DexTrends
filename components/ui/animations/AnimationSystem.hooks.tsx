import { useContext } from 'react';
import { AnimationContext } from './AnimationSystem';

export const useAnimation = () => useContext(AnimationContext);