import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Container } from '../../ui/Container';
import Button, { default as GradientButton } from '@/components/ui/Button';
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
          onClick={() => router.push('/tcgexpansions')}
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
        
        <GradientButton
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: setInfo.name,
                text: `Check out the ${setInfo.name} TCG set with ${setInfo.total} cards!`,
                url: window.location.href
              });
            } else {
              // Fallback: copy URL to clipboard
              navigator.clipboard.writeText(window.location.href);
            }
          }}
          variant="secondary"
          className="px-4 py-2"
        >
          Share
        </GradientButton>
      </div>

      <Container variant="elevated" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Set Image */}
          <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {setInfo.images?.logo && (
              <div className="relative max-w-full h-auto mb-4" style={{ maxHeight: '200px' }}>
                <Image 
                  src={setInfo.images.logo} 
                  alt={setInfo.name}
                  width={400}
                  height={200}
                  className="max-w-full h-auto drop-shadow-lg"
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                  priority={true}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
                />
              </div>
            )}
            {setInfo.images?.symbol && (
              <motion.div
                className="relative h-16 w-16"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Image 
                  src={setInfo.images.symbol} 
                  alt={`${setInfo.name} symbol`}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Set Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
              {setInfo.name}
            </h1>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg p-3">
                <p className="text-stone-600 dark:text-stone-300 text-sm">Series</p>
                <p className="font-semibold">{setInfo.series}</p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg p-3">
                <p className="text-stone-600 dark:text-stone-300 text-sm">Release Date</p>
                <p className="font-semibold">
                  {new Date(setInfo.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg p-3">
                <p className="text-stone-600 dark:text-stone-300 text-sm">Total Cards</p>
                <p className="font-semibold text-lg">
                  <span className="text-amber-600">{setInfo.printedTotal}</span>
                  <span className="text-stone-500 mx-1">/</span>
                  <span className="text-pink-600">{setInfo.total}</span>
                </p>
              </div>
              {setInfo.ptcgoCode && (
                <div className="bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-600 rounded-lg p-3">
                  <p className="text-stone-600 dark:text-stone-300 text-sm">PTCGO Code</p>
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
      </Container>
    </motion.div>
  );
}