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

  // Toggle a Pokémon as favorite
  const togglePokemonFavorite = (pokemonId) => {
    setFavorites(prev => {
      const newPokemonFavorites = prev.pokemon.includes(pokemonId)
        ? prev.pokemon.filter(id => id !== pokemonId)
        : [...prev.pokemon, pokemonId];
      
      return {
        ...prev,
        pokemon: newPokemonFavorites
      };
    });
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

  // Check if a Pokémon is favorited
  const isPokemonFavorite = (pokemonId) => favorites.pokemon.includes(pokemonId);
  
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
