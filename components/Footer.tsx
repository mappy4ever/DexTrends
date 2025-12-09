import React from 'react';
import Link from 'next/link';
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiHeart,
  FiGrid,
  FiList,
  FiFolder,
  FiTrendingUp
} from 'react-icons/fi';
// Social brand icons - exceptions where Feather has no equivalent
import { FaDiscord } from 'react-icons/fa';
// Domain-specific icons for card games
import { GiCardPickup, GiCrossedSwords } from 'react-icons/gi';
import { borderRadiusClasses } from '../styles/design-tokens';
import { FooterLogo } from '../components/ui/DexTrendsLogo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: '/pokedex', label: 'Pokédex', icon: <FiGrid className="w-4 h-4" /> },
    { href: '/tcgexpansions', label: 'TCG Sets', icon: <FiList className="w-4 h-4" /> },
    { href: '/pocketmode', label: 'Pocket Mode', icon: <GiCardPickup className="w-4 h-4" /> },
    { href: '/trending', label: 'Trending', icon: <FiTrendingUp className="w-4 h-4" /> },
    { href: '/battle-simulator', label: 'Battle', icon: <GiCrossedSwords className="w-4 h-4" /> },
    { href: '/collections', label: 'Collections', icon: <FiFolder className="w-4 h-4" /> },
  ];

  const socialLinks = [
    { href: 'https://github.com', label: 'GitHub', icon: <FiGithub className="w-5 h-5" /> },
    { href: 'https://twitter.com', label: 'Twitter', icon: <FiTwitter className="w-5 h-5" /> },
    { href: 'https://discord.com', label: 'Discord', icon: <FaDiscord className="w-5 h-5" /> },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: <FiLinkedin className="w-5 h-5" /> },
  ];

  return (
    <footer className="relative w-full mt-16">
      {/* Clean Footer Content - No wave separator for minimal design */}
      <div className="relative bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <FooterLogo />
              </div>
              <p className="text-stone-600 dark:text-stone-300 max-w-xs mx-auto md:mx-0">
                Your comprehensive Pokemon TCG and Pokedex companion. Track, trade, and battle with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-stone-800 dark:text-white mb-4">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-2 px-4 py-2 ${borderRadiusClasses.lg} text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-amber-600 dark:hover:text-amber-400 transition-all duration-150`}
                  >
                    <span className="text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-150">
                      {link.icon}
                    </span>
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Social & Newsletter */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold text-stone-800 dark:text-white mb-4">
                Connect With Us
              </h4>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-end gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className={`p-3 ${borderRadiusClasses.full} bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-300 hover:bg-amber-600 hover:text-white hover:shadow-md transition-all duration-150`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="max-w-xs mx-auto md:ml-auto md:mr-0">
                <p className="text-sm text-stone-600 dark:text-stone-300 mb-3">
                  Stay updated with the latest Pokemon TCG news
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className={`flex-1 px-4 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 ${borderRadiusClasses.lg} focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow duration-150`}
                  />
                  <button
                    className={`px-4 py-2 bg-amber-600 text-white text-sm font-medium ${borderRadiusClasses.lg} hover:bg-amber-700 hover:shadow-md transition-all duration-150`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-stone-200 dark:border-stone-700/50" />

          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-600 dark:text-stone-300 text-center md:text-left">
              © {currentYear} DexTrends - A{" "}
              <a
                href="https://www.pakepoint.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-150"
              >
                PakePoint
              </a>
              {" "}Project. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-150"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-150"
              >
                Terms of Service
              </Link>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                Made with <FiHeart className="w-3 h-3" /> by Trainers
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;