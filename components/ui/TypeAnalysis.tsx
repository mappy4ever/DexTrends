import React, { useState } from 'react';
import { TypeBadge } from './TypeBadge';

interface TypeInfo {
  description: string;
  characteristics: string[];
  strategies: string;
}

type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

const TYPE_DESCRIPTIONS: Record<PokemonType, TypeInfo> = {
  normal: {
    description: "The Normal type is the most basic type of Pokémon. They are very common and appear from the very first route you visit.",
    characteristics: ["Balanced stats", "Wide movepool", "No resistances or weaknesses to most types"],
    strategies: "Normal types are versatile with access to many different moves. Use their balanced stats and diverse movesets to adapt to different situations."
  },
  fire: {
    description: "Fire-type Pokémon are known for their hot-blooded and passionate nature. They excel in physical power and special attacks.",
    characteristics: ["High Attack/Special Attack", "Burn status moves", "Resistant to Fire, Grass, Ice, Bug, Steel, Fairy"],
    strategies: "Fire types excel at dealing heavy damage. Use their powerful offensive moves and burn status to wear down opponents."
  },
  water: {
    description: "Water-type Pokémon are among the most diverse, found in oceans, rivers, and lakes. They're known for their adaptability.",
    characteristics: ["Balanced stats", "Wide move variety", "Resistant to Fire, Water, Ice, Steel"],
    strategies: "Water types are reliable and versatile. Use their balance and access to Ice moves to counter multiple types."
  },
  electric: {
    description: "Electric-type Pokémon generate electricity and are often very fast. They can paralyze opponents with their electric attacks.",
    characteristics: ["High Speed", "Paralysis moves", "Resistant to Flying, Steel, Electric"],
    strategies: "Electric types are excellent for speed control. Use their fast moves and paralysis to control the battlefield."
  },
  grass: {
    description: "Grass-type Pokémon are connected to nature and plants. They often have healing abilities and status moves.",
    characteristics: ["Status moves", "Healing abilities", "Resistant to Water, Electric, Grass, Ground"],
    strategies: "Grass types excel at support. Use status moves, healing, and stat boosters to outlast opponents."
  },
  ice: {
    description: "Ice-type Pokémon come from cold climates and can freeze opponents solid. They're excellent against many types but fragile.",
    characteristics: ["High damage potential", "Freeze status", "Weak to many types but strong offensively"],
    strategies: "Ice types are glass cannons. Strike first with powerful Ice moves that are super effective against many types."
  },
  fighting: {
    description: "Fighting-type Pokémon are disciplined martial artists with incredible physical strength and fighting techniques.",
    characteristics: ["Very high Attack", "Close combat moves", "Resistant to Rock, Bug, Dark"],
    strategies: "Fighting types are physical powerhouses. Use their incredible Attack stats and fighting moves to break through defenses."
  },
  poison: {
    description: "Poison-type Pokémon use toxic attacks and can poison opponents. They're often associated with pollution and waste.",
    characteristics: ["Poison status moves", "Good bulk", "Resistant to Fighting, Poison, Bug, Grass, Fairy"],
    strategies: "Poison types excel at attrition. Use poison status and good defensive stats to slowly wear down opponents."
  },
  ground: {
    description: "Ground-type Pokémon are masters of the earth, using earthquake attacks and manipulating the battlefield terrain.",
    characteristics: ["Earthquake moves", "High Attack", "Immune to Electric attacks"],
    strategies: "Ground types control the battlefield. Use powerful Earthquake moves and electric immunity to dominate."
  },
  flying: {
    description: "Flying-type Pokémon soar through the skies and are immune to Ground attacks. They're often paired with other types.",
    characteristics: ["Immune to Ground", "High Speed/mobility", "Often dual-typed"],
    strategies: "Flying types provide excellent utility. Use ground immunity and speed to avoid attacks and strike quickly."
  },
  psychic: {
    description: "Psychic-type Pokémon have incredible mental powers and can manipulate objects with their minds.",
    characteristics: ["High Special Attack", "Mind-based moves", "Resistant to Fighting, Psychic"],
    strategies: "Psychic types are special attackers. Use their high Special Attack and diverse special moves to outmaneuver opponents."
  },
  bug: {
    description: "Bug-type Pokémon are often underestimated but can be surprisingly powerful, especially in swarms.",
    characteristics: ["Fast evolution", "Status moves", "Often paired with other types"],
    strategies: "Bug types are unpredictable. Use their unique moves and stat changes to surprise opponents."
  },
  rock: {
    description: "Rock-type Pokémon are incredibly durable with high Defense stats. They're associated with mountains and caves.",
    characteristics: ["Very high Defense", "Sandstorm weather", "Resistant to Normal, Flying, Poison, Fire"],
    strategies: "Rock types are defensive walls. Use their incredible Defense and weather control to outlast opponents."
  },
  ghost: {
    description: "Ghost-type Pokémon are mysterious spirits that can phase through attacks and use supernatural powers.",
    characteristics: ["Immune to Normal/Fighting", "Unique status moves", "Often high Special Attack"],
    strategies: "Ghost types are tricky and elusive. Use immunities and unique moves to confuse and outplay opponents."
  },
  dragon: {
    description: "Dragon-type Pokémon are legendary creatures with incredible power and majesty. They're rare and formidable.",
    characteristics: ["Very high stats overall", "Powerful Dragon moves", "Often late-game Pokémon"],
    strategies: "Dragon types are powerhouses. Use their incredible overall stats and powerful moves to dominate battles."
  },
  dark: {
    description: "Dark-type Pokémon fight dirty and use underhanded tactics. They're immune to Psychic attacks.",
    characteristics: ["Immune to Psychic", "Dirty fighting moves", "Good mixed stats"],
    strategies: "Dark types are unpredictable fighters. Use psychic immunity and tricky moves to gain advantages."
  },
  steel: {
    description: "Steel-type Pokémon have incredible defensive capabilities and are resistant to many types of attacks.",
    characteristics: ["Incredible resistances", "High Defense", "Immune to Poison"],
    strategies: "Steel types are defensive specialists. Use their many resistances and high Defense to wall opponents."
  },
  fairy: {
    description: "Fairy-type Pokémon are magical creatures that are especially effective against powerful Dragon types.",
    characteristics: ["Immune to Dragon", "Special-oriented", "Often supportive"],
    strategies: "Fairy types are Dragon slayers. Use their unique typing and special moves to counter powerful opponents."
  }
};


interface TypeAnalysisCardProps {
  type: PokemonType;
  onClose: () => void;
}

export const TypeAnalysisCard: React.FC<TypeAnalysisCardProps> = ({ type, onClose }) => {
  const typeInfo = TYPE_DESCRIPTIONS[type];
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'matchups'>('overview');

  if (!typeInfo) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold capitalize">{type} Type</h2>
                <p className="text-purple-100">Detailed analysis and battle guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'overview' as const, label: 'Overview' },
            { key: 'strategy' as const, label: 'Strategy' },
            { key: 'matchups' as const, label: 'Matchups' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{typeInfo.description}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Key Characteristics</h3>
                <ul className="space-y-2">
                  {typeInfo.characteristics.map((char, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-gray-700">{char}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Battle Strategy</h3>
                <p className="text-gray-600 leading-relaxed">{typeInfo.strategies}</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Pro Tips</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Consider team composition when using {type} types</li>
                  <li>• Take advantage of STAB (Same Type Attack Bonus) for 1.5× damage</li>
                  <li>• Watch out for type disadvantages and plan accordingly</li>
                  <li>• Use dual types to cover weaknesses</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'matchups' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Type Matchup Summary</h3>
                <TypeBadge type={type} size="lg" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Strong Against</h4>
                  <p className="text-green-700 text-sm">Types that {type} attacks are super effective against</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Weak Against</h4>
                  <p className="text-red-700 text-sm">Types that {type} struggles against</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DualTypeCalculator: React.FC = () => {
  const [type1, setType1] = useState('');
  const [type2, setType2] = useState('');
  const [showResults, setShowResults] = useState(false);

  const types: PokemonType[] = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        Dual Type Calculator
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Type</label>
          <select
            value={type1}
            onChange={(e) => setType1(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type...</option>
            {types.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Type</label>
          <select
            value={type2}
            onChange={(e) => setType2(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select type...</option>
            {types.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {type1 && type2 && (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TypeBadge type={type1} size="lg" />
            <span className="text-2xl">+</span>
            <TypeBadge type={type2} size="lg" />
          </div>
          <button
            onClick={() => setShowResults(!showResults)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showResults ? 'Hide Results' : 'Calculate Effectiveness'}
          </button>
        </div>
      )}
      
      {showResults && type1 && type2 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Dual Type Analysis</h4>
          <p className="text-gray-600 text-sm">
            This {type1}/{type2} combination creates unique defensive and offensive properties.
            Dual types multiply effectiveness values, creating interesting strategic opportunities.
          </p>
        </div>
      )}
    </div>
  );
};