// UnifiedAppContext type definitions

import { ReactNode } from 'react';
import { Pokemon, SimplePokemon } from '../api/pokemon';
import { TCGCard, SimpleCard, Deck, CollectionCard } from '../api/cards';
import { PocketCard, PocketDeck, PocketCollection } from '../api/pocket-cards';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ThemeColor = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'pink';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
  highContrast?: boolean;
  reducedMotion?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
}

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
  };
  preferences?: UserPreferences;
  stats?: UserStats;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  roles?: string[];
  subscription?: SubscriptionInfo;
}

export interface UserPreferences {
  theme?: ThemeConfig;
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
  display?: DisplayPreferences;
  gameplay?: GameplayPreferences;
}

export interface NotificationPreferences {
  email?: {
    newsletter?: boolean;
    updates?: boolean;
    trades?: boolean;
    priceAlerts?: boolean;
  };
  push?: {
    enabled?: boolean;
    trades?: boolean;
    events?: boolean;
    friends?: boolean;
  };
  inApp?: {
    enabled?: boolean;
    sound?: boolean;
    vibration?: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility?: 'public' | 'friends' | 'private';
  collectionVisibility?: 'public' | 'friends' | 'private';
  showOnlineStatus?: boolean;
  allowFriendRequests?: boolean;
  allowTradeRequests?: boolean;
}

export interface DisplayPreferences {
  language?: string;
  currency?: string;
  dateFormat?: string;
  cardLayout?: 'grid' | 'list';
  cardSize?: 'small' | 'medium' | 'large';
  showPrices?: boolean;
  showRatings?: boolean;
  animations?: boolean;
}

export interface GameplayPreferences {
  autoSave?: boolean;
  confirmActions?: boolean;
  soundEffects?: boolean;
  backgroundMusic?: boolean;
  hapticFeedback?: boolean;
}

export interface UserStats {
  totalCards?: number;
  uniqueCards?: number;
  totalDecks?: number;
  totalTrades?: number;
  collectionValue?: number;
  favoriteType?: string;
  joinDate?: string;
  lastActive?: string;
}

export interface SubscriptionInfo {
  tier: 'free' | 'basic' | 'premium' | 'pro';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  features?: string[];
}

// Favorites types
export interface FavoritesState {
  cards: SimpleCard[];
  pokemon: SimplePokemon[];
  decks: string[];
  sets: string[];
}

export interface FavoritesActions {
  addToFavorites: (type: keyof FavoritesState, item: any) => void;
  removeFromFavorites: (type: keyof FavoritesState, itemId: string | number) => void;
  isFavorite: (type: keyof FavoritesState, itemId: string | number) => boolean;
  clearFavorites: (type?: keyof FavoritesState) => void;
  toggleFavorite: (type: keyof FavoritesState, item: any) => void;
}

// Settings types
export interface AppSettings {
  general?: GeneralSettings;
  appearance?: AppearanceSettings;
  performance?: PerformanceSettings;
  accessibility?: AccessibilitySettings;
  advanced?: AdvancedSettings;
}

export interface GeneralSettings {
  autoSave?: boolean;
  autoUpdate?: boolean;
  crashReports?: boolean;
  analytics?: boolean;
  defaultView?: string;
  startupPage?: string;
}

export interface AppearanceSettings {
  theme?: ThemeConfig;
  compactMode?: boolean;
  showAnimations?: boolean;
  cardStyle?: 'modern' | 'classic' | 'minimal';
  fontFamily?: string;
}

export interface PerformanceSettings {
  cacheEnabled?: boolean;
  cacheSize?: number;
  imageQuality?: 'low' | 'medium' | 'high' | 'auto';
  lazyLoading?: boolean;
  prefetch?: boolean;
  reducedData?: boolean;
}

export interface AccessibilitySettings {
  screenReader?: boolean;
  keyboardNavigation?: boolean;
  focusIndicators?: boolean;
  colorBlindMode?: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  textToSpeech?: boolean;
  largeText?: boolean;
}

export interface AdvancedSettings {
  developerMode?: boolean;
  experimentalFeatures?: string[];
  customEndpoints?: Record<string, string>;
  debugLogging?: boolean;
}

// Collection types
export interface CollectionState {
  cards: CollectionCard[];
  pocketCards: PocketCollection | null;
  stats: CollectionStats;
  filters: CollectionFilters;
  sort: CollectionSort;
}

export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  totalValue: number;
  bySet: Record<string, number>;
  byRarity: Record<string, number>;
  byType: Record<string, number>;
  completionRate: number;
}

