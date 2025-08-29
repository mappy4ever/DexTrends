import Link from 'next/link';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { CircularButton } from '../components/ui/design-system';
import { FullBleedWrapper } from '../components/ui/FullBleedWrapper';
import Image from 'next/image';
import Head from 'next/head';
import DexTrendsLogo from '../components/ui/DexTrendsLogo';

const Custom404: NextPage = () => {
  const pokemonSprites = [
    '/sprites/pokemon/25.png', // Pikachu
    '/sprites/pokemon/39.png', // Jigglypuff
    '/sprites/pokemon/143.png', // Snorlax
    '/sprites/pokemon/150.png', // Mewtwo
    '/sprites/pokemon/133.png', // Eevee
  ];

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>404 - Page Not Found | DexTrends</title>
        <meta name="description" content="The page you're looking for has escaped into the tall grass. Maybe it used Teleport?" />
      </Head>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Floating Pokemon */}
      {pokemonSprites.map((_sprite, index) => (
        <motion.div
          key={index}
          className="absolute w-24 h-24 opacity-10"
          initial={{ 
            x: `${Math.random() * 100 - 50}vw`,
            y: `${Math.random() * 100 - 50}vh`,
          }}
          animate={{
            x: [
              Math.random() * 200 - 100,
              Math.random() * 200 - 100,
              Math.random() * 200 - 100,
            ],
            y: [
              Math.random() * 200 - 100,
              Math.random() * 200 - 100,
              Math.random() * 200 - 100,
            ],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20 + index * 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <GlassContainer variant="colored" className="max-w-lg mx-auto text-center">
          {/* DexTrends Logo */}
          <div className="mb-6">
            <DexTrendsLogo variant="horizontal" size="sm" className="mx-auto opacity-80" />
          </div>
          
          {/* Big 404 with Pokeball */}
          <motion.div
            className="relative mb-8"
            animate={{ 
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
              404
            </div>
            
            {/* Pokeball decoration */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-b from-red-500 to-white relative overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-1 bg-black -translate-y-1/2" />
                <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-white border-2 border-black rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>
            </motion.div>
          </motion.div>

          <h2 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">
            Oops! This Pokemon has fled!
          </h2>
          
          <p className="text-base text-gray-600 dark:text-gray-400 mb-8">
            The page you're looking for has escaped into the tall grass.
            <br />
            Maybe it used Teleport?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CircularButton
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              variant="primary"
              size="lg"
            >
              Return to Pallet Town
            </CircularButton>
            
            <CircularButton
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.history.back();
                }
              }}
              variant="secondary"
              size="lg"
            >
              Go Back
            </CircularButton>
          </div>

          {/* Fun Pokemon quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-gray-500 dark:text-gray-500 mt-8 italic"
          >
            "We hope to see you again!" - Pokemon Center Nurse
          </motion.p>
        </GlassContainer>
      </motion.div>
    </div>
    </FullBleedWrapper>
  );
};

export default Custom404;