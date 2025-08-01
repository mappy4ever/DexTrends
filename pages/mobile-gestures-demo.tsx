import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaTrash, FaInfo, FaCog, FaBookmark } from 'react-icons/fa';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { Button } from '../components/ui/design-system/Button';
import TouchGestures from '../components/mobile/TouchGestures';
import BottomSheet from '../components/mobile/BottomSheet';
import { ContextMenu, useContextMenu, ContextMenuItem } from '../components/ui/ContextMenu';
import { ToastContainer } from '../components/ui/Toast';
import { useToast } from '../hooks/useToast';

const MobileGesturesDemo = () => {
  const { toasts, removeToast, success, info, warning } = useToast();
  const { isOpen: isContextOpen, position, items, openMenu, closeMenu, handleLongPress } = useContextMenu();
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(0.5);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [pinchScale, setPinchScale] = useState(1);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  // Mock cards for demo
  const demoCards = [
    { id: 1, name: 'Pikachu', type: 'Electric', color: 'yellow' },
    { id: 2, name: 'Charizard', type: 'Fire', color: 'red' },
    { id: 3, name: 'Blastoise', type: 'Water', color: 'blue' },
    { id: 4, name: 'Venusaur', type: 'Grass', color: 'green' }
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

  const handleSwipe = (direction: string, detail: any) => {
    setSwipeDirection(direction);
    info(`Swiped ${direction} - Distance: ${Math.round(detail.distance)}px`);
    setTimeout(() => setSwipeDirection(null), 1000);
  };

  const handlePinch = (detail: any) => {
    setPinchScale(detail.scale);
    if (detail.scale > 1.5) {
      success('Zoomed in!');
    } else if (detail.scale < 0.7) {
      warning('Zoomed out!');
    }
  };

  const handleDoubleTap = (detail: any) => {
    success(`Double tapped at (${Math.round(detail.x)}, ${Math.round(detail.y)})`);
  };

  return (
    <>
      <Head>
        <title>Mobile Gestures Demo - DexTrends</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 pb-20">
        <motion.h1 
          className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Mobile Gestures Demo
        </motion.h1>

        {/* Swipeable Cards Section */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-4">Swipeable Cards</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Swipe left/right on cards to reveal actions
          </p>
          
          <div className="space-y-4">
            {demoCards.map((card) => (
              <motion.div
                key={card.id}
                className="relative overflow-hidden"
                drag="x"
                dragConstraints={{ left: -120, right: 0 }}
                dragElastic={0.2}
                dragMomentum={false}
                whileDrag={{ scale: 0.98 }}
              >
                <GlassContainer 
                  variant="light" 
                  className={`p-4 bg-gradient-to-r from-${card.color}-100 to-${card.color}-200`}
                >
                  <h3 className="font-semibold text-lg">{card.name}</h3>
                  <p className="text-sm text-gray-600">Type: {card.type}</p>
                </GlassContainer>
                
                {/* Swipe Actions */}
                <div className="absolute top-0 right-0 h-full flex items-center gap-2 px-4">
                  <motion.button
                    className="p-3 bg-red-500 text-white rounded-full shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => success(`${card.name} added to favorites!`)}
                  >
                    <FaHeart />
                  </motion.button>
                  <motion.button
                    className="p-3 bg-blue-500 text-white rounded-full shadow-lg"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => info(`Sharing ${card.name}...`)}
                  >
                    <FaShare />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassContainer>

        {/* Touch Gestures Section */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-4">Touch Gestures Area</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Try: Swipe in any direction, pinch to zoom, double tap
          </p>
          
          <TouchGestures
            onSwipeLeft={(detail) => handleSwipe('left', detail)}
            onSwipeRight={(detail) => handleSwipe('right', detail)}
            onSwipeUp={(detail) => handleSwipe('up', detail)}
            onSwipeDown={(detail) => handleSwipe('down', detail)}
            onPinch={handlePinch}
            onDoubleTap={handleDoubleTap}
            enableSwipe
            enablePinch
            enableDoubleTap
            className="relative"
          >
            <motion.div
              className="h-64 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-xl flex items-center justify-center relative overflow-hidden"
              animate={{
                scale: pinchScale,
                backgroundColor: swipeDirection 
                  ? swipeDirection === 'left' || swipeDirection === 'right' 
                    ? '#fbbf24' 
                    : '#34d399'
                  : undefined
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">Interactive Area</p>
                <p className="text-sm opacity-75">
                  {swipeDirection ? `Swiped ${swipeDirection}!` : 'Swipe, pinch, or double tap'}
                </p>
                {pinchScale !== 1 && (
                  <p className="text-sm mt-2">Scale: {pinchScale.toFixed(2)}x</p>
                )}
              </div>
              
              {/* Visual feedback for swipe direction */}
              <AnimatePresence>
                {swipeDirection && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                  >
                    <motion.div
                      className="text-6xl"
                      animate={{
                        x: swipeDirection === 'left' ? -50 : swipeDirection === 'right' ? 50 : 0,
                        y: swipeDirection === 'up' ? -50 : swipeDirection === 'down' ? 50 : 0
                      }}
                    >
                      {swipeDirection === 'left' && '←'}
                      {swipeDirection === 'right' && '→'}
                      {swipeDirection === 'up' && '↑'}
                      {swipeDirection === 'down' && '↓'}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TouchGestures>
        </GlassContainer>

        {/* Long Press Context Menu */}
        <GlassContainer variant="dark" blur="lg" className="mb-6 p-4">
          <h2 className="text-xl font-semibold mb-4">Long Press Context Menu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Long press on items below to show context menu
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            {demoCards.map((card) => (
              <div
                key={card.id}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openMenu(e, contextMenuItems.map(item => ({
                    ...item,
                    action: () => {
                      setSelectedCard(card.id);
                      item.action();
                    }
                  })));
                }}
                className="cursor-pointer"
              >
                <GlassContainer
                  variant="light"
                  className={`p-4 text-center bg-gradient-to-br from-${card.color}-100 to-${card.color}-200`}
                >
                  <p className="font-semibold">{card.name}</p>
                  <p className="text-xs text-gray-600 mt-1">Long press me</p>
                </GlassContainer>
              </div>
            ))}
          </div>
        </GlassContainer>

        {/* Bottom Sheet Demo */}
        <div className="fixed bottom-4 left-4 right-4">
          <Button
            variant="primary"
            fullWidth
            onClick={() => setBottomSheetOpen(true)}
            leftIcon={<FaCog />}
          >
            Open Bottom Sheet
          </Button>
        </div>

        {/* Bottom Sheet */}
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title="Bottom Sheet Demo"
          snapPoints={[0.25, 0.5, 0.75, 0.95]}
          initialSnapPoint={0.5}
          onSnapPointChange={setCurrentSnapPoint}
        >
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Current snap point: {Math.round(currentSnapPoint * 100)}%
            </p>
            
            <div className="space-y-4">
              <GlassContainer variant="light" className="p-4">
                <h3 className="font-semibold mb-2">Drag to resize</h3>
                <p className="text-sm text-gray-600">
                  Drag the handle at the top to snap to different heights: 25%, 50%, 75%, or 95%
                </p>
              </GlassContainer>
              
              <GlassContainer variant="light" className="p-4">
                <h3 className="font-semibold mb-2">Velocity dismissal</h3>
                <p className="text-sm text-gray-600">
                  Swipe down quickly to dismiss the sheet
                </p>
              </GlassContainer>
              
              <GlassContainer variant="light" className="p-4">
                <h3 className="font-semibold mb-2">Content scrolling</h3>
                <p className="text-sm text-gray-600">
                  When expanded, content scrolls independently
                </p>
              </GlassContainer>
              
              {/* Add more content to demonstrate scrolling */}
              {currentSnapPoint > 0.5 && (
                <>
                  {[...Array(10)].map((_, i) => (
                    <GlassContainer key={i} variant="light" className="p-4">
                      <h4 className="font-medium">Item {i + 1}</h4>
                      <p className="text-sm text-gray-600">
                        Additional content to demonstrate scrolling behavior
                      </p>
                    </GlassContainer>
                  ))}
                </>
              )}
            </div>
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

export default MobileGesturesDemo;