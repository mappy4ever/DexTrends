import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeBadge } from '../ui/TypeBadge';
import { CircularButton } from '../ui/design-system';
import hapticFeedback from '../../utils/hapticFeedback';
import { simulateBattleToCompletion } from '../../utils/battle/simulation';
import type { Pokemon, PokemonMove } from '../../types/pokemon';
import type { BattleResult } from '../../types/battle';
import logger from '../../utils/logger';

interface MobileBattleSimulatorProps {
  initialPokemon1?: Pokemon | null;
  initialPokemon2?: Pokemon | null;
}

// Step-by-step wizard stages
type WizardStep = 'select-p1' | 'select-p2' | 'setup-p1' | 'setup-p2' | 'battle' | 'results';

const MobileBattleSimulator: React.FC<MobileBattleSimulatorProps> = ({
  initialPokemon1,
  initialPokemon2
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select-p1');
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(initialPokemon1 || null);
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(initialPokemon2 || null);
  const [selectedMoves1, setSelectedMoves1] = useState<PokemonMove[]>([]);
  const [selectedMoves2, setSelectedMoves2] = useState<PokemonMove[]>([]);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Progress indicator
  const stepIndex = {
    'select-p1': 0,
    'select-p2': 1,
    'setup-p1': 2,
    'setup-p2': 3,
    'battle': 4,
    'results': 5
  };

  const progress = ((stepIndex[currentStep] + 1) / 6) * 100;

  // Handle step navigation
  const handleNextStep = useCallback(() => {
    hapticFeedback.light();
    
    switch (currentStep) {
      case 'select-p1':
        if (pokemon1) setCurrentStep('select-p2');
        break;
      case 'select-p2':
        if (pokemon2) setCurrentStep('setup-p1');
        break;
      case 'setup-p1':
        if (selectedMoves1.length > 0) setCurrentStep('setup-p2');
        break;
      case 'setup-p2':
        if (selectedMoves2.length > 0) setCurrentStep('battle');
        break;
      case 'battle':
        handleSimulateBattle();
        break;
    }
  }, [currentStep, pokemon1, pokemon2, selectedMoves1, selectedMoves2]);

  const handlePreviousStep = useCallback(() => {
    hapticFeedback.light();
    
    switch (currentStep) {
      case 'select-p2':
        setCurrentStep('select-p1');
        break;
      case 'setup-p1':
        setCurrentStep('select-p2');
        break;
      case 'setup-p2':
        setCurrentStep('setup-p1');
        break;
      case 'battle':
        setCurrentStep('setup-p2');
        break;
      case 'results':
        setCurrentStep('battle');
        break;
    }
  }, [currentStep]);

  // Simulate battle
  const handleSimulateBattle = useCallback(async () => {
    if (!pokemon1 || !pokemon2 || selectedMoves1.length === 0 || selectedMoves2.length === 0) {
      return;
    }

    setIsSimulating(true);
    hapticFeedback.medium();

    try {
      // Create battle configs
      const config1 = {
        level: 50,
        stats: {
          hp: pokemon1.stats?.find(s => s.stat.name === 'hp')?.base_stat || 100,
          attack: pokemon1.stats?.find(s => s.stat.name === 'attack')?.base_stat || 100,
          defense: pokemon1.stats?.find(s => s.stat.name === 'defense')?.base_stat || 100,
          specialAttack: pokemon1.stats?.find(s => s.stat.name === 'special-attack')?.base_stat || 100,
          specialDefense: pokemon1.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 100,
          speed: pokemon1.stats?.find(s => s.stat.name === 'speed')?.base_stat || 100
        }
      };
      
      const config2 = {
        level: 50,
        stats: {
          hp: pokemon2.stats?.find(s => s.stat.name === 'hp')?.base_stat || 100,
          attack: pokemon2.stats?.find(s => s.stat.name === 'attack')?.base_stat || 100,
          defense: pokemon2.stats?.find(s => s.stat.name === 'defense')?.base_stat || 100,
          specialAttack: pokemon2.stats?.find(s => s.stat.name === 'special-attack')?.base_stat || 100,
          specialDefense: pokemon2.stats?.find(s => s.stat.name === 'special-defense')?.base_stat || 100,
          speed: pokemon2.stats?.find(s => s.stat.name === 'speed')?.base_stat || 100
        }
      };
      

      const result = await simulateBattleToCompletion(
        pokemon1,
        pokemon2,
        config1,
        config2,
        selectedMoves1,
        selectedMoves2,
        async () => null // Simple move loader for now
      );
      setBattleResult(result);
      setCurrentStep('results');
    } catch (error) {
      logger.error('Battle simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  }, [pokemon1, pokemon2, selectedMoves1, selectedMoves2]);

  // Reset battle
  const handleReset = useCallback(() => {
    hapticFeedback.medium();
    setPokemon1(null);
    setPokemon2(null);
    setSelectedMoves1([]);
    setSelectedMoves2([]);
    setBattleResult(null);
    setCurrentStep('select-p1');
  }, []);

  // Pokemon selection card
  const PokemonSelectionCard = ({ pokemon, onSelect, label }: {
    pokemon: Pokemon | null;
    onSelect: () => void;
    label: string;
  }) => (
    <motion.div
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      {pokemon ? (
        <div className="flex items-center space-x-3">
          <div className="relative w-20 h-20">
            <Image
              src={pokemon.sprites?.front_default || '/images/placeholder-pokemon.png'}
              alt={pokemon.name}
              fill
              className="object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-bold capitalize text-lg">{pokemon.name}</h3>
            <div className="flex gap-1 mt-1">
              {pokemon.types?.map(type => (
                <TypeBadge key={type.type.name} type={type.type.name} size="sm" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto bg-white/10 rounded-full mb-3" />
          <p className="text-white/60">{label}</p>
        </div>
      )}
    </motion.div>
  );

  // Move selection card
  const MoveSelectionCard = ({ move, isSelected, onToggle }: {
    move: PokemonMove;
    isSelected: boolean;
    onToggle: () => void;
  }) => (
    <motion.div
      className={`p-3 rounded-lg border-2 transition-colors ${
        isSelected 
          ? 'bg-blue-500/20 border-blue-500' 
          : 'bg-white/5 border-white/20'
      }`}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium capitalize">{move.move.name.replace('-', ' ')}</span>
        {isSelected && (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="mobile-battle-simulator min-h-screen pb-20">
      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-900 to-gray-900/95 backdrop-blur-sm">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Step Title */}
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {currentStep === 'select-p1' && 'Choose Your Pokemon'}
            {currentStep === 'select-p2' && 'Choose Opponent'}
            {currentStep === 'setup-p1' && 'Select Your Moves'}
            {currentStep === 'setup-p2' && 'Select Opponent Moves'}
            {currentStep === 'battle' && 'Ready to Battle!'}
            {currentStep === 'results' && 'Battle Results'}
          </h2>
          {currentStep !== 'select-p1' && (
            <CircularButton
              onClick={handlePreviousStep}
              variant="secondary"
              size="sm"
            >
              Back
            </CircularButton>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Pokemon Selection Steps */}
          {(currentStep === 'select-p1' || currentStep === 'select-p2') && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <PokemonSelectionCard
                pokemon={currentStep === 'select-p1' ? pokemon1 : pokemon2}
                onSelect={() => {}}
                label={currentStep === 'select-p1' ? 'Tap to select your Pokemon' : 'Tap to select opponent'}
              />
              
              {/* Quick Popular Pokemon */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white/60">Popular Choices</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['pikachu', 'charizard', 'mewtwo', 'lucario', 'garchomp', 'gengar'].map(name => (
                    <motion.button
                      key={name}
                      className="py-2 px-3 bg-white/10 rounded-lg text-sm capitalize"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Would fetch and set Pokemon here
                        hapticFeedback.light();
                      }}
                    >
                      {name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Move Selection Steps */}
          {(currentStep === 'setup-p1' || currentStep === 'setup-p2') && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-4">
                <p className="text-white/60">Select up to 4 moves</p>
                <p className="text-2xl font-bold mt-1">
                  {currentStep === 'setup-p1' ? selectedMoves1.length : selectedMoves2.length}/4
                </p>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(currentStep === 'setup-p1' ? pokemon1?.moves : pokemon2?.moves)?.slice(0, 20).map(move => (
                  <MoveSelectionCard
                    key={move.move.name}
                    move={move}
                    isSelected={
                      currentStep === 'setup-p1'
                        ? selectedMoves1.some(m => m.move.name === move.move.name)
                        : selectedMoves2.some(m => m.move.name === move.move.name)
                    }
                    onToggle={() => {
                      hapticFeedback.light();
                      if (currentStep === 'setup-p1') {
                        setSelectedMoves1(prev => {
                          const exists = prev.some(m => m.move.name === move.move.name);
                          if (exists) {
                            return prev.filter(m => m.move.name !== move.move.name);
                          }
                          return prev.length < 4 ? [...prev, move] : prev;
                        });
                      } else {
                        setSelectedMoves2(prev => {
                          const exists = prev.some(m => m.move.name === move.move.name);
                          if (exists) {
                            return prev.filter(m => m.move.name !== move.move.name);
                          }
                          return prev.length < 4 ? [...prev, move] : prev;
                        });
                      }
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Battle Ready Screen */}
          {currentStep === 'battle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <PokemonSelectionCard
                  pokemon={pokemon1}
                  onSelect={() => {}}
                  label="Your Pokemon"
                />
                <PokemonSelectionCard
                  pokemon={pokemon2}
                  onSelect={() => {}}
                  label="Opponent"
                />
              </div>
              
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-4xl mb-4"
                >
                  ⚔️
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Ready for Battle!</h3>
                <p className="text-white/60 text-sm">Tap the button below to start</p>
              </div>
              
              <CircularButton
                onClick={handleSimulateBattle}
                variant="primary"
                className="w-full"
                disabled={isSimulating}
              >
                {isSimulating ? 'Simulating...' : 'Start Battle!'}
              </CircularButton>
            </motion.div>
          )}

          {/* Results Screen */}
          {currentStep === 'results' && battleResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="text-6xl mb-4"
                >
                  {battleResult.winner === 'player1' ? '🏆' : '💔'}
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">
                  {battleResult.winner === 'player1' ? 'Victory!' : 'Defeat'}
                </h2>
                <p className="text-white/60">
                  {battleResult.winner === 'player1' ? pokemon1?.name : pokemon2?.name} wins!
                </p>
              </div>

              <div className="space-y-4">
                <CircularButton
                  onClick={handleReset}
                  variant="primary"
                  className="w-full"
                >
                  New Battle
                </CircularButton>
                <CircularButton
                  onClick={() => setCurrentStep('battle')}
                  variant="secondary"
                  className="w-full"
                >
                  Rematch
                </CircularButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Button (floating) */}
      {currentStep !== 'results' && currentStep !== 'battle' && (
        <div className="fixed bottom-20 left-4 right-4 z-30">
          <CircularButton
            onClick={handleNextStep}
            variant="primary"
            className="w-full"
            disabled={
              (currentStep === 'select-p1' && !pokemon1) ||
              (currentStep === 'select-p2' && !pokemon2) ||
              (currentStep === 'setup-p1' && selectedMoves1.length === 0) ||
              (currentStep === 'setup-p2' && selectedMoves2.length === 0)
            }
          >
            Continue
          </CircularButton>
        </div>
      )}
    </div>
  );
};

export default MobileBattleSimulator;