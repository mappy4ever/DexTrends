import React, { createContext, useState, useContext, useEffect } from 'react';
import { FavoritesManager } from '../lib/supabase';
import logger from '../utils/logger';

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
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // First, try to migrate any existing localStorage favorites
      await FavoritesManager.migrateLocalStorageFavorites();
      
      // Then load from Supabase
      const supabaseFavorites = await FavoritesManager.getFavorites(userId);
      setFavorites(supabaseFavorites);
    } catch (error) {
      // Handle loading error by falling back to localStorage
      
      // Fallback to localStorage if Supabase fails
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
          // Invalid saved favorites, use defaults
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle a Pokémon as favorite with Supabase integration
  const togglePokemonFavorite = async (pokemonData) => {
    if (!pokemonData || !pokemonData.id) return false;
    
    const normalizedId = String(pokemonData.id);
    const isCurrentlyFavorite = favorites.pokemon.some(p => p.id === normalizedId);
    
    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const success = await FavoritesManager.removeFavorite('pokemon', normalizedId, userId);
        if (success) {
          setFavorites(prev => ({
            ...prev,
            pokemon: prev.pokemon.filter(p => p.id !== normalizedId)
          }));
          
          // Trigger notification if available
          if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('success', `${pokemonData.name} removed from favorites`);
          }
        }
        return success;
      } else {
        // Add to favorites
        const success = await FavoritesManager.addFavorite('pokemon', normalizedId, pokemonData, userId);
        if (success) {
          setFavorites(prev => ({
            ...prev,
            pokemon: [...prev.pokemon, { id: normalizedId, ...pokemonData }]
          }));
          
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
        return success;
      }
    } catch (error) {
      logger.error('Failed to toggle Pokemon favorite', { error, pokemonId: normalizedId });
      
      // Show error notification if available
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification('error', 'Failed to update favorites. Please try again.');
      }
      return false;
    }
  };

  // Toggle a card as favorite with Supabase integration
  const toggleCardFavorite = async (cardData) => {
    if (!cardData || !cardData.id) return false;
    
    const cardId = String(cardData.id);
    const isCurrentlyFavorite = favorites.cards.some(c => c.id === cardId);
    
    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const success = await FavoritesManager.removeFavorite('card', cardId, userId);
        if (success) {
          setFavorites(prev => ({
            ...prev,
            cards: prev.cards.filter(c => c.id !== cardId)
          }));
          
          // Trigger notification if available
          if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('success', `${cardData.name} removed from favorites`);
          }
        }
        return success;
      } else {
        // Add to favorites
        const success = await FavoritesManager.addFavorite('card', cardId, cardData, userId);
        if (success) {
          setFavorites(prev => ({
            ...prev,
            cards: [...prev.cards, { id: cardId, ...cardData }]
          }));
          
          // Trigger notification if available
          if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('cardAdded', cardData.name);
          }
        }
        return success;
      }
    } catch (error) {
      logger.error('Failed to toggle card favorite', { error, cardId });
      
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
