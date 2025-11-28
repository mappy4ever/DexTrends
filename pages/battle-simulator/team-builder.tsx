import React, { useState } from 'react';
import type { NextPage } from 'next';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';

const TeamBuilderPage: NextPage = () => {
  const [team, setTeam] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const addPokemon = () => {
    if (!input.trim()) return;
    setTeam(prev => [...prev, input.trim()].slice(0, 6));
    setInput('');
  };

  const removePokemon = (idx: number) => {
    setTeam(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Team Builder</h1>
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow border border-stone-300 dark:border-stone-600 rounded-xl p-2 mr-2 text-stone-900 dark:text-stone-100 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm transition-all duration-150 focus:ring-2 focus:ring-amber-500"
            placeholder="Enter Pokémon name"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            onClick={addPokemon}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg transition-all duration-150"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {team.map((mon, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b border-stone-200 dark:border-stone-700 pb-1"
            >
              <span className="text-stone-900 dark:text-stone-100">{idx + 1}. {mon}</span>
              <button onClick={() => removePokemon(idx)} className="text-red-600 hover:text-red-700 transition-colors duration-150">Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </FullBleedWrapper>
  );
};

// Mark this page as full bleed to remove Layout padding
(TeamBuilderPage as any).fullBleed = true;

export default TeamBuilderPage;
