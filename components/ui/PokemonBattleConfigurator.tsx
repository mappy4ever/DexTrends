import React from 'react';
import { TypeBadge } from './TypeBadge';

// Type definitions
interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

interface Nature {
  name: string;
  increased_stat?: {
    name: string;
  };
  decreased_stat?: {
    name: string;
  };
}

interface PokemonConfig {
  name: string;
  level: number;
  nature: string;
  ivs: PokemonStats;
  evs: PokemonStats;
  stats: PokemonStats;
  manualStats: boolean;
}

interface Pokemon {
  id: number;
  name: string;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

interface PokemonBattleConfiguratorProps {
  playerNumber: number;
  playerName: string;
  editingPlayer: boolean;
  setEditingPlayer: (editing: boolean) => void;
  selectedPokemon: Pokemon | null;
  pokemonConfig: PokemonConfig;
  setPokemonConfig: React.Dispatch<React.SetStateAction<PokemonConfig>>;
  allNatures: Nature[];
  showIVsEVs: boolean;
  setShowIVsEVs: (show: boolean) => void;
  setShowPokemonSelector: (show: boolean) => void;
  calculateAllStats: (pokemon: Pokemon, config: PokemonConfig) => PokemonStats;
  playerColor?: 'blue' | 'red';
}

interface ColorClasses {
  gradient: string;
  bg: string;
  border: string;
  text: string;
  hover: string;
  focus: string;
}

// Reusable Pokemon Battle Configuration Component
export const PokemonBattleConfigurator: React.FC<PokemonBattleConfiguratorProps> = ({
  playerNumber,
  playerName,
  editingPlayer,
  setEditingPlayer,
  selectedPokemon,
  pokemonConfig,
  setPokemonConfig,
  allNatures,
  showIVsEVs,
  setShowIVsEVs,
  setShowPokemonSelector,
  calculateAllStats,
  playerColor = 'blue'
}) => {
  const colorClasses: Record<'blue' | 'red', ColorClasses> = {
    blue: {
      gradient: 'from-amber-400 to-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      hover: 'hover:bg-amber-100',
      focus: 'focus:border-amber-400 focus:ring-amber-100'
    },
    red: {
      gradient: 'from-red-400 to-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      hover: 'hover:bg-red-100',
      focus: 'focus:border-red-400 focus:ring-red-100'
    }
  };

  const colors = colorClasses[playerColor];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Player Name Editor */}
      <div className="text-center mb-4">
        {editingPlayer ? (
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPokemonConfig(prev => ({ ...prev, name: e.target.value }))}
            onBlur={() => setEditingPlayer(false)}
            onKeyPress={(e) => e.key === 'Enter' && setEditingPlayer(false)}
            className={`text-xl font-bold text-center bg-transparent border-b-2 border-amber-600 text-amber-700 mb-4 outline-none focus:border-amber-700`}
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 
              className={`text-xl font-bold text-amber-700 cursor-pointer hover:text-amber-800`}
              onClick={() => setEditingPlayer(true)}
            >
              {playerName}
            </h3>
            <button
              onClick={() => setEditingPlayer(true)}
              className={`text-amber-600 hover:text-amber-800 transition-colors`}
              title="Edit name"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Level Slider */}
      <div className={`${colors.bg} rounded-xl p-3 mb-3`}>
        <label className={`block font-semibold ${colors.text} mb-2 text-sm`}>
          Level: {pokemonConfig.level}
        </label>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="100"
            value={pokemonConfig.level}
            onChange={(e) => setPokemonConfig(prev => ({ ...prev, level: parseInt(e.target.value) }))}
            className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #b45309 0%, #b45309 ${(pokemonConfig.level - 1) / 99 * 100}%, #e5e7eb ${(pokemonConfig.level - 1) / 99 * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>

