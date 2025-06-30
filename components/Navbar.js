import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsHeart, BsSearch, BsCardList, BsGrid, BsBook, BsChevronDown } from "react-icons/bs";
import { GiPokerHand, GiCardPickup } from "react-icons/gi";
import { FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import GlobalSearchModal from "./GlobalSearchModal";
import { useTheme } from "../context/themecontext";
import { useFavorites } from "../context/favoritescontext";
import Image from "next/image";
import { toLowercaseUrl } from "../utils/formatters";
import ClientOnly from "./ClientOnly";

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { favorites } = useFavorites();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});
  const [hoverTimeouts, setHoverTimeouts] = useState({});
  const menuWrapperRef = useRef(null);
  const dropdownRefs = useRef({});
  const router = useRouter();
  const searchModalRef = useRef();
  
  // Count total favorites
  const totalFavorites = favorites ? 
    (favorites.pokemon ? favorites.pokemon.length : 0) + 
    (favorites.cards ? favorites.cards.length : 0) : 0;

  // DexTrends Pokémon-themed navigation with dropdown structure
  const navItems = [
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
    { href: "/leaderboard", label: "Leaderboard", icon: <BsGrid size={22} />, color: "text-ultraball-yellow" },
    { href: "/pokedex", label: "Pokédex", icon: <BsBook size={22} />, color: "text-poke-fairy" },
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
        { href: "/pocketmode?view=deckbuilder", label: "Deck Builder", icon: <GiPokerHand size={18} />, description: "Build custom decks" },
      ]
    },
    { href: "/fun", label: "Fun", icon: <AiOutlineBulb size={22} />, color: "text-poke-psychic" },
  ];

  const pageTitles = navItems.reduce((acc, item) => {
    acc[item.href] = item.label;
    return acc;
  }, { "/": "Dashboard" }); // Ensure root path has a title

  const currentTitle = pageTitles[router.pathname] || "DexTrends"; // Updated title

  // Debounced hover functions to prevent flashing
  const handleDropdownEnter = (itemHref) => {
    if (hoverTimeouts[itemHref]) {
      clearTimeout(hoverTimeouts[itemHref]);
      setHoverTimeouts(prev => ({ ...prev, [itemHref]: null }));
    }
    setDropdownStates(prev => ({ ...prev, [itemHref]: true }));
  };

  const handleDropdownLeave = (itemHref) => {
    const timeout = setTimeout(() => {
      setDropdownStates(prev => ({ ...prev, [itemHref]: false }));
    }, 100); // Small delay to prevent rapid flickering
    setHoverTimeouts(prev => ({ ...prev, [itemHref]: timeout }));
  };

  // Click outside for mobile menu and dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileOpen && menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        const mobileToggle = document.getElementById("mobile-menu-button");
        if (mobileToggle && mobileToggle.contains(event.target)) {
            return; // Don't close if clicking the toggle button itself
        }
        setMobileOpen(false);
      }
      
      // Close dropdowns when clicking outside - simplified to prevent loops
      setDropdownStates({});
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      Object.values(hoverTimeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, [mobileOpen, dropdownStates, hoverTimeouts]);

  const isDarkMode = theme === 'dark';

  return (
    <>
      {/* Clean Navbar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-16 z-40 bg-white border-b border-border-color shadow-sm">
        <Link
          href="/"
          className="flex items-center gap-x-3 text-xl font-bold text-pokemon-red overflow-hidden hover:opacity-80 transition-opacity duration-300">
          <div className="flex-shrink-0 w-8 h-8 bg-pokemon-red rounded-full flex items-center justify-center">
            <BsGrid size={20} className="text-white" />
          </div>
          <span className="truncate">
            DexTrends
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-x-2">
          {navItems.map(item => {
            const isActive = router.pathname === item.href || 
              (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));
            
            if (item.hasDropdown) {
              return (
                <div key={`topnav-${item.href}`} className="relative" ref={el => dropdownRefs.current[item.href] = el}>
                  <button
                    className={`group flex items-center gap-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer border-2
                      ${isActive
                        ? 'bg-pokemon-red text-white border-pokemon-red shadow-md'
                        : 'text-dark-text border-transparent hover:border-border-color hover:bg-light-grey'}`}
                    onMouseEnter={() => handleDropdownEnter(item.href)}
                    onMouseLeave={() => handleDropdownLeave(item.href)}
                    onClick={() => setDropdownStates(prev => ({ ...prev, [item.href]: !prev[item.href] }))}
                  >
                    <span className={`flex-shrink-0 w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-pokemon-red'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate text-sm font-semibold">{item.label}</span>
                    <BsChevronDown className={`w-3 h-3 transition-transform duration-200 ${dropdownStates[item.href] ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute top-full left-0 mt-1 w-64 bg-white border border-border-color rounded-lg shadow-lg z-50 transition-all duration-200 ${
                      dropdownStates[item.href] ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    }`}
                    onMouseEnter={() => handleDropdownEnter(item.href)}
                    onMouseLeave={() => handleDropdownLeave(item.href)}
                  >
                    <div className="p-2">
                      {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                        <Link
                          key={`dropdown-${item.href}-${dropdownIndex}-${dropdownItem.href}`}
                          href={dropdownItem.href}
                          className={`group flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:bg-light-grey ${
                            router.pathname === dropdownItem.href ? 'bg-pokemon-red/10 border-l-4 border-pokemon-red' : ''
                          }`}
                          onClick={() => setDropdownStates(prev => ({ ...prev, [item.href]: false }))}
                        >
                          <span className="flex-shrink-0 w-5 h-5 mt-0.5 text-pokemon-red">
                            {dropdownItem.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-dark-text truncate">
                              {dropdownItem.label}
                            </div>
                            <div className="text-xs text-text-grey mt-0.5">
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
              <Link
                key={`topnav-${item.href}`}
                href={item.href}
                className={`group flex items-center gap-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer border-2
                  ${isActive
                    ? 'bg-pokemon-red text-white border-pokemon-red shadow-md'
                    : 'text-dark-text border-transparent hover:border-border-color hover:bg-light-grey'}`}
                style={{ pointerEvents: 'auto' }}
              >
                <span className={`flex-shrink-0 w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-pokemon-red'}`}>
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
            className="p-3 rounded-lg bg-pokemon-blue text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-blue shadow-sm transition-all duration-300"
            onClick={() => searchModalRef.current?.open()}
          >
            <BsSearch size={18} />
          </button>
          
          <Link 
            href="/favorites"
            aria-label="View favorites"
            title="View favorites"
            className="relative p-3 rounded-lg bg-pokemon-yellow text-white hover:bg-yellow-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pokemon-yellow shadow-sm transition-all duration-300"
            data-is-navbar="true"
          >
            <BsHeart size={18} />
            <ClientOnly>
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1 bg-pokemon-red text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-sm">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </ClientOnly>
          </Link>
          
          <ClientOnly>
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
          </ClientOnly>
          
          {/* Mobile Menu Button */}
          <ClientOnly>
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
          </ClientOnly>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div ref={menuWrapperRef} className="fixed top-16 right-0 left-0 bg-white/95 backdrop-blur-sm border-t border-border-color p-4 shadow-lg">
            <nav className="flex flex-col space-y-2">
              {navItems.map(item => {
                const isActive = router.pathname === item.href || 
                  (item.dropdownItems && item.dropdownItems.some(subItem => router.pathname === subItem.href));
                
                if (item.hasDropdown) {
                  return (
                    <div key={`mobile-${item.href}`} className="space-y-1">
                      <div className={`flex items-center gap-x-3 px-4 py-3 rounded-lg font-medium border-2 touch-manipulation
                        ${isActive
                          ? 'bg-pokemon-red text-white border-pokemon-red'
                          : 'text-dark-text border-transparent bg-light-grey'}`}
                        style={{ minHeight: '48px' }}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 ${isActive ? 'text-white' : 'text-pokemon-red'}`}>
                          {item.icon}
                        </span>
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      {/* Mobile dropdown items */}
                      <div className="pl-6 space-y-1">
                        {item.dropdownItems.map((dropdownItem, dropdownIndex) => (
                          <Link
                            key={`mobile-dropdown-${item.href}-${dropdownIndex}-${dropdownItem.href}`}
                            href={dropdownItem.href}
                            className={`flex items-center gap-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 border-2 touch-manipulation
                              ${router.pathname === dropdownItem.href
                                ? 'bg-pokemon-blue text-white border-pokemon-blue'
                                : 'text-dark-text border-transparent hover:border-border-color hover:bg-white'}`}
                            onClick={() => setMobileOpen(false)}
                            style={{ minHeight: '40px' }}
                          >
                            <span className={`flex-shrink-0 w-5 h-5 ${router.pathname === dropdownItem.href ? 'text-white' : 'text-pokemon-blue'}`}>
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
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    className={`flex items-center gap-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 border-2 touch-manipulation
                      ${isActive
                        ? 'bg-pokemon-red text-white border-pokemon-red'
                        : 'text-dark-text border-transparent hover:border-border-color hover:bg-light-grey'}`}
                    onClick={() => setMobileOpen(false)}
                    style={{ minHeight: '48px' }}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 ${isActive ? 'text-white' : 'text-pokemon-red'}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
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