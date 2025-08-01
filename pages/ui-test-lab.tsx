import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { GlassContainer } from '../components/ui/design-system/GlassContainer';
import { CircularCard } from '../components/ui/design-system/CircularCard';
import { TypeGradientBadge } from '../components/ui/design-system/TypeGradientBadge';
import { useContextualTheme, getContextualTabClass } from '../hooks/useContextualTheme';
import { cn } from '../utils/cn';

const UITestLab = () => {
  const [selectedSection, setSelectedSection] = useState('glass');
  const theme = useContextualTheme('ui');

  // Glass morphism variations (user preferred)
  const glassVariations = [
    { 
      name: 'Rich Dark ⭐', 
      variant: 'dark' as const, 
      blur: 'lg' as const,
      description: 'User preferred - Strong presence, high contrast',
      preferred: true
    },
    { 
      name: 'Ultra Light', 
      variant: 'light' as const, 
      blur: 'sm' as const,
      description: 'Barely there, ethereal feel'
    },
    { 
      name: 'Soft Medium', 
      variant: 'medium' as const, 
      blur: 'md' as const,
      description: 'Balanced visibility and depth'
    },
    { 
      name: 'Colored Dream', 
      variant: 'colored' as const, 
      blur: 'xl' as const,
      description: 'Pastel gradient background'
    },
    { 
      name: 'Gradient Glass',
      variant: 'light' as const,
      blur: 'md' as const,
      gradient: true,
      description: 'With gradient overlay'
    }
  ];

  // Circular element variations (user approved only)
  const circularVariations = [
    {
      name: 'Tiny Orb',
      size: 'sm' as const,
      gradientFrom: 'pink-300',
      gradientTo: 'purple-300',
      glow: false,
      description: 'Perfect for small accents'
    },
    {
      name: 'Glowing XL',
      size: 'xl' as const,
      gradientFrom: 'violet-400',
      gradientTo: 'fuchsia-400',
      glow: true,
      description: 'Hero elements and focus points'
    }
  ];

  // Typography variations (solid colors)
  const typographyStyles = [
    {
      name: 'Soft Purple',
      color: 'text-purple-600 dark:text-purple-400',
      text: 'Beautiful Typography'
    },
    {
      name: 'Gentle Pink',
      color: 'text-pink-600 dark:text-pink-400', 
      text: 'Beautiful Typography'
    },
    {
      name: 'Ocean Blue',
      color: 'text-blue-600 dark:text-blue-400',
      text: 'Beautiful Typography'
    },
    {
      name: 'Forest Green',
      color: 'text-emerald-600 dark:text-emerald-400',
      text: 'Beautiful Typography'
    },
    {
      name: 'Warm Grey ⭐',
      color: 'text-gray-600 dark:text-gray-400',
      text: 'Beautiful Typography',
      preferred: true
    },
    {
      name: 'Deep Slate ⭐',
      color: 'text-slate-700 dark:text-slate-300',
      text: 'Beautiful Typography',
      preferred: true
    },
    {
      name: 'Soft Indigo',
      color: 'text-indigo-600 dark:text-indigo-400',
      text: 'Beautiful Typography'
    },
    {
      name: 'Muted Rose',
      color: 'text-rose-600 dark:text-rose-400',
      text: 'Beautiful Typography'
    }
  ];

  // Pastel color palettes (user preferred marked)
  const colorPalettes = [
    {
      name: 'Soft Pastels',
      colors: ['bg-pink-100', 'bg-purple-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100']
    },
    {
      name: 'Deeper Pastels',
      colors: ['bg-pink-200', 'bg-purple-200', 'bg-blue-200', 'bg-emerald-200', 'bg-indigo-200']
    },
    {
      name: 'Pastels with Grey ⭐',
      colors: ['bg-pink-100', 'bg-purple-100', 'bg-gray-200', 'bg-blue-100', 'bg-slate-200'],
      preferred: true
    },
    {
      name: 'Muted Pastels ⭐',
      colors: ['bg-rose-200', 'bg-violet-200', 'bg-gray-300', 'bg-sky-200', 'bg-slate-300'],
      preferred: true
    }
  ];

  const sectionButtons = [
    { id: 'glass', label: 'Glass Morphism' },
    { id: 'circular', label: 'Circular Elements' },
    { id: 'typography', label: 'Typography' },
    { id: 'colors', label: 'Color Palettes' },
    { id: 'badges', label: 'Type Badges' }
  ];

  return (
    <>
      <Head>
        <title>UI Test Lab - DexTrends</title>
        <meta name="description" content="UI component testing and calibration" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              UI Test Laboratory
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

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          
          {/* Glass Morphism Section */}
          {selectedSection === 'glass' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Glass Morphism Variations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {glassVariations.map((variation, index) => (
                  <motion.div
                    key={variation.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassContainer
                      variant={variation.variant}
                      blur={variation.blur}
                      gradient={variation.gradient}
                      hover={true}
                      className={`h-48 flex flex-col justify-center items-center ${variation.preferred ? 'ring-2 ring-purple-500' : ''}`}
                    >
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                        {variation.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {variation.description}
                      </p>
                      <div className="mt-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    </GlassContainer>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Circular Elements Section */}
          {selectedSection === 'circular' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Circular Element Variations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 place-items-center">
                {circularVariations.map((variation, index) => (
                  <motion.div
                    key={variation.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <CircularCard
                      size={variation.size}
                      gradientFrom={variation.gradientFrom}
                      gradientTo={variation.gradientTo}
                      glow={variation.glow}
                      title={variation.name}
                      subtitle={variation.description}
                    >
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        ✨
                      </div>
                    </CircularCard>
                  </motion.div>
                ))}
              </div>
              
              {/* Enhanced Interactive Example */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Enhanced Interactive Design</h3>
                <div className="flex flex-wrap gap-6 justify-center">
                  <CircularCard
                    size="xl"
                    gradientFrom="indigo-400"
                    gradientTo="purple-500"
                    glow={true}
                    title="Premium Card"
                    subtitle="Enhanced clickable design"
                    onClick={() => alert('Enhanced circular card clicked!')}
                    badge={
                      <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        ★
                      </div>
                    }
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-4xl mb-2">💎</div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Premium</div>
                    </div>
                  </CircularCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* Typography Section */}
          {selectedSection === 'typography' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Typography Styles</h2>
              
              {/* Color Variations */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Color Variations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {typographyStyles.map((style, index) => (
                    <motion.div
                      key={style.name}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center py-6"
                    >
                      <h3 className={`text-4xl md:text-5xl font-bold mb-2 ${style.color} ${style.preferred ? 'ring-2 ring-purple-400 rounded-lg px-4 py-2' : ''}`}>
                        {style.text}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{style.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Weight & Size Hierarchy */}
              <div>
                <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-gray-200">Weight & Size Hierarchy</h3>
                <div className="space-y-4">
                  <div className="text-5xl font-light text-purple-600 dark:text-purple-400">Light Heading</div>
                  <div className="text-4xl font-normal text-purple-600 dark:text-purple-400">Regular Heading</div>
                  <div className="text-3xl font-medium text-purple-600 dark:text-purple-400">Medium Heading</div>
                  <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">Semibold Heading</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">Bold Heading</div>
                  <div className="text-base font-medium text-gray-600 dark:text-gray-400">Body Text Medium</div>
                  <div className="text-base font-normal text-gray-600 dark:text-gray-400">Body Text Regular</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-500">Small Text</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Color Palettes Section */}
          {selectedSection === 'colors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Pastel Color Palettes</h2>
              <div className="space-y-8">
                {colorPalettes.map((palette, index) => (
                  <motion.div
                    key={palette.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                      {palette.name}
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {palette.colors.map((color, colorIndex) => (
                        <motion.div
                          key={colorIndex}
                          className={`w-20 h-20 rounded-2xl ${color} shadow-lg border border-white/50`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                        />
                      ))}
                    </div>
                    
                    {/* Gradient version of the palette */}
                    <div className="mt-4">
                      <div 
                        className="h-16 rounded-2xl shadow-lg border border-white/50"
                        style={{
                          background: `linear-gradient(to right, ${palette.colors.map(c => 
                            c.replace('bg-', '').split('-').join('-')
                          ).map(c => {
                            // Convert Tailwind class to CSS color
                            const colorMap: {[key: string]: string} = {
                              'pink-100': '#fce7f3', 'purple-100': '#f3e8ff', 'blue-100': '#dbeafe', 
                              'green-100': '#dcfce7', 'yellow-100': '#fefce8', 'rose-200': '#fecdd3',
                              'violet-200': '#e9d5ff', 'sky-200': '#bae6fd', 'emerald-200': '#a7f3d0',
                              'amber-200': '#fde68a', 'slate-200': '#e2e8f0', 'stone-200': '#e7e5e4',
                              'neutral-200': '#e5e5e5', 'zinc-200': '#e4e4e7', 'gray-200': '#e5e7eb',
                              'fuchsia-300': '#f0abfc', 'cyan-300': '#67e8f9', 'lime-300': '#bef264',
                              'orange-300': '#fdba74', 'indigo-300': '#a5b4fc'
                            };
                            return colorMap[c] || '#e5e7eb';
                          }).join(', ')}`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Type Badges Section */}
          {selectedSection === 'badges' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Type Badge Design (Standard Only)</h2>
              
              {/* Current Standard Design */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Pokemon Types (Consistent Sizing)</h3>
                <div className="flex flex-wrap gap-3">
                  {['fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'fairy', 'fighting', 'poison', 'ground', 'flying', 'bug', 'rock', 'ghost', 'dark', 'steel', 'normal'].map((type) => (
                    <TypeGradientBadge key={type} type={type} size="sm" gradient={false} />
                  ))}
                </div>
              </div>

              {/* Pokemon Pocket Types */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Pokemon Pocket TCG Types</h3>
                <div className="flex flex-wrap gap-3">
                  {['fire', 'water', 'grass', 'electric', 'psychic', 'fighting', 'darkness', 'metal', 'colorless'].map((type) => (
                    <TypeGradientBadge key={type} type={type} size="sm" gradient={false} />
                  ))}
                </div>
              </div>

              {/* Size Consistency Test */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Size Consistency Check</h3>
                <div className="flex flex-wrap gap-3 items-center">
                  <TypeGradientBadge type="fire" size="sm" gradient={false} />
                  <TypeGradientBadge type="ice" size="sm" gradient={false} />
                  <TypeGradientBadge type="normal" size="sm" gradient={false} />
                  <TypeGradientBadge type="fighting" size="sm" gradient={false} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  ↑ All badges should be exactly the same size (min-width ensures consistency)
                </p>
              </div>

              {/* In Context Example */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">In Context (Card Example)</h3>
                <GlassContainer variant="light" blur="md" className="max-w-md">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl">
                      🔥
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Charizard</h4>
                      <div className="flex gap-2">
                        <TypeGradientBadge type="fire" size="sm" gradient={false} />
                        <TypeGradientBadge type="flying" size="sm" gradient={false} />
                      </div>
                    </div>
                  </div>
                </GlassContainer>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default UITestLab;