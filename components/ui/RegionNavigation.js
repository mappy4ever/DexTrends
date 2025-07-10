import React from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Define the order of regions
const REGION_ORDER = [
  'kanto',
  'johto',
  'hoenn',
  'sinnoh',
  'unova',
  'kalos',
  'alola',
  'galar',
  'paldea'
];

const REGION_NAMES = {
  kanto: 'Kanto',
  johto: 'Johto',
  hoenn: 'Hoenn',
  sinnoh: 'Sinnoh',
  unova: 'Unova',
  kalos: 'Kalos',
  alola: 'Alola',
  galar: 'Galar',
  paldea: 'Paldea'
};

export default function RegionNavigation({ currentRegion }) {
  const currentIndex = REGION_ORDER.indexOf(currentRegion.toLowerCase());
  const prevRegion = currentIndex > 0 ? REGION_ORDER[currentIndex - 1] : null;
  const nextRegion = currentIndex < REGION_ORDER.length - 1 ? REGION_ORDER[currentIndex + 1] : null;

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between items-center px-4 md:px-8 pointer-events-none z-30">
      {/* Previous Region */}
      {prevRegion && (
        <Link href={`/regions/${prevRegion}`}>
          <motion.div
            className="group flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer pointer-events-auto"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-pokemon-blue transition-colors" />
            <div className="hidden md:block">
              <div className="text-xs text-gray-500 dark:text-gray-400">Previous</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-pokemon-blue transition-colors">
                {REGION_NAMES[prevRegion]}
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* Region Indicator */}
      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            {REGION_ORDER.map((region, index) => (
              <Link key={region} href={`/regions/${region}`}>
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${
                    region === currentRegion.toLowerCase()
                      ? 'bg-pokemon-blue w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  title={REGION_NAMES[region]}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Next Region */}
      {nextRegion && (
        <Link href={`/regions/${nextRegion}`}>
          <motion.div
            className="group flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer pointer-events-auto"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="hidden md:block text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Next</div>
              <div className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-pokemon-blue transition-colors">
                {REGION_NAMES[nextRegion]}
              </div>
            </div>
            <FaChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-pokemon-blue transition-colors" />
          </motion.div>
        </Link>
      )}
    </div>
  );
}