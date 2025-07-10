// Region Selector Component
// Sharp, modern region selection with geometric design

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/themecontext';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';

const RegionSelector = ({ 
  regions, 
  selectedRegion, 
  onRegionSelect, 
  regionData,
  isExpanded,
  onToggleExpanded
}) => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-12"
    >
      {/* Mobile dropdown */}
      <div className="md:hidden">
        <motion.button
          onClick={onToggleExpanded}
          className={`w-full p-4 rounded-2xl ${
            theme === 'dark' 
              ? 'bg-gray-800 text-white' 
              : 'bg-white text-gray-900'
          } shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-xl font-bold">
            {regionData[selectedRegion]?.name || selectedRegion.charAt(0).toUpperCase() + selectedRegion.slice(1)}
          </span>
          {isExpanded ? <BsChevronUp /> : <BsChevronDown />}
        </motion.button>

        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`mt-2 rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg border border-gray-200 dark:border-gray-700`}
          >
            {regions.map((region) => (
              <motion.button
                key={region}
                onClick={() => {
                  onRegionSelect(region);
                  onToggleExpanded();
                }}
                className={`w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedRegion === region ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                whileHover={{ x: 4 }}
              >
                {regionData[region]?.name || region.charAt(0).toUpperCase() + region.slice(1)}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {regions.map((region, index) => {
            const isSelected = selectedRegion === region;
            const regionInfo = regionData[region];
            
            return (
              <motion.button
                key={region}
                variants={itemVariants}
                onClick={() => onRegionSelect(region)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? 'scale-110 z-10'
                    : 'hover:scale-105'
                }`}
                whileHover={{ 
                  y: -4,
                  boxShadow: "0 15px 40px rgba(0,0,0,0.2)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Background with gradient */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${
                  regionInfo?.color || 'from-blue-600 to-purple-600'
                } ${isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-90'}`} />
                
                {/* Geometric decoration */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-white opacity-20 transform rotate-45" />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-white opacity-15 transform rotate-45" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-white">
                  <h3 className={`font-bold transition-all duration-300 ${
                    isSelected ? 'text-2xl mb-2' : 'text-xl mb-1'
                  }`}>
                    {regionInfo?.name || region.charAt(0).toUpperCase() + region.slice(1)}
                  </h3>
                  
                  {isSelected && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm opacity-90"
                    >
                      Selected Region
                    </motion.p>
                  )}
                </div>

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selector"
                    className="absolute -inset-1 rounded-2xl border-4 border-white shadow-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Hover border effect */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-white transition-opacity duration-300 ${
                  isSelected ? 'opacity-0' : 'opacity-0 group-hover:opacity-50'
                }`} />
              </motion.button>
            );
          })}
        </div>

        {/* Connection lines between regions */}
        <div className="relative mt-8">
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-30"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default RegionSelector;