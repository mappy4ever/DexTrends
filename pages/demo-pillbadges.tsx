import React, { useState } from 'react';
import { PillBadge } from '@/components/ui/PillBadge';
import { PillBadgeGroup } from '@/components/ui/PillBadgeGroup';
import { POKEMON_TYPE_COLORS } from '@/utils/pokemonTypeColors';

export default function DemoPillBadges() {
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  const typeOptions = [
    { id: 'fire', label: 'Fire', color: POKEMON_TYPE_COLORS.fire, count: 24 },
    { id: 'water', label: 'Water', color: POKEMON_TYPE_COLORS.water, count: 31 },
    { id: 'grass', label: 'Grass', color: POKEMON_TYPE_COLORS.grass, count: 28 },
    { id: 'electric', label: 'Electric', color: POKEMON_TYPE_COLORS.electric, count: 15 },
    { id: 'psychic', label: 'Psychic', color: POKEMON_TYPE_COLORS.psychic, count: 19 },
    { id: 'dark', label: 'Dark', color: POKEMON_TYPE_COLORS.dark, count: 12 },
    { id: 'dragon', label: 'Dragon', color: POKEMON_TYPE_COLORS.dragon, count: 8 },
    { id: 'fairy', label: 'Fairy', color: POKEMON_TYPE_COLORS.fairy, count: 11 },
    { id: 'fighting', label: 'Fighting', color: POKEMON_TYPE_COLORS.fighting, count: 22 },
    { id: 'flying', label: 'Flying', color: POKEMON_TYPE_COLORS.flying, count: 18 },
    { id: 'ghost', label: 'Ghost', color: POKEMON_TYPE_COLORS.ghost, count: 9 },
    { id: 'ground', label: 'Ground', color: POKEMON_TYPE_COLORS.ground, count: 16 },
    { id: 'ice', label: 'Ice', color: POKEMON_TYPE_COLORS.ice, count: 7 },
    { id: 'normal', label: 'Normal', color: POKEMON_TYPE_COLORS.normal, count: 35 },
    { id: 'poison', label: 'Poison', color: POKEMON_TYPE_COLORS.poison, count: 14 },
    { id: 'rock', label: 'Rock', color: POKEMON_TYPE_COLORS.rock, count: 13 },
    { id: 'steel', label: 'Steel', color: POKEMON_TYPE_COLORS.steel, count: 10 },
    { id: 'bug', label: 'Bug', color: POKEMON_TYPE_COLORS.bug, count: 17 }
  ];

  const categoryOptions = [
    { id: 'physical', label: 'Physical', count: 156 },
    { id: 'special', label: 'Special', count: 142 },
    { id: 'status', label: 'Status', count: 98 }
  ];

  const regionOptions = [
    { id: 'kanto', label: 'Kanto' },
    { id: 'johto', label: 'Johto' },
    { id: 'hoenn', label: 'Hoenn' },
    { id: 'sinnoh', label: 'Sinnoh' },
    { id: 'unova', label: 'Unova' },
    { id: 'kalos', label: 'Kalos' },
    { id: 'alola', label: 'Alola' },
    { id: 'galar', label: 'Galar' },
    { id: 'paldea', label: 'Paldea' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            PillBadge Component System Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Reusable pill-shaped badge components for filtering and organizing data
          </p>
        </div>

        {/* Individual PillBadge Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Individual PillBadges</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Variants</h3>
              <div className="flex flex-wrap gap-2">
                <PillBadge label="Filled" variant="filled" />
                <PillBadge label="Outlined" variant="outlined" />
                <PillBadge label="Ghost" variant="ghost" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <PillBadge label="Extra Small" size="xs" variant="outlined" />
                <PillBadge label="Small" size="sm" variant="outlined" />
                <PillBadge label="Medium" size="md" variant="outlined" />
                <PillBadge label="Large" size="lg" variant="outlined" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">With Colors</h3>
              <div className="flex flex-wrap gap-2">
                <PillBadge label="Fire" variant="filled" color={POKEMON_TYPE_COLORS.fire} />
                <PillBadge label="Water" variant="filled" color={POKEMON_TYPE_COLORS.water} />
                <PillBadge label="Grass" variant="filled" color={POKEMON_TYPE_COLORS.grass} />
                <PillBadge label="Electric" variant="outlined" color={POKEMON_TYPE_COLORS.electric} />
                <PillBadge label="Psychic" variant="outlined" color={POKEMON_TYPE_COLORS.psychic} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">With Additional Data</h3>
              <div className="flex flex-wrap gap-2">
                <PillBadge label="Physical" value="156 moves" variant="outlined" />
                <PillBadge label="Special" count={142} variant="outlined" />
                <PillBadge 
                  label="Status" 
                  count={98} 
                  interactive 
                  onClick={() => alert('Status moves clicked!')} 
                  variant="outlined" 
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interactive & Removable</h3>
              <div className="flex flex-wrap gap-2">
                <PillBadge 
                  label="Click me" 
                  interactive 
                  onClick={() => alert('Clicked!')} 
                  variant="outlined" 
                />
                <PillBadge 
                  label="Remove me" 
                  onRemove={() => alert('Removed!')} 
                  variant="filled" 
                />
                <PillBadge 
                  label="Selected" 
                  selected 
                  interactive 
                  onClick={() => {}} 
                  variant="outlined" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* PillBadgeGroup Examples */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">PillBadgeGroup</h2>
          
          <div className="space-y-8">
            {/* Single Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Single Selection (Pokemon Type)
              </h3>
              <PillBadgeGroup
                options={typeOptions.slice(0, 6)}
                value={selectedType}
                onChange={(value) => setSelectedType(value as string)}
                variant="filled"
                size="sm"
                showAll
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedType || 'All'}
              </p>
            </div>

            {/* Multiple Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Multiple Selection (Pokemon Types)
              </h3>
              <PillBadgeGroup
                options={typeOptions}
                value={selectedTypes}
                onChange={(value) => setSelectedTypes(value as string[])}
                variant="filled"
                size="sm"
                multiple
                showAll
                maxVisible={10}
              />
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedTypes.length === 0 ? 'All' : selectedTypes.join(', ')}
              </p>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Move Categories
              </h3>
              <PillBadgeGroup
                options={categoryOptions}
                value={selectedCategories}
                onChange={(value) => setSelectedCategories(value as string[])}
                variant="outlined"
                size="md"
                multiple
                showAll
              />
            </div>

            {/* Regions */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pokemon Regions
              </h3>
              <PillBadgeGroup
                options={regionOptions}
                value={selectedRegions}
                onChange={(value) => setSelectedRegions(value as string[])}
                variant="ghost"
                size="sm"
                multiple
                showAll={false}
              />
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Common Use Cases</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Data Filtering</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Use pill badges to filter Pokemon moves by type and category
              </p>
              <div className="space-y-3">
                <PillBadgeGroup
                  options={typeOptions.slice(0, 5)}
                  value={[]}
                  onChange={() => {}}
                  variant="filled"
                  size="sm"
                  multiple
                  showAll
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Tag Management</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Manage tags with removable pill badges
              </p>
              <div className="flex flex-wrap gap-2">
                <PillBadge label="Legendary" onRemove={() => {}} variant="filled" color="#f59e0b" />
                <PillBadge label="Mythical" onRemove={() => {}} variant="filled" color="#8b5cf6" />
                <PillBadge label="Starter" onRemove={() => {}} variant="filled" color="#10b981" />
                <PillBadge label="Shiny" onRemove={() => {}} variant="filled" color="#ec4899" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}