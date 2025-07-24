import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GlassContainer } from '../design-system/GlassContainer';
import { TypeGradientBadge } from '../design-system/TypeGradientBadge';
import { GradientButton } from '../design-system/GradientButton';

interface Pokemon {
  name: string;
  sprite: string;
  id?: number;
}

interface CircularGymLeaderCardProps {
  name: string;
  region: string;
  type: string;
  badge: string;
  badgeImage?: string;
  image: string;
  team: Pokemon[];
  strengths: string[];
  weaknesses: string[];
  quote: string;
  funFact: string;
  gymTown: string;
  recommendedLevel?: number;
}

const CircularGymLeaderCard: React.FC<CircularGymLeaderCardProps> = ({
  name,
  region,
  type,
  badge,
  badgeImage,
  image,
  team,
  strengths,
  weaknesses,
  quote,
  funFact,
  gymTown,
  recommendedLevel
}) => {
  const typeGradients: { [key: string]: { from: string; to: string } } = {
    rock: { from: 'amber-600', to: 'yellow-900' },
    water: { from: 'blue-400', to: 'blue-600' },
    electric: { from: 'yellow-300', to: 'yellow-500' },
    grass: { from: 'green-400', to: 'green-600' },
    poison: { from: 'purple-500', to: 'purple-700' },
    psychic: { from: 'pink-400', to: 'pink-600' },
    fire: { from: 'orange-400', to: 'red-600' },
    ground: { from: 'yellow-500', to: 'amber-700' },
    normal: { from: 'gray-300', to: 'gray-500' },
    fighting: { from: 'red-600', to: 'red-800' },
    flying: { from: 'blue-300', to: 'indigo-500' },
    ice: { from: 'cyan-300', to: 'blue-400' },
    bug: { from: 'lime-400', to: 'green-500' },
    ghost: { from: 'purple-700', to: 'purple-900' },
    steel: { from: 'slate-400', to: 'gray-600' },
    dragon: { from: 'indigo-600', to: 'purple-800' },
    dark: { from: 'gray-700', to: 'gray-900' },
    fairy: { from: 'pink-300', to: 'pink-500' }
  };

  const gradient = typeGradients[type.toLowerCase()] || typeGradients.normal;

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassContainer
        variant="colored"
        blur="lg"
        rounded="3xl"
        padding="none"
        hover={true}
        className="relative overflow-visible"
      >
        {/* Central Circular Leader Image */}
        <div className="relative flex justify-center pt-6">
          <motion.div
            className="relative w-48 h-48 z-20"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Gradient outer ring */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-${gradient.from} to-${gradient.to} p-1 shadow-2xl`}>
              {/* White middle ring */}
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-1">
                {/* Inner gradient circle */}
                <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-${gradient.from}/20 to-${gradient.to}/20 overflow-hidden`}>
                  <Image
                    src={image}
                    alt={name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-full"
                  />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <motion.div
              className="absolute -top-2 -right-2 z-30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            >
              <div className="relative w-16 h-16 bg-white rounded-full shadow-lg p-2">
                <Image
                  src={badgeImage || `/images/scraped/badges/${badge.toLowerCase().replace(' badge', '-badge').replace(' ', '-')}.png`}
                  alt={badge}
                  layout="fill"
                  objectFit="contain"
                  className="p-1"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Content sections */}
        <div className="px-6 pb-6 mt-4">
          {/* Name and location */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{gymTown} Gym Leader</p>
            {recommendedLevel && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Recommended Level: {recommendedLevel}
              </p>
            )}
          </div>

          {/* Type specialization */}
          <div className="flex justify-center mb-4">
            <TypeGradientBadge type={type} size="md" gradient={true} />
          </div>

          {/* Quote */}
          {quote && (
            <div className="mb-4">
              <p className="text-sm italic text-center text-gray-600 dark:text-gray-400">
                "{quote}"
              </p>
            </div>
          )}

          {/* Team preview - circular mini sprites */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
              Team
            </h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {team.slice(0, 6).map((pokemon, index) => (
                <Link
                  key={index}
                  href={pokemon.id ? `/pokedex/${pokemon.id}` : `/pokedex/${pokemon.name.toLowerCase()}`}
                >
                  <motion.div
                    className="relative w-12 h-12 cursor-pointer"
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-${gradient.from}/30 to-${gradient.to}/30 p-0.5`}>
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                        <Image
                          src={pokemon.sprite}
                          alt={pokemon.name}
                          width={48}
                          height={48}
                          className="p-1"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Strong Against
              </h3>
              <div className="flex flex-wrap justify-center gap-1">
                {strengths.slice(0, 3).map((strength, index) => (
                  <TypeGradientBadge
                    key={index}
                    type={strength}
                    size="xs"
                    circular={true}
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Weak Against
              </h3>
              <div className="flex flex-wrap justify-center gap-1">
                {weaknesses.slice(0, 3).map((weakness, index) => (
                  <TypeGradientBadge
                    key={index}
                    type={weakness}
                    size="xs"
                    circular={true}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Fun fact */}
          {funFact && (
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-semibold">Fun Fact:</span> {funFact}
              </p>
            </div>
          )}
        </div>
      </GlassContainer>
    </motion.div>
  );
};

export default CircularGymLeaderCard;