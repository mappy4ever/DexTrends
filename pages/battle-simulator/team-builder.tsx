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
    <FullBleedWrapper>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Team Builder</h1>
        <div className="flex items-center">
          <input
            type="text"
            className="flex-grow border rounded p-2 mr-2 text-black"
            placeholder="Enter Pokémon name"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            onClick={addPokemon}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {team.map((mon, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center border-b pb-1"
            >
              <span>{idx + 1}. {mon}</span>
              <button onClick={() => removePokemon(idx)} className="text-red-600">Remove</button>
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
