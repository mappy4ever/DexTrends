import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { fetchData } from '../utils/apiutils';
import { TypeBadge } from '../components/ui/TypeBadge';
import { TypeAnalysisCard, DualTypeCalculator } from '../components/ui/TypeAnalysis';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { NextPage } from 'next';

// Type definitions
interface DamageRelations {
  double_damage_from?: Array<{ name: string; url: string }>;
  double_damage_to?: Array<{ name: string; url: string }>;
  half_damage_from?: Array<{ name: string; url: string }>;
  half_damage_to?: Array<{ name: string; url: string }>;
  no_damage_from?: Array<{ name: string; url: string }>;
  no_damage_to?: Array<{ name: string; url: string }>;
}

interface TypeData {
  name: string;
  damageRelations: DamageRelations;
  pokemon: Array<{ pokemon: { name: string; url: string } }>;
  moves: Array<{ name: string; url: string }>;
  generation: { name: string; url: string };
}

interface EffectivenessStyle {
  text: string;
  color: string;
  bg: string;
  symbol: string;
}

type PokemonType = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 
  'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 
  'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

type ViewMode = 'chart' | 'interactive' | 'details' | 'advanced';

const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

const TYPE_ICONS: Record<PokemonType, string> = {
  normal: '⚪',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '👊',
  poison: '☠️',
  ground: '⛰️',
  flying: '🌪️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🗿',
  ghost: '👻',
  dragon: '🐲',
  dark: '🌑',
  steel: '⚙️',
  fairy: '🧚'
};

const EFFECTIVENESS_DESCRIPTIONS: Record<number, EffectivenessStyle> = {
  2: { text: 'Super Effective', color: 'text-green-600', bg: 'bg-green-100', symbol: '★★' },
  0.5: { text: 'Not Very Effective', color: 'text-red-600', bg: 'bg-red-100', symbol: '½' },
  0: { text: 'No Effect', color: 'text-gray-600', bg: 'bg-gray-100', symbol: '✗' },
  1: { text: 'Normal Damage', color: 'text-blue-600', bg: 'bg-blue-100', symbol: '●' }
};

