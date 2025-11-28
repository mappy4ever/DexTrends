import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeGradientBadge } from './design-system/TypeGradientBadge';
import { GlassContainer } from './design-system/GlassContainer';

interface TypeMatchup {
  attacking: string;
  defending: string;
  effectiveness: number;
}

interface TypeData {
  damageRelations: {
    double_damage_to?: Array<{ name: string }>;
    half_damage_to?: Array<{ name: string }>;
    no_damage_to?: Array<{ name: string }>;
    double_damage_from?: Array<{ name: string }>;
    half_damage_from?: Array<{ name: string }>;
    no_damage_from?: Array<{ name: string }>;
  };
}

interface CircularTypeMatrixProps {
  typeData: Map<string, TypeData>;
  selectedType?: string;
  onTypeSelect?: (type: string) => void;
}

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const EFFECTIVENESS_COLORS: { [key: number]: { bg: string; text: string; symbol: string } } = {
  0: { bg: 'bg-stone-200 dark:bg-stone-700', text: 'text-stone-500', symbol: '0' },
  0.5: { bg: 'bg-red-200 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-400', symbol: '½' },
  1: { bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-600 dark:text-stone-400', symbol: '1' },
  2: { bg: 'bg-green-200 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-400', symbol: '2' }
};

export const CircularTypeMatrix: React.FC<CircularTypeMatrixProps> = ({
  typeData,
  selectedType,
  onTypeSelect
}) => {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'attacking' | 'defending'>('attacking');

  const getEffectiveness = (attacker: string, defender: string): number => {
    const attackerData = typeData.get(attacker);
    if (!attackerData) return 1;

    const damageRelations = attackerData.damageRelations;
    
    if (damageRelations.double_damage_to?.some((t) => t.name === defender)) return 2;
    if (damageRelations.half_damage_to?.some((t) => t.name === defender)) return 0.5;
    if (damageRelations.no_damage_to?.some((t) => t.name === defender)) return 0;
    
    return 1;
  };

  const getTypeRelations = (type: string) => {
    const data = typeData.get(type);
    if (!data) return { superEffective: [], notVeryEffective: [], noEffect: [], resistantTo: [], weakTo: [], immuneTo: [] };

    const damageRelations = data.damageRelations;
    
    return {
      superEffective: damageRelations.double_damage_to?.map((t) => t.name) || [],
      notVeryEffective: damageRelations.half_damage_to?.map((t) => t.name) || [],
      noEffect: damageRelations.no_damage_to?.map((t) => t.name) || [],
      resistantTo: damageRelations.half_damage_from?.map((t) => t.name) || [],
      weakTo: damageRelations.double_damage_from?.map((t) => t.name) || [],
      immuneTo: damageRelations.no_damage_from?.map((t) => t.name) || []
    };
  };

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex justify-center">
        <GlassContainer variant="medium" rounded="full" padding="none" className="inline-flex">
          <button
            onClick={() => setViewMode('attacking')}
            className={`px-6 py-3 rounded-full transition-all ${
              viewMode === 'attacking'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Attacking
          </button>
          <button
            onClick={() => setViewMode('defending')}
            className={`px-6 py-3 rounded-full transition-all ${
              viewMode === 'defending'
                ? 'bg-gradient-to-r from-amber-500 to-amber-500 text-white'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Defending
          </button>
        </GlassContainer>
      </div>

      {/* Type Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {POKEMON_TYPES.map((type: string) => (
          <motion.div
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTypeSelect?.(type)}
            onMouseEnter={() => setHoveredType(type)}
            onMouseLeave={() => setHoveredType(null)}
            className="cursor-pointer"
          >
            <TypeGradientBadge
              type={type}
              size="md"
              circular={true}
              gradient={true}
              className={selectedType === type ? 'ring-4 ring-offset-2 ring-pokemon-red' : ''}
            />
          </motion.div>
        ))}
      </div>

      {/* Selected Type Details */}
      <AnimatePresence mode="wait">
        {selectedType && (
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassContainer variant="colored" className="p-8">
              <div className="text-center mb-6">
                <TypeGradientBadge
                  type={selectedType}
                  size="lg"
                  circular={true}
                  gradient={true}
                />
                <h3 className="text-2xl font-bold mt-4 capitalize text-stone-800 dark:text-stone-200">
                  {selectedType} Type
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Offensive Matchups */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-center text-stone-700 dark:text-stone-300">
                    When Attacking
                  </h4>
                  <div className="space-y-4">
                    {(() => {
                      const relations = getTypeRelations(selectedType);
                      return (
                        <>
                          {relations.superEffective.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                Super Effective (2×)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.superEffective.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {relations.notVeryEffective.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                Not Very Effective (½×)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.notVeryEffective.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {relations.noEffect.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-stone-700 dark:text-stone-400 mb-2">
                                No Effect (0×)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.noEffect.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Defensive Matchups */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-center text-stone-700 dark:text-stone-300">
                    When Defending
                  </h4>
                  <div className="space-y-4">
                    {(() => {
                      const relations = getTypeRelations(selectedType);
                      return (
                        <>
                          {relations.weakTo.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                                Weak To (2× damage)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.weakTo.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {relations.resistantTo.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
                                Resistant To (½× damage)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.resistantTo.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {relations.immuneTo.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-stone-700 dark:text-stone-400 mb-2">
                                Immune To (0× damage)
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {relations.immuneTo.map((type: string) => (
                                  <TypeGradientBadge
                                    key={type}
                                    type={type}
                                    size="sm"
                                    gradient={false}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Effectiveness Matrix */}
              {viewMode === 'attacking' && (
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-center text-stone-700 dark:text-stone-300">
                    Attack Effectiveness Against All Types
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {POKEMON_TYPES.map((defendingType) => {
                      const effectiveness = getEffectiveness(selectedType, defendingType);
                      const style = EFFECTIVENESS_COLORS[effectiveness];
                      
                      return (
                        <motion.div
                          key={defendingType}
                          whileHover={{ scale: 1.05 }}
                          className={`relative p-3 rounded-xl text-center ${style.bg} transition-all`}
                        >
                          <TypeGradientBadge
                            type={defendingType}
                            size="xs"
                            gradient={false}
                          />
                          <div className={`mt-2 font-bold ${style.text}`}>
                            {style.symbol}×
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hovered Type Preview */}
      <AnimatePresence>
        {hoveredType && hoveredType !== selectedType && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <GlassContainer variant="dark" className="p-4">
              <TypeGradientBadge
                type={hoveredType}
                size="md"
                circular={true}
                gradient={true}
              />
              <p className="text-sm mt-2 text-stone-600 dark:text-stone-400">
                Click to view details
              </p>
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircularTypeMatrix;