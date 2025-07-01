import React from 'react';

// Standalone demo component to showcase the move card design
export default function MoveCardDemo() {
  const sampleMoves = [
    {
      name: 'Mega Punch',
      type: 'NORMAL',
      category: 'PHYSICAL',
      power: 80,
      accuracy: 85,
      pp: 20,
      description: 'Inflicts regular damage with no additional effect.'
    },
    {
      name: 'Ice Punch',
      type: 'ICE',
      category: 'PHYSICAL',
      power: 75,
      accuracy: 100,
      pp: 15,
      description: 'Has a 10% chance to freeze the target.'
    },
    {
      name: 'Body Slam',
      type: 'NORMAL',
      category: 'PHYSICAL',
      power: 85,
      accuracy: 100,
      pp: 15,
      description: 'Has a 30% chance to paralyze the target.'
    },
    {
      name: 'Thunderbolt',
      type: 'ELECTRIC',
      category: 'SPECIAL',
      power: 90,
      accuracy: 100,
      pp: 15,
      description: 'Has a 10% chance to paralyze the target.'
    },
    {
      name: 'Toxic',
      type: 'POISON',
      category: 'STATUS',
      power: null,
      accuracy: 90,
      pp: 10,
      description: 'Badly poisons the target.'
    },
    {
      name: 'Flamethrower',
      type: 'FIRE',
      category: 'SPECIAL',
      power: 90,
      accuracy: 100,
      pp: 15,
      description: 'Has a 10% chance to burn the target.'
    }
  ];

  // Get type colors
  const getTypeColors = (type) => {
    switch (type) {
      case 'NORMAL': return 'bg-gray-200 text-gray-800';
      case 'FIRE': return 'bg-orange-100 text-orange-800';
      case 'WATER': return 'bg-blue-100 text-blue-800';
      case 'ELECTRIC': return 'bg-yellow-100 text-yellow-800';
      case 'GRASS': return 'bg-green-100 text-green-800';
      case 'ICE': return 'bg-cyan-100 text-cyan-800';
      case 'FIGHTING': return 'bg-red-100 text-red-800';
      case 'POISON': return 'bg-purple-100 text-purple-800';
      case 'GROUND': return 'bg-amber-100 text-amber-800';
      case 'FLYING': return 'bg-sky-100 text-sky-800';
      case 'PSYCHIC': return 'bg-pink-100 text-pink-800';
      case 'BUG': return 'bg-lime-100 text-lime-800';
      case 'ROCK': return 'bg-stone-100 text-stone-800';
      case 'GHOST': return 'bg-indigo-100 text-indigo-800';
      case 'DRAGON': return 'bg-violet-100 text-violet-800';
      case 'DARK': return 'bg-gray-700 text-gray-100';
      case 'STEEL': return 'bg-slate-200 text-slate-800';
      case 'FAIRY': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  // Get category colors
  const getCategoryColors = (category) => {
    switch (category) {
      case 'PHYSICAL':
        return 'bg-red-100 text-red-700';
      case 'SPECIAL':
        return 'bg-blue-100 text-blue-700';
      case 'STATUS':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Move Cards Demo</h1>
        
        {/* Moves Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
          {sampleMoves.map((move, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-5 space-y-3 hover:shadow-md transition-all">
              {/* Top Section - Name + Tags */}
              <div className="flex justify-between items-start">
                <h3 className="text-base font-semibold text-gray-900">{move.name}</h3>
                <div className="flex gap-1 flex-wrap justify-end">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColors(move.type)}`}>
                    {move.type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColors(move.category)}`}>
                    {move.category}
                  </span>
                </div>
              </div>
              
              {/* Middle Section - Stats Grid */}
              <div className="flex justify-between text-sm text-gray-600">
                <div className="text-center">
                  <span className="font-semibold text-gray-900">
                    {move.power || '—'}
                  </span>
                  <br />
                  <span className="text-xs">Power</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900">
                    {move.accuracy}%
                  </span>
                  <br />
                  <span className="text-xs">Accuracy</span>
                </div>
                <div className="text-center">
                  <span className="font-semibold text-gray-900">
                    {move.pp}
                  </span>
                  <br />
                  <span className="text-xs">PP</span>
                </div>
              </div>
              
              {/* Bottom Section - Effect Description */}
              <p className="text-xs italic text-gray-500 border-t pt-3">
                {move.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}