      {/* Nature Selection */}
      <div className={`${colors.bg} rounded-xl p-3 mb-3`}>
        <label className={`block font-semibold ${colors.text} mb-2 text-sm`}>Nature</label>
        <div className="relative">
          <div className={`bg-white ${colors.border} border-2 rounded-lg p-3 cursor-pointer hover:${colors.border.replace('border-', 'border-')} transition-all`}
               onClick={() => document.getElementById(`nature-select-${playerNumber}`)?.classList.toggle('hidden')}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`font-bold ${colors.text} text-lg capitalize`}>
                  {pokemonConfig.nature}
                </div>
                {(() => {
                  const nature = allNatures.find(n => n.name === pokemonConfig.nature);
                  if (nature?.increased_stat && nature?.decreased_stat) {
                    return (
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          +{nature.increased_stat.name.replace('special-', 'Sp.')}
                        </span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                          -{nature.decreased_stat.name.replace('special-', 'Sp.')}
                        </span>
                      </div>
                    );
                  }
                  return <span className="text-xs text-stone-500 dark:text-stone-400">No stat changes</span>;
                })()}
              </div>
              <svg className={`w-5 h-5 text-amber-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div id={`nature-select-${playerNumber}`} className={`hidden absolute top-full left-0 right-0 mt-1 bg-white ${colors.border} border-2 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto`}>
            {allNatures.map(nature => (
              <button
                key={nature.name}
                onClick={() => {
                  setPokemonConfig(prev => ({ ...prev, nature: nature.name }));
                  document.getElementById(`nature-select-${playerNumber}`)?.classList.add('hidden');
                }}
                className={`w-full px-3 py-2 text-left hover:${colors.bg} transition-colors border-b border-stone-200 last:border-b-0`}
              >
                <div className="font-medium capitalize">{nature.name}</div>
                {nature.increased_stat && nature.decreased_stat ? (
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs text-green-600">+{nature.increased_stat.name.replace('special-', 'Sp.')}</span>
                    <span className="text-xs text-red-600">-{nature.decreased_stat.name.replace('special-', 'Sp.')}</span>
                  </div>
                ) : (
                  <span className="text-xs text-stone-500 dark:text-stone-400">Neutral</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* IVs/EVs Collapsible Section */}
      <div className={`${colors.bg} rounded-xl shadow-md mb-3`}>
        <button
          onClick={() => setShowIVsEVs(!showIVsEVs)}
          className={`w-full px-4 py-3 flex items-center justify-between text-left hover:${colors.hover} rounded-xl transition-all`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${colors.text}`}>IVs & EVs Configuration</span>
            <span className={`text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full`}>
              Advanced
            </span>
          </div>
          <div className={`transform transition-transform duration-300 ${showIVsEVs ? 'rotate-180' : ''}`}>
            <svg className={`w-5 h-5 text-amber-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {showIVsEVs && (
          <div className="px-4 pb-4 space-y-4 animate-fadeIn">
            {/* Quick Actions */}
            <div>
              <p className={`text-xs font-medium text-amber-700 mb-2`}>Quick Actions:</p>
              <div className="grid grid-cols-1 gap-1 mb-2">
                <button
                  onClick={() => {
                    setPokemonConfig(prev => {
                      const newConfig = {
                        ...prev,
                        ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 }
                      };
                      if (!newConfig.manualStats && selectedPokemon) {
                        newConfig.stats = calculateAllStats(selectedPokemon, newConfig);
                      }
                      return newConfig;
                    });
                  }}
                  className="px-2 py-1 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200 transition-colors"
                >
                  Max IVs
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => setPokemonConfig(prev => ({
                    ...prev,
                    evs: { hp: 0, attack: 252, defense: 0, specialAttack: 0, specialDefense: 4, speed: 252 }
                  }))}
                  className="px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-100 transition-colors"
                >
                  Physical Sweeper
                </button>
                <button
                  onClick={() => setPokemonConfig(prev => ({
                    ...prev,
                    evs: { hp: 0, attack: 0, defense: 0, specialAttack: 252, specialDefense: 4, speed: 252 }
                  }))}
                  className="px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-100 transition-colors"
                >
                  Special Sweeper
                </button>
                <button
                  onClick={() => setPokemonConfig(prev => ({
                    ...prev,
                    evs: { hp: 252, attack: 0, defense: 252, specialAttack: 0, specialDefense: 4, speed: 0 }
                  }))}
                  className="px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-100 transition-colors"
                >
                  Physical Tank
                </button>
                <button
                  onClick={() => setPokemonConfig(prev => ({
                    ...prev,
                    evs: { hp: 252, attack: 0, defense: 4, specialAttack: 0, specialDefense: 252, speed: 0 }
                  }))}
                  className="px-2 py-1 bg-white border border-amber-300 rounded text-xs hover:bg-amber-100 transition-colors"
                >
                  Special Tank
                </button>
              </div>
            </div>

            {/* IVs and EVs Side by Side */}
            <IVEVConfigurator
              pokemonConfig={pokemonConfig}
              setPokemonConfig={setPokemonConfig}
              selectedPokemon={selectedPokemon}
              calculateAllStats={calculateAllStats}
            />
            
            <div className={`mt-2 text-xs text-center font-semibold ${
              Object.values(pokemonConfig.evs).reduce((sum, ev) => sum + ev, 0) > 510 
                ? 'text-red-600' 
                : 'text-orange-700'
            }`}>
              Total EVs: {Object.values(pokemonConfig.evs).reduce((sum, ev) => sum + ev, 0)}/510
              {Object.values(pokemonConfig.evs).reduce((sum, ev) => sum + ev, 0) > 510 && 
                <span className="block text-red-600">⚠️ Over limit!</span>
              }
            </div>
            
            {!pokemonConfig.manualStats && (
              <button
                onClick={() => {
                  if (selectedPokemon) {
                    const newStats = calculateAllStats(selectedPokemon, pokemonConfig);
                    setPokemonConfig(prev => ({ ...prev, stats: newStats }));
                  }
                }}
                className={`w-full mt-2 px-3 py-1 bg-gradient-to-r ${colors.gradient} text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all transform hover:scale-105`}
              >
                Recalculate Stats
              </button>
            )}
          </div>
        )}
      </div>

      {/* Battle Stats */}
      <BattleStatsDisplay
        pokemonConfig={pokemonConfig}
        setPokemonConfig={setPokemonConfig}
        playerColor="blue"
      />
    </div>
  );
};

// Reusable IV/EV Configuration Component
interface IVEVConfiguratorProps {
  pokemonConfig: PokemonConfig;
  setPokemonConfig: React.Dispatch<React.SetStateAction<PokemonConfig>>;
  selectedPokemon: Pokemon | null;
  calculateAllStats: (pokemon: Pokemon, config: PokemonConfig) => PokemonStats;
}

const IVEVConfigurator: React.FC<IVEVConfiguratorProps> = ({ 
  pokemonConfig, 
  setPokemonConfig, 
  selectedPokemon, 
  calculateAllStats 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* IVs Section */}
      <div>
        <label className="block font-semibold text-amber-900 mb-2 text-xs text-center">IVs (0-31)</label>
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(pokemonConfig.ivs) as [keyof PokemonStats, number][]).map(([stat, value]) => (
            <div key={stat} className="bg-white rounded-lg p-1.5 border border-amber-200">
              <label className="text-xs font-medium text-amber-700 capitalize block mb-1 text-center">
                {stat.replace('special', 'Sp.')}
              </label>
              <input
                type="number"
                min="0"
                max="31"
                value={value}
                onChange={(e) => {
                  setPokemonConfig(prev => {
                    const newConfig = {
                      ...prev,
                      ivs: { ...prev.ivs, [stat]: Math.min(31, Math.max(0, parseInt(e.target.value) || 0)) }
                    };
                    if (!newConfig.manualStats && selectedPokemon) {
                      newConfig.stats = calculateAllStats(selectedPokemon, newConfig);
                    }
                    return newConfig;
                  });
                }}
                className="w-full px-1 py-1 border border-amber-200 rounded text-xs text-center font-bold focus:border-amber-400 focus:ring-1 focus:ring-amber-100"
              />
              <div className="mt-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(value / 31) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setPokemonConfig(prev => {
              const newConfig = {
                ...prev,
                ivs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
              };
              if (!newConfig.manualStats && selectedPokemon) {
                newConfig.stats = calculateAllStats(selectedPokemon, newConfig);
              }
              return newConfig;
            });
          }}
          className="w-full mt-2 px-2 py-1 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200 transition-colors"
        >
          Reset IVs
        </button>
      </div>

      {/* EVs Section */}
      <div>
        <label className="block font-semibold text-amber-900 mb-2 text-xs text-center">EVs (0-252)</label>
        <div className="grid grid-cols-2 gap-1">
          {(Object.entries(pokemonConfig.evs) as [keyof PokemonStats, number][]).map(([stat, value]) => (
            <div key={stat} className="bg-white rounded-lg p-1.5 border border-orange-200">
              <label className="text-xs font-medium text-orange-700 capitalize block mb-1 text-center">
                {stat.replace('special', 'Sp.')} <span className="text-orange-600 font-bold">+{Math.floor(value / 4)}</span>
              </label>
              <input
                type="number"
                min="0"
                max="252"
                value={value}
                onChange={(e) => {
                  setPokemonConfig(prev => {
                    const newConfig = {
                      ...prev,
                      evs: { ...prev.evs, [stat]: Math.min(252, parseInt(e.target.value) || 0) }
                    };
                    if (!newConfig.manualStats && selectedPokemon) {
                      newConfig.stats = calculateAllStats(selectedPokemon, newConfig);
                    }
                    return newConfig;
                  });
                }}
                className="w-full px-1 py-1 border border-orange-200 rounded text-xs text-center font-bold focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
              />
              <div className="mt-1 h-1 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
                  style={{ width: `${(value / 252) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setPokemonConfig(prev => {
              const newConfig = {
                ...prev,
                evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 }
              };
              if (!newConfig.manualStats && selectedPokemon) {
                newConfig.stats = calculateAllStats(selectedPokemon, newConfig);
              }
              return newConfig;
            });
          }}
          className="w-full mt-2 px-2 py-1 bg-stone-100 border border-stone-300 rounded text-xs hover:bg-stone-200 transition-colors"
        >
          Reset EVs
        </button>
      </div>
    </div>
  );
};

