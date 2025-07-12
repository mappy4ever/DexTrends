import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // Initialize favorites state
  const [favorites, setFavorites] = useState({
    pokemon: [],
    cards: [],
    decks: []
  });
  
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null); // For future auth integration
  
  // Load favorites on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadFavorites();
    }
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // For now, just use localStorage
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);
          setFavorites({
            pokemon: parsed.pokemon || [],
            cards: parsed.cards || [],
            decks: parsed.decks || []
          });
        } catch (parseError) {
          console.warn('Failed to parse saved favorites');
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save favorites to localStorage
  const saveFavoritesToStorage = (newFavorites) => {
    try {
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return true;
    } catch (error) {
      console.error('Failed to save favorites:', error);
      return false;
    }
  };

  // Toggle a Pokémon as favorite
  const togglePokemonFavorite = async (pokemonData) => {
    if (!pokemonData || !pokemonData.id) return false;
    
    const normalizedId = String(pokemonData.id);
    const isCurrentlyFavorite = favorites.pokemon.some(p => p.id === normalizedId);
    
    try {
      let newFavorites;
      if (isCurrentlyFavorite) {
        // Remove from favorites
        newFavorites = {
          ...favorites,
          pokemon: favorites.pokemon.filter(p => p.id !== normalizedId)
        };
        
        // Trigger notification if available
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('success', `${pokemonData.name} removed from favorites`);
        }
      } else {
        // Add to favorites
        newFavorites = {
          ...favorites,
          pokemon: [...favorites.pokemon, { id: normalizedId, ...pokemonData }]
        };
        
        // Trigger notification if available
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('success', `${pokemonData.name} added to favorites!`, {
            actions: [
              {
                label: 'View Favorites',
                handler: () => {
                  window.location.href = '/favorites';
                }
              }
            ]
          });
        }
      }
      
      setFavorites(newFavorites);
      return saveFavoritesToStorage(newFavorites);
    } catch (error) {
      console.error('Failed to toggle Pokemon favorite:', error);
      
      // Show error notification if available
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification('error', 'Failed to update favorites. Please try again.');
      }
      return false;
    }
  };

  // Toggle a card as favorite
  const toggleCardFavorite = async (cardData) => {
    if (!cardData || !cardData.id) return false;
    
    const cardId = String(cardData.id);
    const isCurrentlyFavorite = favorites.cards.some(c => c.id === cardId);
    
    try {
      let newFavorites;
      if (isCurrentlyFavorite) {
        // Remove from favorites
        newFavorites = {
          ...favorites,
          cards: favorites.cards.filter(c => c.id !== cardId)
        };
        
        // Trigger notification if available
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('success', `${cardData.name} removed from favorites`);
        }
      } else {
        // Add to favorites
        newFavorites = {
          ...favorites,
          cards: [...favorites.cards, { id: cardId, ...cardData }]
        };
        
        // Trigger notification if available
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('cardAdded', cardData.name);
        }
      }
      
      setFavorites(newFavorites);
      return saveFavoritesToStorage(newFavorites);
    } catch (error) {
      console.error('Failed to toggle card favorite:', error);
      
      // Show error notification if available
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification('error', 'Failed to update favorites. Please try again.');
      }
      return false;
    }
  };

  // Check if a Pokémon is favorited
  const isPokemonFavorite = (pokemonId) => {
    if (!pokemonId) return false;
    return favorites.pokemon.some(p => p.id === String(pokemonId));
  };
  
  // Check if a card is favorited
  const isCardFavorite = (cardId) => {
    if (!cardId) return false;
    return favorites.cards.some(c => c.id === String(cardId));
  };

  return (
    <FavoritesContext.Provider value={{ 
      favorites,
      loading,
      togglePokemonFavorite,
      toggleCardFavorite,
      isPokemonFavorite,
      isCardFavorite,
      loadFavorites,
      setUserId // For future auth integration
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
