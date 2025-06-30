import React from "react";

// Type color mapping for badges (customize as needed)
const TYPE_COLORS = {
  Normal: "bg-gray-200 text-gray-800",
  Fire: "bg-orange-200 text-orange-900",
  Water: "bg-blue-200 text-blue-900",
  Electric: "bg-yellow-200 text-yellow-900",
  Grass: "bg-green-200 text-green-900",
  Ice: "bg-cyan-100 text-cyan-900",
  Fighting: "bg-red-300 text-red-900",
  Poison: "bg-purple-200 text-purple-900",
  Ground: "bg-yellow-300 text-yellow-900",
  Flying: "bg-sky-200 text-sky-900",
  Psychic: "bg-pink-200 text-pink-900",
  Bug: "bg-lime-200 text-lime-900",
  Rock: "bg-yellow-700 text-yellow-100",
  Ghost: "bg-indigo-200 text-indigo-900",
  Dragon: "bg-indigo-400 text-indigo-100",
  Dark: "bg-gray-700 text-gray-100",
  Steel: "bg-gray-400 text-gray-900",
  Fairy: "bg-pink-100 text-pink-900",
};

// Optional: SVG icons for height/weight/type
const HeightIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m0 0l-3-3m3 3l3-3"/></svg>
);
const WeightIcon = () => (
  <svg className="inline w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 15c1.333-2 6.667-2 8 0"/></svg>
);

const PokedexDisplay = ({ pokemon }) => {
  if (!pokemon) return null;
  return (
    <div className="relative w-full max-w-[400px] mx-auto pokedex-container select-none">
      <img
        src="/images/pokedex_frame.png"
        alt="Pokédex Frame"
        className="w-full block pointer-events-none select-none">
        draggable={false}
      />
      {/* Overlay: adjust top/left/width/height for your PNG's screen */}
      <div
        className="absolute pokedex-screen flex flex-col items-center justify-center bg-gray-50/90 rounded-xl shadow-lg">
        style={{
          top: '20%',
          left: '13%',
          width: '74%',
          height: '67%',
          padding: '1.1rem 0.5rem',
          boxShadow: '0 2px 18px 2px #6b7280cc',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <img
          src={pokemon.artUrl}
          alt={pokemon.name}
          className="w-[100px] mb-2 drop-shadow-lg transition-transform duration-200 hover:scale-105">
          style={{ objectFit: 'contain', maxHeight: '120px' }}
        />
        <div className="font-bold text-lg mb-1 text-center">
          #{pokemon.number} <span className="capitalize">{pokemon.name}</span>
        </div>
        <div className="flex gap-2 mb-1 flex-wrap justify-center">
          {pokemon.types.map((type) => (
            <span
              key={type}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-white ${TYPE_COLORS[type] || 'bg-gray-200 text-gray-800'}`}
            >
              {type}
            </span>
          ))}
        </div>
        <div className="flex gap-4 mb-1 text-sm items-center justify-center">
          <span><HeightIcon />{pokemon.height} m</span>
          <span><WeightIcon />{pokemon.weight} kg</span>
        </div>
        <div className="text-sm text-center">
          <span className="font-semibold">Abilities:</span> {pokemon.abilities.join(', ')}
        </div>
      </div>
    </div>
  );
};

export default PokedexDisplay;
