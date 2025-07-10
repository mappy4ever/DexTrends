import { useState, useEffect } from 'react';
import { bulbapediaApi } from '../utils/bulbapediaApi';

// Custom hook for fetching Bulbapedia data
export const useBulbapedia = () => {
  // Generic fetch function
  const fetchData = async (fetchFunction) => {
    try {
      const data = await fetchFunction();
      return { data, error: null };
    } catch (error) {
      console.error('Bulbapedia fetch error:', error);
      return { data: null, error: error.message };
    }
  };

  // Search Bulbapedia
  const search = async (query, options) => {
    return fetchData(() => bulbapediaApi.search(query, options));
  };

  // Get page content
  const getPage = async (title) => {
    return fetchData(() => bulbapediaApi.getPageContent(title));
  };

  // Get images from a page
  const getImages = async (pageTitle) => {
    return fetchData(() => bulbapediaApi.getPageImages(pageTitle));
  };

  // Get category members
  const getCategoryMembers = async (category, options) => {
    return fetchData(() => bulbapediaApi.getCategoryMembers(category, options));
  };

  // Get gym leader data
  const getGymLeader = async (name) => {
    return fetchData(() => bulbapediaApi.getGymLeaderData(name));
  };

  // Get TCG card data
  const getTCGCard = async (cardName) => {
    return fetchData(() => bulbapediaApi.getTCGCardData(cardName));
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
export const useBulbapediaQuery = (queryType, params, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bulbapedia = useBulbapedia();

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let result;
        
        switch (queryType) {
          case 'search':
            result = await bulbapedia.search(params.query, params.options);
            break;
          case 'page':
            result = await bulbapedia.getPage(params.title);
            break;
          case 'images':
            result = await bulbapedia.getImages(params.pageTitle);
            break;
          case 'category':
            result = await bulbapedia.getCategoryMembers(params.category, params.options);
            break;
          case 'gymLeader':
            result = await bulbapedia.getGymLeader(params.name);
            break;
          case 'tcgCard':
            result = await bulbapedia.getTCGCard(params.cardName);
            break;
          default:
            throw new Error(`Unknown query type: ${queryType}`);
        }

        if (!cancelled) {
          if (result.error) {
            setError(result.error);
          } else {
            setData(result.data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (options.enabled !== false) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [queryType, JSON.stringify(params), options.enabled]);

  return { data, loading, error, refetch: () => fetchData() };
};

// Example usage in a component:
/*
function GymLeaderComponent({ leaderName }) {
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