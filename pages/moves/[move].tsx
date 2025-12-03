import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { PokeballLoader } from '@/components/ui/PokeballLoader';

// Type colors for move type styling
const TYPE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  normal: { bg: 'bg-stone-100', border: 'border-stone-300', text: 'text-stone-700' },
  fire: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
  water: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  electric: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700' },
  grass: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  ice: { bg: 'bg-cyan-100', border: 'border-cyan-300', text: 'text-cyan-700' },
  fighting: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  poison: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  ground: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700' },
  flying: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-700' },
  psychic: { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
  bug: { bg: 'bg-lime-100', border: 'border-lime-300', text: 'text-lime-700' },
  rock: { bg: 'bg-stone-200', border: 'border-stone-400', text: 'text-stone-700' },
  ghost: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700' },
  dragon: { bg: 'bg-indigo-200', border: 'border-indigo-400', text: 'text-indigo-800' },
  dark: { bg: 'bg-stone-300', border: 'border-stone-500', text: 'text-stone-800' },
  steel: { bg: 'bg-slate-200', border: 'border-slate-400', text: 'text-slate-700' },
  fairy: { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-700' },
};

interface MoveData {
  id: number;
  name: string;
  accuracy: number | null;
  power: number | null;
  pp: number;
  priority: number;
  damage_class: { name: string };
  type: { name: string };
  effect_entries: Array<{ effect: string; short_effect: string; language: { name: string } }>;
  flavor_text_entries: Array<{ flavor_text: string; language: { name: string }; version_group: { name: string } }>;
  learned_by_pokemon: Array<{ name: string; url: string }>;
  meta: {
    ailment: { name: string } | null;
    ailment_chance: number;
    category: { name: string };
    crit_rate: number;
    drain: number;
    flinch_chance: number;
    healing: number;
    max_hits: number | null;
    max_turns: number | null;
    min_hits: number | null;
    min_turns: number | null;
    stat_chance: number;
  } | null;
  target: { name: string };
  contest_type: { name: string } | null;
  generation: { name: string };
}

function capitalize(str: string): string {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function MovePage() {
  const router = useRouter();
  const { move } = router.query;
  const [moveData, setMoveData] = useState<MoveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!move || typeof move !== 'string') return;

    const fetchMove = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/move/${move}`);
        if (!response.ok) {
          throw new Error('Move not found');
        }
        const data = await response.json();
        setMoveData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load move');
      } finally {
        setLoading(false);
      }
    };

    fetchMove();
  }, [move]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
        <PokeballLoader />
      </div>
    );
  }

  if (error || !moveData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900 p-4">
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-4">Move Not Found</h1>
        <p className="text-stone-600 dark:text-stone-400 mb-6">{error || 'Unable to load move data'}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const typeColor = TYPE_COLORS[moveData.type.name] || TYPE_COLORS.normal;
  const englishEffect = moveData.effect_entries.find(e => e.language.name === 'en');
  const englishFlavor = moveData.flavor_text_entries.find(e => e.language.name === 'en');

  return (
    <>
      <Head>
        <title>{capitalize(moveData.name)} - Move Details | DexTrends</title>
        <meta name="description" content={englishEffect?.short_effect || `Details about the ${capitalize(moveData.name)} move`} />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pb-20">
        {/* Header */}
        <div className={`${typeColor.bg} border-b ${typeColor.border}`}>
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-600 dark:text-stone-700 hover:text-stone-800 mb-4 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="flex items-center gap-4">
              <h1 className={`text-3xl font-bold ${typeColor.text}`}>
                {capitalize(moveData.name)}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}>
                {capitalize(moveData.type.name)}
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Power</p>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                {moveData.power ?? '—'}
              </p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Accuracy</p>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                {moveData.accuracy ? `${moveData.accuracy}%` : '—'}
              </p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">PP</p>
              <p className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                {moveData.pp}
              </p>
            </div>
            <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 text-center">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Category</p>
              <p className="text-lg font-bold text-stone-800 dark:text-stone-200 capitalize">
                {moveData.damage_class.name}
              </p>
            </div>
          </div>

          {/* Description */}
          {englishFlavor && (
            <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-2">Description</h2>
              <p className="text-stone-700 dark:text-stone-300">
                {englishFlavor.flavor_text.replace(/\n/g, ' ')}
              </p>
            </div>
          )}

          {/* Effect */}
          {englishEffect && (
            <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-2">Effect</h2>
              <p className="text-stone-700 dark:text-stone-300">
                {englishEffect.effect.replace(/\$effect_chance/g, String(moveData.meta?.stat_chance || moveData.meta?.ailment_chance || '—'))}
              </p>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-stone-500 dark:text-stone-400">Target</p>
                <p className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                  {moveData.target.name.replace(/-/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-stone-500 dark:text-stone-400">Priority</p>
                <p className="font-medium text-stone-700 dark:text-stone-300">
                  {moveData.priority > 0 ? `+${moveData.priority}` : moveData.priority}
                </p>
              </div>
              <div>
                <p className="text-stone-500 dark:text-stone-400">Generation</p>
                <p className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                  {moveData.generation.name.replace('generation-', 'Gen ')}
                </p>
              </div>
              {moveData.meta?.ailment && moveData.meta.ailment.name !== 'none' && (
                <div>
                  <p className="text-stone-500 dark:text-stone-400">Status Effect</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300 capitalize">
                    {moveData.meta.ailment.name} ({moveData.meta.ailment_chance}%)
                  </p>
                </div>
              )}
              {moveData.meta?.crit_rate !== undefined && moveData.meta.crit_rate > 0 && (
                <div>
                  <p className="text-stone-500 dark:text-stone-400">Crit Rate</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    +{moveData.meta.crit_rate}
                  </p>
                </div>
              )}
              {moveData.meta?.flinch_chance !== undefined && moveData.meta.flinch_chance > 0 && (
                <div>
                  <p className="text-stone-500 dark:text-stone-400">Flinch Chance</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    {moveData.meta.flinch_chance}%
                  </p>
                </div>
              )}
              {moveData.meta?.drain !== undefined && moveData.meta.drain !== 0 && (
                <div>
                  <p className="text-stone-500 dark:text-stone-400">
                    {moveData.meta.drain > 0 ? 'HP Drain' : 'Recoil'}
                  </p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    {Math.abs(moveData.meta.drain)}%
                  </p>
                </div>
              )}
              {moveData.meta?.healing !== undefined && moveData.meta.healing > 0 && (
                <div>
                  <p className="text-stone-500 dark:text-stone-400">Healing</p>
                  <p className="font-medium text-stone-700 dark:text-stone-300">
                    {moveData.meta.healing}%
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pokemon that can learn this move */}
          <div className="bg-white dark:bg-stone-800 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
            <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 mb-3">
              Pokémon that can learn {capitalize(moveData.name)} ({moveData.learned_by_pokemon.length})
            </h2>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {moveData.learned_by_pokemon.slice(0, 50).map(pokemon => (
                <Link
                  key={pokemon.name}
                  href={`/pokemon/${pokemon.name}`}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-700 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors capitalize"
                >
                  {pokemon.name.replace(/-/g, ' ')}
                </Link>
              ))}
              {moveData.learned_by_pokemon.length > 50 && (
                <span className="px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400">
                  +{moveData.learned_by_pokemon.length - 50} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
