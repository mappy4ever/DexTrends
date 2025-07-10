import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface PokemonLoadingScreenProps {
  type?: 'default' | 'facts' | 'silhouette' | 'pokeball';
  message?: string;
  showFacts?: boolean;
  duration?: number;
}

const PokemonLoadingScreen = ({ 
  type = "default",
  message = "Loading...", showFacts = true, duration = 3000 
}: PokemonLoadingScreenProps) => {
  const [currentFact, setCurrentFact] = useState(0);
  const [showSilhouette, setShowSilhouette] = useState(true);

  const pokemonFacts = [
    "💡 Did you know? Pikachu was originally going to be called 'Pikachuu'!",
    "⚡ Fun fact: Electric-type moves are super effective against Water and Flying types!",
    "🌟 Legendary Pokémon have a catch rate of only 3 in the original games!",
    "🎮 The first Pokémon games were released in Japan in 1996!",
    "🔥 Charizard isn't actually a Dragon-type - it's Fire/Flying!",
    "💎 Shiny Pokémon have a 1 in 4,096 chance of appearing in modern games!",
    "🌙 Pokémon was inspired by the creator's childhood hobby of collecting insects!",
    "👑 Mew was secretly added to the original games at the last minute!",
    "🎯 Critical hits in Pokémon deal 1.5x damage instead of 2x!",
    "🌈 There are currently 18 different Pokémon types!",
    "🎪 The longest Pokémon name is Fletchinder with 11 letters!",
    "⭐ Arceus is known as the 'Original One' in Pokémon mythology!",
    "🏃 Quick Claw has a 20% chance to make your Pokémon move first!",
    "🔮 Psychic-type moves were overpowered in Generation 1!",
    "🎵 Pokémon Red/Blue had only 4-channel audio!",
  ];

  const silhouettePokemon = [
    { name: "Pikachu", hint: "This Electric mouse is the franchise mascot!" },
    { name: "Charizard", hint: "This Fire-type dragon isn't actually a Dragon!" },
    { name: "Mewtwo", hint: "The most powerful Psychic-type legendary!" },
    { name: "Eevee", hint: "This Normal-type has many evolution possibilities!" },
    { name: "Lucario", hint: "This Fighting/Steel-type can sense auras!" },
    { name: "Greninja", hint: "This Water/Dark-type ninja is super fast!" },
  ];

  const [currentSilhouette, setCurrentSilhouette] = useState(0);

  useEffect(() => {
    if (showFacts && type === "facts") {
      const interval = setInterval(() => {
        setCurrentFact((prev: any) => (prev + 1) % pokemonFacts.length);
      }, 2500);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [showFacts, type, pokemonFacts.length]);

  useEffect(() => {
    if (type === "silhouette") {
      const interval = setInterval(() => {
        setCurrentSilhouette((prev: any) => (prev + 1) % silhouettePokemon.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [type, silhouettePokemon.length]);

  const PokeBallSpinner = () => (
    <div className="relative w-20 h-20 mx-auto mb-6">
      {/* Pokéball design with smooth CSS animation */}
      <div className="pokeball-spinner w-20 h-20 rounded-full relative overflow-hidden">
        {/* Top half - red */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-500 to-red-600 rounded-t-full"></div>
        {/* Bottom half - white */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-100 to-white rounded-b-full"></div>
        {/* Middle line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 transform -translate-y-1/2"></div>
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-gray-800">
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
      {/* Sparkle effects */}
      <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
      <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-75"></div>
      <div className="absolute top-2 -left-3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping delay-150"></div>
      
      {/* CSS for smooth pokeball spinning */}
      <style jsx>{`
        .pokeball-spinner {
          animation: pokeball-smooth-spin 1.5s linear infinite;
          transform-origin: center center;
          will-change: transform;
        }
        
        @keyframes pokeball-smooth-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Ensure no buffering or back-and-forth motion */
        .pokeball-spinner {
          animation-fill-mode: both;
          animation-timing-function: linear;
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </div>
  );

  const WhosThatPokemon = () => (
    <div className="text-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-4 animate-pulse">
          Who's That Pokémon?
        </h3>
        {/* Silhouette effect */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="w-32 h-32 bg-black rounded-lg animate-bounce opacity-80">
            {/* Simple silhouette shapes for different Pokémon */}
            {currentSilhouette === 0 && (
              <div className="relative w-full h-full">
                {/* Pikachu silhouette approximation */}
                <div className="absolute top-2 left-6 w-4 h-6 bg-black transform rotate-12"></div>
                <div className="absolute top-2 right-6 w-4 h-6 bg-black transform -rotate-12"></div>
                <div className="absolute top-6 left-1/2 w-16 h-16 bg-black rounded-full transform -translate-x-1/2"></div>
                <div className="absolute bottom-4 left-1/2 w-8 h-6 bg-black rounded-full transform -translate-x-1/2"></div>
              </div>
            )}
            {currentSilhouette === 1 && (
              <div className="relative w-full h-full">
                {/* Charizard silhouette approximation */}
                <div className="absolute top-4 left-1/2 w-12 h-8 bg-black rounded-full transform -translate-x-1/2"></div>
                <div className="absolute top-8 left-1/2 w-16 h-12 bg-black rounded-lg transform -translate-x-1/2"></div>
                <div className="absolute bottom-6 left-1/4 w-6 h-8 bg-black rounded-lg"></div>
                <div className="absolute bottom-6 right-1/4 w-6 h-8 bg-black rounded-lg"></div>
              </div>
            )}
            {/* Add more silhouettes for other Pokémon... */}
          </div>
        </div>
        <p className="text-blue-200 text-sm animate-pulse">
          {silhouettePokemon[currentSilhouette].hint}
        </p>
      </div>
    </div>
  );

  if (type === "pokeball") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <PokeBallSpinner />
          <h2 className="text-2xl font-bold mb-2 animate-pulse">{message}</h2>
          <p className="text-blue-200">Catching 'em all...</p>
        </div>
      </div>
    );
  }

  if (type === "silhouette") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
        <div className="text-center">
          <WhosThatPokemon />
          <div className="mt-6">
            <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "facts") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md mx-auto px-6">
          <PokeBallSpinner />
          <h2 className="text-2xl font-bold mb-6 animate-pulse">{message}</h2>
          
          {/* Dynamic facts */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 min-h-[100px] flex items-center">
            <p className="text-lg leading-relaxed animate-fadeIn" key={currentFact}>
              {pokemonFacts[currentFact]}
            </p>
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {pokemonFacts.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentFact % 5 ? 'bg-yellow-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default loading screen
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pokemon-red via-pokemon-blue to-pokemon-yellow flex items-center justify-center z-50">
      <div className="text-center text-white">
        <PokeBallSpinner />
        <h2 className="text-2xl font-bold mb-2 animate-pulse">{message}</h2>
        <p className="text-blue-200">Getting ready for adventure...</p>
      </div>
    </div>
  );
};

export default PokemonLoadingScreen;