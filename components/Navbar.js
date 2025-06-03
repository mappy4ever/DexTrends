import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomSiteLogo from '../components/icons/CustomSiteLogo';
import { RxDashboard } from "react-icons/rx"; 
import { AiOutlineBulb } from "react-icons/ai";
import { BsSun, BsMoon, BsGlobeEuropeAfrica } from "react-icons/bs";
import { RiGovernmentFill } from "react-icons/ri";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => { setMounted(true); }, []);
  const isDarkMode = resolvedTheme === 'dark';

  const navItems = [
    { href: "/", label: "Main", icon: <RxDashboard size={20} /> },
    { href: "/TCGSets", label: "TCG Sets", icon: <RiGovernmentFill size={20} /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <AiOutlineBulb size={20} /> },
    { href: "/PokeDex", label: "Pokédex", icon: <BsGlobeEuropeAfrica size={20} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-navbar/80 backdrop-blur-xl border-b border-border shadow-lg flex items-center justify-between px-4 md:px-8 h-16">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <CustomSiteLogo size={38} />
          <span className="hidden sm:inline font-extrabold tracking-tight text-foreground">DexTrends</span>
        </Link>
      </div>
      <div className="flex-1 flex justify-center">
        <ul className="flex gap-2 md:gap-4 items-center">
          {navItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-colors duration-150 hover:bg-primary/10 hover:text-primary ${router.pathname === item.href ? 'bg-primary/10 text-primary' : 'text-text-navbar'}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2">
        {mounted && (
          <button
            aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
            className="p-2 rounded-full hover:bg-surface-hovered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
          >
            {isDarkMode ? <BsSun size={20} /> : <BsMoon size={20} />}
          </button>
        )}
      </div>
    </nav>
  );
}