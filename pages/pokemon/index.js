import dynamic from 'next/dynamic';

// Dynamic import with loading state
const PokemonHub = dynamic(
  () => import('./index.client'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Pokémon Hub...</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR to prevent hydration issues
  }
);

export default PokemonHub;