import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { FaHeart, FaRegHeart, FaShare, FaArrowUp } from 'react-icons/fa';
import { CircularButton } from '../ui/design-system';
import { useFavorites } from '../../context/UnifiedAppContext';
import { useToast } from '../providers/ToastProvider';
import ShareMenu from '../ui/ShareMenu';
import { sharePokemon } from '../../utils/shareUtils';
import { useBottomNavigation, BOTTOM_NAV_HEIGHT } from '../ui/BottomNavigation';
import { Z_INDEX } from '../../hooks/useViewport';
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
  const toast = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { hasBottomNav } = useBottomNavigation();

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

  // Calculate bottom position: above BottomNav on mobile, normal on desktop
  const bottomPosition = hasBottomNav ? BOTTOM_NAV_HEIGHT + 16 : 24;

  return (
    <motion.div
      className={cn(
        "fixed",
        "flex flex-col gap-3",
        "right-4 md:right-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{
        zIndex: Z_INDEX.fab,
        bottom: bottomPosition,
        maxHeight: 'calc(100vh - 120px)',
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {/* Scroll to top button - solid bg for iOS */}
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
              className="shadow-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              title="Scroll to top"
            >
              <FaArrowUp />
            </CircularButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share button - solid bg for iOS */}
      <ShareMenu
        onShare={(method) => sharePokemon(pokemon, method)}
        trigger={
          <CircularButton
            size="icon"
            variant="secondary"
            className="shadow-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
            title="Share Pokemon"
          >
            <FaShare />
          </CircularButton>
        }
      />

      {/* Favorite button - solid bg for iOS */}
      <CircularButton
        size="icon"
        variant={isFavorite ? 'primary' : 'secondary'}
        onClick={() => {
          const pokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
          if (isFavorite) {
            removeFromFavorites('pokemon', pokemon.id);
            toast.info(`${pokemonName} removed from favorites`);
          } else {
            const favoritePokemon: FavoritePokemon = {
              id: typeof pokemon.id === 'string' ? parseInt(pokemon.id) : pokemon.id,
              name: pokemon.name,
              types: pokemon.types?.map(t => t.type.name),
              sprite: pokemon.sprites?.front_default || undefined,
              addedAt: Date.now()
            };
            addToFavorites('pokemon', favoritePokemon);
            toast.success(`${pokemonName} added to favorites!`);
          }
        }}
        className={cn(
          "shadow-lg",
          isFavorite
            ? "bg-red-500 hover:bg-red-600 border border-red-400"
            : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
        )}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorite ? <FaHeart className="text-white" /> : <FaRegHeart />}
      </CircularButton>
    </motion.div>
  );
};

export default FloatingActionBar;