const TypeEffectiveness: NextPage = () => {
  const [typeData, setTypeData] = useState<Record<string, TypeData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAttackType, setSelectedAttackType] = useState<PokemonType | null>(null);
  const [selectedDefendType, setSelectedDefendType] = useState<PokemonType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('chart');
  const [allTypes, setAllTypes] = useState<PokemonType[]>([]);
  const [showTypeAnalysis, setShowTypeAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState<PokemonType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const types: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  useEffect(() => {
    loadTypeData();
  }, []);

  const loadTypeData = async () => {
    setLoading(true);
    const data: Record<string, TypeData> = {};
    
    for (const type of types) {
      try {
        const typeInfo = await fetchData(`https://pokeapi.co/api/v2/type/${type}`);
        data[type] = {
          name: type,
          damageRelations: typeInfo.damage_relations,
          pokemon: typeInfo.pokemon.slice(0, 10), // Get first 10 for examples
          moves: typeInfo.moves.slice(0, 5), // Get first 5 moves
          generation: typeInfo.generation
        };
      } catch (error) {
        console.error(`Failed to load type ${type}:`, error);
      }
    }
    
    setTypeData(data);
    setAllTypes(types);
    setLoading(false);
  };

  const getEffectiveness = (attackType: string, defendType: string): number => {
    if (!typeData[attackType]) return 1;
    
    const relations = typeData[attackType].damageRelations;
    
    // Check for no effect
    if (relations.no_damage_to?.some(t => t.name === defendType)) return 0;
    
    // Check for super effective
    if (relations.double_damage_to?.some(t => t.name === defendType)) return 2;
    
    // Check for not very effective
    if (relations.half_damage_to?.some(t => t.name === defendType)) return 0.5;
    
    return 1;
  };

  const TypeChart = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Type Effectiveness Chart</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-xs font-semibold text-gray-600">ATK \\ DEF</th>
              {types.map(type => (
                <th key={type} className="p-1 text-center">
                  <div className="flex flex-col items-center">
                    <TypeBadge type={type} size="xs" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {types.map(attackType => (
              <tr key={attackType} className="hover:bg-gray-50">
                <td className="p-1 text-center border-r border-gray-200">
                  <TypeBadge type={attackType} size="xs" />
                </td>
                {types.map(defendType => {
                  const effectiveness = getEffectiveness(attackType, defendType);
                  const style = EFFECTIVENESS_DESCRIPTIONS[effectiveness];
                  
                  return (
                    <td key={`${attackType}-${defendType}`} 
                        className={`p-1 text-center text-xs font-bold border border-gray-100 ${style.bg} ${style.color} cursor-pointer hover:scale-110 transition-transform relative group`}
                        onClick={() => {
                          setSelectedAttackType(attackType);
                          setSelectedDefendType(defendType);
                          setViewMode('details');
                        }}
                        title={`${attackType.toUpperCase()} vs ${defendType.toUpperCase()}: ${style.text}`}
                    >
                      {effectiveness === 1 ? '1' : effectiveness === 0 ? '0' : effectiveness}
                      
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        {attackType} → {defendType}: {effectiveness}×
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {Object.entries(EFFECTIVENESS_DESCRIPTIONS).map(([value, style]) => (
          <div key={value} className={`flex items-center gap-2 px-3 py-1 rounded-full ${style.bg}`}>
            <span className={`font-bold ${style.color}`}>{style.symbol}</span>
            <span className={`text-sm ${style.color}`}>{style.text}</span>
            <span className={`text-xs ${style.color}`}>({value}×)</span>
          </div>
        ))}
      </div>
    </div>
  );

  const InteractiveSelector = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Attack Type Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🗡️ Select Attacking Type
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedAttackType(type)}
              onDoubleClick={() => {
                setAnalysisType(type);
                setShowTypeAnalysis(true);
              }}
              className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                selectedAttackType === type 
                  ? 'ring-4 ring-blue-300 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: TYPE_COLORS[type] + '20' }}
              title="Click to select, double-click for detailed analysis"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{TYPE_ICONS[type]}</div>
                <TypeBadge type={type} size="sm" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Defend Type Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🛡️ Select Defending Type
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedDefendType(type)}
              onDoubleClick={() => {
                setAnalysisType(type);
                setShowTypeAnalysis(true);
              }}
              className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                selectedDefendType === type 
                  ? 'ring-4 ring-red-300 shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              style={{ backgroundColor: TYPE_COLORS[type] + '20' }}
              title="Click to select, double-click for detailed analysis"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{TYPE_ICONS[type]}</div>
                <TypeBadge type={type} size="sm" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {selectedAttackType && selectedDefendType && (
        <div className="lg:col-span-2">
          <EffectivenessResult 
            attackType={selectedAttackType} 
            defendType={selectedDefendType}
            effectiveness={getEffectiveness(selectedAttackType, selectedDefendType)}
          />
        </div>
      )}
    </div>
  );

  interface EffectivenessResultProps {
    attackType: PokemonType;
    defendType: PokemonType;
    effectiveness: number;
  }

  const EffectivenessResult: React.FC<EffectivenessResultProps> = ({ attackType, defendType, effectiveness }) => {
    const style = EFFECTIVENESS_DESCRIPTIONS[effectiveness];
    
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg p-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Battle Result</h3>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-4xl mb-2">{TYPE_ICONS[attackType]}</div>
              <TypeBadge type={attackType} size="lg" />
              <p className="text-sm text-gray-600 mt-2">Attacking</p>
            </div>
            
            <div className="text-6xl">⚔️</div>
            
            <div className="text-center">
              <div className="text-4xl mb-2">{TYPE_ICONS[defendType]}</div>
              <TypeBadge type={defendType} size="lg" />
              <p className="text-sm text-gray-600 mt-2">Defending</p>
            </div>
          </div>
          
          <div className={`inline-block px-8 py-4 rounded-2xl ${style.bg} border-2 border-current`}>
            <div className="flex items-center gap-3">
              <span className={`text-3xl ${style.color}`}>{style.symbol}</span>
              <div>
                <p className={`text-xl font-bold ${style.color}`}>{style.text}</p>
                <p className={`text-sm ${style.color} opacity-80`}>{effectiveness}× damage</p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {attackType.charAt(0).toUpperCase() + attackType.slice(1)} Type Info
              </h4>
              <div className="text-sm text-gray-600">
                {typeData[attackType]?.pokemon?.length > 0 && (
                  <p>Example Pokémon: {typeData[attackType].pokemon.slice(0, 3).map(p => p.pokemon.name).join(', ')}</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">
                {defendType.charAt(0).toUpperCase() + defendType.slice(1)} Type Info
              </h4>
              <div className="text-sm text-gray-600">
                {typeData[defendType]?.pokemon?.length > 0 && (
                  <p>Example Pokémon: {typeData[defendType].pokemon.slice(0, 3).map(p => p.pokemon.name).join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TypeDetails = () => {
    if (!selectedAttackType && !selectedDefendType) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Select a Type to View Details</h3>
          <p className="text-gray-600">Choose a type from the chart or interactive mode to see detailed information.</p>
        </div>
      );
    }

    const selectedType = selectedAttackType || selectedDefendType;
    const data = typeData[selectedType!];

    if (!data) return null;

    return (
      <div className="space-y-6">
        {/* Type Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{TYPE_ICONS[selectedType!]}</div>
            <h2 className="text-4xl font-bold mb-2 capitalize">{selectedType} Type</h2>
            <p className="text-purple-100">Complete type analysis and effectiveness guide</p>
          </div>
        </div>

        {/* Effectiveness Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Super Effective Against */}
          <div className="bg-green-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Super Effective Against
            </h3>
            <div className="space-y-2">
              {data.damageRelations.double_damage_to?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-green-700 font-medium">2× damage</span>
                </div>
              )) || <p className="text-green-600 italic">None</p>}
            </div>
          </div>

          {/* Not Very Effective Against */}
          <div className="bg-red-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              Not Very Effective Against
            </h3>
            <div className="space-y-2">
              {data.damageRelations.half_damage_to?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-red-700 font-medium">0.5× damage</span>
                </div>
              )) || <p className="text-red-600 italic">None</p>}
            </div>
          </div>

          {/* No Effect Against */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">❌</span>
              No Effect Against
            </h3>
            <div className="space-y-2">
              {data.damageRelations.no_damage_to?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-gray-700 font-medium">0× damage</span>
                </div>
              )) || <p className="text-gray-600 italic">None</p>}
            </div>
          </div>
        </div>

        {/* Defensive Matchups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weak To */}
          <div className="bg-orange-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">💥</span>
              Weak To
            </h3>
            <div className="space-y-2">
              {data.damageRelations.double_damage_from?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-orange-700 font-medium">Takes 2× damage</span>
                </div>
              )) || <p className="text-orange-600 italic">None</p>}
            </div>
          </div>

          {/* Resists */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🛡️</span>
              Resists
            </h3>
            <div className="space-y-2">
              {data.damageRelations.half_damage_from?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-blue-700 font-medium">Takes 0.5× damage</span>
                </div>
              )) || <p className="text-blue-600 italic">None</p>}
            </div>
          </div>

          {/* Immune To */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚫</span>
              Immune To
            </h3>
            <div className="space-y-2">
              {data.damageRelations.no_damage_from?.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <TypeBadge type={type.name as PokemonType} size="sm" />
                  <span className="text-purple-700 font-medium">Takes 0× damage</span>
                </div>
              )) || <p className="text-purple-600 italic">None</p>}
            </div>
          </div>
        </div>

        {/* Example Pokemon */}
        {data.pokemon?.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Example {selectedType!.charAt(0).toUpperCase() + selectedType!.slice(1)} Type Pokémon
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {data.pokemon.slice(0, 10).map(p => (
                <div key={p.pokemon.name} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="font-medium capitalize text-gray-800">{p.pokemon.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const AdvancedFeatures = () => (
    <div className="space-y-8">
      {/* Dual Type Calculator */}
      <DualTypeCalculator />
      
      {/* Type Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          📊 Type Statistics & Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Most Effective Types */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">🏆 Most Offensive Types</h4>
            <div className="space-y-2">
              {(['fighting', 'rock', 'steel'] as PokemonType[]).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <TypeBadge type={type} size="xs" />
                  <span className="text-sm text-green-700">Strong against many types</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Most Defensive Types */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-3">🛡️ Most Defensive Types</h4>
            <div className="space-y-2">
              {(['steel', 'fire', 'water'] as PokemonType[]).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <TypeBadge type={type} size="xs" />
                  <span className="text-sm text-blue-700">Many resistances</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Balanced Types */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3">⚖️ Balanced Types</h4>
            <div className="space-y-2">
              {(['normal', 'dragon', 'psychic'] as PokemonType[]).map(type => (
                <div key={type} className="flex items-center gap-2">
                  <TypeBadge type={type} size="xs" />
                  <span className="text-sm text-purple-700">Well-rounded</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Type Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          🔍 Quick Type Lookup
        </h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search for a type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {searchQuery && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {types
              .filter(type => type.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setAnalysisType(type);
                    setShowTypeAnalysis(true);
                  }}
                  className="p-2 rounded-lg hover:shadow-md transition-all"
                  style={{ backgroundColor: TYPE_COLORS[type] + '20' }}
                >
                  <div className="text-center">
                    <div className="text-lg">{TYPE_ICONS[type]}</div>
                    <TypeBadge type={type} size="xs" />
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>
      
      {/* Battle Tips */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
          💡 Pro Battle Tips
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-orange-800">Offensive Strategy</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>STAB (Same Type Attack Bonus) gives 1.5× damage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Super effective moves deal 2× damage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Coverage moves hit multiple type weaknesses</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-blue-800">Defensive Strategy</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Resistances reduce damage to 0.5×</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Immunities completely block damage (0×)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Dual types can stack resistances or weaknesses</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading type effectiveness data...</p>
          </div>
        </div>
      </FullBleedWrapper>
    );
  }

  return (
    <>
      <Head>
        <title>Pokémon Type Effectiveness Chart | DexTrends</title>
        <meta name="description" content="Complete Pokémon type effectiveness chart with interactive tools and detailed type analysis." />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-7xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ⚔️ Type Effectiveness Guide
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Master Pokémon battles with our comprehensive type matchup system
            </p>
            
            {/* View Mode Selector */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[
                { key: 'chart' as ViewMode, label: 'Full Chart', icon: '📊' },
                { key: 'interactive' as ViewMode, label: 'Interactive', icon: '🎮' },
                { key: 'details' as ViewMode, label: 'Type Details', icon: '📋' },
                { key: 'advanced' as ViewMode, label: 'Advanced Tools', icon: '🔬' }
              ].map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    viewMode === mode.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-2">{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {viewMode === 'chart' && <TypeChart />}
            {viewMode === 'interactive' && <InteractiveSelector />}
            {viewMode === 'details' && <TypeDetails />}
            {viewMode === 'advanced' && <AdvancedFeatures />}
          </div>
          
          {/* Type Analysis Modal */}
          {showTypeAnalysis && analysisType && (
            <TypeAnalysisCard 
              type={analysisType} 
              onClose={() => {
                setShowTypeAnalysis(false);
                setAnalysisType(null);
              }} 
            />
          )}
        </div>
      </FullBleedWrapper>
    </>
  );
};

// Mark this page as fullBleed to remove default padding
(TypeEffectiveness as any).fullBleed = true;

export default TypeEffectiveness;