// Gym Leader Showcase Component
// Stunning visual cards with full artwork and geometric design

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../../context/themecontext';
import { TypeBadge } from './TypeBadge';
import { 
  BsShieldCheck, 
  BsTrophy, 
  BsGeoAlt, 
  BsLightning,
  BsStars,
  BsDiamond
} from 'react-icons/bs';
import { 
  GiSwordWound, 
  GiShield, 
  GiSpeedometer,
  GiHealing 
} from 'react-icons/gi';

const GymLeaderShowcase = ({ leader, index, isExpanded, onToggle }) => {
  const { theme } = useTheme();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  // Determine if this card should be on the left or right
  const isLeft = index % 2 === 0;
  
  // Mouse position for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (event) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateXValue = (event.clientY - centerY) / 10;
    const rotateYValue = (centerX - event.clientX) / 10;
    
    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);
    
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  // Animation variants
  const cardVariants = {
    hidden: {
      opacity: 0,
      x: isLeft ? -100 : 100,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: index * 0.2
      }
    }
  };

  const imageVariants = {
    hidden: {
      scale: 1.2,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: index * 0.2 + 0.3
      }
    }
  };

  // Get type-based colors
  const getTypeGradient = (type) => {
    const gradients = {
      fire: 'from-red-500 via-orange-500 to-yellow-500',
      water: 'from-blue-500 via-cyan-500 to-teal-500',
      grass: 'from-green-500 via-emerald-500 to-lime-500',
      electric: 'from-yellow-400 via-yellow-500 to-amber-500',
      psychic: 'from-pink-500 via-purple-500 to-indigo-500',
      ice: 'from-cyan-400 via-blue-400 to-indigo-400',
      dragon: 'from-purple-600 via-indigo-600 to-blue-600',
      dark: 'from-gray-700 via-gray-800 to-black',
      fighting: 'from-red-600 via-orange-600 to-red-700',
      poison: 'from-purple-600 via-pink-600 to-purple-700',
      ground: 'from-yellow-600 via-amber-600 to-orange-600',
      flying: 'from-blue-400 via-indigo-400 to-purple-400',
      bug: 'from-green-600 via-lime-600 to-green-700',
      rock: 'from-yellow-700 via-amber-700 to-orange-700',
      ghost: 'from-purple-700 via-indigo-700 to-gray-700',
      steel: 'from-gray-500 via-slate-500 to-gray-600',
      fairy: 'from-pink-400 via-rose-400 to-pink-500',
      normal: 'from-gray-400 via-gray-500 to-gray-600'
    };
    return gradients[type] || gradients.normal;
  };

  const typeGradient = getTypeGradient(leader.type);

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`relative mb-32 ${isLeft ? 'pr-8' : 'pl-8'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Triangle shapes */}
        <motion.div
          className={`absolute ${isLeft ? 'right-0' : 'left-0'} top-1/4 w-32 h-32`}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={`w-full h-full bg-gradient-to-br ${typeGradient} opacity-10 transform rotate-45`} />
        </motion.div>
        
        <motion.div
          className={`absolute ${isLeft ? 'left-1/4' : 'right-1/4'} bottom-1/4 w-24 h-24`}
          animate={{
            rotate: [360, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={`w-full h-full bg-gradient-to-tl ${typeGradient} opacity-15 clip-triangle`} />
        </motion.div>
      </div>

      {/* Main card container */}
      <motion.div
        className={`relative ${isLeft ? 'flex-row' : 'flex-row-reverse'} flex items-center gap-8 max-w-7xl mx-auto`}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        {/* Character artwork side */}
        <motion.div
          className="relative w-1/2 h-96 flex items-center justify-center"
          variants={imageVariants}
        >
          {/* Geometric background for image */}
          <div className={`absolute inset-0 bg-gradient-to-br ${typeGradient} opacity-20 transform ${isLeft ? 'skew-y-3' : '-skew-y-3'} rounded-3xl`} />
          <div className={`absolute inset-4 bg-gradient-to-tl ${typeGradient} opacity-10 transform ${isLeft ? '-skew-y-2' : 'skew-y-2'} rounded-2xl`} />
          
          {/* Character image */}
          <motion.div
            className="relative z-10 w-80 h-80"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {leader.image ? (
              <Image
                src={leader.image.startsWith('http') ? '/images/placeholder-gym-leader.png' : leader.image}
                alt={leader.name}
                layout="fill"
                objectFit="contain"
                className="drop-shadow-2xl"
                onError={(e) => {
                  e.target.src = '/images/placeholder-gym-leader.png';
                }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${typeGradient} rounded-2xl flex items-center justify-center`}>
                <BsStars className="text-white text-6xl" />
              </div>
            )}
          </motion.div>

          {/* Floating elements around character */}
          <motion.div
            className="absolute top-8 left-8"
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${typeGradient} rounded-lg opacity-80 flex items-center justify-center`}>
              <BsDiamond className="text-white text-2xl" />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 right-8"
            animate={{
              y: [0, 10, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <div className={`w-12 h-12 bg-gradient-to-tl ${typeGradient} rounded-full opacity-70 flex items-center justify-center`}>
              <BsLightning className="text-white text-xl" />
            </div>
          </motion.div>
        </motion.div>

        {/* Stats and info side */}
        <motion.div
          className="w-1/2 space-y-6"
          initial={{ opacity: 0, x: isLeft ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
        >
          {/* Leader name and title */}
          <div className="space-y-2">
            <motion.h2
              className="text-6xl font-black tracking-tight"
              style={{
                background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                backgroundImage: `linear-gradient(135deg, rgb(59 130 246), rgb(147 51 234))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {leader.name}
            </motion.h2>
            <div className="flex items-center gap-4">
              <TypeBadge type={leader.type} size="lg" />
              <span className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                Gym Leader
              </span>
            </div>
          </div>

          {/* Quote */}
          {leader.quote && (
            <motion.div
              className={`p-4 rounded-2xl bg-gradient-to-r ${typeGradient} bg-opacity-10 border-l-4 border-current`}
              style={{ borderColor: `rgb(var(--color-${leader.type}))` }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-lg italic font-medium">"{leader.quote}"</p>
            </motion.div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <BsGeoAlt className={`text-2xl text-blue-500`} />
                <span className="font-semibold text-gray-500 dark:text-gray-400">City</span>
              </div>
              <p className="text-xl font-bold">{leader.city || 'Unknown'}</p>
            </motion.div>

            {/* Badge */}
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <BsTrophy className={`text-2xl text-yellow-500`} />
                <span className="font-semibold text-gray-500 dark:text-gray-400">Badge</span>
              </div>
              <p className="text-xl font-bold">{leader.badge || 'Unknown Badge'}</p>
            </motion.div>

            {/* Region */}
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <BsShieldCheck className={`text-2xl text-green-500`} />
                <span className="font-semibold text-gray-500 dark:text-gray-400">Region</span>
              </div>
              <p className="text-xl font-bold capitalize">{leader.region}</p>
            </motion.div>

            {/* Generation */}
            <motion.div
              className={`p-4 rounded-xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <BsStars className={`text-2xl text-purple-500`} />
                <span className="font-semibold text-gray-500 dark:text-gray-400">Generation</span>
              </div>
              <p className="text-xl font-bold">Gen {leader.generation}</p>
            </motion.div>
          </div>

          {/* Team preview */}
          {leader.team && leader.team.length > 0 && (
            <motion.div
              className={`p-6 rounded-2xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GiSwordWound className="text-red-500" />
                Team Preview
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {leader.team.slice(0, 6).map((pokemon, idx) => (
                  <motion.div
                    key={idx}
                    className={`p-3 rounded-lg bg-gradient-to-br ${typeGradient} bg-opacity-20 border border-gray-200 dark:border-gray-600`}
                    whileHover={{ scale: 1.05 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <p className="font-bold text-sm">{pokemon.name}</p>
                    {pokemon.level && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">Lv. {pokemon.level}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Description */}
          {leader.description && (
            <motion.div
              className={`p-6 rounded-2xl bg-gradient-to-br ${theme === 'dark' ? 'from-gray-800 to-gray-900' : 'from-white to-gray-50'} border border-gray-200 dark:border-gray-700 shadow-lg`}
              whileHover={{ scale: 1.01 }}
            >
              <p className="text-lg leading-relaxed">{leader.description}</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Connector line to next leader */}
      {index < 7 && (
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 0.3, scaleY: 1 }}
          transition={{ duration: 0.8, delay: index * 0.2 + 1 }}
        >
          <div className={`w-1 h-16 bg-gradient-to-b ${typeGradient} rounded-full`} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default GymLeaderShowcase;