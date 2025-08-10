import { useState, useEffect, useCallback } from 'react';
import { bulbapediaApi } from '../utils/bulbapediaApi';
import logger from '../utils/logger';

// Types for Bulbapedia data
interface BulbapediaSearchOptions {
  limit?: number;
  offset?: number;
  namespace?: number;
}

interface BulbapediaCategoryOptions {
  limit?: number;
  continue?: string;
}

interface BulbapediaResult<T> {
  data: T | null;
  error: string | null;
}

interface GymLeaderData {
  name: string;
  image?: string;
  type?: string;
  badge?: string;
  quote?: string;
}

interface TCGCardData {
  name: string;
  set?: string;
  number?: string;
  rarity?: string;
  artist?: string;
  image?: string;
}

type QueryType = 'search' | 'page' | 'images' | 'category' | 'gymLeader' | 'tcgCard';

interface QueryParams {
  // For search
  query?: string;
  options?: BulbapediaSearchOptions;
  // For page
  title?: string;
  // For images
  pageTitle?: string;
  // For category
  category?: string;
  categoryOptions?: BulbapediaCategoryOptions;
  // For gym leader
  name?: string;
  // For TCG card
  cardName?: string;
}

interface UseBulbapediaQueryOptions {
  enabled?: boolean;
}

// Custom hook for fetching Bulbapedia data
export const useBulbapedia = () => {
  // Generic fetch function
  const fetchData = async <T,>(fetchFunction: () => Promise<T>): Promise<BulbapediaResult<T>> => {
    try {
      const data = await fetchFunction();
      return { data, error: null };
    } catch (error) {
      logger.error('Bulbapedia fetch error:', { error });
      return { data: null, error: (error as Error).message };
    }
  };

  // Search Bulbapedia
  const search = async (query: string, options?: BulbapediaSearchOptions) => {
    return fetchData(() => bulbapediaApi.search(query, options));
  };

  // Get page content
  const getPage = async (title: string) => {
    return fetchData(() => bulbapediaApi.getPageContent(title));
  };

  // Get images from a page
  const getImages = async (pageTitle: string) => {
    return fetchData(() => bulbapediaApi.getPageImages(pageTitle));
  };

  // Get category members
  const getCategoryMembers = async (category: string, options?: BulbapediaCategoryOptions) => {
    return fetchData(() => bulbapediaApi.getCategoryMembers(category, options));
  };

  // Get gym leader data
  const getGymLeader = async (name: string) => {
    return fetchData<GymLeaderData | null>(() => bulbapediaApi.getGymLeaderData(name));
  };

  // Get TCG card data
  const getTCGCard = async (cardName: string) => {
    return fetchData<TCGCardData | null>(() => bulbapediaApi.getTCGCardData(cardName));
  };

  return {
    search,
    getPage,
    getImages,
    getCategoryMembers,
    getGymLeader,
    getTCGCard
  };
};

// Hook for auto-fetching data with loading state
export const useBulbapediaQuery = (
  queryType: QueryType, 
  params: QueryParams, 
  options: UseBulbapediaQueryOptions = {}
) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bulbapedia = useBulbapedia();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result: BulbapediaResult<any>;
      
      switch (queryType) {
        case 'search':
          if (!params.query) throw new Error('Query is required for search');
          result = await bulbapedia.search(params.query, params.options);
          break;
        case 'page':
          if (!params.title) throw new Error('Title is required for page fetch');
          result = await bulbapedia.getPage(params.title);
          break;
        case 'images':
          if (!params.pageTitle) throw new Error('Page title is required for images fetch');
          result = await bulbapedia.getImages(params.pageTitle);
          break;
        case 'category':
          if (!params.category) throw new Error('Category is required for category fetch');
          result = await bulbapedia.getCategoryMembers(params.category, params.categoryOptions);
          break;
        case 'gymLeader':
          if (!params.name) throw new Error('Name is required for gym leader fetch');
          result = await bulbapedia.getGymLeader(params.name);
          break;
        case 'tcgCard':
          if (!params.cardName) throw new Error('Card name is required for TCG card fetch');
          result = await bulbapedia.getTCGCard(params.cardName);
          break;
        default:
          throw new Error(`Unknown query type: ${queryType}`);
      }

      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [queryType, params, bulbapedia]);

  useEffect(() => {
    let cancelled = false;

    const runFetch = async () => {
      if (!cancelled && options.enabled !== false) {
        await fetchData();
      }
    };

    runFetch();

    return () => {
      cancelled = true;
    };
  }, [fetchData, options.enabled]);

  return { data, loading, error, refetch: fetchData };
};

// Example usage in a component:
/*
function GymLeaderComponent({ leaderName }: { leaderName: string }) {
  const { data, loading, error } = useBulbapediaQuery('gymLeader', { name: leaderName });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div>
      <h2>{data.name}</h2>
      {data.image && <img src={data.image} alt={data.name} />}
      <p>Type: {data.type}</p>
      <p>Badge: {data.badge}</p>
      <p>Quote: {data.quote}</p>
    </div>
  );
}
*/