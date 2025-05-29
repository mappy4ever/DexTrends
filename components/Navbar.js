import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomSiteLogo from '../components/icons/CustomSiteLogo';
import { RxDashboard } from "react-icons/rx"; 
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsPersonBoundingBox } from "react-icons/bs";
import { RiGovernmentFill } from "react-icons/ri";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { VscQuestion, VscClose, VscMenu } from "react-icons/vsc";

export default function Navbar({ isCollapsed, setIsCollapsed }) {
  const { theme, setTheme, resolvedTheme, mounted: themeMounted } = useTheme(); // Use 'mounted' from useTheme
  const [sidebarMode, setSidebarMode] = useState("expand"); // "expand", "collapse", "hover"
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuWrapperRef = useRef(null);
  const router = useRouter();

  // DexTrends key pages
  const navItems = [
    { href: "/", label: "Main", icon: <RxDashboard size={22} /> },
    { href: "/TCGSets", label: "TCG Sets", icon: <RiGovernmentFill size={22} /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <AiOutlineBulb size={22} /> },
    { href: "/PokeDex", label: "Pokédex", icon: <BsGlobeEuropeAfrica size={22} /> },
  ];

  const pageTitles = navItems.reduce((acc, item) => {
    acc[item.href] = item.label;
    return acc;
  }, { "/": "Dashboard" }); // Ensure root path has a title

  const currentTitle = pageTitles[router.pathname] || "OnOurDime";

  // Initialize sidebarMode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("sidebarMode");
    if (savedMode && ["expand", "collapse", "hover"].includes(savedMode)) {
        setSidebarMode(savedMode);
    } else {
        setSidebarMode("expand"); // Default to expand
    }
  }, []);

  // Update localStorage and parent state when sidebarMode changes
  useEffect(() => {
    localStorage.setItem("sidebarMode", sidebarMode);
    setIsCollapsed(sidebarMode === "collapse" || (sidebarMode === "hover" && !hoverExpanded));
    if (sidebarMode === "expand") {
        setHoverExpanded(true); // In expand mode, it's always "hover expanded" conceptually
    } else if (sidebarMode === "collapse") {
        setHoverExpanded(false);
    }
    // For "hover" mode, hoverExpanded is controlled by mouse events
  }, [sidebarMode, setIsCollapsed, hoverExpanded]);


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

  const handleSidebarToggle = () => {
    if (sidebarMode === "expand") setSidebarMode("collapse");
    else if (sidebarMode === "collapse") setSidebarMode("hover");
    else setSidebarMode("expand"); // "hover" -> "expand"
  };

  const handleMouseEnter = () => { if (sidebarMode === "hover") setHoverExpanded(true); };
  const handleMouseLeave = () => { if (sidebarMode === "hover") setHoverExpanded(false); };

  const showText = sidebarMode === 'expand' || (sidebarMode === 'hover' && hoverExpanded);

  const SidebarItem = ({ href, icon, text, isActive }) => (
    <Link
      href={href}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-x-3 p-2.5 rounded-app-md transition-colors text-sm font-medium group
                  ${isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20' // Adjusted dark active state
                    : 'text-text-navbar hover:bg-surface-hovered hover:text-foreground'}
                  ${!showText ? "justify-center" : ""}`}
        title={!showText ? text : undefined} // Show tooltip when text is hidden
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span> {/* Consistent icon container */}
      {showText && <span className="truncate">{text}</span>}
    </Link>
  );

  const desktopSidebarWidth = showText ? "w-60" : "w-16"; // Adjusted widths for better visual balance

//  const currentUiTheme = themeMounted && resolvedTheme === 'dark' ? 'dark' : 'light';

  const isDarkMode = resolvedTheme === 'dark';

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between px-4 h-14 shadow-md z-40 bg-navbar text-text-navbar backdrop-blur-sm">
        <Link href="/" className="text-lg font-semibold text-foreground">
          {currentTitle}
        </Link>
        <div className="flex items-center gap-x-2">
          <button
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            className="p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <BsSun size={18} /> : <BsMoon size={18} />}
          </button>
          <button
            id="mobile-menu-button"
            type="button"
            className="p-2 rounded-md hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <VscClose size={22} /> : <VscMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {mobileOpen && (
        <div
          ref={menuWrapperRef}
          id="mobile-menu"
          className="md:hidden fixed top-14 left-0 w-full bg-navbar p-4 space-y-1 shadow-lg z-30 border-b border-border backdrop-blur-sm"
        >
          <nav className="flex flex-col gap-y-1">
            {navItems.map(item => (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-x-3 px-3 py-2.5 rounded-app-md text-base font-medium
                            ${router.pathname === item.href
                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                : 'text-text-navbar hover:bg-surface-hovered hover:text-foreground'}`}
              >
                <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Left Sidebar (Desktop Only) */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 z-30 h-screen
                   bg-navbar text-text-navbar shadow-lg transition-all duration-300 ease-in-out border-r border-border backdrop-blur-sm
                   ${desktopSidebarWidth}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`flex items-center h-16 px-4 border-b border-border flex-shrink-0 ${!showText && "justify-center"}`}>
          <Link href="/" className="flex items-center gap-x-2 text-xl font-bold text-foreground overflow-hidden">
            <RiGovernmentFill size={24} className="flex-shrink-0 text-primary" />
            {showText && <span className="truncate">OnOurDime</span>}
          </Link>
        </div>

        <button
            onClick={handleSidebarToggle}
            className="absolute top-12 -right-3.5 z-10 p-1.5 bg-card border border-border rounded-full shadow-md hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={sidebarMode === "expand" ? "Collapse sidebar" : sidebarMode === "collapse" ? "Enable hover to expand sidebar": "Expand sidebar fully"}
            title={sidebarMode === "expand" ? "Collapse" : sidebarMode === "collapse" ? "Enable Hover" : "Expand Fully"}
          >
            {sidebarMode === "expand" ? <TbLayoutSidebarLeftCollapse size={18} /> : <TbLayoutSidebarLeftExpand size={18} />}
        </button>

        <nav className="flex-grow space-y-1.5 px-2.5 py-4 overflow-y-auto">
          {navItems.map(item => (
            <SidebarItem
              key={`desktop-${item.href}`}
              href={item.href}
              icon={item.icon}
              text={item.label}
              isActive={router.pathname === item.href}
            />
          ))}
        </nav>

        <div className={"absolute bottom-2 left-1 mt-auto p-3 flex-shrink-0"}>
          <button
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            className="p-1 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <BsSun size={22} /> : <BsMoon size={22} />}
          </button>
        </div>
      </aside>
    </>
  );
}