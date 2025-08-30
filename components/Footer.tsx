import React from 'react';
import Link from 'next/link';
import { 
  FaGithub, 
  FaTwitter, 
  FaDiscord, 
  FaLinkedin,
  FaHeart 
} from 'react-icons/fa';
import { 
  BsGrid, 
  BsCardList, 
  BsCollection
} from 'react-icons/bs';
import { GiCardPickup, GiCrossedSwords } from 'react-icons/gi';
import { FiTrendingUp } from 'react-icons/fi';
import { borderRadiusClasses, glassEffect } from '../styles/design-tokens';
import { FooterLogo } from '../components/ui/DexTrendsLogo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  const quickLinks = [
    { href: '/pokedex', label: 'Pokédex', icon: <BsGrid className="w-4 h-4" /> },
    { href: '/tcg-sets', label: 'TCG Sets', icon: <BsCardList className="w-4 h-4" /> },
    { href: '/pocketmode', label: 'Pocket Mode', icon: <GiCardPickup className="w-4 h-4" /> },
    { href: '/trending', label: 'Trending', icon: <FiTrendingUp className="w-4 h-4" /> },
    { href: '/battle-simulator', label: 'Battle', icon: <GiCrossedSwords className="w-4 h-4" /> },
    { href: '/collections', label: 'Collections', icon: <BsCollection className="w-4 h-4" /> },
  ];

  const socialLinks = [
    { href: 'https://github.com', label: 'GitHub', icon: <FaGithub className="w-5 h-5" /> },
    { href: 'https://twitter.com', label: 'Twitter', icon: <FaTwitter className="w-5 h-5" /> },
    { href: 'https://discord.com', label: 'Discord', icon: <FaDiscord className="w-5 h-5" /> },
    { href: 'https://linkedin.com', label: 'LinkedIn', icon: <FaLinkedin className="w-5 h-5" /> },
  ];

  return (
    <footer className="relative w-full mt-20">
      {/* Wave SVG Separator */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-full">
        <svg 
          viewBox="0 0 1440 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-24"
        >
          <path 
            d="M0,50 C240,100 480,0 720,50 C960,100 1200,0 1440,50 L1440,100 L0,100 Z" 
            className="fill-white dark:fill-gray-900 opacity-10"
          />
          <path 
            d="M0,70 C240,90 480,50 720,70 C960,90 1200,50 1440,70 L1440,100 L0,100 Z" 
            className="fill-white dark:fill-gray-900 opacity-20"
          />
          <path 
            d="M0,85 C240,95 480,75 720,85 C960,95 1200,75 1440,85 L1440,100 L0,100 Z" 
            className="fill-white dark:fill-gray-900 opacity-30"
          />
        </svg>
      </div>

      {/* Glass Morphism Footer Content */}
      <div className={`relative ${glassEffect.combined} border-t border-gray-200 dark:border-gray-700 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <FooterLogo />
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-xs mx-auto md:mx-0">
                Your comprehensive Pokemon TCG and Pokedex companion. Track, trade, and battle with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-2 px-4 py-2 ${borderRadiusClasses.lg} text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-pink-900/20 hover:text-pokemon-red dark:hover:text-pink-400 transition-all duration-300`}
                  >
                    <span className="text-gray-400 group-hover:text-pokemon-red dark:group-hover:text-pink-400 transition-colors">
                      {link.icon}
                    </span>
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Social & Newsletter */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                    className={`p-3 ${borderRadiusClasses.full} bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-400 hover:from-pokemon-red hover:to-pink-500 hover:text-white hover:shadow-lg hover:scale-110 transition-all duration-300`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="max-w-xs mx-auto md:ml-auto md:mr-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Stay updated with the latest Pokemon TCG news
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email"
                    className={`flex-1 px-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 ${borderRadiusClasses.lg} focus:outline-none focus:ring-2 focus:ring-pokemon-red focus:border-transparent`}
                  />
                  <button
                    className={`px-4 py-2 bg-gradient-to-r from-pokemon-red to-pink-500 text-white text-sm font-medium ${borderRadiusClasses.lg} hover:from-red-600 hover:to-pink-600 hover:shadow-lg transition-all duration-300`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200 dark:border-gray-700/50" />

          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              © {currentYear} DexTrends - A{" "}
              <a
                href="https://www.pakepoint.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                PakePoint
              </a>
              {" "}Project. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 dark:text-gray-400 hover:text-pokemon-red dark:hover:text-pink-400 transition-colors"
              >
                Terms of Service
              </Link>
              <button className="flex items-center gap-1 text-pink-500 hover:text-pink-600 transition-colors">
                Made with <FaHeart className="w-3 h-3" /> by Trainers
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;