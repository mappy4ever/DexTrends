import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface PokemonEmptyStateProps {
  type?: 'search' | 'collection' | 'cards' | 'error' | 'maintenance';
  customMessage?: string | null;
  actionButton?: React.ReactNode | null;
  showAnimation?: boolean;
}

const PokemonEmptyState = ({ 
  type = "search",
  customMessage = null, actionButton = null, showAnimation = true 
}: PokemonEmptyStateProps) => {
  const router = useRouter();
  const [currentMessage, setCurrentMessage] = useState(0);

  const emptyStateData = {
    search: {
      title: "It's super effective... at hiding! 🫥",
      messages: [
        "No Pokémon found in the tall grass!",
        "Even Alakazam can't find what you're looking for!",
        "This search came up emptier than Team Rocket's plans!",
        "Looks like these Pokémon used Teleport!",
        "Not even the Pokédex has this entry!"
      ],
      emoji: "🔍",
      animation: "animate-bounce",
      suggestions: [
        "Try a different search term",
        "Check your spelling (unlike Team Rocket)",
        "Browse by type or generation",
        "Clear your filters and try again"
      ]
    },
    collection: {
      title: "Your collection is emptier than Ash's wallet! 💸",
      messages: [
        "Time to start your Pokémon journey!",
        "Even Youngster Joey has more than this!",
        "Professor Oak would be disappointed!",
        "Gotta catch 'em all... starting now!",
        "Your Pokédex is feeling lonely!"
      ],
      emoji: "📱",
      animation: "animate-pulse",
      suggestions: [
        "Add your first Pokémon card",
        "Browse the TCG sets",
        "Check out trending cards",
        "Explore Pocket mode"
      ]
    },
    cards: {
      title: "These cards vanished faster than Abra! ✨",
      messages: [
        "Looks like Team Rocket stole all the cards!",
        "Even Mewtwo can't find any cards here!",
        "This deck is more empty than Magikarp's moveset!",
        "No cards found in this dimension!",
        "The cards used Substitute and disappeared!"
      ],
      emoji: "🃏",
      animation: "animate-spin",
      suggestions: [
        "Try different filters",
        "Check another set",
        "Browse all cards",
        "Visit the card database"
      ]
    },
    error: {
      title: "Oops! Something went wrong! 💥",
      messages: [
        "Pikachu tripped over the power cable!",
        "Team Rocket is interfering with the connection!",
        "A wild ERROR appeared! It's super confusing!",
        "Porygon caused a glitch in the system!",
        "The server fainted! Quick, use a Revive!"
      ],
      emoji: "⚡",
      animation: "animate-shake",
      suggestions: [
        "Try refreshing the page",
        "Check your internet connection",
        "Wait a moment and try again",
        "Report this to Professor Oak"
      ]
    },
    maintenance: {
      title: "Nurse Joy is healing our servers! 🏥",
      messages: [
        "The Pokémon Center is under maintenance!",
        "Our Chansey is working hard to fix things!",
        "The servers are taking a well-deserved rest!",
        "Team Rocket broke something... again!",
        "We're upgrading to Pokémon Center 2.0!"
      ],
      emoji: "🔧",
      animation: "animate-pulse",
      suggestions: [
        "Check back in a few minutes",
        "Follow us for updates",
        "Try again later",
        "Thank you for your patience!"
      ]
    }
  };

  const currentData = emptyStateData[type] || emptyStateData.search;

  useEffect(() => {
    if (showAnimation) {
      const interval = setInterval(() => {
        setCurrentMessage((prev: number) => (prev + 1) % currentData.messages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [currentData.messages.length, showAnimation]);

  const PokemonIllustration = (): React.ReactElement => {
    // CSS-based Pokémon illustrations
    const illustrations = {
      search: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Confused Psyduck */}
          <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto relative">
            {/* Eyes */}
            <div className="absolute top-4 left-3 w-3 h-3 bg-black rounded-full"></div>
            <div className="absolute top-4 right-3 w-3 h-3 bg-black rounded-full"></div>
            {/* Beak */}
            <div className="absolute top-8 left-1/2 w-2 h-3 bg-orange-400 transform -translate-x-1/2"></div>
            {/* Question marks */}
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">❓</div>
            <div className="absolute -top-4 -left-2 text-xl animate-bounce delay-75">❓</div>
          </div>
        </div>
      ),
      collection: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Empty Pokéball */}
          <div className="w-24 h-24 mx-auto relative">
            <div className="w-24 h-24 rounded-full border-4 border-stone-300 border-dashed relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-300"></div>
              <div className="absolute top-1/2 left-1/2 w-4 h-4 border-2 border-stone-300 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            {/* Dust cloud */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-4 bg-stone-200 rounded-full opacity-60 animate-pulse"></div>
            </div>
          </div>
        </div>
      ),
      cards: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Flying cards */}
          <div className="relative">
            <div className="absolute top-2 left-4 w-12 h-16 bg-gradient-to-b from-amber-400 to-amber-600 rounded-lg transform rotate-12 animate-float opacity-60"></div>
            <div className="absolute top-6 right-4 w-12 h-16 bg-gradient-to-b from-red-400 to-red-600 rounded-lg transform -rotate-12 animate-float delay-75 opacity-80"></div>
            <div className="absolute top-4 left-1/2 w-12 h-16 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-lg transform -translate-x-1/2 animate-float delay-150"></div>
          </div>
        </div>
      ),
      error: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Dizzy Pikachu */}
          <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto relative">
            {/* Dizzy eyes */}
            <div className="absolute top-4 left-2 text-lg">@</div>
            <div className="absolute top-4 right-2 text-lg">@</div>
            {/* Mouth */}
            <div className="absolute top-10 left-1/2 w-2 h-2 bg-black rounded-full transform -translate-x-1/2"></div>
            {/* Sparks */}
            <div className="absolute -top-1 left-1 text-yellow-300 animate-ping">⚡</div>
            <div className="absolute -top-2 right-1 text-yellow-300 animate-ping delay-75">⚡</div>
            <div className="absolute top-2 -right-2 text-yellow-300 animate-ping delay-150">⚡</div>
          </div>
        </div>
      ),
      maintenance: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          {/* Chansey with tools */}
          <div className="w-24 h-20 bg-pink-300 rounded-full mx-auto relative">
            {/* Eyes */}
            <div className="absolute top-3 left-4 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute top-3 right-4 w-2 h-2 bg-black rounded-full"></div>
            {/* Nurse hat */}
            <div className="absolute -top-2 left-1/2 w-8 h-4 bg-white rounded-t-lg transform -translate-x-1/2">
              <div className="absolute top-1 left-1/2 w-2 h-2 bg-red-500 transform -translate-x-1/2"></div>
            </div>
            {/* Tools */}
            <div className="absolute -right-3 top-6 text-lg animate-bounce">🔧</div>
            <div className="absolute -left-3 top-8 text-lg animate-bounce delay-75">🔨</div>
          </div>
        </div>
      )
    };

    return illustrations[type] || illustrations.search;
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Animated Illustration */}
      <div className={showAnimation ? currentData.animation : ''}>
        <PokemonIllustration />
      </div>

      {/* Main Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-stone-900 dark:text-white mb-4">
        {customMessage || currentData.title}
      </h2>

      {/* Rotating Messages */}
      <div className="mb-8 h-8 flex items-center">
        <p className="text-lg text-stone-600 dark:text-stone-300 animate-fadeIn" key={currentMessage}>
          {currentData.messages[currentMessage]}
        </p>
      </div>

      {/* Suggestions */}
      <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-6 mb-8 max-w-md w-full">
        <h3 className="font-semibold text-stone-900 dark:text-white mb-4 flex items-center justify-center">
          <span className="mr-2">{currentData.emoji}</span>
          Try These Instead:
        </h3>
        <ul className="space-y-2 text-sm text-stone-600 dark:text-stone-300">
          {currentData.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center">
              <span className="mr-2 text-pokemon-red">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {actionButton || (
          <>
            <Link href="/">
              <button className="bg-pokemon-red hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                🏠 Go Home
              </button>
            </Link>
            
            {type === 'search' && (
              <button
                onClick={() => router.reload()}
                className="bg-pokemon-blue hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                🔄 Try Again
              </button>
            )}
            
            {type === 'collection' && (
              <Link href="/tcgexpansions">
                <button className="bg-pokemon-yellow hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                  🃏 Browse Cards
                </button>
              </Link>
            )}
            
            {type === 'error' && (
              <button
                onClick={() => router.reload()}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                ⚡ Revive Page
              </button>
            )}
          </>
        )}
      </div>

      {/* Fun Footer Message */}
      <div className="mt-8 text-xs text-stone-500 dark:text-stone-300 max-w-sm">
        <p className="italic">
          "Even the best Trainers face challenges. The real victory is getting back up!" 
          <span className="block mt-1 text-right">- Professor Oak (probably)</span>
        </p>
      </div>
    </div>
  );
};

export default PokemonEmptyState;