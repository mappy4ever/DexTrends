import { useEffect, useState, useRef, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsHeart, BsSearch, BsCardList, BsGrid, BsBook, BsChevronDown, BsPerson, BsPersonFill, BsQuestionCircle } from "react-icons/bs";
import { GiPokerHand, GiCardPickup, GiCrossedSwords } from "react-icons/gi";
import { FiTrendingUp, FiShoppingBag, FiBarChart2 } from "react-icons/fi";
import GlobalSearchModal from "./GlobalSearchModal";
import logger from "../utils/logger";
import { DynamicAdvancedSearchModal } from "./dynamic/DynamicComponents";
import { useAppContext, useFavorites } from "../context/UnifiedAppContext";
import { useAuthSafe } from "../context/AuthContext";
import ClientOnly from "./ClientOnly";
import { NavbarLogo } from "../components/ui/DexTrendsLogo";
import { PokeballSVG } from "./ui/PokeballSVG";

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
  const auth = useAuthSafe();
  const user = auth?.user ?? null;
  const authLoading = auth?.loading ?? false;
  // Mobile menu removed - navigation is now via BottomNavigation + MoreSheet
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const router = useRouter();
  const searchModalRef = useRef<GlobalSearchModalHandle>(null);

  // Count total favorites
  const totalFavorites = favorites ?
    (favorites.pokemon ? favorites.pokemon.length : 0) +
    (favorites.cards ? favorites.cards.length : 0) : 0;

  // DexTrends Pokémon-themed navigation with dropdown structure
  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: <BsGrid size={18} />, color: "text-pokeball-red" },
    { 
      href: "/tcgexpansions", 
      label: "Pokémon TCG", 
      icon: <BsCardList size={18} />, 
      color: "text-greatball-blue",
      hasDropdown: true,
      dropdownItems: [
        { href: "/tcgexpansions", label: "Sets", icon: <BsCardList size={18} />, description: "Browse all TCG sets" },
        { href: "/cards", label: "Cards", icon: <BsCardList size={18} />, description: "Browse and search Pokemon cards" },
        { href: "/market", label: "Market Analytics", icon: <FiTrendingUp size={18} />, description: "Market trends and insights" },
        { href: "/analytics", label: "Site Analytics", icon: <FiBarChart2 size={18} />, description: "DexTrends usage analytics" },
        { href: "/trending", label: "Price Tracker", icon: <FiTrendingUp size={18} />, description: "Track card prices" },
        { href: "/collections", label: "Collections", icon: <BsHeart size={18} />, description: "Manage your collection" },
        { href: "/trending", label: "Leaderboard", icon: <RiGovernmentFill size={18} />, description: "Top collectors and rankings" },
      ]
    },
    { href: "/pokedex", label: "Pokédex", icon: <PokeballSVG size={18} />, color: "text-poke-fairy" },
    {
      href: "/pokemon",
      label: "Pokémon",
      icon: <BsGlobeEuropeAfrica size={18} />,
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
      icon: <GiCrossedSwords size={18} />,
      color: "text-poke-fighting",
      hasDropdown: true,
      dropdownItems: [
        { href: "/battle-simulator", label: "Battle Simulator", icon: <GiCrossedSwords size={18} />, description: "Simulate Pokemon battles" },
        { href: "/type-effectiveness", label: "Type Effectiveness", icon: <BsBook size={18} />, description: "Interactive type chart" },
        { href: "/team-builder/advanced", label: "Team Builder", icon: <GiPokerHand size={18} />, description: "Build competitive teams" },
        { href: "/team-builder/ev-optimizer", label: "EV Optimizer", icon: <AiOutlineBulb size={18} />, description: "Optimize EVs and stats" },
      ]
    },
    { 
      href: "/pocketmode", 
      label: "Pocket", 
      icon: <GiCardPickup size={18} />, 
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
    { href: "/fun", label: "Fun", icon: <AiOutlineBulb size={18} />, color: "text-poke-psychic" },
    { href: "/support", label: "Support", icon: <BsQuestionCircle size={18} />, color: "text-stone-500" },
  ];




  // Close dropdowns on route change
  useEffect(() => {
    setDropdownStates({});
  }, [router.pathname]);

  // Click outside to close dropdowns (desktop only)
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

      // Close all dropdowns
      setDropdownStates({});
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  return (
    <>
      {/* Clean Navbar - Warm cream background */}
      {/* Mobile: 48px height, minimal (logo + theme). Desktop: 64px with full nav */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-3 md:px-6 h-12 md:h-16 z-30 bg-[#FFFDF7] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] safe-area-padding-top">
        <div className="flex items-center gap-x-2">
          {/* Logo - always visible */}
          <NavbarLogo />
        </div>
        <nav className="hidden md:flex items-center gap-x-1">
          {navItems.map(item => {
            const isActive = router.pathname === item.href ||
              (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));

            if (item.hasDropdown) {
              return (
                <div key={`topnav-${item.href}`} className="relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-x-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-150 cursor-pointer
                      ${isActive
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                    onMouseEnter={() => {
                      // Close all other dropdowns first, then open this one
                      setDropdownStates({ [item.href]: true });
                    }}
                    onMouseLeave={(e) => {
                      // Check if we're moving to the dropdown menu
                      const relatedTarget = e.relatedTarget as HTMLElement | null;
                      const isMovingToDropdown = relatedTarget &&
                        typeof relatedTarget.closest === 'function' && (
                          relatedTarget.closest('.dropdown-menu') ||
                          relatedTarget.closest('.invisible-bridge')
                        );

                      if (!isMovingToDropdown) {
                        setDropdownStates(prev => ({ ...prev, [item.href]: false }));
                      }
                    }}
                  >
                    <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 ${isActive ? 'text-white' : item.color || 'text-stone-500'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                    <BsChevronDown className={`w-3 h-3 transition-transform duration-150 ${dropdownStates[item.href] ? 'rotate-180' : ''} ${isActive ? 'text-white/70' : 'text-stone-400'}`} />
                  </Link>

                  {/* Invisible bridge to prevent gap */}
                  {dropdownStates[item.href] && (
                    <div className="invisible-bridge absolute top-full left-0 w-full h-2" />
                  )}

                  {/* Dropdown menu - clean warm design */}
                  <div
                    className={`dropdown-menu absolute top-full left-0 mt-1 w-64 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden ${
                      dropdownStates[item.href] ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-1'
                    } transition-all duration-150`}
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
                    <div className="py-1.5">
                      {item.dropdownItems!.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={`dropdown-${item.href}-${dropdownIndex}`}
                          href={dropdownItem.href}
                          className={`group flex items-center gap-3 px-3 py-2.5 mx-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                            router.pathname === dropdownItem.href
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              : 'hover:bg-stone-50 dark:hover:bg-stone-700/50 text-stone-700 dark:text-stone-300'
                          }`}
                          onClick={() => {
                            logger.debug('Navigation link clicked', { href: dropdownItem.href });
                            setDropdownStates({});
                          }}
                        >
                          <span className={`flex-shrink-0 w-5 h-5 ${
                            router.pathname === dropdownItem.href
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-stone-400 dark:text-stone-500'
                          }`}>
                            {dropdownItem.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {dropdownItem.label}
                            </div>
                            <div className="text-xs text-stone-500 dark:text-stone-400">
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
                className={`group flex items-center gap-x-1.5 px-3 py-2 rounded-lg font-medium transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                style={{ pointerEvents: 'auto' }}
              >
                <span className={`flex-shrink-0 flex items-center justify-center w-5 h-5 ${isActive ? 'text-white' : item.color || 'text-stone-500'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-x-1.5 sm:gap-x-2">
          {/* Search Button - DESKTOP ONLY (mobile uses bottom nav) */}
          <button
            aria-label="Open search"
            title="Search (Cmd+K)"
            className="hidden md:flex p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors duration-150 touch-manipulation min-w-[44px] min-h-[44px] items-center justify-center"
            onClick={() => searchModalRef.current?.open()}
          >
            <BsSearch className="w-5 h-5" />
          </button>

          {/* Favorites - DESKTOP ONLY (mobile uses More sheet) */}
          <Link
            href="/favorites"
            aria-label="View favorites"
            title="View favorites"
            className="hidden md:flex relative p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors duration-150 touch-manipulation min-w-[44px] min-h-[44px] items-center justify-center"
            data-is-navbar="true"
          >
            <BsHeart className="w-5 h-5" />
            <ClientOnly>
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </ClientOnly>
          </Link>

          {/* User / Login Button - DESKTOP ONLY */}
          <ClientOnly>
            <Link
              href={user ? "/profile" : "/auth/login"}
              aria-label={user ? "View profile" : "Sign in"}
              title={user ? "View profile" : "Sign in"}
              className={`hidden md:flex relative p-2.5 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 touch-manipulation min-w-[44px] min-h-[44px] items-center justify-center ${
                user
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 active:bg-amber-300 dark:active:bg-amber-900/80'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600'
              }`}
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-stone-300 dark:border-stone-600 border-t-amber-500 rounded-full animate-spin" />
              ) : user ? (
                <BsPersonFill className="w-5 h-5" />
              ) : (
                <BsPerson className="w-5 h-5" />
              )}
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900" />
              )}
            </Link>
          </ClientOnly>

          {/* Theme Toggle - always visible on both mobile and desktop */}
          <button
            aria-label={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            title={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            className="p-2 md:p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-all duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={toggleTheme}
          >
            <ClientOnly>
              {theme === 'dark' ?
                <BsSun className="w-5 h-5 text-amber-500" /> :
                <BsMoon className="w-5 h-5 text-amber-600" />
              }
            </ClientOnly>
          </button>
        </div>
      </div>
      {/* Spacer for fixed navbar - 48px mobile, 64px desktop */}
      <div className="h-12 md:h-16" />
      <GlobalSearchModal ref={searchModalRef} />
      
      {/* Advanced Search Modal */}
      <DynamicAdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearchResults={(_results) => {
          setShowAdvancedSearch(false);
          // Navigate to a search results page or handle results
          router.push('/cards');
        }}
      />
    </>
  );
}