import React from 'react';
import HolographicCard from '../components/ui/HolographicCard';
import { FadeIn } from '../components/ui/animations';

const demoCards = [
  {
    id: 'swsh12pt5-160',
    name: 'Lugia VSTAR',
    rarity: 'Special Illustration Rare',
    image: 'https://images.pokemontcg.io/swsh12pt5/160_hires.png'
  },
  {
    id: 'swsh4-192',
    name: 'Pikachu VMAX',
    rarity: 'Secret Rare',
    image: 'https://images.pokemontcg.io/swsh4/192_hires.png'
  },
  {
    id: 'xy1-1',
    name: 'Venusaur EX',
    rarity: 'Rare Ultra',
    image: 'https://images.pokemontcg.io/xy1/1_hires.png'
  },
  {
    id: 'sm1-1',
    name: 'Caterpie',
    rarity: 'Common',
    image: 'https://images.pokemontcg.io/sm1/1_hires.png'
  }
];

export default function DemoHolographic() {
  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Holographic Card Effects Demo</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Hover over the cards to see the interactive holographic effects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {demoCards.map((card) => (
            <div key={card.id} className="text-center">
              <HolographicCard
                rarity={card.rarity}
                intensity="high"
                className="mx-auto max-w-[280px]"
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-auto rounded-lg"
                />
              </HolographicCard>
              <h3 className="mt-4 font-semibold">{card.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{card.rarity}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">About the Effects</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• <strong>Interactive 3D Transform:</strong> Cards tilt based on mouse position</li>
            <li>• <strong>Dynamic Shine:</strong> Light reflection follows your cursor</li>
            <li>• <strong>Rarity-Based Patterns:</strong> Different holographic effects for each rarity</li>
            <li>• <strong>Smooth Animations:</strong> Spring physics for natural movement</li>
            <li>• <strong>Mobile Optimized:</strong> Touch-friendly with performance considerations</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Effects are most visible on rare and ultra rare cards
          </p>
        </div>
      </FadeIn>
    </div>
  );
}