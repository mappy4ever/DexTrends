import React, { useState, useEffect, useMemo, memo } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import FullBleedWrapper from '@/components/ui/FullBleedWrapper';
import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/BreadcrumbNavigation';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchJSON } from '@/utils/unifiedFetch';
import { IoSearch, IoClose } from 'react-icons/io5';
import type { TCGCard, CardSet } from '@/types/api/cards';

// Type definitions
interface PokemonResult {
  name: string;
  url: string;
}

interface SearchResults {
  cards: TCGCard[];
  pokemon: PokemonResult[];
  loading: boolean;
}

// Memoized result components
const PokemonResultCard = memo(({ pokemon }: { pokemon: PokemonResult }) => {
  const pokemonId = pokemon.url.split('/').slice(-2, -1)[0];
  return (
    <Link
      href={`/pokedex/${pokemonId}`}
      className="flex items-center min-h-[56px] p-3 bg-stone-50 dark:bg-stone-700/50 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-200 dark:border-stone-600"
    >
      <div className="relative w-12 h-12 mr-3">
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
          alt={pokemon.name}
          width={48}
          height={48}
          className="object-contain"
          loading="lazy"
        />
      </div>
      <div>
        <div className="font-medium capitalize text-stone-900 dark:text-white">{pokemon.name}</div>
        <div className="text-xs text-stone-500">#{pokemonId.padStart(4, '0')}</div>
      </div>
    </Link>
  );
});
PokemonResultCard.displayName = 'PokemonResultCard';

const CardResultItem = memo(({ card }: { card: TCGCard }) => (
  <Link
    href={`/cards/${card.id}`}
    className="flex items-center min-h-[56px] p-3 bg-stone-50 dark:bg-stone-700/50 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors border border-stone-200 dark:border-stone-600"
  >
    {card.images?.small && (
      <div className="relative w-10 h-14 mr-3 rounded overflow-hidden">
        <Image
          src={card.images.small}
          alt={card.name}
          width={40}
          height={56}
          className="rounded object-cover"
          loading="lazy"
        />
      </div>
    )}
    <div>
      <div className="font-medium text-stone-900 dark:text-white">{card.name}</div>
      <div className="text-xs text-stone-500">{card.set?.name}</div>
    </div>
  </Link>
));
CardResultItem.displayName = 'CardResultItem';

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { q } = router.query;

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    cards: [],
    pokemon: [],
    loading: false
  });

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Sync URL query with search input (only when q changes from URL navigation)
  useEffect(() => {
    if (typeof q === 'string' && q !== searchQuery) {
      setSearchQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // Update URL when search changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery !== q) {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, undefined, { shallow: true });
    }
  }, [debouncedQuery, q, router]);

  // Perform search
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults({ cards: [], pokemon: [], loading: false });
      return;
    }

    const search = async () => {
      setResults(prev => ({ ...prev, loading: true }));

      try {
        // Search Pokemon
        const pokemonResponse = await fetchJSON<{ results: PokemonResult[] }>(
          `https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0`
        );

        const filteredPokemon = pokemonResponse?.results?.filter(p =>
          p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        ).slice(0, 12) || [];

        // Search TCG Cards (basic search)
        let cards: TCGCard[] = [];
        try {
          const cardResponse = await fetch(`/api/tcg-cards?q=name:${encodeURIComponent(debouncedQuery)}*&pageSize=12`);
          if (cardResponse.ok) {
            const cardData = await cardResponse.json();
            cards = cardData.data || [];
          }
        } catch {
          // TCG search failed silently
        }

        setResults({
          cards,
          pokemon: filteredPokemon,
          loading: false
        });
      } catch {
        setResults({ cards: [], pokemon: [], loading: false });
      }
    };

    search();
  }, [debouncedQuery]);

  const hasResults = results.pokemon.length > 0 || results.cards.length > 0;
  const showEmptyState = debouncedQuery.length >= 2 && !results.loading && !hasResults;

  return (
    <>
      <Head>
        <title>{searchQuery ? `Search: ${searchQuery}` : 'Search'} - DexTrends</title>
        <meta name="description" content="Search across all Pokémon data - Pokédex, TCG cards, moves, items, and more" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* PageHeader with Breadcrumbs */}
          <PageHeader
            title="Search"
            description="Find Pokemon, TCG cards, and more"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Search', href: '/search', icon: '🔍', isActive: true },
            ]}
          />

          {/* Enhanced Search Input */}
          <div className="mb-8">
            <div className="relative">
              <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pokemon, cards..."
                aria-label="Search Pokemon and TCG cards"
                className="w-full min-h-[56px] pl-11 pr-14 py-4 text-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <IoClose className="w-5 h-5 text-stone-400" />
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {results.loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-500">Searching...</p>
            </div>
          )}

          {/* Empty State */}
          {showEmptyState && (
            <Container variant="default" className="text-center py-12">
              <p className="text-stone-500">No results found for &quot;{debouncedQuery}&quot;</p>
              <p className="text-sm text-stone-400 mt-2">Try a different search term</p>
            </Container>
          )}

          {/* Results */}
          {!results.loading && hasResults && (
            <div className="space-y-8">
              {/* Pokemon Results */}
              {results.pokemon.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4">
                    Pokemon ({results.pokemon.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.pokemon.map((pokemon) => (
                      <PokemonResultCard key={pokemon.name} pokemon={pokemon} />
                    ))}
                  </div>
                </div>
              )}

              {/* Card Results */}
              {results.cards.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-200 mb-4">
                    TCG Cards ({results.cards.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.cards.map((card) => (
                      <CardResultItem key={card.id} card={card} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!debouncedQuery && (
            <Container variant="default" className="text-center py-12">
              <p className="text-stone-500">Start typing to search</p>
            </Container>
          )}
        </div>
      </FullBleedWrapper>
    </>
  );
};

// Tell layout to use full bleed
(SearchPage as any).fullBleed = true;

export default SearchPage;
