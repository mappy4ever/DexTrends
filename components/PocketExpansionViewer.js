import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlideUp } from "./ui/Animations";

/**
 * Component to display Pokémon TCG Pocket expansion details
 * @param {Object} props Component props
 * @param {Object} props.expansion The expansion data to display
 */
export default function PocketExpansionViewer({ expansion }) {
  const [expanded, setExpanded] = useState(false);

  if (!expansion) return null;

  // Parse release date for display
  const releaseDate = new Date(expansion.releaseDate).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            {/* Expansion logo/symbol if available */}
            {expansion.logoUrl && (
              <div className="mr-4 w-12 h-12 relative">
                <Image 
                  src={expansion.logoUrl} 
                  alt={`${expansion.name} logo`}
                  width={48}
                  height={48}
                  layout="fixed"
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">{expansion.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{expansion.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Release Date</div>
              <div className="font-medium">{releaseDate}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Cards</div>
              <div className="font-medium">{expansion.cardCount}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-3">Featured Cards</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {expansion.featuredPokemon.map(pokemon => (
              <div key={pokemon.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:shadow-md transition-all">
                <div className="relative w-full h-28 sm:h-36 mb-2">
                  <Image
                    src={pokemon.imageUrl || "/back-card.png"}
                    alt={pokemon.name}
                    layout="fill"
                    objectFit="contain"
                    className="transition-all duration-300 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/back-card.png";
                    }}
                  />
                </div>
                <h4 className="text-sm font-medium text-center truncate">{pokemon.name}</h4>
                <div className="text-xs text-center text-primary-dark dark:text-primary-light mt-1">{pokemon.rarity}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Toggle button for viewing more details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-5 py-2 text-sm text-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <span className="mr-1">{expanded ? "Hide" : "Show"} More Details</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      
      {/* Expanded content */}
      {expanded && (
        <SlideUp className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3">Set Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Set Code:</span>
                    <span className="font-medium">{expansion.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Card Count:</span>
                    <span className="font-medium">{expansion.cardCount} cards</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Release Date:</span>
                    <span className="font-medium">{releaseDate}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-3">Set Mechanics</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>New {expansion.name.split(' ').pop()} special mechanics</li>
                    <li>Unique foil pattern for rare cards</li>
                    <li>Exclusive Trainer cards</li>
                    <li>Special energy cards for TCG Pocket</li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-3">Card Distribution</h4>
                <div className="grid grid-cols-3 gap-y-2 text-sm">
                  <div>
                    <div className="font-medium">Common</div>
                    <div className="text-gray-600 dark:text-gray-400">{Math.floor(expansion.cardCount * 0.45)} cards</div>
                  </div>
                  <div>
                    <div className="font-medium">Uncommon</div>
                    <div className="text-gray-600 dark:text-gray-400">{Math.floor(expansion.cardCount * 0.3)} cards</div>
                  </div>
                  <div>
                    <div className="font-medium">Rare</div>
                    <div className="text-gray-600 dark:text-gray-400">{Math.floor(expansion.cardCount * 0.15)} cards</div>
                  </div>
                  <div>
                    <div className="font-medium">Ultra Rare</div>
                    <div className="text-gray-600 dark:text-gray-400">{Math.floor(expansion.cardCount * 0.07)} cards</div>
                  </div>
                  <div>
                    <div className="font-medium">Secret Rare</div>
                    <div className="text-gray-600 dark:text-gray-400">{Math.floor(expansion.cardCount * 0.03)} cards</div>
                  </div>
                </div>
                
                <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="text-blue-700 dark:text-blue-300 font-medium mb-2">Collector's Note</h5>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {expansion.name} features unique collector's items and chase cards that are exclusively available in the Pokémon TCG Pocket format.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-center">
            <button className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all">
              Browse All {expansion.name} Cards
            </button>
          </div>
        </SlideUp>
      )}
    </div>
  );
}
