import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface FlippableCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  flipOnHover?: boolean;
  flipOnClick?: boolean;
}

const FlippableCard: React.FC<FlippableCardProps> = ({
  frontContent,
  backContent,
  className = '',
  width = '100%',
  height = 'auto',
  flipOnHover = false,
  flipOnClick = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (flipOnClick) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (flipOnHover) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (flipOnHover) {
      setIsFlipped(false);
    }
  };

  return (
    <div
      className={cn(
        'relative preserve-3d cursor-pointer',
        className
      )}
      style={{ width, height }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        {/* Front Face */}
        <div className="absolute w-full h-full backface-hidden">
          {frontContent}
        </div>
        
        {/* Back Face */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

export default FlippableCard;