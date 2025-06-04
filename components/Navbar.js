import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsHeart, BsSearch } from "react-icons/bs";
import GlobalSearchModal from "./GlobalSearchModal";
import { useTheme } from "../context/ThemeContext";
import { useFavorites } from "../context/FavoritesContext";
import Image from "next/image";

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

  // DexTrends key pages
  const navItems = [
    { href: "/", label: "Main", icon: <RiGovernmentFill size={22} /> },
    { href: "/TCGSets", label: "TCG Sets", icon: <RiGovernmentFill size={22} /> },
    { href: "/trending", label: "Trending", icon: <AiOutlineBulb size={22} /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <AiOutlineBulb size={22} /> },
    { href: "/PokeDex", label: "Pokédex", icon: <BsGlobeEuropeAfrica size={22} /> },
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
      {/* Top Navbar (Desktop & Mobile) */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-16 shadow-md z-40 bg-navbar text-text-navbar backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-x-2 text-xl font-bold text-foreground overflow-hidden">
          <RiGovernmentFill size={24} className="flex-shrink-0 text-primary" />
          <span className="truncate">DexTrends</span>
        </Link>
        <nav className="flex items-center gap-x-6">
          {navItems.map(item => (
            <Link
              key={`topnav-${item.href}`}
              href={item.href}
              className={`flex items-center gap-x-2 px-3 py-2 rounded-app-md text-base font-medium transition-colors
                ${router.pathname === item.href
                  ? 'bg-primary/10 text-primary dark:bg-primary/20'
                  : 'text-text-navbar hover:bg-surface-hovered hover:text-foreground'}`}
            >
              <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-x-2">
          <button
            aria-label="Open global search"
            title="Search (Cmd+K)"
            className="p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary border border-primary bg-white/80 dark:bg-gray-800/80 shadow"
            onClick={() => searchModalRef.current?.open()}
          >
            <BsSearch size={18} />
          </button>
          
          <Link href="/favorites" legacyBehavior>
            <a
              aria-label="View favorites"
              title="View favorites"
              className="relative p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary"
            >
              <BsHeart size={18} />
              {totalFavorites > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </a>
          </Link>
          
          <button
            aria-label={theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            title={theme === 'dark' ? "Activate light mode" : "Activate dark mode"}
            className="p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>
        </div>
      </div>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      <GlobalSearchModal ref={searchModalRef} />
    </>
  );
}