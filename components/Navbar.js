import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";
import { BsSun, BsMoon } from "react-icons/bs";
import PakePointLogo from '../components/PakePointLogo';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuWrapperRef = useRef(null); // Wraps both the button and the menu

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (menuWrapperRef.current && !menuWrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className={`bg-[var(--color-navbar)] text-text-navbar fixed top-0 left-0 w-full z-50 transition-all duration-500 items-center backdrop-blur-sm ${
        scrolled ? "bg-[var(--color-navbar-scrolled)] dark:bg-[var(--color-navbar-scrolled)]" : ""
      } md:h-20 h-16`}
    >
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex items-center justify-between">
        <Link
          href="/"
          className="font-heading hover:text-text-highlightHover md:text-3xl"
          onClick={() => setIsOpen(false)}
        >
          <PakePointLogo className="h-10 md:h-16 w-auto text-text-navbar hover:text-text-highlightHover" />
        </Link>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-4">
          {/* Desktop Navigation */}
          <div className="hidden md:flex text-xl items-center space-x-4">
            <Link href="/" className="hover:text-text-highlightHover">
              <AiOutlineHome size={30} />
            </Link>
            <Link href="/about" className="hover:text-text-highlightHover">About</Link>
            <Link href="/services" className="hover:text-text-highlightHover">Services</Link>
            <Link href="/portfolio" className="hover:text-text-highlightHover">Portfolio</Link>
            <Link href="/blog" className="hover:text-text-highlightHover">Blog</Link>
            <Link href="/contact" className="hover:text-text-highlightHover">Contact</Link>
          </div>
          <button
            className={`relative w-16 h-8 rounded-full transition-all duration-300 shadow-inner ${
              theme === "dark" ? "bg-white/10 shadow-[#251f14]" : "bg-white/10 shadow-[#393129]"
            }`}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Dark Mode"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-all duration-300 transform ${
                theme === "dark"
                  ? "translate-x-8 bg-[#251f14] shadow-lg shadow-[#251f14]"
                  : "bg-[#3D3D3D] shadow-lg shadow-[#393129]"
              }`}
            >
              {mounted && theme === "dark" ? (
                <BsMoon className="text-text-navbar mx-auto mt-1" size={18} />
              ) : (
                <BsSun className="text-[#DFAD2D] mx-auto mt-1" size={18} />
              )}
            </div>
          </button>
        </div>

        {/* Mobile Menu Wrapper */}
        <div ref={menuWrapperRef} className="md:hidden relative">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="text-button focus:outline-none focus:text-button-darkHover transition-transform duration-300 transform scale-110"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              // X Icon
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6L18 18M6 18L18 6"
                />
              </svg>
            ) : (
              // Hamburger Menu Icon
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Mobile Navigation with Full-Width & Opaque Background */}
          {isOpen && (
           <>
         
           {/* Full-width dropdown menu with opaque background */}
           <div className="fixed top-16 left-0 w-full bg-[var(--color-navbar)] px-4 pb-3 space-y-2 transition-all duration-300 shadow-lg z-50">
          	 <Link href="/" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 Home
          	 </Link>
          	 <Link href="/about" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 About
          	 </Link>
          	 <Link href="/services" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 Services
          	 </Link>
          	 <Link href="/portfolio" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 Portfolio
          	 </Link>
          	 <Link href="/blog" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 Blog
          	 </Link>
          	 <Link href="/contact" className="block hover:text-text-highlightHover transition" onClick={() => setIsOpen(false)}>
          	 Contact
          	 </Link>
           </div>
           </>
          )}

        </div>
      </div>
    </nav>
  );
}
