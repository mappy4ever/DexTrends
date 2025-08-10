import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FaHeart, FaRegHeart, FaShare, FaArrowUp } from 'react-icons/fa';
import { CircularButton } from '../ui/design-system';
import { useFavorites } from '../../context/UnifiedAppContext';
import ShareMenu from '../ui/ShareMenu';
import { sharePokemon } from '../../utils/shareUtils';
import type { Pokemon } from "../../types/api/pokemon";
import type { FavoritePokemon } from "../../context/modules/types";

interface FloatingActionBarProps {
  pokemon: Pokemon;
  className?: string;
}

const FloatingActionBar: React.FC<FloatingActionBarProps> = ({
  pokemon,
  className
}) => {
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Check if favorited
  const isFavorite = favorites.pokemon.some((p: FavoritePokemon) => p.id === pokemon.id);
  
  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <motion.div
      className={cn(
        "fixed z-40",
        "flex flex-col gap-3",
        // Safe zones: avoid mobile browser UI and other elements
        "bottom-4 md:bottom-6 right-4 md:right-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      // Add container boundaries
      style={{
        maxHeight: 'calc(100vh - 120px)', // Leave space for header/footer
        maxWidth: 'calc(100vw - 32px)' // Prevent overflow
      }}
    >
      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <CircularButton
              size="icon"
              variant="secondary"
              onClick={scrollToTop}
              className="shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
              title="Scroll to top"
            >
              <FaArrowUp />
            </CircularButton>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Share button */}
      <ShareMenu
        onShare={(method) => sharePokemon(pokemon, method)}
        trigger={
          <CircularButton
            size="icon"
            variant="secondary"
            className="shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-800/90"
            title="Share Pokemon"
          >
            <FaShare />
          </CircularButton>
        }
      />
      
      {/* Favorite button */}
      <CircularButton
        size="icon"
        variant={isFavorite ? 'primary' : 'secondary'}
        onClick={() => {
          if (isFavorite) {
            removeFromFavorites('pokemon', pokemon.id);
          } else {
            const favoritePokemon: FavoritePokemon = {
              id: typeof pokemon.id === 'string' ? parseInt(pokemon.id) : pokemon.id,
              name: pokemon.name,
              types: pokemon.types?.map(t => t.type.name),
              sprite: pokemon.sprites?.front_default || undefined,
              addedAt: Date.now()
            };
            addToFavorites('pokemon', favoritePokemon);
          }
        }}
        className={cn(
          "shadow-lg backdrop-blur-sm",
          isFavorite 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-white/90 dark:bg-gray-800/90"
        )}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? <FaHeart className="text-white" /> : <FaRegHeart />}
      </CircularButton>
    </motion.div>
  );
};

export default FloatingActionBar;