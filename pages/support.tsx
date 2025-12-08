import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container } from '@/components/ui/Container';
import { FiCommand, FiHelpCircle, FiZap, FiBook, FiMail, FiSend, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';

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

// Feature ideas for internal development tracking
interface FeatureIdea {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed' | 'idea';
  category: 'pokedex' | 'tcg' | 'pocket' | 'social' | 'ux' | 'data';
}

const featureIdeas: FeatureIdea[] = [
  // High Priority
  {
    id: 'deck-sharing',
    title: 'Deck Sharing & Export',
    description: 'Share decks via links, export as images for social media, QR codes for quick import',
    priority: 'high',
    status: 'completed',
    category: 'tcg'
  },
  {
    id: 'collection-tracker',
    title: 'Card Collection Tracker',
    description: 'Track owned cards, completion percentage per set, wish lists, and trade lists',
    priority: 'high',
    status: 'completed',
    category: 'tcg'
  },
  {
    id: 'price-alerts',
    title: 'Price Drop Alerts',
    description: 'Get notified when card prices drop below target, daily/weekly price digests via email',
    priority: 'high',
    status: 'completed',
    category: 'tcg'
  },
  {
    id: 'team-builder',
    title: 'Pokemon Team Builder',
    description: 'Build competitive teams with type coverage analysis, weakness/resistance calculator',
    priority: 'high',
    status: 'completed',
    category: 'pokedex'
  },
  // Medium Priority
  {
    id: 'compare-pokemon',
    title: 'Pokemon Comparison Tool',
    description: 'Side-by-side comparison of stats, moves, abilities between 2-4 Pokemon',
    priority: 'medium',
    status: 'planned',
    category: 'pokedex'
  },
  {
    id: 'meta-decks',
    title: 'Meta Deck Analytics',
    description: 'Track tournament-winning decks, popular card combinations, meta shifts over time',
    priority: 'medium',
    status: 'idea',
    category: 'tcg'
  },
  {
    id: 'pocket-pull-rates',
    title: 'Pocket Pull Rate Simulator',
    description: 'Simulate pack openings, track pull rates, expected value calculator',
    priority: 'medium',
    status: 'idea',
    category: 'pocket'
  },
  {
    id: 'social-profiles',
    title: 'User Profiles & Social',
    description: 'Public profiles showing collections, favorite Pokemon, deck builds, achievements',
    priority: 'medium',
    status: 'idea',
    category: 'social'
  },
  {
    id: 'advanced-filters',
    title: 'Advanced Search Filters',
    description: 'Filter by weakness, resistance, evolution stage, catch rate, egg group, etc.',
    priority: 'medium',
    status: 'planned',
    category: 'pokedex'
  },
  {
    id: 'mega-regional-forms',
    title: 'Mega Evolutions & Regional Forms',
    description: 'Browse Mega Evolutions, Alolan forms, Galarian forms, Hisuian forms, and Paldean forms with stats and comparisons',
    priority: 'medium',
    status: 'planned',
    category: 'pokedex'
  },
  // Low Priority / Ideas
  {
    id: 'trading-marketplace',
    title: 'Card Trading Platform',
    description: 'Match users for trades, trade verification, reputation system',
    priority: 'low',
    status: 'idea',
    category: 'social'
  },
  {
    id: 'ai-deck-suggestions',
    title: 'AI Deck Recommendations',
    description: 'ML-powered deck suggestions based on your collection and play style',
    priority: 'low',
    status: 'idea',
    category: 'tcg'
  },
  {
    id: 'nuzlocke-tracker',
    title: 'Nuzlocke Challenge Tracker',
    description: 'Track Nuzlocke runs with encounters, deaths, team history per route',
    priority: 'low',
    status: 'idea',
    category: 'pokedex'
  },
  {
    id: 'ev-iv-calculator',
    title: 'EV/IV Calculator',
    description: 'Calculate hidden stats, optimal EV spreads, breeding helper',
    priority: 'medium',
    status: 'planned',
    category: 'data'
  },
  {
    id: 'dark-mode-themes',
    title: 'Custom Themes',
    description: 'Type-based themes (Fire theme, Water theme), OLED dark mode, custom accents',
    priority: 'low',
    status: 'idea',
    category: 'ux'
  },
  {
    id: 'offline-mode',
    title: 'Offline Mode (PWA)',
    description: 'Install as app, browse cached Pokemon/cards offline, sync when online',
    priority: 'medium',
    status: 'idea',
    category: 'ux'
  }
];

const priorityColors = {
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  low: { bg: 'bg-stone-100 dark:bg-stone-800', text: 'text-stone-600 dark:text-stone-400', border: 'border-stone-200 dark:border-stone-700' }
};

const statusIcons = {
  completed: FiCheckCircle,
  'in-progress': FiClock,
  planned: FiSend,
  idea: FiStar
};

const statusLabels = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  planned: 'Planned',
  idea: 'Idea'
};

