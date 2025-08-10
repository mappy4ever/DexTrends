// PWA-specific Type Declarations
// Extends browser APIs for Progressive Web App functionality

// BeforeInstallPromptEvent for PWA installation  
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extended Navigator interface for PWA features
interface ExtendedNavigator extends Navigator {
  standalone?: boolean; // iOS Safari standalone mode
  connection?: NetworkInformation;
}

// Network Information API
interface NetworkInformation extends EventTarget {
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  readonly type?: ConnectionType;
  onchange: ((this: NetworkInformation, ev: Event) => unknown) | null;
  addEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
  removeEventListener(type: 'change', listener: (this: NetworkInformation, ev: Event) => void): void;
}

type ConnectionType = 
  | 'bluetooth' 
  | 'cellular' 
  | 'ethernet' 
  | 'none' 
  | 'wifi' 
  | 'wimax' 
  | 'other' 
  | 'unknown';

// Web App Manifest
interface WebAppManifest {
  name?: string;
  short_name?: string;
  start_url?: string;
  display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color?: string;
  theme_color?: string;
  icons?: WebAppManifestIcon[];
  lang?: string;
  scope?: string;
  orientation?: OrientationLockType;
  categories?: string[];
  screenshots?: WebAppManifestScreenshot[];
  shortcuts?: WebAppManifestShortcut[];
}

interface WebAppManifestIcon {
  src: string;
  sizes?: string;
  type?: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

interface WebAppManifestScreenshot {
  src: string;
  sizes?: string;
  type?: string;
  label?: string;
}

interface WebAppManifestShortcut {
  name: string;
  short_name?: string;
  description?: string;
  url: string;
  icons?: WebAppManifestIcon[];
}

// Google Analytics (gtag) interface
interface GTagFunction {
  (command: 'config', targetId: string, config?: GTagConfig): void;
  (command: 'event', eventName: string, eventParameters?: GTagEventParameters): void;
  (command: 'js', config: Date): void;
  (command: 'set', config: GTagConfig): void;
}

interface GTagConfig {
  page_title?: string;
  page_location?: string;
  custom_parameter?: string;
  [key: string]: unknown;
}

interface GTagEventParameters {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter?: string;
  [key: string]: unknown;
}

// Extended Window interface for PWA features
interface PWAWindow extends Window {
  BeforeInstallPromptEvent: {
    prototype: BeforeInstallPromptEvent;
    new(): BeforeInstallPromptEvent;
  };
  navigator: ExtendedNavigator;
  gtag?: GTagFunction;
}

// Display mode media query
interface DisplayModeMediaQuery {
  matches: boolean;
}

// Service Worker Registration with additional properties
interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
  periodicSync?: PeriodicSyncManager;
  pushManager?: PushManager;
  backgroundFetch?: BackgroundFetchManager;
}

// Sync Manager for Background Sync
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

// Periodic Sync Manager
interface PeriodicSyncManager {
  register(tag: string, options?: PeriodicSyncOptions): Promise<void>;
  getTags(): Promise<string[]>;
  unregister(tag: string): Promise<void>;
}

interface PeriodicSyncOptions {
  minInterval?: number;
}

// Background Fetch Manager
interface BackgroundFetchManager {
  fetch(id: string, request: RequestInfo, options?: BackgroundFetchOptions): Promise<BackgroundFetchRegistration>;
  get(id: string): Promise<BackgroundFetchRegistration | undefined>;
  getIds(): Promise<string[]>;
}

interface BackgroundFetchOptions {
  icons?: ImageResource[];
  title?: string;
  downloadTotal?: number;
}

interface ImageResource {
  src: string;
  sizes?: string;
  type?: string;
}

interface BackgroundFetchRegistration extends EventTarget {
  readonly id: string;
  readonly uploadTotal: number;
  readonly uploaded: number;
  readonly downloadTotal: number;
  readonly downloaded: number;
  readonly result: BackgroundFetchResult;
  readonly failureReason: BackgroundFetchFailureReason;
  readonly recordsAvailable: boolean;
  abort(): Promise<boolean>;
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<BackgroundFetchRecord | undefined>;
  matchAll(request?: RequestInfo, options?: CacheQueryOptions): Promise<BackgroundFetchRecord[]>;
}

type BackgroundFetchResult = '' | 'success' | 'failure';
type BackgroundFetchFailureReason = '' | 'aborted' | 'bad-status' | 'fetch-error' | 'quota-exceeded' | 'download-total-exceeded';

interface BackgroundFetchRecord {
  readonly request: Request;
  readonly responseReady: Promise<Response>;
}

// Push Manager with extended options
interface ExtendedPushManager extends PushManager {
  subscribe(options?: ExtendedPushSubscriptionOptions): Promise<PushSubscription>;
}

interface ExtendedPushSubscriptionOptions extends PushSubscriptionOptions {
  applicationServerKey?: BufferSource | string;
}

// Notification with extended options
interface ExtendedNotificationOptions extends NotificationOptions {
  badge?: string;
  image?: string;
  timestamp?: number;
  renotify?: boolean;
  silent?: boolean;
  sound?: string;
  sticky?: boolean;
  actions?: NotificationAction[];
}

// Web Share API
interface Navigator {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

// Screen Wake Lock API
interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean;
  readonly type: 'screen';
  release(): Promise<void>;
}

interface Navigator {
  wakeLock?: WakeLock;
}

// Web App Install Banner
interface BeforeInstallPromptEventMap {
  'beforeinstallprompt': BeforeInstallPromptEvent;
}

// Extend WindowEventMap
interface WindowEventMap extends BeforeInstallPromptEventMap {
  'appinstalled': Event;
}

// Utility types for PWA development
type PWADisplayMode = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
type PWAConnectionSpeed = 'fast' | 'medium' | 'slow' | 'offline';
type PWADataMode = 'full' | 'reduced' | 'essential';

// Export commonly used types
export type {
  BeforeInstallPromptEvent,
  ExtendedNavigator,
  NetworkInformation,
  ConnectionType,
  WebAppManifest,
  WebAppManifestIcon,
  GTagFunction,
  GTagConfig,
  GTagEventParameters,
  PWAWindow,
  ExtendedServiceWorkerRegistration,
  SyncManager,
  PeriodicSyncManager,
  BackgroundFetchManager,
  ShareData,
  PWADisplayMode,
  PWAConnectionSpeed,
  PWADataMode
};