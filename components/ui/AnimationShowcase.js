import React, { useState } from 'react';
import { 
  EnhancedPageTransition,
  InteractiveCard,
  AnimatedModal,
  AnimatedDrawer,
  AnimatedButton,
  AnimatedToggle,
  AnimatedInput,
  ScrollReveal,
  EnhancedLoadingDots,
  AnimatedSkeleton,
  StaggerList,
  useEnhancedAnimation
} from './EnhancedAnimationSystem';
import {
  HolographicCard,
  FlippableCard,
  PackOpeningAnimation,
  CardStack,
  EvolutionAnimation,
  AnimatedTypeBadge
} from './PokemonCardAnimations';

export default function AnimationShowcase() {
  const { animationSpeed, setAnimationSpeed, enableMicroInteractions, setEnableMicroInteractions } = useEnhancedAnimation();
  
  // Demo states
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toggleState, setToggleState] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [evolutionStage, setEvolutionStage] = useState(1);

  // Sample card data
  const sampleCards = [
    { id: 1, name: 'Pikachu', rarity: 'common' },
    { id: 2, name: 'Charizard', rarity: 'holo' },
    { id: 3, name: 'Mewtwo', rarity: 'ultra' },
    { id: 4, name: 'Mew', rarity: 'secret' },
  ];

  const pokemonTypes = ['Fire', 'Water', 'Electric', 'Grass', 'Psychic', 'Dark', 'Steel', 'Fairy'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <EnhancedPageTransition variant="slideUp">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <ScrollReveal direction="down" className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              DexTrends Animation System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive animation showcase with performance optimizations
            </p>
          </ScrollReveal>

          {/* Animation Controls */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Animation Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label>Animation Speed</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={animationSpeed}
                      onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm w-12">{animationSpeed}x</span>
                  </div>
                </div>
                <AnimatedToggle
                  checked={enableMicroInteractions}
                  onChange={(e) => setEnableMicroInteractions(e.target.checked)}
                  label="Enable Micro-interactions"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Page Transitions Demo */}
          <section>
            <ScrollReveal direction="left">
              <h2 className="text-2xl font-semibold mb-6">Page Transitions</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['fade', 'slideUp', 'scale'].map((variant, index) => (
                <ScrollReveal key={variant} direction="up" delay={index * 0.1}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="font-medium capitalize mb-2">{variant} Transition</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Used for {variant === 'fade' ? 'subtle' : variant === 'slideUp' ? 'content reveal' : 'emphasis'} transitions
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Card Interactions */}
          <section>
            <ScrollReveal direction="right">
              <h2 className="text-2xl font-semibold mb-6">Card Interactions</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sampleCards.map((card, index) => (
                <ScrollReveal key={card.id} direction="up" delay={index * 0.1}>
                  <HolographicCard rarity={card.rarity}>
                    <InteractiveCard 
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer"
                      glowColor={
                        card.rarity === 'secret' ? 'rgba(236, 72, 153, 0.5)' :
                        card.rarity === 'ultra' ? 'rgba(251, 191, 36, 0.5)' :
                        card.rarity === 'holo' ? 'rgba(168, 85, 247, 0.5)' :
                        'rgba(59, 130, 246, 0.5)'
                      }
                    >
                      <h3 className="font-bold text-lg mb-2">{card.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {card.rarity} Card
                      </p>
                    </InteractiveCard>
                  </HolographicCard>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Modal & Drawer Demo */}
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Modal & Drawer Animations</h2>
            </ScrollReveal>
            <div className="flex flex-wrap gap-4">
              <AnimatedButton onClick={() => setModalOpen(true)} variant="primary">
                Open Modal
              </AnimatedButton>
              <AnimatedButton onClick={() => setDrawerOpen(true)} variant="secondary">
                Open Drawer
              </AnimatedButton>
            </div>

            <AnimatedModal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
              <div className="bg-white dark:bg-gray-800 p-8 rounded-lg max-w-md">
                <h3 className="text-xl font-bold mb-4">Animated Modal</h3>
                <p className="mb-6">This modal uses smooth scale and fade animations.</p>
                <AnimatedButton onClick={() => setModalOpen(false)} variant="primary" className="w-full">
                  Close Modal
                </AnimatedButton>
              </div>
            </AnimatedModal>

            <AnimatedDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <div className="p-8 w-80">
                <h3 className="text-xl font-bold mb-4">Slide Drawer</h3>
                <p className="mb-6">This drawer slides in from the right with easing.</p>
                <AnimatedButton onClick={() => setDrawerOpen(false)} variant="danger" className="w-full">
                  Close Drawer
                </AnimatedButton>
              </div>
            </AnimatedDrawer>
          </section>

          {/* Micro-interactions */}
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Micro-interactions</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal direction="left">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                  <h3 className="font-medium mb-4">Form Elements</h3>
                  <AnimatedInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Animated input field"
                  />
                  <div className="flex items-center justify-between">
                    <span>Toggle Animation</span>
                    <AnimatedToggle
                      checked={toggleState}
                      onChange={(e) => setToggleState(e.target.checked)}
                    />
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="right">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                  <h3 className="font-medium mb-4">Button Variants</h3>
                  <div className="space-y-2">
                    <AnimatedButton variant="primary" className="w-full">Primary Button</AnimatedButton>
                    <AnimatedButton variant="secondary" className="w-full">Secondary Button</AnimatedButton>
                    <AnimatedButton variant="success" className="w-full">Success Button</AnimatedButton>
                    <AnimatedButton variant="danger" className="w-full">Danger Button</AnimatedButton>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Pokemon-specific Animations */}
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Pokemon Card Animations</h2>
            </ScrollReveal>
            
            {/* Type Badges */}
            <ScrollReveal delay={0.1}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h3 className="font-medium mb-4">Animated Type Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemonTypes.map((type, index) => (
                    <AnimatedTypeBadge key={type} type={type} size="md" />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Card Flip */}
            <ScrollReveal delay={0.2}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h3 className="font-medium mb-4">Card Flip Animation</h3>
                <div className="flex justify-center">
                  <FlippableCard
                    isFlipped={cardFlipped}
                    onFlip={() => setCardFlipped(!cardFlipped)}
                    className="w-48 h-64"
                    frontContent={
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        Card Front
                      </div>
                    }
                    backContent={
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                        Card Back
                      </div>
                    }
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Pack Opening */}
            <ScrollReveal delay={0.3}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
                <h3 className="font-medium mb-4">Pack Opening Animation</h3>
                <AnimatedButton onClick={() => setPackOpen(true)} variant="primary">
                  Open Pack
                </AnimatedButton>
                <PackOpeningAnimation
                  isOpen={packOpen}
                  onComplete={() => setPackOpen(false)}
                  packType="premium"
                >
                  <div className="bg-white p-8 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">You got a rare card!</h3>
                    <AnimatedButton onClick={() => setPackOpen(false)} variant="success">
                      Awesome!
                    </AnimatedButton>
                  </div>
                </PackOpeningAnimation>
              </div>
            </ScrollReveal>

            {/* Evolution Chain */}
            <ScrollReveal delay={0.4}>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="font-medium mb-4">Evolution Animation</h3>
                <EvolutionAnimation
                  currentStage={evolutionStage}
                  onStageChange={setEvolutionStage}
                  stages={[
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">1</div>,
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">2</div>,
                    <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>,
                  ]}
                />
              </div>
            </ScrollReveal>
          </section>

          {/* Loading States */}
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Loading & Skeleton Animations</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal direction="left">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-medium mb-4">Loading Indicators</h3>
                  <div className="flex items-center justify-around">
                    <EnhancedLoadingDots size="sm" />
                    <EnhancedLoadingDots size="md" />
                    <EnhancedLoadingDots size="lg" />
                  </div>
                </div>
              </ScrollReveal>
              
              <ScrollReveal direction="right">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h3 className="font-medium mb-4">Skeleton Loading</h3>
                  <div className="space-y-3">
                    <AnimatedSkeleton height="1rem" />
                    <AnimatedSkeleton height="1rem" width="80%" />
                    <AnimatedSkeleton height="1rem" width="60%" />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Stagger List */}
          <section>
            <ScrollReveal>
              <h2 className="text-2xl font-semibold mb-6">Staggered List Animation</h2>
            </ScrollReveal>
            <StaggerList className="space-y-3">
              {['First Item', 'Second Item', 'Third Item', 'Fourth Item', 'Fifth Item'].map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                  <h3 className="font-medium">{item}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This item appears with a staggered delay
                  </p>
                </div>
              ))}
            </StaggerList>
          </section>
        </div>
      </EnhancedPageTransition>
    </div>
  );
}