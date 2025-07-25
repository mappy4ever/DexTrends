// Region Header Component
// Stunning header for gym leader regions with geometric design

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/UnifiedAppContext';
import { BsStars, BsDiamond, BsHexagon } from 'react-icons/bs';

interface RegionData {
  name?: string;
  color?: string;
}

interface RegionHeaderProps {
  region: string;
  regionData?: RegionData;
  leaderCount: number;
  isActive?: boolean;
  onClick?: () => void;
}

const RegionHeader: React.FC<RegionHeaderProps> = ({ 
  region, 
  regionData, 
  leaderCount, 
  isActive, 
  onClick 
}) => {
  const { theme } = useTheme();

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -50,
      rotateX: -90
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const decorationVariants = {
    floating: {
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="relative mb-16 overflow-hidden"
    >
      {/* Background geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          variants={decorationVariants}
          animate="floating"
          className="absolute top-4 left-1/4 w-8 h-8"
        >
          <BsDiamond className="w-full h-full text-blue-400 opacity-30" />
        </motion.div>
        <motion.div
          variants={decorationVariants}
          animate="floating"
          className="absolute top-8 right-1/3 w-6 h-6"
          style={{ animationDelay: '2s' }}
        >
          <BsHexagon className="w-full h-full text-purple-400 opacity-40" />
        </motion.div>
        <motion.div
          variants={decorationVariants}
          animate="floating"
          className="absolute bottom-4 left-1/3 w-10 h-10"
          style={{ animationDelay: '4s' }}
        >
          <BsStars className="w-full h-full text-pink-400 opacity-25" />
        </motion.div>
      </div>

      {/* Main header content */}
      <motion.div
        className={`relative bg-gradient-to-r ${regionData?.color || 'from-blue-600 to-purple-600'} rounded-3xl p-8 md:p-12 text-white shadow-2xl`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
        }}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {/* Geometric overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white transform rotate-45 -translate-x-12 translate-y-12" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <motion.h1
            className="text-6xl md:text-8xl font-black tracking-tight mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {regionData?.name || region.charAt(0).toUpperCase() + region.slice(1)}
          </motion.h1>
          
          <motion.div
            className="text-2xl md:text-3xl font-bold opacity-90 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Gym Leaders
          </motion.div>
          
          <motion.p
            className="text-lg md:text-xl opacity-80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {leaderCount} Legendary Trainers Await
          </motion.p>

          {/* Stats bar */}
          <motion.div
            className="mt-8 flex justify-center items-center gap-8 text-sm md:text-base"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <BsStars className="text-yellow-300" />
              <span>Elite Trainers</span>
            </div>
            <div className="w-1 h-6 bg-white opacity-50" />
            <div className="flex items-center gap-2">
              <BsDiamond className="text-blue-300" />
              <span>Gym Badges</span>
            </div>
            <div className="w-1 h-6 bg-white opacity-50" />
            <div className="flex items-center gap-2">
              <BsHexagon className="text-purple-300" />
              <span>Type Masters</span>
            </div>
          </motion.div>
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-white opacity-50" />
        <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-white opacity-50" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-white opacity-50" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-white opacity-50" />
      </motion.div>

      {/* Bottom accent line */}
      <motion.div
        className={`mt-4 h-2 bg-gradient-to-r ${regionData?.color || 'from-blue-600 to-purple-600'} rounded-full mx-auto w-32`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
    </motion.div>
  );
};

export default RegionHeader;