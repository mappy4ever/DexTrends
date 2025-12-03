import Link from 'next/link';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import { Container } from '../components/ui/Container';
import { CircularButton } from '../components/ui/design-system';
import { FullBleedWrapper } from '../components/ui/FullBleedWrapper';
import Image from 'next/image';
import Head from 'next/head';
import DexTrendsLogo from '../components/ui/DexTrendsLogo';

const Custom404: NextPage = () => {
  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>404 - Page Not Found | DexTrends</title>
        <meta name="description" content="The page you're looking for has escaped into the tall grass. Maybe it used Teleport?" />
      </Head>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        {/* Subtle background circles - reduced for mobile performance */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-stone-200/20 dark:bg-stone-700/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-stone-300/20 dark:bg-stone-600/20 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 w-full max-w-md"
        >
          <Container variant="default" className="text-center p-6 sm:p-8">
            {/* DexTrends Logo */}
            <div className="mb-4 sm:mb-6">
              <DexTrendsLogo variant="horizontal" size="sm" className="mx-auto opacity-80" />
            </div>

            {/* Big 404 - responsive sizing */}
            <motion.div
              className="relative mb-6 sm:mb-8 inline-block"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-pokemon-red to-pokemon-blue bg-clip-text text-transparent">
                404
              </div>

              {/* Pokeball decoration - smaller on mobile, positioned safely */}
              <motion.div
                className="absolute -top-2 -right-6 sm:-top-4 sm:-right-8 w-12 h-12 sm:w-16 sm:h-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-red-500 to-white relative overflow-hidden shadow-md">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 sm:h-1 bg-black -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white border-2 border-black rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
              </motion.div>
            </motion.div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-stone-800 dark:text-white mb-3 sm:mb-4">
              Oops! This Pokemon has fled!
            </h2>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mb-6 sm:mb-8">
              The page you're looking for has escaped into the tall grass.
              <span className="hidden sm:inline"><br /></span>
              <span className="sm:hidden"> </span>
              Maybe it used Teleport?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <CircularButton
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                variant="primary"
                size="lg"
              >
                Return Home
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
              transition={{ delay: 0.8 }}
              className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-6 sm:mt-8 italic"
            >
              "We hope to see you again!" - Pokemon Center Nurse
            </motion.p>
          </Container>
        </motion.div>
      </div>
    </FullBleedWrapper>
  );
};

export default Custom404;