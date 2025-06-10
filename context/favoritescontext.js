import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  // Initialize from localStorage if available
  const [favorites, setFavorites] = useState({
    pokemon: [],
    cards: []
  });
  
  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Could not parse saved favorites:", error);
      }
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Toggle a Pokémon as favorite with improved handling
  const togglePokemonFavorite = (pokemonId) => {
    if (!pokemonId) return; // Guard against invalid IDs
    
    // Normalize the ID to string for consistent comparison
    const normalizedId = String(pokemonId);
    
    setFavorites(prev => {
      const newPokemonFavorites = prev.pokemon.includes(normalizedId)
        ? prev.pokemon.filter(id => id !== normalizedId)
        : [...prev.pokemon, normalizedId];
      
      return {
        ...prev,
        pokemon: newPokemonFavorites
      };
    });
    
    // Return a success indicator that can be used by components
    return true;
  };

  // Toggle a card as favorite
  const toggleCardFavorite = (cardId) => {
    setFavorites(prev => {
      const newCardFavorites = prev.cards.includes(cardId)
        ? prev.cards.filter(id => id !== cardId)
        : [...prev.cards, cardId];
      
      return {
        ...prev,
        cards: newCardFavorites
      };
    });
  };

  // Check if a Pokémon is favorited with improved type handling
  const isPokemonFavorite = (pokemonId) => {
    if (!pokemonId) return false;
    return favorites.pokemon.includes(String(pokemonId));
  };
  
  // Check if a card is favorited
  const isCardFavorite = (cardId) => favorites.cards.includes(cardId);

  return (
    <FavoritesContext.Provider value={{ 
      favorites,
      togglePokemonFavorite,
      toggleCardFavorite,
      isPokemonFavorite,
      isCardFavorite
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
