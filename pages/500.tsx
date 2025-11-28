import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/Container';
import { CircularButton } from '../components/ui/design-system';
import { FullBleedWrapper } from '../components/ui/FullBleedWrapper';
import { FiRefreshCw } from 'react-icons/fi';
import { AiOutlineHome } from 'react-icons/ai';
import { FaBolt } from 'react-icons/fa';
import Head from 'next/head';
import DexTrendsLogo from '../components/ui/DexTrendsLogo';

const Custom500: NextPage = () => {
  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>500 - Server Error | DexTrends</title>
        <meta name="description" content="Something went wrong on our servers. Our team has been notified and is working to fix it." />
      </Head>
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      
      {/* Lightning Bolts Animation */}
      {[...Array(5)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute w-1 bg-yellow-400 opacity-30"
          style={{
            height: `${Math.random() * 200 + 100}px`,
            left: `${Math.random() * 100}%`,
            top: '-50px',
          }}
          animate={{
            y: [0, 1000],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.5,
            delay: index * 2,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeIn"
          }}
        />
      ))}

      {/* Shocked Pikachu Animation */}
      <motion.div
        className="absolute w-32 h-32 opacity-20"
        style={{ left: '10%', top: '20%' }}
        animate={{
          rotate: [0, -10, 10, -10, 10, 0],
          scale: [1, 1.1, 0.9, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Container variant="default" className="max-w-lg mx-auto text-center">
          {/* DexTrends Logo */}
          <div className="mb-6">
            <DexTrendsLogo variant="horizontal" size="sm" className="mx-auto opacity-80" />
          </div>
          
          {/* Big 500 with Electric Effect */}
          <motion.div
            className="relative mb-8"
            animate={{ 
              filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              500
            </div>
            
            {/* Electric sparks */}
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <FaBolt className="text-4xl text-yellow-400" />
            </motion.div>
          </motion.div>

          <h2 className="text-3xl font-semibold text-stone-800 dark:text-white mb-4">
            Critical Hit! Server Error!
          </h2>
          
          <p className="text-base text-stone-600 dark:text-stone-400 mb-8">
            The server used Self-Destruct!
            <br />
            It's super effective... at breaking things.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CircularButton
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              variant="primary"
              size="lg"
              className="group"
            >
              <span className="flex items-center gap-2">
                Use Revive
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.span>
              </span>
            </CircularButton>
            
            <CircularButton
              onClick={() => {
                // Use window.location for reliable navigation in error states (SSR safe)
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }}
              variant="secondary"
              size="lg"
            >
              <span className="flex items-center gap-2">
                <AiOutlineHome className="w-5 h-5" />
                Flee to Pokemon Center
              </span>
            </CircularButton>
          </div>

          {/* Fun Pokemon quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-sm text-stone-500 dark:text-stone-500 mt-8 italic"
          >
            "Team Rocket's blasting off again!" - Team Rocket
          </motion.p>
          
          {/* Status effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm"
          >
            <FaBolt className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            Server is paralyzed! It may be unable to move!
          </motion.div>
        </Container>
      </motion.div>
    </div>
    </FullBleedWrapper>
  );
};

export default Custom500;