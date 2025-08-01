import React from 'react';
import { useRouter } from 'next/router';
import { GlassContainer } from '../../ui/design-system/GlassContainer';
import { GradientButton } from '../../ui/design-system/GradientButton';
import CardSharingSystem from '../../ui/CardSharingSystem';
import { motion } from 'framer-motion';
import type { CardSet } from '../../../types/api/cards';

interface SetHeaderProps {
  setInfo: CardSet;
  onScrollToCards: () => void;
}

export default function SetHeader({ setInfo, onScrollToCards }: SetHeaderProps) {
  const router = useRouter();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <GradientButton
          onClick={() => router.push('/tcgsets')}
          variant="secondary"
          size="sm"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          }
        >
          Back to Sets
        </GradientButton>
        
        {/* TODO: Replace with proper share button component
        <CardSharingSystem 
          shareData={{
            title: setInfo.name,
            text: `Check out the ${setInfo.name} TCG set with ${setInfo.total} cards!`,
            url: typeof window !== 'undefined' ? window.location.href : ''
          }}
        /> */}
      </div>

      <GlassContainer variant="medium" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Set Image */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {setInfo.images?.logo && (
              <img 
                src={setInfo.images.logo} 
                alt={setInfo.name}
                className="max-w-full h-auto mb-4 drop-shadow-lg"
                style={{ maxHeight: '200px' }}
              />
            )}
            {setInfo.images?.symbol && (
              <motion.img 
                src={setInfo.images.symbol} 
                alt={`${setInfo.name} symbol`}
                className="h-16 w-16 object-contain"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.div>

          {/* Set Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {setInfo.name}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-light rounded-lg p-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Series</p>
                <p className="font-semibold">{setInfo.series}</p>
              </div>
              <div className="glass-light rounded-lg p-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Release Date</p>
                <p className="font-semibold">
                  {new Date(setInfo.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="glass-light rounded-lg p-3">
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Cards</p>
                <p className="font-semibold text-lg">
                  <span className="text-purple-600">{setInfo.printedTotal}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-pink-600">{setInfo.total}</span>
                </p>
              </div>
              {setInfo.ptcgoCode && (
                <div className="glass-light rounded-lg p-3">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">PTCGO Code</p>
                  <p className="font-semibold font-mono">{setInfo.ptcgoCode}</p>
                </div>
              )}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <GradientButton
                onClick={onScrollToCards}
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                }
              >
                View Cards
              </GradientButton>
            </motion.div>
          </motion.div>
        </div>
      </GlassContainer>
    </motion.div>
  );
}