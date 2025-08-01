import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaTrash, FaInfo, FaCog, FaBookmark } from 'react-icons/fa';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { Button } from '../components/ui/design-system/Button';
import { CircularCard } from '../components/ui/design-system/CircularCard';
import TouchGestures from '../components/mobile/TouchGestures';
import BottomSheet from '../components/mobile/BottomSheet';
import { ContextMenu, useContextMenu, ContextMenuItem } from '../components/ui/ContextMenu';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';
import UnifiedCard from '../components/ui/cards/UnifiedCard';
import ZoomableImage from '../components/ui/ZoomableImage';

const UXGesturesShowcase = () => {
  const { toasts, removeToast, success, info, warning } = useToast();
  const { isOpen: isContextOpen, position, items, openMenu, closeMenu, handleLongPress } = useContextMenu();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0.5);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  // Mock data for demos
  const mockPokemonCards = [
    { 
      id: 'base1-4', 
      name: 'Charizard', 
      images: { small: 'https://images.pokemontcg.io/base1/4.png' },
      types: ['Fire'],
      set: { name: 'Base Set', id: 'base1' },
      number: '4',
      rarity: 'Rare Holo',
      hp: '120'
    },
    { 
      id: 'base1-15', 
      name: 'Venusaur', 
      images: { small: 'https://images.pokemontcg.io/base1/15.png' },
      types: ['Grass'],
      set: { name: 'Base Set', id: 'base1' },
      number: '15',
      rarity: 'Rare Holo',
      hp: '100'
    },
    { 
      id: 'base1-2', 
      name: 'Blastoise', 
      images: { small: 'https://images.pokemontcg.io/base1/2.png' },
      types: ['Water'],
      set: { name: 'Base Set', id: 'base1' },
      number: '2',
      rarity: 'Rare Holo',
      hp: '100'
    }
  ];

  const circularCardData = [
    { name: 'Electric', color: 'yellow', gradientFrom: 'yellow-300', gradientTo: 'yellow-500' },
    { name: 'Water', color: 'blue', gradientFrom: 'blue-300', gradientTo: 'blue-500' },
    { name: 'Fire', color: 'red', gradientFrom: 'red-300', gradientTo: 'red-500' },
    { name: 'Grass', color: 'green', gradientFrom: 'green-300', gradientTo: 'green-500' }
  ];

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'favorite',
      icon: <FaHeart />,
      label: 'Add to Favorites',
      action: () => success('Added to favorites!'),
      color: 'text-red-500'
    },
    {
      id: 'share',
      icon: <FaShare />,
      label: 'Share',
      action: () => info('Share feature coming soon!'),
      color: 'text-blue-500'
    },
    {
      id: 'bookmark',
      icon: <FaBookmark />,
      label: 'Bookmark',
      action: () => success('Bookmarked!'),
      color: 'text-purple-500'
    },
    {
      id: 'info',
      icon: <FaInfo />,
      label: 'View Details',
      action: () => setBottomSheetOpen(true),
      color: 'text-gray-500'
    }
  ];

  return (
    <>
      <Head>
        <title>UX Gestures Showcase - DexTrends</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
        <motion.h1 
          className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          UX Gestures Showcase
        </motion.h1>
        
        <motion.p
          className="text-center text-gray-600 dark:text-gray-400 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Experience all the enhanced mobile interactions
        </motion.p>

        {/* 1. Swipeable Cards with Actions */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-2">1. Swipeable Cards</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Swipe left on cards to reveal quick actions
          </p>
          
          <div className="space-y-4">
            {mockPokemonCards.map((card) => (
              <UnifiedCard
                key={card.id}
                card={card}
                cardType="tcg"
                showTypes
                showHP
                showRarity
                onCardClick={() => info(`Clicked on ${card.name}`)}
              />
            ))}
          </div>
        </GlassContainer>

        {/* 2. Circular Cards with Gestures */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-2">2. Circular Cards with Gestures</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Swipe or long press on circular cards
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {circularCardData.map((item) => (
              <CircularCard
                key={item.name}
                size="md"
                title={item.name}
                subtitle="Type Energy"
                gradientFrom={item.gradientFrom}
                gradientTo={item.gradientTo}
                enableGestures
                onClick={() => info(`${item.name} type selected`)}
                onFavorite={() => success(`${item.name} favorited!`)}
                onShare={() => info(`Sharing ${item.name}...`)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl">⚡</span>
                </div>
              </CircularCard>
            ))}
          </div>
        </GlassContainer>

        {/* 3. Pinch to Zoom Images */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-2">3. Pinch to Zoom Images</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Double tap or pinch to zoom on images
          </p>
          
          <div className="grid grid-cols-3 gap-4">
            {mockPokemonCards.map((card) => (
              <div key={card.id} className="text-center">
                <ZoomableImage
                  src={card.images.small}
                  alt={card.name}
                  width={120}
                  height={168}
                  className="rounded-lg shadow-lg mx-auto"
                  enableZoom
                />
                <p className="text-xs mt-2">{card.name}</p>
              </div>
            ))}
          </div>
        </GlassContainer>

        {/* 4. Advanced Touch Gestures */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-2">4. Multi-Touch Gestures</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Try all gestures: swipe, pinch, double tap
          </p>
          
          <TouchGestures
            onSwipeLeft={(detail) => {
              info(`Swiped left - Distance: ${Math.round(detail.distance)}px`);
              setSelectedDemo('swipe-left');
            }}
            onSwipeRight={(detail) => {
              info(`Swiped right - Distance: ${Math.round(detail.distance)}px`);
              setSelectedDemo('swipe-right');
            }}
            onSwipeUp={(detail) => {
              info(`Swiped up - Distance: ${Math.round(detail.distance)}px`);
              setSelectedDemo('swipe-up');
            }}
            onSwipeDown={(detail) => {
              info(`Swiped down - Distance: ${Math.round(detail.distance)}px`);
              setSelectedDemo('swipe-down');
            }}
            onPinch={(detail) => {
              if (detail.scale > 1.5) {
                success(`Zoomed in to ${Math.round(detail.scale * 100)}%`);
              } else if (detail.scale < 0.7) {
                warning(`Zoomed out to ${Math.round(detail.scale * 100)}%`);
              }
            }}
            onDoubleTap={(detail) => {
              success(`Double tapped at (${Math.round(detail.x)}, ${Math.round(detail.y)})`);
              setSelectedDemo('double-tap');
            }}
            enableSwipe
            enablePinch
            enableDoubleTap
          >
            <motion.div
              className="h-48 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-xl flex items-center justify-center relative overflow-hidden"
              animate={{
                backgroundColor: selectedDemo 
                  ? selectedDemo.includes('swipe') 
                    ? '#fbbf24' 
                    : '#34d399'
                  : undefined
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-center">
                <p className="text-xl font-bold mb-2">Interactive Zone</p>
                <p className="text-sm opacity-75">
                  {selectedDemo ? `Detected: ${selectedDemo}` : 'Try any gesture'}
                </p>
              </div>
              
              {/* Visual feedback */}
              <AnimatePresence>
                {selectedDemo && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    onAnimationComplete={() => setTimeout(() => setSelectedDemo(null), 1000)}
                  >
                    <motion.div className="text-6xl">
                      {selectedDemo === 'swipe-left' && '←'}
                      {selectedDemo === 'swipe-right' && '→'}
                      {selectedDemo === 'swipe-up' && '↑'}
                      {selectedDemo === 'swipe-down' && '↓'}
                      {selectedDemo === 'double-tap' && '👆👆'}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TouchGestures>
        </GlassContainer>

        {/* 5. Long Press Context Menu */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-2">5. Long Press Context Menu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Long press on items for contextual actions
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {['Pikachu', 'Eevee', 'Snorlax', 'Mew'].map((pokemon) => (
              <div
                key={pokemon}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openMenu(e, contextMenuItems.map(item => ({
                    ...item,
                    action: () => {
                      item.action();
                      info(`${item.label} for ${pokemon}`);
                    }
                  })));
                }}
                className="cursor-pointer"
              >
                <GlassContainer
                  variant="light"
                  className="p-6 text-center hover:scale-105 transition-transform"
                >
                  <p className="font-semibold text-lg">{pokemon}</p>
                  <p className="text-xs text-gray-600 mt-1">Long press me</p>
                </GlassContainer>
              </div>
            ))}
          </div>
        </GlassContainer>

        {/* Bottom Sheet Demo Button */}
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setBottomSheetOpen(true)}
            leftIcon={<FaCog />}
          >
            Open Advanced Bottom Sheet
          </Button>
        </div>

        {/* Bottom Sheet */}
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title="Advanced Bottom Sheet"
          snapPoints={[0.25, 0.5, 0.75, 0.95]}
          initialSnapPoint={0.5}
          onSnapPointChange={setCurrentSnapPoint}
        >
          <div className="py-4">
            <GlassContainer variant="light" className="p-4 mb-4">
              <h3 className="font-semibold mb-2">Current Features</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Multiple snap points: {Math.round(currentSnapPoint * 100)}%</li>
                <li>✓ Velocity-based dismissal</li>
                <li>✓ Smooth drag interactions</li>
                <li>✓ Content scrolling when expanded</li>
              </ul>
            </GlassContainer>
            
            <GlassContainer variant="light" className="p-4 mb-4">
              <h3 className="font-semibold mb-2">Visual Feedback</h3>
              <p className="text-sm text-gray-600">
                All interactions provide immediate visual feedback without haptic vibration
              </p>
            </GlassContainer>
            
            {/* Demo content for scrolling */}
            {currentSnapPoint > 0.5 && (
              <>
                <h4 className="font-medium mb-3">Extended Content</h4>
                {[...Array(8)].map((_, i) => (
                  <GlassContainer key={i} variant="light" className="p-4 mb-3">
                    <h5 className="font-medium">Feature {i + 1}</h5>
                    <p className="text-sm text-gray-600">
                      Demonstration of scrollable content in expanded sheet
                    </p>
                  </GlassContainer>
                ))}
              </>
            )}
          </div>
        </BottomSheet>

        {/* Context Menu */}
        {isContextOpen && (
          <ContextMenu
            items={items}
            position={position}
            onClose={closeMenu}
            variant="list"
          />
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </>
  );
};

export default UXGesturesShowcase;