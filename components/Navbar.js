import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { RxDashboard, RxTable } from "react-icons/rx";
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica, BsPersonBoundingBox } from "react-icons/bs";
import { MdCompare, MdPersonSearch } from "react-icons/md";
import { IoStatsChart, IoMap } from "react-icons/io5";
import { RiGovernmentFill } from "react-icons/ri";
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { useRouter } from "next/router";

export default function Navbar({ isCollapsed, setIsCollapsed }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("expand"); // "expand", "collapse", "hover"
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuWrapperRef = useRef(null);
  const router = useRouter();

  const pageTitles = {
    "/": "Dashboard",
    "/reports": "Reports",
    "/events": "Events",
    "/tables": "Tables",
    "/about": "About",
  };

  const currentTitle = pageTitles[router.pathname] || "OnOurDime";

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("sidebarMode");
    if (savedMode) setSidebarMode(savedMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarMode", sidebarMode);
    if (sidebarMode === "collapse") {
      setIsCollapsed(true);
      setHoverExpanded(false);
    }
    if (sidebarMode === "expand") {
      setIsCollapsed(false);
      setHoverExpanded(true);
    }
    if (sidebarMode === "hover") {
      setIsCollapsed(true);
    }
  }, [sidebarMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSidebarToggle = () => {
    if (sidebarMode === "expand") {
      setSidebarMode("collapse");
      setHoverExpanded(false);
    } else if (sidebarMode === "collapse") {
      setSidebarMode("hover");
	  setHoverExpanded(true);
    } else {
      setSidebarMode("expand");
      setHoverExpanded(true);
    }
  };

  const handleMouseEnter = () => {
    if (sidebarMode === "hover") setHoverExpanded(true);
  };

  const handleMouseLeave = () => {
    if (sidebarMode === "hover") setHoverExpanded(false);
  };

  const SidebarItem = ({ href, icon, text }) => (
    <Link 
      href={href} 
      className="flex items-center gap-3 p-3 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-md"
    >
      {icon}
      {!isCollapsed || hoverExpanded ? <span>{text}</span> : null}
    </Link>
  );

  return (
    <>
      {/* Mobile Navbar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-[var(--color-navbar)] text-text-navbar flex items-center justify-between px-4 h-14 shadow-md z-50">
        <span className="font-bold text-lg">{currentTitle}</span>
        <div className="flex items-center gap-4">
          
		  {/* Dark Mode Toggle */}
		  <button
            className="p-1 rounded-full bg-white/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <BsSun size={24} /> : <BsMoon size={24} />}
          </button>

          {/* Mobile Menu Button */}
		  <button
            type="button"
            className="text-button focus:outline-none focus:text-button-darkHover transition-transform duration-300 transform scale-110"
            onClick={(e) => setMobileOpen(true)}
          >
            {mobileOpen ? (
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6L18 18M6 18L18 6" />
              </svg>
            ) : (
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) */}
      {mobileOpen && (
        <div
          ref={menuWrapperRef}
          className="md:hidden fixed top-14 left-0 w-full bg-[var(--color-navbar)] px-4 pb-3 space-y-2 shadow-md z-50"
        >
          {/* Mobile Navigation (No Icons) */}
          <nav className="flex flex-col gap-4 mt-6 text-lg">
            <Link href="/" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/orgs" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Department&nbsp;Trends</Link>
			<Link href="/people" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Person&nbsp;Inspector</Link>
            <Link href="/map" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Map&nbsp;Explorer</Link>
            {/* <Link href="/events" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Event&nbsp;Comparer</Link>
            <Link href="/tables" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>Tables</Link> */}
            <Link href="/about" className="hover:text-text-highlightHover" onClick={() => setMobileOpen(false)}>About</Link>
          </nav>
        </div>
      )}

      {/* Left Sidebar (Desktop Only) */}
      <div
        className={`hidden md:flex flex-col fixed left-0 top-0 z-50 h-screen bg-[var(--color-navbar)] text-text-navbar shadow-md transition-all duration-300 ${
          isCollapsed && !hoverExpanded ? "w-16" : "w-64"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        <div className="flex justify-between items-center px-4 py-3">
          {!isCollapsed || hoverExpanded ? <h1 className="text-lg font-bold">OnOurDime</h1> : null}
          <button onClick={handleSidebarToggle} className="p-2">
            {sidebarMode === "expand" ? (
              <TbLayoutSidebarLeftCollapse size={24} className="text-gray-500" />
            ) : sidebarMode === "collapse" ? (
              <TbLayoutSidebarLeftExpand size={24} className="text-gray-500" />
            ) : (
              <TbLayoutSidebarLeftExpand size={24} />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2 px-2">
          <SidebarItem href="/" icon={<RxDashboard size={24} />} text="Dashboard" />
          <SidebarItem href="/orgs" icon={<RiGovernmentFill size={24} />} text="Department&nbsp;Trends" />
		  <SidebarItem href="/people" icon={<BsPersonBoundingBox size={24} />} text="Person&nbsp;Inspector" />
		  <SidebarItem href="/map" icon={<BsGlobeEuropeAfrica size={24} />} text="Map&nbsp;Explorer" />
		  {/* <SidebarItem href="/events" icon={<MdCompare size={24} />} text="Event&nbsp;Comparer" /> 
          <SidebarItem href="/tables" icon={<RxTable size={24} />} text="Tables" /> */}
          <SidebarItem href="/about" icon={<AiOutlineBulb size={24} />} text="About" />
        </nav>

        {/* Dark Mode Button */}
        <div className="absolute bottom-4 left-4">
          <button
            className="p-1 rounded-full bg-white/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {mounted && theme === "dark" ? <BsSun size={24} /> : <BsMoon size={24} />}
          </button>
        </div>
      </div>
    </>
  );
}
