import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChevronRight, FaHome } from 'react-icons/fa';

interface Breadcrumb {
  title: string;
  href: string | null;
  icon: string;
  isActive?: boolean;
  isEllipsis?: boolean;
}

interface BreadcrumbNavigationProps {
  customBreadcrumbs?: Breadcrumb[] | null;
  showHome?: boolean;
  className?: string;
  maxItems?: number;
  showPageTitle?: boolean;
  /** On mobile, collapse to "Home > Current" only (default: true) */
  collapseOnMobile?: boolean;
}

interface RouteInfo {
  title: string;
  icon: string;
}

/**
 * Dynamic Breadcrumb Navigation Component
 * Provides contextual navigation path for better UX
 */
const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  customBreadcrumbs = null,
  showHome = true,
  className = '',
  maxItems = 5,
  showPageTitle = true,
  collapseOnMobile = true
}) => {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Route mapping for breadcrumb generation - wrapped in useMemo to prevent recreation
  const routeMap: Record<string, RouteInfo> = useMemo(() => ({
    '/': { title: 'Home', icon: '🏠' },
    '/cards': { title: 'Cards', icon: '🃏' },
    '/cards/[cardId]': { title: 'Card Details', icon: '🔍' },
    '/pokedex': { title: 'Pokédex', icon: '📚' },
    '/pokedex/[pokeid]': { title: 'Pokémon Details', icon: '🔍' },
    '/pocketmode': { title: 'Pocket Mode', icon: '📱' },
    '/pocketmode/[pokemonid]': { title: 'Pocket Card', icon: '🔍' },
    '/pocketmode/deckbuilder': { title: 'Deck Builder', icon: '🏗️' },
    '/pocketmode/decks': { title: 'My Decks', icon: '📦' },
    '/pocketmode/expansions': { title: 'Expansions', icon: '📈' },
    '/tcgexpansions': { title: 'TCG Sets', icon: '🎯' },
    '/tcgexpansions/[setid]': { title: 'Set Details', icon: '🔍' },
    '/trending': { title: 'Trending', icon: '📈' },
    '/favorites': { title: 'Favorites', icon: '⭐' },
    '/leaderboard': { title: 'Leaderboard', icon: '🏆' },
    '/collections': { title: 'Collections', icon: '💎' },
    '/fun': { title: 'Fun Zone', icon: '🎮' },
    '/qa-test': { title: 'QA Testing', icon: '🧪' }
  }), []);

  // Generate breadcrumbs from current route
  const breadcrumbs = useMemo(() => {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const pathSegments = router.asPath.split('/').filter(segment => segment);
    const breadcrumbs: Breadcrumb[] = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbs.push({
        title: 'Home',
        href: '/',
        icon: '🏠',
        isActive: false
      });
    }

    // Skip home if we're already on home page
    if (router.pathname === '/') {
      return showHome ? breadcrumbs.map(b => ({ ...b, isActive: true })) : [];
    }

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Check if this is a dynamic route
      const isLast = index === pathSegments.length - 1;
      let routeKey = currentPath;
      
      // Handle dynamic routes
      if (router.query && Object.keys(router.query).length > 0) {
        Object.keys(router.query).forEach(key => {
          if (segment === router.query[key]) {
            routeKey = routeKey.replace(segment, `[${key}]`);
          }
        });
      }

      const routeInfo = routeMap[routeKey] || routeMap[router.pathname];
      
      // Generate title for dynamic segments
      let title = routeInfo?.title || segment;
      let icon = routeInfo?.icon || '📄';

      // Special handling for dynamic content
      if (router.query && segment === router.query.cardId) {
        title = `Card ${segment}`;
        icon = '🃏';
      } else if (router.query && segment === router.query.pokemonid) {
        title = `Pokémon ${segment}`;
        icon = '🔍';
      } else if (router.query && segment === router.query.pokeid) {
        title = `Pokédex #${segment}`;
        icon = '📚';
      } else if (router.query && segment === router.query.setid) {
        title = `Set: ${segment}`;
        icon = '🎯';
      }

      breadcrumbs.push({
        title,
        href: currentPath,
        icon,
        isActive: isLast
      });
    });

    // Limit breadcrumbs if too many
    if (breadcrumbs.length > maxItems) {
      const start = breadcrumbs.slice(0, 2);
      const end = breadcrumbs.slice(-2);
      return [
        ...start,
        { title: '...', href: null, icon: '⋯', isEllipsis: true },
        ...end
      ];
    }

    return breadcrumbs;
  }, [router.pathname, router.asPath, router.query, customBreadcrumbs, showHome, maxItems, routeMap]);

  // Mobile-optimized breadcrumbs: show only "Home > Current"
  const displayBreadcrumbs = useMemo(() => {
    if (!collapseOnMobile || !isMobile || breadcrumbs.length <= 2) {
      return breadcrumbs;
    }
    // On mobile, show first (Home) and last (current) only
    const first = breadcrumbs[0];
    const last = breadcrumbs[breadcrumbs.length - 1];
    return [first, last];
  }, [breadcrumbs, collapseOnMobile, isMobile]);

  // Don't render if no breadcrumbs or only home
  if (breadcrumbs.length <= 1 && !showPageTitle) {
    return null;
  }

  return (
    <nav className={`breadcrumb-navigation ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-1 sm:space-x-2 text-sm overflow-x-auto scrollbar-hide">
        {displayBreadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-stone-400 dark:text-stone-500 flex-shrink-0" />
            )}

            {crumb.isEllipsis ? (
              <span className="text-stone-400 dark:text-stone-500 px-1 sm:px-2">
                {crumb.icon}
              </span>
            ) : crumb.isActive ? (
              <span className="flex items-center space-x-1 text-stone-900 dark:text-stone-100 font-medium truncate max-w-[150px] sm:max-w-none">
                <span role="img" aria-hidden="true" className="flex-shrink-0">{crumb.icon}</span>
                <span className="truncate">{crumb.title}</span>
              </span>
            ) : (
              <Link
                href={crumb.href!}
                className="flex items-center space-x-1 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors duration-200 flex-shrink-0"
              >
                <span role="img" aria-hidden="true">{crumb.icon}</span>
                <span className="hover:underline hidden sm:inline">{crumb.title}</span>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Page Title Section */}
      {showPageTitle && breadcrumbs.length > 0 && (
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center space-x-2">
            <span role="img" aria-hidden="true" className="text-3xl">
              {breadcrumbs[breadcrumbs.length - 1].icon}
            </span>
            <span>{breadcrumbs[breadcrumbs.length - 1].title}</span>
          </h1>
        </div>
      )}
      <style jsx>{`
        .breadcrumb-navigation {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
        
        .dark .breadcrumb-navigation {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        @media (max-width: 640px) {
          .breadcrumb-navigation {
            padding: 0.75rem 0;
          }
          
          .breadcrumb-navigation h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </nav>
  );
};

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: Action[];
  breadcrumbs?: Breadcrumb[] | null;
  className?: string;
  children?: React.ReactNode;
  /** Show breadcrumbs above the title. Default: false (navbar provides navigation) */
  showBreadcrumbs?: boolean;
}

/**
 * Page Header with optional Breadcrumbs
 * Breadcrumbs are hidden by default since navbar provides navigation
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions = [],
  breadcrumbs = null,
  className = '',
  children,
  showBreadcrumbs = false
}) => {
  return (
    <div className={`page-header ${className}`}>
      {showBreadcrumbs && (
        <BreadcrumbNavigation
          customBreadcrumbs={breadcrumbs}
          showPageTitle={false}
        />
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 sm:text-base">
              {description}
            </p>
          )}
        </div>
        
        {(actions.length > 0 || children) && (
          <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                    action.variant === 'primary'
                      ? 'text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
                      : 'text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-700 focus:ring-amber-500'
                  }`}
                  disabled={action.disabled}
                >
                  {action.icon && (
                    <span className="mr-2" role="img" aria-hidden="true">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
              {children}
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .page-header {
          margin-bottom: 2rem;
        }
        
        @media (max-width: 640px) {
          .page-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
};

interface RelatedPage {
  title: string;
  href: string;
  icon: string;
  description?: string;
}

interface QuickNavigationProps {
  currentPage?: string;
  relatedPages?: RelatedPage[];
  className?: string;
}

/**
 * Quick Navigation Component
 * Shows related pages and quick actions
 */
const QuickNavigation: React.FC<QuickNavigationProps> = ({ 
  currentPage, 
  relatedPages = [], 
  className = '' 
}) => {
  if (relatedPages.length === 0) return null;

  return (
    <div className={`quick-navigation ${className}`}>
      <h3 className="text-sm font-medium text-stone-500 dark:text-stone-300 mb-3">
        Related Pages
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {relatedPages.map((page, index) => (
          <Link 
            key={index}
            href={page.href}
            className="flex items-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors duration-200 group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-200" role="img" aria-hidden="true">
              {page.icon}
            </span>
            <div>
              <div className="text-sm font-medium text-stone-900 dark:text-stone-100">
                {page.title}
              </div>
              {page.description && (
                <div className="text-xs text-stone-500 dark:text-stone-300">
                  {page.description}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbNavigation;
export { BreadcrumbNavigation, PageHeader, QuickNavigation };