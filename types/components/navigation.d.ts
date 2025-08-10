// Navigation-related type definitions

import { ReactNode } from 'react';

// Route types
export interface Route {
  path: string;
  exact?: boolean;
  component?: ReactNode;
  redirect?: string;
  protected?: boolean;
  roles?: string[];
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Navigation item types
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  href?: string;
  icon?: ReactNode | string;
  badge?: string | number | BadgeConfig;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  active?: boolean;
  exact?: boolean;
  roles?: string[];
  tooltip?: string;
  className?: string;
  divider?: boolean;
  group?: string;
  expanded?: boolean;
}

export interface BadgeConfig {
  value: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  variant?: 'solid' | 'outline' | 'dot';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Breadcrumb types
export interface BreadcrumbItem {
  label: string;
  path?: string;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

// Tab types
export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
  icon?: ReactNode;
  badge?: string | number | BadgeConfig;
  disabled?: boolean;
  closable?: boolean;
  lazy?: boolean;
  keepAlive?: boolean;
}

// Menu types
export interface MenuItem extends NavigationItem {
  type?: 'item' | 'submenu' | 'group' | 'divider';
  shortcut?: string;
  danger?: boolean;
}

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Sidebar types
export interface SidebarConfig {
  items: NavigationItem[];
  collapsed?: boolean;
  collapsible?: boolean;
  width?: number | string;
  collapsedWidth?: number | string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  logo?: ReactNode;
  footer?: ReactNode;
  onCollapse?: (collapsed: boolean) => void;
}

// Navigation bar types
export interface NavbarConfig {
  brand?: {
    logo?: ReactNode;
    text?: string;
    href?: string;
    onClick?: () => void;
  };
  items?: NavigationItem[];
  actions?: ReactNode;
  search?: {
    placeholder?: string;
    onSearch?: (query: string) => void;
    suggestions?: string[];
  };
  user?: {
    name?: string;
    avatar?: string;
    menu?: MenuItem[];
  };
  notifications?: {
    count?: number;
    items?: NotificationItem[];
    onViewAll?: () => void;
  };
  sticky?: boolean;
  transparent?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface NotificationItem {
  id: string;
  title: string;
  message?: string;
  time?: string;
  read?: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Pagination types
export interface PaginationConfig {
  current: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  simple?: boolean;
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// Stepper/Wizard types
export interface StepItem {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  content?: ReactNode;
  status?: 'wait' | 'process' | 'finish' | 'error';
  disabled?: boolean;
  validator?: () => boolean | Promise<boolean>;
  onEnter?: () => void;
  onLeave?: () => void;
}

export interface StepperConfig {
  steps: StepItem[];
  current: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'default';
  labelPlacement?: 'horizontal' | 'vertical';
  status?: 'wait' | 'process' | 'finish' | 'error';
  onChange?: (current: number) => void;
  onFinish?: () => void;
}

// Navigation context
export interface NavigationContext {
  currentPath: string;
  previousPath?: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  hash?: string;
  navigate: (path: string, options?: NavigateOptions) => void;
  goBack: () => void;
  goForward: () => void;
  refresh: () => void;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;  // Navigation state - can be any serializable router state
  shallow?: boolean;
  scroll?: boolean;
  locale?: string;
}

// Router types (Next.js specific)
export interface RouterQuery {
  [key: string]: string | string[] | undefined;
}

export interface RouterProps {
  pathname: string;
  route: string;
  query: RouterQuery;
  asPath: string;
  basePath: string;
  locale?: string;
  locales?: string[];
  defaultLocale?: string;
  isReady: boolean;
  isPreview: boolean;
  isLocaleDomain: boolean;
}

// Link types
export interface LinkProps {
  href: string;
  as?: string;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean;
  locale?: string | false;
  legacyBehavior?: boolean;
}

// Anchor/ScrollSpy types
export interface AnchorItem {
  id: string;
  title: string;
  href: string;
  children?: AnchorItem[];
}

export interface ScrollSpyConfig {
  items: AnchorItem[];
  offset?: number;
  smooth?: boolean;
  duration?: number;
  activeClass?: string;
  onActiveChange?: (activeId: string) => void;
}

// Navigation guards
export interface NavigationGuard {
  canActivate?: (route: Route) => boolean | Promise<boolean>;
  canDeactivate?: (route: Route) => boolean | Promise<boolean>;
  canLoad?: (route: Route) => boolean | Promise<boolean>;
  redirectTo?: string;
}

// Mobile navigation
export interface MobileNavigationConfig {
  type: 'drawer' | 'bottom-tabs' | 'action-sheet';
  items: NavigationItem[];
  activeItem?: string;
  swipeEnabled?: boolean;
  hideOnScroll?: boolean;
  showLabels?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

// Search configuration
export interface SearchConfig {
  placeholder?: string;
  hotkeys?: string[];
  sources?: SearchSource[];
  maxResults?: number;
  debounce?: number;
  onSearch?: (query: string) => void | Promise<SearchResult[]>;
  onSelect?: (result: SearchResult) => void;
}

export interface SearchSource {
  id: string;
  name: string;
  search: (query: string) => Promise<SearchResult[]>;
  priority?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  url?: string;
  icon?: ReactNode;
  category?: string;
  metadata?: Record<string, any>;
}

// History types
export interface HistoryEntry {
  path: string;
  title?: string;
  timestamp: number;
  state?: unknown;  // History state - serializable router/navigation data
}

export interface NavigationHistory {
  entries: HistoryEntry[];
  currentIndex: number;
  maxSize?: number;
  onUpdate?: (history: NavigationHistory) => void;
}