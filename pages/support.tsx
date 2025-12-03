import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container } from '@/components/ui/Container';
import { BsKeyboard, BsQuestionCircle, BsLightbulb, BsBook, BsEnvelope } from 'react-icons/bs';

interface HelpSection {
  title: string;
  content: string;
}

interface PageHelp {
  title: string;
  sections: HelpSection[];
}

const pageHelpContent: Record<string, PageHelp> = {
  '/': {
    title: 'DexTrends Home',
    sections: [
      {
        title: 'Quick Start',
        content: 'Browse trending Pokemon cards, explore the Pokedex, or search for specific cards.'
      },
      {
        title: 'Navigation',
        content: 'Use the navigation bar at the top to explore different sections of the site.'
      }
    ]
  },
  '/pokedex': {
    title: 'Pokedex',
    sections: [
      {
        title: 'Search Pokemon',
        content: 'Type Pokemon names, numbers, or types to find specific Pokemon.'
      },
      {
        title: 'Favorites',
        content: 'Click the heart icon to add Pokemon to your favorites for quick access.'
      },
      {
        title: 'Filters',
        content: 'Use type filters and generation filters to narrow down your search.'
      }
    ]
  },
  '/cards': {
    title: 'Card Browser',
    sections: [
      {
        title: 'Price Tracking',
        content: 'View real-time prices from TCGPlayer and track price history.'
      },
      {
        title: 'Card Details',
        content: 'Click any card to see detailed stats, attacks, and market data.'
      },
      {
        title: 'Zoom Feature',
        content: 'Click the zoom icon or press the card image to view high-resolution images.'
      }
    ]
  },
  '/favorites': {
    title: 'Your Favorites',
    sections: [
      {
        title: 'Manage Favorites',
        content: 'View and organize your favorite Pokemon and cards in one place.'
      },
      {
        title: 'Sync Across Devices',
        content: 'Your favorites are automatically saved and synced across devices.'
      }
    ]
  }
};

const keyboardShortcuts = [
  { keys: 'Ctrl + K', description: 'Open global search' },
  { keys: 'F1', description: 'Toggle help mode' },
  { keys: 'Shift + ?', description: 'Toggle help mode (alternative)' },
  { keys: 'Ctrl + Shift + P', description: 'Go to Pokedex' },
  { keys: 'Ctrl + Shift + C', description: 'Go to Cards' },
  { keys: 'Ctrl + Shift + F', description: 'Go to Favorites' },
  { keys: 'Escape', description: 'Close modals and dialogs' },
];

const quickTips = [
  'Press Ctrl+K to quickly search anywhere on the site',
  'Double-click any card image for detailed zoom view',
  'Use Ctrl+Shift+F to quickly access your favorites',
  'Press F1 or Shift+? for help on any page',
  'Your favorites automatically sync across devices',
  'Use type filters to narrow down Pokemon searches',
  'Click column headers to sort tables',
  'Long-press on mobile to see quick actions',
];

export default function SupportPage() {
  const router = useRouter();
  const [expandedPage, setExpandedPage] = useState<string | null>(null);

  const handlePageHelpClick = useCallback((path: string) => {
    setExpandedPage(expandedPage === path ? null : path);
  }, [expandedPage]);

  return (
    <>
      <Head>
        <title>Support & Help | DexTrends</title>
        <meta name="description" content="Get help with using DexTrends - keyboard shortcuts, tips, and page-specific guides." />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Header */}
        <div className="bg-gradient-to-b from-amber-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <BsQuestionCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Support & Help</h1>
                <p className="text-stone-600 dark:text-stone-300">Tips, shortcuts, and guides to help you get the most out of DexTrends</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Quick Tips */}
          <Container variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <BsLightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Quick Tips</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-sm text-stone-700 dark:text-stone-300">{tip}</p>
                </div>
              ))}
            </div>
          </Container>

          {/* Keyboard Shortcuts */}
          <Container variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BsKeyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Keyboard Shortcuts</h2>
            </div>
            <div className="grid gap-2">
              {keyboardShortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50"
                >
                  <span className="text-sm text-stone-700 dark:text-stone-300">{shortcut.description}</span>
                  <kbd className="px-2.5 py-1.5 text-xs font-mono font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </Container>

          {/* Page-Specific Help */}
          <Container variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <BsBook className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Page Guides</h2>
            </div>
            <div className="space-y-2">
              {Object.entries(pageHelpContent).map(([path, help]) => (
                <div key={path} className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handlePageHelpClick(path)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{help.title}</span>
                      <span className="text-xs text-stone-500 dark:text-stone-300 font-mono">{path}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-stone-500 transition-transform ${expandedPage === path ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedPage === path && (
                    <div className="px-4 pb-4 space-y-3 border-t border-stone-200 dark:border-stone-700 pt-3">
                      {help.sections.map((section, index) => (
                        <div key={index}>
                          <h4 className="text-sm font-medium text-stone-800 dark:text-stone-200 mb-1">
                            {section.title}
                          </h4>
                          <p className="text-sm text-stone-600 dark:text-stone-300">
                            {section.content}
                          </p>
                        </div>
                      ))}
                      <button
                        onClick={() => router.push(path)}
                        className="mt-2 text-sm text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Go to {help.title}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>

          {/* Contact */}
          <Container variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <BsEnvelope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Need More Help?</h2>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
              If you have questions, feedback, or need assistance, feel free to reach out to us.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-800 dark:bg-stone-700 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-600 transition-colors"
              >
                Report an Issue
              </a>
              <a
                href="mailto:support@dextrends.com"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
