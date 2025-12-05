import Link from 'next/link';
import type { NextPage } from 'next';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Custom404: NextPage = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Page Not Found | DexTrends</title>
        <meta name="description" content="The page you're looking for has escaped into the tall grass. Maybe it used Teleport?" />
      </Head>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-stone-50 via-white to-amber-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-red-200/30 dark:bg-red-900/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-amber-200/30 dark:bg-amber-900/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-stone-200/20 dark:bg-stone-700/10 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-sm sm:max-w-md mx-4"
        >
          <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-stone-200/50 dark:border-stone-700/50 p-6 sm:p-8 text-center">

            {/* Animated 404 with Pokeball */}
            <div className="relative mb-6 inline-block">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  404
                </span>
              </motion.div>

              {/* Pokeball decoration */}
              <motion.div
                className="absolute -top-1 -right-4 sm:-top-2 sm:-right-6 w-10 h-10 sm:w-14 sm:h-14"
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-b from-red-500 via-red-500 to-white relative overflow-hidden shadow-lg border-2 border-stone-800 dark:border-stone-600">
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-stone-800 dark:bg-stone-600 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white border-2 border-stone-800 dark:border-stone-600 rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mb-2">
              This Pokemon has fled!
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
              The page you're looking for escaped into the tall grass.
              Maybe it used Teleport?
            </p>

            {/* Action Buttons - Stack on mobile, row on larger */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
              >
                Return Home
              </button>

              <button
                onClick={() => router.back()}
                className="w-full px-6 py-3 bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]"
              >
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-stone-200 dark:border-stone-700">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                Or try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="/pokedex"
                  className="px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                >
                  Pokedex
                </Link>
                <Link
                  href="/tcgexpansions"
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  TCG Cards
                </Link>
                <Link
                  href="/pokemon"
                  className="px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  Pokemon Hub
                </Link>
              </div>
            </div>

            {/* Fun Pokemon quote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-stone-400 dark:text-stone-500 mt-6 italic"
            >
              "We hope to see you again!" - Pokemon Center Nurse
            </motion.p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Custom404;