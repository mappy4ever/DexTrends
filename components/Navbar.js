import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RiGovernmentFill } from "react-icons/ri";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica } from "react-icons/bs";
import GlobalSearchModal from "./GlobalSearchModal";

export default function Navbar() {
  const { theme, setTheme, resolvedTheme, mounted: themeMounted } = useTheme(); // Use 'mounted' from useTheme
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuWrapperRef = useRef(null);
  const router = useRouter();
  const searchModalRef = useRef();

  // DexTrends key pages
  const navItems = [
    { href: "/", label: "Main", icon: <RiGovernmentFill size={22} /> },
    { href: "/TCGSets", label: "TCG Sets", icon: <RiGovernmentFill size={22} /> },
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

  const isDarkMode = resolvedTheme === 'dark';

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
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/></svg>
          </button>
          <button
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            className="p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>
        </div>
      </div>
      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      <GlobalSearchModal ref={searchModalRef} />
    </>
  );
}