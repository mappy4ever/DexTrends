import React, { useState } from 'react';
import { useBulbapediaQuery, useBulbapedia } from '../hooks/useBulbapedia';
import Image from 'next/image';
import logger from '@/utils/logger';

// Types for API responses
interface SearchResult {
  pageid: number;
  title: string;
  snippet: string;
}

interface ImageData {
  title: string;
  url: string;
  thumburl?: string;
}

interface PokemonTeamMember {
  name: string;
  level?: number;
}

interface GymLeaderData {
  name: string;
  image?: string;
  region?: string;
  type?: string;
  badge?: string;
  quote?: string;
  team?: PokemonTeamMember[];
}

interface CategoryItem {
  pageid: number;
  title: string;
}

// Example component showing how to use Bulbapedia API
export const BulbapediaSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const bulbapedia = useBulbapedia();
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setActiveSearch(searchTerm);
    
    const { data, error } = await bulbapedia.search(searchTerm, { limit: 10 });
    
    if (error) {
      logger.error('Search error:', { error });
      setResults(null);
    } else {
      setResults(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bulbapedia Search</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search Bulbapedia..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results && (
        <div className="space-y-2">
          <h3 className="font-bold">Results for "{activeSearch}":</h3>
          {results.map((result) => (
            <div key={result.pageid} className="p-3 border rounded-lg hover:bg-gray-50">
              <a
                href={`https://bulbapedia.bulbagarden.net/wiki/${result.title.replace(/ /g, '_')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                {result.title}
              </a>
              <p className="text-sm text-gray-600 mt-1">
                {result.snippet.replace(/<[^>]*>/g, '')}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface GymLeaderDisplayProps {
  leaderName: string;
}

// Component to display gym leader data fetched from Bulbapedia
export const GymLeaderDisplay: React.FC<GymLeaderDisplayProps> = ({ leaderName }) => {
  const { data, loading, error } = useBulbapediaQuery(
    'gymLeader',
    { name: leaderName }
  ) as { data: GymLeaderData | null; loading: boolean; error: string | null };

  if (loading) return <div className="animate-pulse">Loading gym leader data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data) return <div>No data found for {leaderName}</div>;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-4">
        {data.image && (
          <div className="relative w-24 h-24">
            <Image
              src={data.image}
              alt={data.name}
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="text-xl font-bold">{data.name}</h3>
          {data.region && <p className="text-gray-600">Region: {data.region}</p>}
          {data.type && <p className="text-gray-600">Type: {data.type}</p>}
          {data.badge && <p className="text-gray-600">Badge: {data.badge}</p>}
          {data.quote && <p className="italic mt-2">"{data.quote}"</p>}
        </div>
      </div>
      
      {data.team && data.team.length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold mb-2">Team:</h4>
          <div className="grid grid-cols-3 gap-2">
            {data.team.map((pokemon, idx) => (
              <div key={idx} className="text-center p-2 bg-gray-100 rounded">
                <p className="font-medium">{pokemon.name}</p>
                {pokemon.level && <p className="text-sm">Lv. {pokemon.level}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Component to fetch and display TCG rarity symbols
export const TCGRarityDisplay: React.FC = () => {
  const [rarities, setRarities] = useState<ImageData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const bulbapedia = useBulbapedia();

  const fetchRarities = async () => {
    setLoading(true);
    
    // Get rarity images
    const { data } = await bulbapedia.getImages('Rarity');
    
    if (data) {
      const rarityImages = data.filter((img: ImageData) => 
        img.title.includes('SetSymbol') || 
        img.title.includes('TCG Pocket')
      );
      setRarities(rarityImages);
    }
    
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">TCG Rarity Symbols</h2>
      
      <button
        onClick={fetchRarities}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Fetching...' : 'Fetch Rarity Symbols'}
      </button>
      
      {rarities && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {rarities.map((rarity) => (
            <div key={rarity.title} className="text-center p-4 border rounded-lg">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <Image
                  src={rarity.thumburl || rarity.url}
                  alt={rarity.title}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <p className="text-sm font-medium">
                {rarity.title.replace(/File:|\.png/gi, '').replace(/SetSymbol|TCG Pocket /gi, '')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoryBrowserProps {
  categoryName?: string;
}

// Component to browse Pokemon categories
export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ categoryName = "Generation I Pokémon" }) => {
  const { data, loading, error } = useBulbapediaQuery(
    'category',
    { category: categoryName, options: { limit: 20 } }
  ) as { data: CategoryItem[] | null; loading: boolean; error: string | null };

  if (loading) return <div className="animate-pulse">Loading category...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!data || data.length === 0) return <div>No items found in category</div>;

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">Category: {categoryName}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((item) => (
          <a
            key={item.pageid}
            href={`https://bulbapedia.bulbagarden.net/wiki/${item.title.replace(/ /g, '_')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 border rounded-lg hover:bg-gray-50 text-center"
          >
            <p className="font-medium text-sm">{item.title}</p>
          </a>
        ))}
      </div>
    </div>
  );
};