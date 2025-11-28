import React, { useEffect, useRef } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import FullBleedWrapper from '@/components/ui/FullBleedWrapper';

// Dynamic import of GlobalSearchModal
const GlobalSearchModal = dynamic(() => import('@/components/GlobalSearchModal'), {
  ssr: false
});

interface GlobalSearchModalHandle {
  open: () => void;
}

const SearchPage: NextPage = () => {
  const router = useRouter();
  const searchModalRef = useRef<GlobalSearchModalHandle>(null);

  // Open search modal on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchModalRef.current?.open();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle modal close - navigate back
  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Search - DexTrends</title>
        <meta name="description" content="Search across all Pokémon data - Pokédex, TCG cards, moves, items, and more" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-4">
              Search DexTrends
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mb-8">
              Search across Pokédex, TCG cards, moves, items, abilities, and more
            </p>
            
            {/* Search button to reopen modal */}
            <button
              onClick={() => searchModalRef.current?.open()}
              className="inline-flex items-center justify-center px-6 py-3 
                       bg-amber-600 hover:bg-amber-700 text-white 
                       rounded-lg font-medium transition-colors duration-200
                       min-h-[44px] touch-target"
            >
              Open Search
            </button>

            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="block mx-auto mt-4 text-stone-600 dark:text-stone-400 
                       hover:text-amber-600 dark:hover:text-amber-400 
                       transition-colors duration-200 min-h-[44px] touch-target"
            >
              Go Back
            </button>
          </div>
        </div>
      </FullBleedWrapper>

      {/* Global Search Modal */}
      <GlobalSearchModal ref={searchModalRef} />
    </>
  );
};

// Tell layout to use full bleed
(SearchPage as any).fullBleed = true;

export default SearchPage;