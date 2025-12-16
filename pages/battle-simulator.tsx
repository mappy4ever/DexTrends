/**
 * Pokemon Battle Simulator Page
 *
 * Clean, user-friendly battle simulator with step-by-step flow:
 * 1. Setup Phase - Select Pokemon and moves
 * 2. Battle Phase - Turn-based combat
 * 3. Results - Winner display and history
 */

import React, { useState, useCallback } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRotateCcw, FiList } from 'react-icons/fi';

// Components
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/BreadcrumbNavigation';
import Modal from '@/components/ui/Modal';
import FullBleedWrapper from '@/components/ui/FullBleedWrapper';
import PageErrorBoundary from '@/components/ui/PageErrorBoundary';
import { EnhancedPokemonSelector, type Pokemon as SelectorPokemon } from '@/components/ui/EnhancedPokemonSelector';
import { VictoryCelebration } from '@/components/ui/BattleEffects';

// Battle components
import { BattleSetup, BattleArena, BattleLog } from '@/components/battle';

// Hook
import { useBattleSimulator } from '@/hooks/useBattleSimulator';

// Types
import type { PokemonMove } from '@/types/pokemon';

// Utils
import { cn } from '@/utils/cn';

type BattlePhase = 'setup' | 'battle' | 'ended';

const BattleSimulator: NextPage = () => {
  const battle = useBattleSimulator();

  // UI State
  const [showPokemonSelector, setShowPokemonSelector] = useState<1 | 2 | null>(null);
  const [showBattleLog, setShowBattleLog] = useState(false);

  // Determine current phase
  const getBattlePhase = (): BattlePhase => {
    if (battle.winner !== null) return 'ended';
    if (battle.battleActive) return 'battle';
    return 'setup';
  };
  const phase = getBattlePhase();

  // Handle Pokemon selection
  const handlePokemonSelect = useCallback((pokemon: SelectorPokemon) => {
    if (showPokemonSelector) {
      battle.selectPokemon(pokemon, showPokemonSelector);
      setShowPokemonSelector(null);
    }
  }, [showPokemonSelector, battle]);

  // Handle move toggle (for setup phase)
  const handleToggleMove = useCallback((player: 1 | 2, move: PokemonMove) => {
    const config = player === 1 ? battle.pokemon1Config : battle.pokemon2Config;
    const setConfig = player === 1 ? battle.setPokemon1Config : battle.setPokemon2Config;
    const isSelected = config.selectedMoves.some(m => m.move.name === move.move.name);

    if (isSelected) {
      setConfig(prev => ({
        ...prev,
        selectedMoves: prev.selectedMoves.filter(m => m.move.name !== move.move.name)
      }));
    } else if (config.selectedMoves.length < 4) {
      setConfig(prev => ({
        ...prev,
        selectedMoves: [...prev.selectedMoves, move]
      }));
    }
  }, [battle]);

  // Handle start battle
  const handleStartBattle = useCallback(() => {
    // Auto-select moves if not selected
    if (battle.pokemon1Config.selectedMoves.length === 0 && battle.selectedPokemon1) {
      battle.selectBestMoves(battle.selectedPokemon1, battle.pokemon1Config, 1);
    }
    if (battle.pokemon2Config.selectedMoves.length === 0 && battle.selectedPokemon2) {
      battle.selectBestMoves(battle.selectedPokemon2, battle.pokemon2Config, 2);
    }
    battle.startBattle();
  }, [battle]);

  // Handle simulate (quick battle)
  const handleSimulateBattle = useCallback(() => {
    // Auto-select moves if not selected
    if (battle.pokemon1Config.selectedMoves.length === 0 && battle.selectedPokemon1) {
      battle.selectBestMoves(battle.selectedPokemon1, battle.pokemon1Config, 1);
    }
    if (battle.pokemon2Config.selectedMoves.length === 0 && battle.selectedPokemon2) {
      battle.selectBestMoves(battle.selectedPokemon2, battle.pokemon2Config, 2);
    }
    // Start and immediately fast-forward
    battle.startBattle();
    setTimeout(() => battle.fastForwardBattle(), 100);
  }, [battle]);

  // Handle reset/play again
  const handlePlayAgain = useCallback(() => {
    battle.resetBattle();
    battle.setShowVictoryScreen(false);
  }, [battle]);

  return (
    <PageErrorBoundary>
      <Head>
        <title>Pokemon Battle Simulator | DexTrends</title>
        <meta name="description" content="Simulate Pokemon battles with accurate damage calculations and type matchups." />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <PageHeader
            title="Battle Simulator"
            description="Simulate Pokemon battles with type advantages and damage calculations"
          />

          {/* Phase: Setup */}
          <AnimatePresence mode="wait">
            {phase === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BattleSetup
                  pokemon1={battle.selectedPokemon1}
                  config1={battle.pokemon1Config}
                  availableMoves1={battle.availableMoves1}
                  pokemon2={battle.selectedPokemon2}
                  config2={battle.pokemon2Config}
                  availableMoves2={battle.availableMoves2}
                  movesData={battle.movesData}
                  onSelectPokemon={(player) => setShowPokemonSelector(player)}
                  onRandomPokemon={(player) => battle.selectRandomPokemon(player)}
                  onToggleMove={handleToggleMove}
                  onAutoSelectMoves={(player) => {
                    const pokemon = player === 1 ? battle.selectedPokemon1 : battle.selectedPokemon2;
                    const config = player === 1 ? battle.pokemon1Config : battle.pokemon2Config;
                    if (pokemon) battle.selectBestMoves(pokemon, config, player);
                  }}
                  onStartBattle={handleStartBattle}
                  onSimulateBattle={handleSimulateBattle}
                  isLoading={battle.loading}
                />
              </motion.div>
            )}

            {/* Phase: Battle */}
            {(phase === 'battle' || phase === 'ended') && battle.selectedPokemon1 && battle.selectedPokemon2 && (
              <motion.div
                key="battle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Container variant="elevated" className="p-6 mb-6">
                  <BattleArena
                    pokemon1={battle.selectedPokemon1}
                    pokemon2={battle.selectedPokemon2}
                    config1={battle.pokemon1Config}
                    config2={battle.pokemon2Config}
                    currentHP1={battle.currentHP1}
                    currentHP2={battle.currentHP2}
                    maxHP1={battle.pokemon1Config.stats.hp}
                    maxHP2={battle.pokemon2Config.stats.hp}
                    player1Name={battle.player1Name}
                    player2Name={battle.player2Name}
                    currentTurn={battle.currentTurn}
                    hitTarget={battle.hitTarget}
                    damageEffect={battle.damageEffect}
                    announcement={battle.announcement}
                    movesData={battle.movesData}
                    isSimulating={battle.isSimulating}
                    onExecuteMove={battle.executeMove}
                    onDamageEffectClear={() => battle.setDamageEffect(null)}
                    onAnnouncementClear={() => battle.setAnnouncement(null)}
                    onFastForward={battle.fastForwardBattle}
                    getTypeEffectiveness={battle.getTypeEffectiveness}
                  />

                  {/* Battle Ended Actions */}
                  {phase === 'ended' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-700"
                    >
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-stone-800 dark:text-white mb-2">
                          Battle Complete!
                        </h3>
                        <p className="text-stone-600 dark:text-stone-400 mb-6">
                          {battle.winner === 1 ? battle.player1Name : battle.player2Name} wins with{' '}
                          <span className="font-semibold capitalize">
                            {battle.winner === 1 ? battle.selectedPokemon1.name : battle.selectedPokemon2.name}
                          </span>
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                          <button
                            onClick={handlePlayAgain}
                            className={cn(
                              'px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-200',
                              'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                              'hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:scale-105'
                            )}
                          >
                            <FiRotateCcw className="inline w-5 h-5 mr-2" />
                            Play Again
                          </button>

                          <button
                            onClick={() => setShowBattleLog(true)}
                            className={cn(
                              'px-6 py-3 font-medium rounded-xl border-2 transition-all',
                              'border-stone-300 dark:border-stone-600',
                              'text-stone-700 dark:text-stone-200',
                              'hover:bg-stone-100 dark:hover:bg-stone-800'
                            )}
                          >
                            <FiList className="inline w-5 h-5 mr-2" />
                            View Battle Log
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Container>

                {/* Inline Battle Log (during battle) */}
                {phase === 'battle' && battle.battleLog.length > 0 && (
                  <BattleLog logs={battle.battleLog} className="mb-6" maxHeight="200px" />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Battle History */}
          {battle.battleHistory.length > 0 && (
            <Container variant="default" className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-stone-700 dark:text-stone-200">
                Recent Battles
              </h3>
              <div className="space-y-2">
                {battle.battleHistory.slice(-5).reverse().map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <div>
                        <span className="font-semibold text-stone-700 dark:text-stone-200 capitalize">
                          {result.winnerPokemon}
                        </span>
                        <span className="text-stone-500 dark:text-stone-400 mx-2">defeated</span>
                        <span className="font-semibold text-stone-700 dark:text-stone-200 capitalize">
                          {result.loserPokemon}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {result.turns} turns
                    </span>
                  </div>
                ))}
              </div>
            </Container>
          )}
        </div>
      </FullBleedWrapper>

      {/* Victory Screen Overlay */}
      <AnimatePresence>
        {battle.showVictoryScreen && battle.winner && (
          <VictoryCelebration
            winner={battle.winner === 1 ? battle.player1Name : battle.player2Name}
            pokemonName={battle.winner === 1 ? battle.selectedPokemon1?.name || '' : battle.selectedPokemon2?.name || ''}
            onClose={() => battle.setShowVictoryScreen(false)}
          />
        )}
      </AnimatePresence>

      {/* Pokemon Selector Modal */}
      <Modal
        isOpen={showPokemonSelector !== null}
        onClose={() => setShowPokemonSelector(null)}
        title={`Select Pokemon for Player ${showPokemonSelector}`}
      >
        <div className="p-4">
          <EnhancedPokemonSelector
            isOpen={true}
            onClose={() => setShowPokemonSelector(null)}
            onSelect={handlePokemonSelect}
            pokemonList={battle.pokemonList}
            loading={battle.loading}
            playerNumber={showPokemonSelector}
          />
        </div>
      </Modal>

      {/* Battle Log Modal */}
      <Modal
        isOpen={showBattleLog}
        onClose={() => setShowBattleLog(false)}
        title="Battle Log"
      >
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {battle.battleLog.length > 0 ? (
            <div className="space-y-2">
              {battle.battleLog.map((log, index) => (
                <div
                  key={index}
                  className="p-2 bg-stone-50 dark:bg-stone-800 rounded text-sm text-stone-700 dark:text-stone-300"
                >
                  {typeof log === 'string' ? log : log.action}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-500 dark:text-stone-400">
              No battle log yet
            </p>
          )}
        </div>
      </Modal>
    </PageErrorBoundary>
  );
};

// Mark as fullBleed for FullBleedWrapper
(BattleSimulator as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default BattleSimulator;
