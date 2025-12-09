import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiSun, FiMoon, FiGlobe, FiHeart, FiSearch, FiGrid, FiLayers, FiBook, FiChevronDown, FiUser, FiHelpCircle, FiZap } from "react-icons/fi";
import { GiPokerHand, GiCardPickup, GiCrossedSwords } from "react-icons/gi"; // Keep specialty gaming icons
import { FiTrendingUp, FiShoppingBag, FiBarChart2 } from "react-icons/fi";
import GlobalSearchModal from "./GlobalSearchModal";
import logger from "../utils/logger";
import { DynamicAdvancedSearchModal } from "./dynamic/DynamicComponents";
import { useAppContext, useFavorites } from "../context/UnifiedAppContext";
import { useAuthSafe } from "../context/AuthContext";
import ClientOnly from "./ClientOnly";
import { NavbarLogo } from "../components/ui/DexTrendsLogo";
import { PokeballSVG } from "./ui/PokeballSVG";
import { useViewport, Z_INDEX } from "../hooks/useViewport";

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const menuWrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchModalRef = useRef<GlobalSearchModalHandle>(null);
  const viewport = useViewport();

  // Use viewport-based mobile detection instead of touch capability
  // This ensures consistent behavior across devices (laptops with touchscreens should use desktop behavior)
  const isMobileViewport = viewport.isMounted && (viewport.isMobile || viewport.isTablet);

  // Android back button handler - closes mobile menu when back is pressed
  useEffect(() => {
    const handlePopState = () => {
      if (mobileOpen) {
        setMobileOpen(false);
      }
      // Also close any open dropdowns
      setDropdownStates({});
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [mobileOpen]);

  // Count total favorites
  const totalFavorites = favorites ?
    (favorites.pokemon ? favorites.pokemon.length : 0) +
    (favorites.cards ? favorites.cards.length : 0) : 0;

  // DexTrends Pokémon-themed navigation with dropdown structure
  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: <FiGrid size={18} />, color: "text-pokeball-red" },
    {
      href: "/tcgexpansions",
      label: "Pokémon TCG",
      icon: <FiLayers size={18} />,
      color: "text-greatball-blue",
      hasDropdown: true,
      dropdownItems: [
        { href: "/tcgexpansions", label: "Sets", icon: <FiLayers size={18} />, description: "Browse all TCG sets" },
        { href: "/cards", label: "Cards", icon: <FiLayers size={18} />, description: "Browse and search Pokemon cards" },
        { href: "/collection", label: "Collection Tracker", icon: <FiHeart size={18} />, description: "Track your card collection" },
        { href: "/deck-sharing", label: "Deck Sharing", icon: <GiCardPickup size={18} />, description: "Build and share deck lists" },
        { href: "/price-alerts", label: "Price Alerts", icon: <FiTrendingUp size={18} />, description: "Get notified on price changes" },
        { href: "/market", label: "Market Analytics", icon: <FiTrendingUp size={18} />, description: "Market trends and insights" },
      ]
    },
    { href: "/pokedex", label: "Pokédex", icon: <PokeballSVG size={18} />, color: "text-poke-fairy" },
    {
      href: "/pokemon",
      label: "Pokémon",
      icon: <FiGlobe size={18} />,
      color: "text-poke-grass",
      hasDropdown: true,
      dropdownItems: [
        { href: "/pokemon/regions", label: "Regions", icon: <FiGlobe size={18} />, description: "Explore all regions" },
        { href: "/pokemon/starters", label: "Starters", icon: <GiPokerHand size={18} />, description: "Regional starter Pokémon" },
        { href: "/pokemon/moves", label: "Moves & TMs", icon: <FiBook size={18} />, description: "Complete moves database" },
        { href: "/pokemon/games", label: "Games", icon: <GiCardPickup size={18} />, description: "All Pokémon games" },
        { href: "/pokemon/items", label: "Items", icon: <FiShoppingBag size={18} />, description: "Items and their effects" },
        { href: "/pokemon/abilities", label: "Abilities", icon: <FiZap size={18} />, description: "Pokémon abilities list" },
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
        { href: "/team-builder", label: "Team Builder", icon: <GiPokerHand size={18} />, description: "Build balanced teams" },
        { href: "/type-effectiveness", label: "Type Effectiveness", icon: <FiBook size={18} />, description: "Interactive type chart" },
      ]
    },
    {
      href: "/pocketmode",
      label: "Pocket",
      icon: <GiCardPickup size={18} />,
      color: "text-poke-electric",
      hasDropdown: true,
      dropdownItems: [
        { href: "/pocketmode", label: "Cards", icon: <FiLayers size={18} />, description: "Browse Pocket cards" },
        { href: "/pocketmode/expansions", label: "Expansions", icon: <FiGrid size={18} />, description: "Browse expansion sets" },
        { href: "/pocketmode/packs", label: "Pack Opening", icon: <FiShoppingBag size={18} />, description: "Open virtual packs" },
        { href: "/pocketmode/decks", label: "Top Decks", icon: <FiBook size={18} />, description: "Popular deck builds" },
        { href: "/pocketmode/deckbuilder", label: "Deck Builder", icon: <GiPokerHand size={18} />, description: "Build custom decks" },
      ]
    },
    { href: "/fun", label: "Fun", icon: <FiZap size={18} />, color: "text-poke-psychic" },
    { href: "/support", label: "Support", icon: <FiHelpCircle size={18} />, color: "text-stone-500" },
  ];




  // Close mobile menu on route change - using pathname for reliability
  useEffect(() => {
    setMobileOpen(false);
    setDropdownStates({});
    // Clean up any stuck states
    document.body.style.overflow = '';
    document.body.classList.remove('mobile-menu-open');
  }, [router.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setMobileOpen(false);
      document.body.style.overflow = '';
    };
  }, []);

  // Click outside for mobile menu and dropdowns
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if clicking the mobile menu button
      const mobileToggle = document.getElementById("mobile-menu-button");
      if (mobileToggle && mobileToggle.contains(event.target as Node)) {
        return;
      }

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



  return (
    <>
      {/* Clean Navbar - Warm cream background */}
      {/* Safe area spacer: Fills the iOS notch area with background color */}
      <div
        className="fixed top-0 left-0 right-0 bg-[#FFFDF7] dark:bg-stone-900"
        style={{
          zIndex: Z_INDEX.navbar,
          height: 'env(safe-area-inset-top, 0px)'
        }}
      />
      <div
        className="fixed left-0 right-0 flex items-center justify-between px-3 md:px-6 h-14 md:h-16 bg-[#FFFDF7] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        style={{
          zIndex: Z_INDEX.navbar,
          top: 'env(safe-area-inset-top, 0px)'
        }}
      >
        <div className="flex items-center gap-x-2">
          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-button"
            className="md:hidden p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-150 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileOpen(prev => !prev);
              logger.debug('Mobile menu toggled', { newState: !mobileOpen });
            }}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <div className="w-5 h-5 flex flex-col justify-center space-y-1">
              <div className={`w-full h-0.5 bg-current transition-all duration-200${mounted && mobileOpen ? ' rotate-45 translate-y-1.5' : ''}`} />
              <div className={`w-full h-0.5 bg-current transition-all duration-200${mounted && mobileOpen ? ' opacity-0' : ''}`} />
              <div className={`w-full h-0.5 bg-current transition-all duration-200${mounted && mobileOpen ? ' -rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
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
                    onClick={(e) => {
                      // On mobile/tablet viewports, toggle dropdown on click instead of navigating
                      // Using viewport width instead of touch capability for consistent behavior
                      if (isMobileViewport) {
                        e.preventDefault();
                        setDropdownStates(prev => ({
                          ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
                          [item.href]: !prev[item.href]
                        }));
                      }
                    }}
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
                    <FiChevronDown className={`w-3 h-3 transition-transform duration-150 ${dropdownStates[item.href] ? 'rotate-180' : ''} ${isActive ? 'text-white/70' : 'text-stone-400'}`} />
                  </Link>

                  {/* Invisible bridge to prevent gap */}
                  {dropdownStates[item.href] && (
                    <div className="invisible-bridge absolute top-full left-0 w-full h-2" />
                  )}

                  {/* Dropdown menu - clean warm design */}
                  <div
                    className={`dropdown-menu absolute top-full left-0 mt-1 w-64 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden z-50 ${
                      dropdownStates[item.href] ? 'block opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-1'
                    } transition-all duration-150`}
                    style={{
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
                            <div className="text-xs text-stone-500 dark:text-stone-300">
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
          {/* Search Button - proper touch target */}
          <button
            aria-label="Open search"
            title="Search (Cmd+K)"
            className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => searchModalRef.current?.open()}
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Favorites - proper touch target */}
          <Link
            href="/favorites"
            aria-label="View favorites"
            title="View favorites"
            className="relative p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            data-is-navbar="true"
          >
            <FiHeart className="w-5 h-5" />
            <ClientOnly>
              {totalFavorites > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </ClientOnly>
          </Link>

          {/* User / Login Button - proper touch target */}
          <ClientOnly>
            <Link
              href={user ? "/profile" : "/auth/login"}
              aria-label={user ? "View profile" : "Sign in"}
              title={user ? "View profile" : "Sign in"}
              className={`relative p-2.5 rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                user
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60 active:bg-amber-300 dark:active:bg-amber-900/80'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600'
              }`}
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-stone-300 dark:border-stone-600 border-t-amber-500 rounded-full animate-spin" />
              ) : user ? (
                <FiUser className="w-5 h-5" />
              ) : (
                <FiUser className="w-5 h-5" />
              )}
              {user && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900" />
              )}
            </Link>
          </ClientOnly>

          {/* Theme Toggle - proper touch target */}
          <button
            aria-label={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            title={mounted && theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            className="p-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 active:bg-stone-300 dark:active:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30 transition-colors duration-150 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={toggleTheme}
          >
            <ClientOnly>
              {theme === 'dark' ?
                <FiSun className="w-5 h-5 text-amber-500" /> :
                <FiMoon className="w-5 h-5 text-amber-600" />
              }
            </ClientOnly>
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay - Proper z-index and rendering */}
      {mobileOpen && (
        <>
          {/* Backdrop - solid bg for iOS performance */}
          <div
            className="fixed inset-0 bg-black/60 md:hidden"
            style={{
              zIndex: Z_INDEX.modal,
              pointerEvents: 'auto'
            }}
            onClick={() => setMobileOpen(false)}
          />

          {/* Menu panel - slide in from left, above backdrop */}
          <div
            ref={menuWrapperRef}
            className="fixed left-0 bottom-0 w-80 max-w-[85vw] bg-[#FFFDF7] dark:bg-stone-900 shadow-2xl md:hidden overflow-y-auto safe-area-padding-x"
            style={{
              zIndex: Z_INDEX.mobileMenu,
              top: 'calc(env(safe-area-inset-top, 0px) + 56px)' // 56px = h-14 navbar height
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col p-3 space-y-1">
              {navItems.map(item => {
                const isActive = router.pathname === item.href ||
                  (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));

                if (item.hasDropdown) {
                  return (
                    <div key={`mobile-${item.href}`} className="space-y-0.5">
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 px-4 py-3.5 rounded-lg font-medium touch-manipulation transition-colors duration-150 min-h-[48px] active:bg-stone-200 dark:active:bg-stone-700
                          ${isActive
                            ? 'bg-amber-600 text-white'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${isActive ? 'text-white' : item.color || 'text-stone-500'}`}>
                          {item.icon}
                        </span>
                        <span className="font-medium text-base">{item.label}</span>
                      </Link>
                      {/* Mobile dropdown items */}
                      <div className="ml-6 space-y-0.5 border-l-2 border-stone-200 dark:border-stone-700 pl-2">
                        {item.dropdownItems!.map((dropdownItem, dropdownIndex) => (
                          <Link key={`mobile-dropdown-${item.href}-${dropdownIndex}-${dropdownItem.href}`}
                            href={dropdownItem.href}
                            className={`flex items-center gap-x-3 px-4 py-3 rounded-lg font-medium transition-colors duration-150 touch-manipulation min-h-[44px] active:bg-stone-200 dark:active:bg-stone-700
                              ${router.pathname === dropdownItem.href
                                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center ${router.pathname === dropdownItem.href ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`}>
                              {dropdownItem.icon}
                            </span>
                            <span className="text-sm">{dropdownItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link key={`mobile-${item.href}`}
                    href={item.href}
                    className={`flex items-center gap-x-3 px-4 py-3.5 rounded-lg font-medium transition-colors duration-150 touch-manipulation min-h-[48px] active:bg-stone-200 dark:active:bg-stone-700
                      ${isActive
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${isActive ? 'text-white' : item.color || 'text-stone-500'}`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
      {/* Spacer removed - Layout component handles padding via pt-14/pt-16 */}
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
