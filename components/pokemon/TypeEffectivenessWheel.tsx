import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { TypeBadge } from '../ui/TypeBadge';
import { GlassContainer } from '../ui/design-system';
import { useTypeEffectiveness } from '../../hooks/useTypeEffectiveness';
import { POKEMON_TYPE_COLORS } from '../../utils/pokemonTypeColors';
import { FaExclamationTriangle, FaBan, FaCircle } from 'react-icons/fa';
import { GiShield } from 'react-icons/gi';
import { getAnimationProps, UI_ANIMATION_SETS } from '../../utils/standardizedAnimations';

interface TypeEffectivenessWheelProps {
  pokemonTypes: { slot: number; type: { name: string } }[];
  className?: string;
}

interface TypeRelation {
  type: string;
  effectiveness: number;
  category: 'weakness' | 'resistance' | 'immunity' | 'normal';
}

const TypeEffectivenessWheel: React.FC<TypeEffectivenessWheelProps> = ({
  pokemonTypes,
  className
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  
  // Use the new hook for type effectiveness
  const { getWeaknesses, getResistances, getImmunities, loading } = useTypeEffectiveness();
  const typeNames = pokemonTypes.map(t => t.type.name);
  
  // Calculate type effectiveness for all types
  const typeRelations = useMemo(() => {
    if (loading) return [];
    
    const relations: TypeRelation[] = [];
    
    // Get weaknesses
    const weaknesses = getWeaknesses(typeNames);
    weaknesses.forEach(({ type, multiplier }) => {
      relations.push({
        type,
        effectiveness: multiplier,
        category: 'weakness'
      });
    });
    
    // Get resistances
    const resistances = getResistances(typeNames);
    resistances.forEach(({ type, multiplier }) => {
      relations.push({
        type,
        effectiveness: multiplier,
        category: 'resistance'
      });
    });
    
    // Get immunities
    const immunities = getImmunities(typeNames);
    immunities.forEach(type => {
      relations.push({
        type,
        effectiveness: 0,
        category: 'immunity'
      });
    });
    
    // Add normal effectiveness types (those not in any other category)
    const allTypes = ['normal', 'fighting', 'flying', 'poison', 'ground', 'rock', 'bug', 'ghost', 
                     'steel', 'fire', 'water', 'grass', 'electric', 'psychic', 'ice', 'dragon', 'dark', 'fairy'];
    const specialTypes = new Set([
      ...weaknesses.map(w => w.type),
      ...resistances.map(r => r.type),
      ...immunities
    ]);
    
    allTypes.forEach(type => {
      if (!specialTypes.has(type)) {
        relations.push({
          type,
          effectiveness: 1,
          category: 'normal'
        });
      }
    });
    
    return relations;
  }, [pokemonTypes, getWeaknesses, getResistances, getImmunities, loading, typeNames]);
  
  // Group relations by category
  const groupedRelations = useMemo(() => {
    return {
      weakness: typeRelations.filter(r => r.category === 'weakness'),
      resistance: typeRelations.filter(r => r.category === 'resistance'),
      immunity: typeRelations.filter(r => r.category === 'immunity'),
      normal: typeRelations.filter(r => r.category === 'normal')
    };
  }, [typeRelations]);
  
  // Category configurations
  const categories = [
    { 
      id: 'weakness', 
      label: 'Weak to', 
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-300 dark:border-red-700',
      icon: <FaExclamationTriangle className="text-red-500" />,
      count: groupedRelations.weakness.length
    },
    { 
      id: 'resistance', 
      label: 'Resistant to', 
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-300 dark:border-green-700',
      icon: <GiShield className="text-green-500" />,
      count: groupedRelations.resistance.length
    },
    { 
      id: 'immunity', 
      label: 'Immune to', 
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      borderColor: 'border-gray-300 dark:border-gray-700',
      icon: <FaBan className="text-gray-500" />,
      count: groupedRelations.immunity.length
    }
  ];
  
  // Get display relations based on selected category
  const displayRelations = selectedCategory 
    ? groupedRelations[selectedCategory as keyof typeof groupedRelations]
    : [];
  
  return (
    <div className={cn("space-y-6", className)} data-testid="type-effectiveness">
      {/* Category selector wheels */}
      <div className="grid grid-cols-3 gap-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id
            )}
            className={cn(
              "relative p-6 rounded-2xl transition-all duration-300",
              "border-2",
              selectedCategory === category.id
                ? `${category.bgColor} ${category.borderColor}`
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
            {...UI_ANIMATION_SETS.button}
          >
            {/* Background gradient when selected */}
            {selectedCategory === category.id && (
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10",
                  category.color
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
              />
            )}
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h4 className="font-bold text-sm mb-1">{category.label}</h4>
              <div className={cn(
                "text-2xl font-bold",
                selectedCategory === category.id && "bg-gradient-to-r text-transparent bg-clip-text",
                selectedCategory === category.id && category.color
              )}>
                {category.count}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {category.count === 1 ? 'type' : 'types'}
              </div>
            </div>
            
            {/* Selection indicator */}
            {selectedCategory === category.id && (
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
              >
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-current" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Type details */}
      <AnimatePresence mode="wait">
        {selectedCategory && displayRelations.length > 0 && (
          <motion.div
            {...getAnimationProps('slideUp')}
          >
            <GlassContainer variant="dark" className="p-6">
              <div className="flex flex-wrap gap-3">
                {displayRelations.map((relation, index) => (
                  <motion.div
                    key={relation.type}
                    {...getAnimationProps('staggerItem', { delay: index * 0.05 })}
                    onMouseEnter={() => setHoveredType(relation.type)}
                    onMouseLeave={() => setHoveredType(null)}
                    className="relative"
                  >
                    <div data-testid={`${relation.category}-${relation.type}`}>
                      <TypeBadge
                        type={relation.type}
                        size="lg"
                        className={cn(
                          "transition-all duration-200",
                          hoveredType === relation.type && "transform scale-110"
                        )}
                      />
                    </div>
                    
                    {/* Effectiveness multiplier tooltip */}
                    <AnimatePresence>
                      {hoveredType === relation.type && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20"
                        >
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {relation.effectiveness}× damage
                          </div>
                          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Visual effectiveness chart */}
      {!selectedCategory && (
        <GlassContainer variant="dark" className="p-6">
          <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 text-center">
            Click a category above to see type matchups
          </h4>
          
          {/* Quick summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl mb-1">
                <FaCircle className="text-red-500 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {groupedRelations.weakness.filter(r => r.effectiveness >= 4).length} double weaknesses
              </div>
            </div>
            <div>
              <div className="text-3xl mb-1">
                <FaCircle className="text-green-500 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {groupedRelations.resistance.filter(r => r.effectiveness <= 0.25).length} double resistances
              </div>
            </div>
            <div>
              <div className="text-3xl mb-1">
                <FaCircle className="text-gray-400 mx-auto" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {groupedRelations.normal.length} normal damage
              </div>
            </div>
          </div>
        </GlassContainer>
      )}
    </div>
  );
};

export default memo(TypeEffectivenessWheel);