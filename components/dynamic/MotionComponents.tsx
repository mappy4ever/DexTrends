// Re-export motion components to avoid .then() chains in dynamic imports
import { motion } from 'framer-motion';

export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export const MotionButton = motion.button;

// Export individual components as named exports for dynamic imports
export default {
  div: MotionDiv,
  span: MotionSpan,
  button: MotionButton
};