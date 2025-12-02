import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system';
import type { TCGCard } from '@/types/api/cards';

interface HorizontalCardShowcaseProps {
  cards: TCGCard[];
  onCardClick?: (card: TCGCard) => void;
  getPrice?: (card: TCGCard) => number;
}

export const HorizontalCardShowcase: React.FC<HorizontalCardShowcaseProps> = ({
  cards,
  onCardClick,
  getPrice = () => 0
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const [dragStartX, setDragStartX] = useState(0);
  const [scrollStartX, setScrollStartX] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Handle drag scrolling
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
    setScrollStartX(scrollRef.current?.scrollLeft || 0);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaX = dragStartX - clientX;
    
    // Calculate drag sensitivity based on content to viewport ratio
    const { scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    const scrollRatio = scrollWidth / clientWidth;
    const sensitivity = Math.max(1, scrollRatio * 0.8); // Amplify drag movement
    
    let newScrollLeft = scrollStartX + (deltaX * sensitivity);
    
    // Infinite scroll wrapping
    if (newScrollLeft < 0) {
      newScrollLeft = maxScroll;
      setScrollStartX(maxScroll);
      setDragStartX(clientX);
    } else if (newScrollLeft > maxScroll) {
      newScrollLeft = 0;
      setScrollStartX(0);
      setDragStartX(clientX);
    }
    
    scrollRef.current.scrollLeft = newScrollLeft;
    updateScrollProgress();
  };
  
  const updateScrollProgress = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      // Calculate the percentage of how far we've scrolled
      const scrollPercentage = (scrollLeft / maxScroll);
      // Fixed thumb width at 15%, so max position is 85%
      const maxPosition = 85;
      setScrollProgress(scrollPercentage * maxPosition);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Auto-scroll effect
  useEffect(() => {
    if (!scrollRef.current || isPaused || isDragging) return;
    
    const scrollContainer = scrollRef.current;
    let animationId: number;
    let scrollPosition = scrollContainer.scrollLeft;
    
    const autoScroll = () => {
      if (!isPaused && !isDragging) {
        scrollPosition += 0.5; // Very slow scroll speed
        
        // Wrap around when reaching the end
        if (scrollPosition >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
        updateScrollProgress();
        animationId = requestAnimationFrame(autoScroll);
      }
    };
    
    animationId = requestAnimationFrame(autoScroll);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, isDragging, cards]);
  
  // Update scroll progress on mount and scroll
  useEffect(() => {
    updateScrollProgress();
    const element = scrollRef.current;
    if (element) {
      element.addEventListener('scroll', updateScrollProgress);
      return () => element.removeEventListener('scroll', updateScrollProgress);
    }
    return undefined;
  }, [cards]);


  if (!cards || cards.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="mb-4 px-6">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
          Top Value Cards
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-300 mt-1">
          Drag to browse collection
        </p>
      </div>

      {/* Scrollable Cards Container with expanded drag area */}
      <div 
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 select-none cursor-grab active:cursor-grabbing"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
            userSelect: 'none'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {cards.map((card, index) => {
            const price = getPrice(card);
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex-shrink-0"
              >
                <div
                  onMouseUp={(e) => {
                    const deltaX = Math.abs(dragStartX - e.clientX);
                    if (deltaX < 5 && onCardClick) {
                      onCardClick(card);
                    }
                  }}
                  className={cn(
                    'relative group cursor-pointer',
                    'w-[280px] h-[160px]',
                    createGlassStyle({
                      blur: 'lg',
                      opacity: 'medium',
                      border: 'strong',
                      rounded: 'xl',
                      shadow: 'lg'
                    }),
                    'overflow-hidden',
                    'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl transition-all duration-150'
                  )}
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-pink-500/10" />
                  
                  {/* Content */}
                  <div className="relative h-full p-4 flex gap-4">
                    {/* Card Image */}
                    <div className="relative w-[100px] h-full">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 rounded-lg" />
                      <img
                        src={card.images.small}
                        alt={card.name}
                        className="w-full h-full object-contain rounded-lg"
                      />
                      {/* Rank badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-white line-clamp-2">
                          {card.name.replace(/Team Rocket's/gi, "TR's")}
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-300">
                          {card.set.name}
                        </p>
                        {card.rarity && (
                          <p className="text-xs text-stone-500 dark:text-stone-500 mt-1">
                            {card.rarity.replace(/Special Illustration Rare/gi, "SIR")}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mt-2">
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          ${price.toFixed(2)}
                        </p>
                        <p className="text-xs text-stone-500">Market Price</p>
                      </div>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Expanded drag area and scroll indicator */}
        <div 
          className="relative h-12 px-6 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Scroll indicator bar */}
          <div className="absolute bottom-2 left-6 right-6">
            <div
              className={cn(
                "relative h-1.5 rounded-full overflow-hidden",
                "bg-stone-200/40 dark:bg-stone-700/40 backdrop-blur-sm"
              )}
              onMouseDown={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickPercentage = clickX / rect.width;
                
                if (scrollRef.current) {
                  const { scrollWidth, clientWidth } = scrollRef.current;
                  const maxScroll = scrollWidth - clientWidth;
                  
                  // Direct mapping - click position maps directly to scroll position
                  scrollRef.current.scrollLeft = maxScroll * clickPercentage;
                  updateScrollProgress();
                }
                handleDragStart(e);
              }}
            >
              {/* Progress indicator */}
              <motion.div
                className="absolute h-full bg-gradient-to-r from-amber-500 to-pink-500 rounded-full shadow-sm"
                style={{ 
                  width: '15%' // Fixed smaller width for the thumb
                }}
                animate={{
                  left: `${scrollProgress}%`
                }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              />
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 text-center">
              Drag to navigate
            </p>
          </div>
        </div>

        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-12 w-12 bg-gradient-to-r from-stone-50 dark:from-stone-900 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-12 w-12 bg-gradient-to-l from-stone-50 dark:from-stone-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};