import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence, useAnimation, PanInfo } from 'framer-motion';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { CircularCard } from '../components/ui/design-system/CircularCard';
import { useContextualTheme } from '../hooks/useContextualTheme';
import { cn } from '../utils/cn';

const UXInteractionLab = () => {
  const [selectedSection, setSelectedSection] = useState('animations');
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const controls = useAnimation();
  const theme = useContextualTheme('ux');
  
  // Timer refs for cleanup
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation variants
  const waveContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.05,
        staggerChildren: 0.03
      }
    }
  };

  const spiralContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0,
        staggerChildren: 0.08
      }
    }
  };

  const waveItemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 20
      }
    }
  };

  const spiralItemVariants = {
    hidden: { rotate: -180, scale: 0, opacity: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25
      }
    }
  };

  // Interaction examples
  const animationExamples = [
    {
      name: 'Gentle Bounce',
      description: 'Soft spring animation',
      component: (
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full cursor-pointer shadow-lg"
          whileHover={{ 
            scale: 1.1,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          whileTap={{ scale: 0.9 }}
        />
      )
    },
    {
      name: 'Liquid Morphism',
      description: 'Smooth shape transformation',
      component: (
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 cursor-pointer shadow-lg"
          style={{ borderRadius: "30%" }}
          whileHover={{ 
            borderRadius: "50%",
            scale: 1.05,
            transition: { duration: 0.3, ease: "easeOut" }
          }}
        />
      )
    },
    {
      name: 'Magnetic Hover',
      description: 'Element follows cursor',
      component: (
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl cursor-pointer"
          whileHover={{
            scale: 1.2,
            boxShadow: "0 0 30px rgba(52, 211, 153, 0.5)",
            transition: { type: "spring", stiffness: 300, damping: 15 }
          }}
          animate={{
            y: [0, -2, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
      )
    },
    {
      name: 'Breathe Effect',
      description: 'Gentle breathing animation',
      component: (
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl cursor-pointer"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.15,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
        />
      )
    },
    {
      name: 'Rotation Hover',
      description: 'Playful rotation effect',
      component: (
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg cursor-pointer shadow-lg"
          whileHover={{ 
            rotate: 15,
            scale: 1.1,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
        />
      )
    }
  ];

  const loadingStates = [
    {
      name: 'Dots Pulse',
      component: (
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-purple-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )
    },
    {
      name: 'Skeleton Shimmer',
      component: (
        <div className="w-48 space-y-3">
          <motion.div
            className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              backgroundSize: "200% 100%"
            }}
          />
          <motion.div
            className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-3/4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              delay: 0.1
            }}
            style={{
              backgroundSize: "200% 100%"
            }}
          />
        </div>
      )
    },
    {
      name: 'Progress Ring',
      component: (
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-200"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      )
    }
  ];

  const feedbackExamples = [
    {
      name: 'Success Toast',
      action: () => {
        setNotificationVisible(true);
        
        // Clear existing timer
        if (notificationTimerRef.current) {
          clearTimeout(notificationTimerRef.current);
        }
        
        notificationTimerRef.current = setTimeout(() => {
          setNotificationVisible(false);
          notificationTimerRef.current = null;
        }, 3000);
      }
    },
    {
      name: 'Progress Bar',
      action: () => {
        setProgressValue(0);
        
        // Clear existing intervals and timers
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (progressResetTimerRef.current) {
          clearTimeout(progressResetTimerRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          setProgressValue(prev => {
            if (prev >= 100) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
              
              progressResetTimerRef.current = setTimeout(() => {
                setProgressValue(0);
                progressResetTimerRef.current = null;
              }, 1000);
              
              return 100;
            }
            return prev + 10;
          });
        }, 200);
      }
    },
    {
      name: 'Modal Dialog',
      action: () => setModalOpen(true)
    }
  ];

  // Define components separately to fix React hooks error
  const ToggleSwitchComponent = ({ id }: { id: number }) => {
    const [isOn, setIsOn] = useState(false);
    return (
      <motion.button
        className={`w-16 h-8 rounded-full p-1 flex ${
          isOn ? 'bg-green-500' : 'bg-gray-300'
        }`}
        onClick={() => setIsOn(!isOn)}
      >
        <motion.div
          className="w-6 h-6 bg-white rounded-full shadow-md"
          animate={{
            x: isOn ? 32 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 700,
            damping: 30
          }}
        />
      </motion.button>
    );
  };

  const RippleButtonComponent = ({ id }: { id: number }) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const rippleTimersRef = useRef<Set<NodeJS.Timeout>>(new Set());
    
    useEffect(() => {
      return () => {
        // Cleanup all ripple timers on unmount
        rippleTimersRef.current.forEach(timer => clearTimeout(timer));
        rippleTimersRef.current.clear();
      };
    }, []);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const newRipple = {
        id: Date.now(),
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      setRipples(prev => [...prev, newRipple]);
      
      const timer = setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        rippleTimersRef.current.delete(timer);
      }, 600);
      
      rippleTimersRef.current.add(timer);
    };

    return (
      <button
        className="relative overflow-hidden px-6 py-3 bg-blue-500 text-white rounded-lg"
        onClick={handleClick}
      >
        <span className="relative z-10">Click Me</span>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 8, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </button>
    );
  };

  const microInteractions = [
    {
      name: 'Like Button',
      component: (id: number) => (
        <motion.button
          className={`p-3 rounded-full ${likedItems.has(id) 
            ? 'bg-red-500 text-white' 
            : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => {
            setLikedItems(prev => {
              const newSet = new Set(prev);
              if (newSet.has(id)) {
                newSet.delete(id);
              } else {
                newSet.add(id);
              }
              return newSet;
            });
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={likedItems.has(id) ? {
            scale: [1, 1.3, 1],
            transition: { duration: 0.3 }
          } : {}}
        >
          <motion.span
            animate={likedItems.has(id) ? {
              rotate: [0, 360],
              transition: { duration: 0.5 }
            } : {}}
          >
            ❤️
          </motion.span>
        </motion.button>
      )
    },
    {
      name: 'Toggle Switch',
      component: (id: number) => <ToggleSwitchComponent id={id} />
    },
    {
      name: 'Ripple Button',
      component: (id: number) => <RippleButtonComponent id={id} />
    }
  ];

  const sectionButtons = [
    { id: 'animations', label: 'Animations', icon: '✨' },
    { id: 'loading', label: 'Loading States', icon: '⏳' },
    { id: 'feedback', label: 'Feedback', icon: '📢' },
    { id: 'micro', label: 'Micro Interactions', icon: '🎯' },
    { id: 'gestures', label: 'Gestures', icon: '👆' }
  ];
  
  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (notificationTimerRef.current) {
        clearTimeout(notificationTimerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (progressResetTimerRef.current) {
        clearTimeout(progressResetTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>UX Interaction Lab - DexTrends</title>
        <meta name="description" content="UX interaction testing and calibration" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              UX Interaction Laboratory
            </h1>
            
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2">
              {sectionButtons.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden",
                    selectedSection === section.id
                      ? theme.tabs.activeClass + " shadow-lg"
                      : theme.tabs.inactiveClass + " " + theme.tabs.hoverClass
                  )}
                  whileHover={{ scale: selectedSection === section.id ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative">{section.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {notificationVisible && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="fixed top-20 right-4 z-50"
            >
              <GlassContainer
                variant="colored"
                blur="lg"
                rounded="xl"
                className="p-4 min-w-[300px] border-green-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">Success!</h4>
                    <p className="text-sm text-green-600">Action completed successfully</p>
                  </div>
                </div>
              </GlassContainer>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          
          {/* Animations Section */}
          {selectedSection === 'animations' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Animation Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {animationExamples.map((example, index) => (
                  <motion.div
                    key={example.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassContainer
                      variant="light"
                      blur="md"
                      className="h-40 flex flex-col items-center justify-center text-center"
                    >
                      {example.component}
                      <h3 className="font-semibold mt-4 text-gray-800 dark:text-gray-200">
                        {example.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {example.description}
                      </p>
                    </GlassContainer>
                  </motion.div>
                ))}
              </div>

              {/* Advanced Animation Examples */}
              <div className="mt-12 space-y-12">
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                    Wave Animation
                  </h3>
                  <motion.div
                    className="flex flex-wrap gap-3 justify-center"
                    variants={waveContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.div
                        key={i}
                        variants={waveItemVariants}
                        className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full"
                        whileHover={{ 
                          scale: 1.3,
                          y: -8,
                          transition: { type: "spring" as const, stiffness: 500, damping: 15 }
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">
                    Ripple Formation
                  </h3>
                  <motion.div
                    className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
                    variants={spiralContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {Array.from({ length: 21 }, (_, i) => {
                      const colors = [
                        'from-pink-400 to-rose-500',
                        'from-purple-400 to-violet-500', 
                        'from-indigo-400 to-blue-500',
                        'from-cyan-400 to-teal-500',
                        'from-emerald-400 to-green-500',
                        'from-yellow-400 to-orange-500',
                        'from-red-400 to-pink-500'
                      ];
                      
                      // Create ripple pattern from center outward
                      const center = 10; // middle index
                      const distance = Math.abs(i - center);
                      const angle = (i - center) * 25; // degrees
                      
                      // Sizes get smaller as they ripple out
                      const sizes = ['w-16 h-16', 'w-14 h-14', 'w-12 h-12', 'w-10 h-10', 'w-8 h-8'];
                      const sizeIndex = Math.min(distance, sizes.length - 1);
                      
                      const customVariants = {
                        hidden: { 
                          scale: 0,
                          opacity: 0,
                          rotate: angle * 2,
                          y: distance * -5
                        },
                        visible: {
                          scale: 1,
                          opacity: 1 - (distance * 0.1),
                          rotate: angle * 0.3,
                          y: 0,
                          transition: {
                            type: "spring" as const,
                            stiffness: 500,
                            damping: 15,
                            delay: distance * 0.03
                          }
                        }
                      };
                      
                      const shape = distance === 0 ? 'rounded-full' : distance % 2 === 0 ? 'rounded-2xl' : 'rounded-xl';
                      
                      return (
                        <motion.div
                          key={i}
                          variants={customVariants}
                          className={`${sizes[sizeIndex]} bg-gradient-to-br ${colors[i % colors.length]} ${shape}`}
                          whileHover={{ 
                            scale: 1.3,
                            rotate: angle * 0.5,
                            zIndex: 10,
                            transition: { type: "spring" as const, stiffness: 500, damping: 15 }
                          }}
                        />
                      );
                    })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading States Section */}
          {selectedSection === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Loading States</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loadingStates.map((loading, index) => (
                  <GlassContainer
                    key={loading.name}
                    variant="medium"
                    blur="md"
                    className="h-32 flex flex-col items-center justify-center"
                  >
                    {loading.component}
                    <h3 className="font-semibold mt-4 text-gray-800 dark:text-gray-200">
                      {loading.name}
                    </h3>
                  </GlassContainer>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback Section */}
          {selectedSection === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Feedback Systems</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {feedbackExamples.map((feedback, index) => (
                  <GlassContainer
                    key={feedback.name}
                    variant="light"
                    blur="md"
                    className="h-32 flex flex-col items-center justify-center"
                  >
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium"
                      onClick={feedback.action}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {feedback.name}
                    </motion.button>
                  </GlassContainer>
                ))}
              </div>

              {/* Progress Bar Demo */}
              <GlassContainer variant="medium" blur="md" className="p-6">
                <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Progress Indicator
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressValue}%` }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {progressValue}% Complete
                </p>
              </GlassContainer>
            </motion.div>
          )}

          {/* Micro Interactions Section */}
          {selectedSection === 'micro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Micro Interactions
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {microInteractions.map((interaction, index) => (
                  <GlassContainer
                    key={interaction.name}
                    variant="light"
                    blur="md"
                    className="h-40 flex flex-col items-center justify-center"
                  >
                    {interaction.component(index)}
                    <h3 className="font-semibold mt-4 text-gray-800 dark:text-gray-200">
                      {interaction.name}
                    </h3>
                  </GlassContainer>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gestures Section */}
          {selectedSection === 'gestures' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Gesture Interactions</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Magnetic Drag */}
                <GlassContainer variant="medium" blur="md" className="h-64 relative">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Magnetic Drag
                  </h3>
                  <div className="relative h-48">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl cursor-grab active:cursor-grabbing shadow-xl"
                      drag
                      dragConstraints={{ left: -100, right: 100, top: -80, bottom: 80 }}
                      dragElastic={0.3}
                      whileDrag={{ 
                        scale: 1.2, 
                        rotate: 8,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
                      }}
                      dragTransition={{ 
                        bounceStiffness: 600, 
                        bounceDamping: 20 
                      }}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        x: '-50%',
                        y: '-50%'
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Smooth magnetic dragging
                  </p>
                </GlassContainer>

                {/* Swipe to Delete */}
                <GlassContainer variant="medium" blur="md" className="h-64">
                  <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Swipe Actions
                  </h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <motion.div
                        key={item}
                        className="bg-white/50 p-3 rounded-lg shadow-sm"
                        drag="x"
                        dragConstraints={{ left: -100, right: 0 }}
                        dragElastic={0.2}
                        whileDrag={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      >
                        <div className="flex justify-between items-center">
                          <span>Item {item}</span>
                          <span className="text-xs text-gray-500">Swipe ←</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassContainer>
              </div>
            </motion.div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassContainer variant="dark" blur="xl" className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                    Modal Dialog
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This is an example of a glass morphism modal with smooth animations.
                  </p>
                  <motion.button
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
                    onClick={() => setModalOpen(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </GlassContainer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default UXInteractionLab;