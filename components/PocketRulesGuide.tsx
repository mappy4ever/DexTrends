import React from "react";

/**
 * Component that explains the rules and differences of Pokémon TCG Pocket
 */
export default function PocketRulesGuide() {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-bold mb-4">Pokémon TCG Pocket Rules</h2>
          <p>
            The Pokémon TCG Pocket is a simplified version of the Pokémon Trading Card Game 
            designed specifically for mobile devices. It features streamlined gameplay, 
            smaller deck sizes, and faster matches while maintaining the core strategy 
            elements that fans love.
          </p>
          
          <div className="my-6">
            <h3 className="text-xl font-bold mb-3">Key Differences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Standard TCG</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>60-card decks</li>
                  <li>6 Prize Cards</li>
                  <li>Complex strategies</li>
                  <li>7-card starting hand</li>
                  <li>Up to 5 Benched Pokémon</li>
                  <li>Thousands of available cards</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">TCG Pocket</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>30-card decks</li>
                  <li>3 Prize Cards</li>
                  <li>Streamlined gameplay</li>
                  <li>5-card starting hand</li>
                  <li>Up to 2 Benched Pokémon</li>
                  <li>Curated card selection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Facts
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Released in September 2023</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Free-to-play with in-app purchases</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Available on iOS and Android</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>5-10 minute match duration</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Regular updates with new cards</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mt-8 mb-3">How to Play</h3>
      <ol className="list-decimal list-inside space-y-3 ml-4">
        <li><strong>Build your deck</strong> - Create a 30-card deck with Pokémon, Energy, and Trainer cards</li>
        <li><strong>Draw your hand</strong> - Begin with 5 cards (instead of 7 in the standard game)</li>
        <li><strong>Set up your Active Pokémon</strong> - Place one Basic Pokémon in the Active position</li>
        <li><strong>Set up your Bench</strong> - Place up to 2 Basic Pokémon on your Bench (compared to 5 in standard)</li>
        <li><strong>Place Prize Cards</strong> - Place 3 cards face down as Prize Cards (instead of 6)</li>
        <li><strong>Play your turn</strong> - Attach Energy, evolve Pokémon, play Trainer cards, and attack</li>
        <li><strong>Take Prize Cards</strong> - When you knock out an opponent's Pokémon, take one Prize Card</li>
        <li><strong>Win the game</strong> - Collect all Prize Cards or if your opponent has no Pokémon left</li>
      </ol>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-3">Card Differences</h3>
          <p>
            Cards in the TCG Pocket have been rebalanced to ensure the game remains fun and
            balanced within the new format:
          </p>
          <ul className="list-disc ml-6 mt-3 space-y-2">
            <li>Many cards have reduced energy costs</li>
            <li>HP values are often adjusted</li>
            <li>Some abilities have been simplified</li>
            <li>Attack damage may be modified</li>
            <li>Some cards have Pocket-exclusive mechanics</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-3">Strategy Tips</h3>
          <ul className="list-disc ml-6 space-y-2">
            <li><strong>Efficiency is key</strong> - With smaller decks and fewer Benched Pokémon, every card counts</li>
            <li><strong>Plan your Energy</strong> - Energy management is even more critical with fewer resources</li>
            <li><strong>Consider tech cards</strong> - Include cards that counter popular strategies</li>
            <li><strong>Prize trade</strong> - Be strategic about which Pokémon you sacrifice</li>
            <li><strong>Card advantage</strong> - Cards that let you draw more cards are extremely valuable</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
        <h3 className="text-xl font-bold mb-3">Competitive Play</h3>
        <p>
          Pokémon TCG Pocket features its own competitive ladder system with exclusive rewards.
          Players can climb through ranks by winning matches and participate in special events
          and tournaments. The competitive structure includes:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="font-bold text-lg mb-2">Ranked Seasons</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Monthly competitive seasons</li>
              <li>Seasonal rewards based on rank</li>
              <li>Special card sleeves and coins</li>
              <li>Exclusive cards for top players</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-2">Special Events</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Weekend tournaments</li>
              <li>Theme deck challenges</li>
              <li>Draft events</li>
              <li>Championship qualifiers</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-10 flex justify-center">
        <div className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download Pokémon TCG Pocket App
        </div>
      </div>
    </div>
  );
}