export interface CollectionFilters {
  sets?: string[];
  types?: string[];
  rarities?: string[];
  priceRange?: { min?: number; max?: number };
  owned?: boolean;
  wishlist?: boolean;
}

export interface CollectionSort {
  field: 'name' | 'number' | 'set' | 'rarity' | 'price' | 'dateAdded';
  order: 'asc' | 'desc';
}

// Deck builder types
export interface DeckBuilderState {
  currentDeck: Deck | null;
  savedDecks: Deck[];
  filters: DeckFilters;
  validation: DeckValidation;
}

export interface DeckFilters {
  format?: 'standard' | 'expanded' | 'unlimited';
  types?: string[];
  costs?: number[];
  sets?: string[];
}

export interface DeckValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: DeckStats;
}

export interface ValidationError {
  type: 'card-limit' | 'deck-size' | 'banned-card' | 'format';
  message: string;
  cardId?: string;
}

export interface ValidationWarning {
  type: 'energy-balance' | 'type-coverage' | 'curve';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DeckStats {
  totalCards: number;
  pokemonCount: number;
  trainerCount: number;
  energyCount: number;
  averageCost: number;
  typeDistribution: Record<string, number>;
}

// App state types
export interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // UI State
  theme: ThemeConfig;
  sidebar: SidebarState;
  modals: ModalState;
  toasts: Toast[];
  
  // Data
  favorites: FavoritesState;
  collection: CollectionState;
  deckBuilder: DeckBuilderState;
  settings: AppSettings;
  
  // Cache & Performance
  cache: CacheState;
  performance: PerformanceState;
  
  // Feature flags
  features: Record<string, boolean>;
}

export interface SidebarState {
  isOpen: boolean;
  isPinned: boolean;
  width: number;
}

export interface ModalState {
  activeModals: string[];
  modalData: Record<string, any>;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface CacheState {
  size: number;
  entries: number;
  hitRate: number;
  lastCleared?: string;
}

export interface PerformanceState {
  fps: number;
  memory: number;
  loadTime: number;
  apiLatency: number;
}

// Context value type
export interface UnifiedAppContextValue {
  // State
  state: AppState;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  
  // User actions
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  
  // Theme actions
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleTheme: () => void;
  
  // Favorites actions
  favorites: FavoritesState;
  addToFavorites: (type: keyof FavoritesState, item: any) => void;
  removeFromFavorites: (type: keyof FavoritesState, itemId: string | number) => void;
  
  // Collection actions
  collection: CollectionState;
  addToCollection: (card: CollectionCard) => Promise<void>;
  removeFromCollection: (cardId: string) => Promise<void>;
  updateCollection: (cardId: string, updates: Partial<CollectionCard>) => Promise<void>;
  
  // Deck builder actions
  deckBuilder: DeckBuilderState;
  createDeck: (deck: Omit<Deck, 'id' | 'dateCreated' | 'dateModified'>) => Promise<void>;
  updateDeck: (deckId: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;
  
  // Settings actions
  settings: AppSettings;
  updateSettings: (section: keyof AppSettings, settings: any) => void;
  resetSettings: (section?: keyof AppSettings) => void;
  
  // UI actions
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (toastId: string) => void;
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  toggleSidebar: () => void;
  
  // Utility functions
  clearCache: () => Promise<void>;
  refreshData: () => Promise<void>;
  exportData: () => Promise<Blob>;
  importData: (file: File) => Promise<void>;
}

// Provider props
export interface UnifiedAppProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
  persistKey?: string;
  onError?: (error: Error) => void;
}