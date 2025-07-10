import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SimpleNavigation = (): any => {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/pokedex', label: 'Pokédex', icon: '📚' },
    { href: '/tcgsets', label: 'TCG Sets', icon: '🃏' },
    { href: '/pocketmode', label: 'Pocket', icon: '📱' },
    { href: '/favorites', label: 'Favorites', icon: '⭐' },
    { href: '/trending', label: 'Trending', icon: '📈' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">DexTrends</span>
            </a>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item: any) => (
              <Link key={item.href} href={item.href}>
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </a>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavigation;