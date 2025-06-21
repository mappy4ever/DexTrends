import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsHeart, BsSearch, BsCardList, BsGrid, BsBook } from "react-icons/bs";
import { GiPokerHand, GiCardPickup } from "react-icons/gi";
import GlobalSearchModal from "./GlobalSearchModal";
import { useTheme } from "../context/themecontext";
import { useFavorites } from "../context/favoritescontext";
import Image from "next/image";
import { toLowercaseUrl } from "../utils/formatters";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { favorites } = useFavorites();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuWrapperRef = useRef(null);
  const router = useRouter();
  const searchModalRef = useRef();
  
  // Count total favorites
  const totalFavorites = favorites ? 
    (favorites.pokemon ? favorites.pokemon.length : 0) + 
    (favorites.cards ? favorites.cards.length : 0) : 0;

  // DexTrends Pokémon-themed navigation
  const navItems = [
    { href: "/", label: "Home", icon: <BsGrid size={22} />, color: "text-pokeball-red" },
    { href: "/tcgsets", label: "TCG Sets", icon: <BsCardList size={22} />, color: "text-greatball-blue" },
    { href: "/collections", label: "Collections", icon: <BsHeart size={22} />, color: "text-poke-psychic" },
    { href: "/leaderboard", label: "Leaderboard", icon: <BsGrid size={22} />, color: "text-ultraball-yellow" },
    { href: "/pokedex", label: "Pokédex", icon: <BsBook size={22} />, color: "text-poke-fairy" },
    { href: "/pocketmode", label: "Pocket Mode", icon: <GiCardPickup size={22} />, color: "text-poke-electric" },
  ];

  const pageTitles = navItems.reduce((acc, item) => {
    acc[item.href] = item.label;
    return acc;
  }, { "/": "Dashboard" }); // Ensure root path has a title

  const currentTitle = pageTitles[router.pathname] || "DexTrends"; // Updated title

  // Click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileOpen && menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        const mobileToggle = document.getElementById("mobile-menu-button");
        if (mobileToggle && mobileToggle.contains(event.target)) {
            return; // Don't close if clicking the toggle button itself
        }
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const isDarkMode = theme === 'dark';

  return (
    <>
      {/* Clean Navbar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-16 z-40 bg-white border-b border-border-color shadow-sm">
        <Link href="/" className="flex items-center gap-x-3 text-xl font-bold text-pokemon-red overflow-hidden hover:opacity-80 transition-opacity duration-300">
          <div className="flex-shrink-0 w-8 h-8 bg-pokemon-red rounded-full flex items-center justify-center">
            <BsGrid size={20} className="text-white" />
          </div>
          <span className="truncate">
            DexTrends
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-x-2">
          {navItems.map(item => (
            <Link
              key={`topnav-${item.href}`}
              href={item.href}
              className={`group flex items-center gap-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer border-2
                ${router.pathname === item.href
                  ? 'bg-pokemon-red text-white border-pokemon-red shadow-md'
                  : 'text-dark-text border-transparent hover:border-border-color hover:bg-light-grey'}`}
              style={{ pointerEvents: 'auto' }}
            >
              <span className={`flex-shrink-0 w-5 h-5 transition-colors duration-300 ${router.pathname === item.href ? 'text-white' : 'text-pokemon-red'}`}>
                {item.icon}
              </span>
              <span className="truncate text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-x-3">
          <button
            aria-label="Open global search"
            title="Search (Cmd+K)"
            className="p-3 rounded-lg bg-pokemon-blue text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-blue shadow-sm transition-all duration-300"
            onClick={() => searchModalRef.current?.open()}
          >
            <BsSearch size={18} />
          </button>
          
          <Link href="/favorites" legacyBehavior>
            <a
              aria-label="View favorites"
              title="View favorites"
              className="relative p-3 rounded-lg bg-pokemon-yellow text-white hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-yellow shadow-sm transition-all duration-300"
              data-is-navbar="true"
            >
              <BsHeart size={18} />
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 bg-pokemon-red text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-sm">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </a>
          </Link>
          
          <button
            aria-label={theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            title={theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            className="p-3 rounded-lg border border-border-color bg-white text-dark-text hover:bg-light-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-blue shadow-sm transition-all duration-300"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? 
              <BsSun size={18} className="text-pokemon-yellow" /> : 
              <BsMoon size={18} className="text-pokemon-blue" />
            }
          </button>
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-3 rounded-lg bg-pokemon-red text-white hover:bg-red-700 shadow-sm transition-all duration-300 touch-manipulation"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-1' : ''}`} />
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <div className={`w-full h-0.5 bg-white transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-1' : ''}`} />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div 
            ref={menuWrapperRef}
            className="fixed top-16 right-0 left-0 bg-white/95 backdrop-blur-sm border-t border-border-color p-4 shadow-lg"
          >
            <nav className="flex flex-col space-y-2">
              {navItems.map(item => (
                <Link
                  key={`mobile-${item.href}`}
                  href={item.href}
                  className={`flex items-center gap-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 border-2 touch-manipulation
                    ${router.pathname === item.href
                      ? 'bg-pokemon-red text-white border-pokemon-red'
                      : 'text-dark-text border-transparent hover:border-border-color hover:bg-light-grey'}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ minHeight: '48px' }}
                >
                  <span className={`flex-shrink-0 w-6 h-6 ${router.pathname === item.href ? 'text-white' : 'text-pokemon-red'}`}>
                    {item.icon}
                  </span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
      
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      <GlobalSearchModal ref={searchModalRef} />
    </>
  );
}