const categoryLabels: Record<string, string> = {
  pokedex: 'Pokédex',
  tcg: 'TCG Cards',
  pocket: 'Pocket',
  social: 'Social',
  ux: 'UX',
  data: 'Data'
};

export default function SupportPage() {
  const router = useRouter();
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [featureFilter, setFeatureFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'in-progress' | 'idea'>('all');

  const handlePageHelpClick = useCallback((path: string) => {
    setExpandedPage(expandedPage === path ? null : path);
  }, [expandedPage]);

  // Filter features
  const filteredFeatures = featureIdeas.filter(feature => {
    if (featureFilter !== 'all' && feature.priority !== featureFilter) return false;
    if (statusFilter !== 'all' && feature.status !== statusFilter) return false;
    return true;
  });

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
                <FiHelpCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
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
                <FiZap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
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
                <FiCommand className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                <FiBook className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                <FiMail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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

          {/* Features & Roadmap - Internal Development Tracker */}
          <Container variant="elevated" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 flex items-center justify-center">
                <FiSend className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Features & Roadmap</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Internal development tracker</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {featureIdeas.filter(f => f.status === 'completed').length}
                </p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-300">Done</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {featureIdeas.filter(f => f.status === 'in-progress').length}
                </p>
                <p className="text-[10px] text-blue-700 dark:text-blue-300">Active</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {featureIdeas.filter(f => f.status === 'planned').length}
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-300">Planned</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-stone-50 dark:bg-stone-800">
                <p className="text-lg font-bold text-stone-600 dark:text-stone-400">
                  {featureIdeas.filter(f => f.status === 'idea').length}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">Ideas</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex gap-1">
                {(['all', 'high', 'medium', 'low'] as const).map(priority => (
                  <button
                    key={priority}
                    onClick={() => setFeatureFilter(priority)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      featureFilter === priority
                        ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {priority === 'all' ? 'All' : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(['all', 'planned', 'in-progress', 'idea'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? 'bg-violet-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {status === 'all' ? 'All Status' : statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFeatures.map(feature => {
                const StatusIcon = statusIcons[feature.status];
                const colors = priorityColors[feature.priority];
                return (
                  <div
                    key={feature.id}
                    className={`p-3 rounded-lg border ${colors.border} ${colors.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {feature.title}
                          </h4>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.text} ${colors.bg}`}>
                            {feature.priority}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            {categoryLabels[feature.category]}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFeatures.length === 0 && (
              <div className="text-center py-8 text-stone-500 dark:text-stone-400">
                <p className="text-sm">No features match the current filters.</p>
                <button
                  onClick={() => { setFeatureFilter('all'); setStatusFilter('all'); }}
                  className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
              <p className="text-xs text-stone-500 dark:text-stone-400 text-center">
                This roadmap is for internal planning. Features may change based on user feedback and priorities.
              </p>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}
