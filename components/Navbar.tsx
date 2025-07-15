import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import Image from 'next/image';
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsHeart, BsSearch, BsCardList, BsGrid, BsBook, BsChevronDown } from "react-icons/bs";
import { GiPokerHand, GiCardPickup, GiCrossedSwords } from "react-icons/gi";
import { FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import GlobalSearchModal from "./GlobalSearchModal";
import { useAppContext, useTheme, useFavorites } from "../context/UnifiedAppContext";
import { toLowercaseUrl } from "../utils/formatters";
import ClientOnly from "./ClientOnly";

// Type definitions for navigation
interface DropdownItem {
  href: string;
  label: string;
  icon: ReactNode;
  description: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  color?: string;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

interface GlobalSearchModalHandle {
  open: () => void;
}

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useAppContext();
  const { favorites } = useFavorites();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const menuWrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement>>({});
  const router = useRouter();
  const searchModalRef = useRef<GlobalSearchModalHandle>(null);
  
  // Count total favorites
  const totalFavorites = favorites ? 
    (favorites.pokemon ? favorites.pokemon.length : 0) + 
    (favorites.cards ? favorites.cards.length : 0) : 0;

  // DexTrends Pokémon-themed navigation with dropdown structure
  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: <BsGrid size={22} />, color: "text-pokeball-red" },
    { 
      href: "/tcgsets", 
      label: "Pokémon TCG", 
      icon: <BsCardList size={22} />, 
      color: "text-greatball-blue",
      hasDropdown: true,
      dropdownItems: [
        { href: "/tcgsets", label: "Sets", icon: <BsCardList size={18} />, description: "Browse all TCG sets" },
        { href: "/trending", label: "Price Tracker", icon: <FiTrendingUp size={18} />, description: "Track card prices" },
        { href: "/collections", label: "Collections", icon: <BsHeart size={18} />, description: "Manage your collection" },
      ]
    },
    { href: "/pokedex", label: "Pokédex", icon: <BsBook size={22} />, color: "text-poke-fairy" },
    {
      href: "/pokemon",
      label: "Pokémon",
      icon: <BsGlobeEuropeAfrica size={22} />,
      color: "text-poke-grass",
      hasDropdown: true,
      dropdownItems: [
        { href: "/pokemon/regions", label: "Regions", icon: <BsGlobeEuropeAfrica size={18} />, description: "Explore all regions" },
        { href: "/pokemon/starters", label: "Starters", icon: <GiPokerHand size={18} />, description: "Regional starter Pokémon" },
        { href: "/pokemon/moves", label: "Moves & TMs", icon: <BsBook size={18} />, description: "Complete moves database" },
        { href: "/pokemon/games", label: "Games", icon: <GiCardPickup size={18} />, description: "All Pokémon games" },
        { href: "/pokemon/items", label: "Items", icon: <FiShoppingBag size={18} />, description: "Items and their effects" },
        { href: "/pokemon/abilities", label: "Abilities", icon: <AiOutlineBulb size={18} />, description: "Pokémon abilities list" },
      ]
    },
    {
      href: "/battle-simulator",
      label: "Battle",
      icon: <GiCrossedSwords size={22} />,
      color: "text-poke-fighting",
      hasDropdown: true,
      dropdownItems: [
        { href: "/battle-simulator", label: "Battle Simulator", icon: <GiCrossedSwords size={18} />, description: "Simulate Pokemon battles" },
        { href: "/battle-simulator/team-builder", label: "Team Builder", icon: <BsGrid size={18} />, description: "Build competitive teams" },
        { href: "/battle-simulator/damage-calc", label: "Damage Calculator", icon: <FiTrendingUp size={18} />, description: "Calculate move damage" },
        { href: "/type-effectiveness", label: "Type Effectiveness", icon: <BsBook size={18} />, description: "Interactive type chart" },
      ]
    },
    { 
      href: "/pocketmode", 
      label: "Pocket", 
      icon: <GiCardPickup size={22} />, 
      color: "text-poke-electric",
      hasDropdown: true,
      dropdownItems: [
        { href: "/pocketmode", label: "Cards", icon: <BsCardList size={18} />, description: "Browse Pocket cards" },
        { href: "/pocketmode/expansions", label: "Expansions", icon: <BsGrid size={18} />, description: "Browse expansion sets" },
        { href: "/pocketmode/packs", label: "Pack Opening", icon: <FiShoppingBag size={18} />, description: "Open virtual packs" },
        { href: "/pocketmode/decks", label: "Top Decks", icon: <BsBook size={18} />, description: "Popular deck builds" },
        { href: "/pocketmode/deckbuilder", label: "Deck Builder", icon: <GiPokerHand size={18} />, description: "Build custom decks" },
      ]
    },
    { href: "/fun", label: "Fun", icon: <AiOutlineBulb size={22} />, color: "text-poke-psychic" },
  ];

  const pageTitles = navItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.href] = item.label;
    return acc;
  }, { "/": "Dashboard" }); // Ensure root path has a title

  const currentTitle = pageTitles[router.pathname] || "DexTrends"; // Updated title

  // Simple dropdown toggle
  const handleDropdownToggle = (itemHref: string) => {
    setDropdownStates(prev => {
      const newState: Record<string, boolean> = {};
      // Close all other dropdowns
      Object.keys(prev).forEach(key => {
        newState[key] = key === itemHref ? !prev[key] : false;
      });
      return newState;
    });
  };

  // Click outside for mobile menu and dropdowns
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking inside any dropdown
      const clickedInsideDropdown = (event.target as HTMLElement).closest('.absolute.top-full');
      if (clickedInsideDropdown) {
        return;
      }

      // Don't close if clicking on a dropdown toggle button
      const clickedToggle = (event.target as HTMLElement).closest('button[type="button"]');
      if (clickedToggle && clickedToggle.querySelector('.transition-transform')) {
        return;
      }

      if (mobileOpen && menuWrapperRef.current && !menuWrapperRef.current.contains(event.target as Node)) {
        const mobileToggle = document.getElementById("mobile-menu-button");
        if (mobileToggle && mobileToggle.contains(event.target as Node)) {
            return;
        }
        setMobileOpen(false);
      }
      
      // Close all dropdowns
      setDropdownStates({});
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileOpen]);

  // Remove unused variable that causes hydration issues
  // const isDarkMode = theme === 'dark';

  return (
    <>
      {/* Redesigned Navbar with Gradient Glass Effect */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 md:px-6 h-20 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg safe-area-padding-top navbar-ios">
        <Link
          href="/"
          className="flex items-center gap-x-3 text-xl font-bold overflow-hidden group"
        >
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pokemon-red to-pink-500 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
            <BsGrid size={24} className="text-white" />
          </div>
          <span className="truncate bg-gradient-to-r from-pokemon-red to-pink-600 bg-clip-text text-transparent font-extrabold text-2xl">
            DexTrends
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-x-3">
          {navItems.map(item => {
            const isActive = router.pathname === item.href || 
              (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));
            
            if (item.hasDropdown) {
              return (
                <div key={`topnav-${item.href}`} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-2 px-5 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer
                      ${isActive
                        ? 'bg-gradient-to-r from-pokemon-red to-pink-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-pink-200 dark:hover:border-pink-700 hover:shadow-lg hover:scale-105 hover:text-red-700 dark:hover:text-red-300'}`}
                    onMouseEnter={() => {
                      // Close all other dropdowns first, then open this one
                      setDropdownStates({ [item.href]: true });
                    }}
                    onMouseLeave={(e) => {
                      // Check if we're moving to the dropdown menu
                      const relatedTarget = e.relatedTarget as HTMLElement;
                      const isMovingToDropdown = relatedTarget && (
                        relatedTarget.closest('.dropdown-menu') || 
                        relatedTarget.closest('.invisible-bridge')
                      );
                      
                      if (!isMovingToDropdown) {
                        // Small delay to allow moving to dropdown
                        setTimeout(() => {
                          setDropdownStates(prev => ({ ...prev, [item.href]: false }));
                        }, 100);
                      }
                    }}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : item.color || 'text-gray-600'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate text-sm font-semibold">{item.label}</span>
                    <BsChevronDown className={`w-3 h-3 transition-transform duration-300 ${dropdownStates[item.href] ? 'rotate-180' : ''} ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  </Link>
                  
                  {/* Invisible bridge to prevent gap */}
                  {dropdownStates[item.href] && (
                    <div className="invisible-bridge absolute top-full left-0 w-full h-3" />
                  )}
                  
                  {/* Dropdown menu - redesigned with glass effect */}
                  <div 
                    className={`dropdown-menu absolute top-full left-0 mt-1 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-2xl overflow-hidden ${
                      dropdownStates[item.href] ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-2'
                    } transition-all duration-300`}
                    style={{
                      zIndex: 9999,
                      pointerEvents: dropdownStates[item.href] ? 'auto' : 'none'
                    }}
                    onMouseEnter={() => {
                      // Keep only this dropdown open when hovering over it
                      setDropdownStates({ [item.href]: true });
                    }}
                    onMouseLeave={() => {
                      // Close dropdown immediately when leaving
                      setDropdownStates({});
                    }}
                  >
                    <div className="p-3">
                      {item.dropdownItems!.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={`dropdown-${item.href}-${dropdownIndex}`}
                          href={dropdownItem.href}
                          className={`group flex items-start gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                            router.pathname === dropdownItem.href 
                              ? 'bg-gradient-to-r from-pokemon-red/20 to-pink-500/20 border border-pokemon-red/30' 
                              : 'hover:bg-gradient-to-r hover:from-red-50/80 hover:to-pink-50/80 hover:shadow-md hover:scale-[1.02]'
                          }`}
                          onClick={() => {
                            console.log('Link clicked:', dropdownItem.href);
                            setDropdownStates({});
                          }}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 p-1 rounded-lg mt-0.5 ${
                            router.pathname === dropdownItem.href 
                              ? 'bg-gradient-to-br from-pokemon-red to-pink-500 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gradient-to-br group-hover:from-pokemon-red/80 group-hover:to-pink-500/80 group-hover:text-white'
                          } transition-all duration-300`}>
                            {dropdownItem.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                              {dropdownItem.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {dropdownItem.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <Link key={`topnav-${item.href}`}
                href={item.href}
                className={`group flex items-center gap-x-2 px-5 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer
                  ${isActive
                    ? 'bg-gradient-to-r from-pokemon-red to-pink-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:border-pink-200 dark:hover:border-pink-700 hover:shadow-lg hover:scale-105 hover:text-red-700 dark:hover:text-red-300'}`}
                style={{ pointerEvents: 'auto' }}
              >
                <span className={`flex-shrink-0 w-5 h-5 transition-all duration-300 ${isActive ? 'text-white' : item.color || 'text-gray-600'} group-hover:scale-110`}>
                  {item.icon}
                </span>
                <span className="truncate text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-x-3">
          <button
            aria-label="Open global search"
            title="Search (Cmd+K)"
            className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => searchModalRef.current?.open()}
          >
            <BsSearch size={20} />
          </button>
          
          <Link 
            href="/favorites"
            aria-label="View favorites"
            title="View favorites"
            className="relative p-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-is-navbar="true"
          >
            <BsHeart size={20} />
            <ClientOnly>
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 bg-pokemon-red text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-sm">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </ClientOnly>
          </Link>
          
          <button
            aria-label={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            title={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            className="p-3 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white/80 hover:border-gray-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300/50 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            onClick={toggleTheme}
          >
            <ClientOnly>
              {theme === 'dark' ? 
                <BsSun size={20} className="text-yellow-500" /> : 
                <BsMoon size={20} className="text-blue-600" />
              }
            </ClientOnly>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-3 rounded-full bg-gradient-to-r from-pokemon-red to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 touch-manipulation transform active:scale-95"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            style={{ minHeight: '48px', minWidth: '48px' }}
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-white transition-all duration-300${mounted && mobileOpen ? ' rotate-45 translate-y-1' : ''}`} />
              <div className={`w-full h-0.5 bg-white transition-all duration-300${mounted && mobileOpen ? ' opacity-0' : ''}`} />
              <div className={`w-full h-0.5 bg-white transition-all duration-300${mounted && mobileOpen ? ' -rotate-45 -translate-y-1' : ''}`} />
            </div>
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      <ClientOnly>
        {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div ref={menuWrapperRef} className="fixed right-0 left-0 bg-white/98 backdrop-blur-xl border-t border-white/30 p-6 shadow-2xl safe-area-padding-x rounded-t-3xl" style={{ top: 'calc(80px + env(safe-area-inset-top))' }}>
            <nav className="flex flex-col space-y-2">
              {navItems.map(item => {
                const isActive = router.pathname === item.href || 
                  (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));
                
                if (item.hasDropdown) {
                  return (
                    <div key={`mobile-${item.href}`} className="space-y-1">
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 px-5 py-4 rounded-2xl font-medium touch-manipulation transition-all duration-300
                          ${isActive
                            ? 'bg-gradient-to-r from-pokemon-red to-pink-500 text-white shadow-lg'
                            : 'text-gray-700 bg-gray-100/80 hover:bg-gray-200/80'}`}
                        style={{ minHeight: '52px' }}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className={`flex-shrink-0 w-7 h-7 ${isActive ? 'text-white' : item.color || 'text-gray-600'}`}>
                          {item.icon}
                        </span>
                        <span className="font-semibold text-base">{item.label}</span>
                      </Link>
                      {/* Mobile dropdown items */}
                      <div className="pl-6 space-y-1">
                        {item.dropdownItems!.map((dropdownItem, dropdownIndex) => (
                          <Link key={`mobile-dropdown-${item.href}-${dropdownIndex}-${dropdownItem.href}`}
                            href={dropdownItem.href}
                            className={`flex items-center gap-x-3 px-5 py-3 rounded-xl font-medium transition-all duration-300 touch-manipulation
                              ${router.pathname === dropdownItem.href
                                ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-300/50'
                                : 'text-gray-600 hover:bg-gray-100/80'}`}
                            onClick={() => setMobileOpen(false)}
                            style={{ minHeight: '44px' }}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 ${router.pathname === dropdownItem.href ? 'text-blue-600' : 'text-gray-500'}`}>
                              {dropdownItem.icon}
                            </span>
                            <span className="font-medium text-sm">{dropdownItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <Link key={`mobile-${item.href}`}
                    href={item.href}
                    className={`flex items-center gap-x-3 px-5 py-4 rounded-2xl font-medium transition-all duration-300 touch-manipulation
                      ${isActive
                        ? 'bg-gradient-to-r from-pokemon-red to-pink-500 text-white shadow-lg'
                        : 'text-gray-700 bg-gray-100/80 hover:bg-gray-200/80'}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ minHeight: '52px' }}
                  >
                    <span className={`flex-shrink-0 w-7 h-7 ${isActive ? 'text-white' : item.color || 'text-gray-600'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      </ClientOnly>
      {/* Spacer for fixed navbar with iOS Safe Area */}
      <div className="h-20 navbar-spacer-ios" />
      <GlobalSearchModal ref={searchModalRef} />
    </>
  );
}