// Reusable Battle Stats Display Component  
interface BattleStatsDisplayProps {
  pokemonConfig: PokemonConfig;
  setPokemonConfig: React.Dispatch<React.SetStateAction<PokemonConfig>>;
  playerColor?: 'blue' | 'red';
}

const BattleStatsDisplay: React.FC<BattleStatsDisplayProps> = ({ 
  pokemonConfig, 
  setPokemonConfig, 
  playerColor = 'blue' 
}) => {
  return (
    <div className={`bg-gradient-to-br from-amber-50 to-amber-50 rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <label className={`block font-semibold text-amber-900 text-sm`}>Battle Stats</label>
        <button
          onClick={() => setPokemonConfig(prev => ({ ...prev, manualStats: !prev.manualStats }))}
          className={`text-amber-600 hover:text-amber-800 transition-colors`}
          title={pokemonConfig.manualStats ? "Switch to auto calculate" : "Manual edit stats"}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      <div className="space-y-2">
        {(Object.entries(pokemonConfig.stats) as [keyof PokemonStats, number][]).map(([stat, value]) => {
          const maxStat = stat === 'hp' ? 714 : 658;
          const percentage = (value / maxStat) * 100;
          
          let barColor = 'bg-red-400';
          if (value >= 150) barColor = 'bg-green-600';
          else if (value >= 120) barColor = 'bg-green-500';
          else if (value >= 100) barColor = 'bg-green-400';
          else if (value >= 80) barColor = 'bg-yellow-400';
          else if (value >= 60) barColor = 'bg-yellow-500';
          else if (value >= 40) barColor = 'bg-orange-400';
          else if (value >= 20) barColor = 'bg-red-500';
          
          return (
            <div key={stat} className="bg-white rounded-lg p-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-stone-700 capitalize">
                  {stat.replace('special', 'Sp.')}
                </label>
                <div className="flex items-center gap-2">
                  {pokemonConfig.manualStats ? (
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setPokemonConfig(prev => ({
                        ...prev,
                        stats: { ...prev.stats, [stat]: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-16 px-1 py-0.5 border border-stone-300 rounded text-xs text-center"
                    />
                  ) : (
                    <span className="text-sm font-bold text-stone-800">{value}</span>
                  )}
                </div>
              </div>
              <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className={`${barColor} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};