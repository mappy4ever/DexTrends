// Service Worker Type Declarations
// Extends the global scope for service worker environment

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

// Enhanced service worker interfaces
interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  skipWaiting(): Promise<void>;
  clients: Clients;
  registration: ServiceWorkerRegistration;
  addEventListener<K extends keyof ServiceWorkerGlobalScopeEventMap>(
    type: K,
    listener: (this: ServiceWorkerGlobalScope, ev: ServiceWorkerGlobalScopeEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
}

interface ServiceWorkerGlobalScopeEventMap {
  install: ExtendableEvent;
  activate: ExtendableEvent;
  fetch: FetchEvent;
  message: ExtendableMessageEvent;
  push: PushEvent;
  sync: SyncEvent;
  notificationclick: NotificationEvent;
}

// Enhanced Fetch Event
interface FetchEvent extends ExtendableEvent {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

// Extended Extendable Event
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<void>): void;
}

// Extended Message Event
interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: unknown;
  readonly lastEventId: string;
  readonly origin: string;
  readonly ports: ReadonlyArray<MessagePort>;
  readonly source: Client | ServiceWorker | MessagePort | null;
}

// Sync Event for Background Sync
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

// Push Event
interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

interface PushMessageData {
  arrayBuffer(): ArrayBuffer;
  blob(): Blob;
  json(): unknown;
  text(): string;
}

// Notification Event
interface NotificationEvent extends ExtendableEvent {
  readonly notification: Notification;
  readonly action: string;
  readonly reply: string;
}

// Cache API
interface CacheStorage {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  has(cacheName: string): Promise<boolean>;
  open(cacheName: string): Promise<Cache>;
  delete(cacheName: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

interface Cache {
  match(request: RequestInfo, options?: CacheQueryOptions): Promise<Response | undefined>;
  matchAll(request?: RequestInfo, options?: CacheQueryOptions): Promise<Response[]>;
  add(request: RequestInfo): Promise<void>;
  addAll(requests: RequestInfo[]): Promise<void>;
  put(request: RequestInfo, response: Response): Promise<void>;
  delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
  keys(request?: RequestInfo, options?: CacheQueryOptions): Promise<Request[]>;
}

interface CacheQueryOptions {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
}

// Client API
interface Clients {
  get(id: string): Promise<Client | undefined>;
  matchAll(options?: ClientQueryOptions): Promise<Client[]>;
  openWindow(url: string): Promise<WindowClient | null>;
  claim(): Promise<void>;
}

interface Client {
  readonly frameType: FrameType;
  readonly id: string;
  readonly type: ClientType;
  readonly url: string;
  postMessage(message: unknown, transfer?: Transferable[]): void;
}

interface WindowClient extends Client {
  readonly focused: boolean;
  readonly visibilityState: VisibilityState;
  focus(): Promise<WindowClient>;
  navigate(url: string): Promise<WindowClient | null>;
}

interface ClientQueryOptions {
  includeUncontrolled?: boolean;
  type?: ClientType;
}

type ClientType = 'window' | 'worker' | 'sharedworker' | 'all';
type FrameType = 'auxiliary' | 'top-level' | 'nested' | 'none';
type VisibilityState = 'hidden' | 'visible';

// Performance metrics interface
interface PerformanceMetrics {
  loadTimes: number[];
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  imageOptimizations: number;
}

// Connection info for adaptive loading
interface NetworkConnection {
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly saveData: boolean;
  readonly downlink: number;
  readonly rtt: number;
  addEventListener(type: 'change', listener: () => void): void;
  removeEventListener(type: 'change', listener: () => void): void;
}

// Extended Navigator for connection info
interface NavigatorConnection {
  readonly connection?: NetworkConnection;
}

declare const navigator: Navigator & NavigatorConnection;
declare const caches: CacheStorage;
declare const registration: ServiceWorkerRegistration;

// Global functions available in service worker context
declare function importScripts(...urls: string[]): void;

// Custom message types for communication with main thread
interface ServiceWorkerMessage {
  type: string;
  data?: unknown;
}

interface AppUpdateMessage extends ServiceWorkerMessage {
  type: 'APP_UPDATED';
  version: string;
  timestamp: number;
}

interface ConnectionChangeMessage extends ServiceWorkerMessage {
  type: 'CONNECTION_CHANGE';
  connectionSpeed: 'fast' | 'medium' | 'slow';
  dataMode: 'full' | 'reduced' | 'essential';
}

interface BackgroundSyncMessage extends ServiceWorkerMessage {
  type: 'BACKGROUND_SYNC_COMPLETE';
  timestamp: number;
}

interface PriceUpdateMessage extends ServiceWorkerMessage {
  type: 'PRICE_DATA_UPDATED';
  timestamp: number;
}

interface UpdateAvailableMessage extends ServiceWorkerMessage {
  type: 'UPDATE_AVAILABLE';
  version: string;
  timestamp: number;
}

type ServiceWorkerMessageType = 
  | AppUpdateMessage 
  | ConnectionChangeMessage 
  | BackgroundSyncMessage 
  | PriceUpdateMessage 
  | UpdateAvailableMessage;

// For main thread communication
interface ServiceWorkerClientMessage {
  type: 'SKIP_WAITING' | 'GET_VERSION' | 'CHECK_FOR_UPDATES';
  data?: unknown;
}

export type {
  ServiceWorkerGlobalScope,
  ExtendableEvent,
  FetchEvent,
  ExtendableMessageEvent,
  SyncEvent,
  PushEvent,
  NotificationEvent,
  Cache,
  CacheStorage,
  Client,
  WindowClient,
  Clients,
  PerformanceMetrics,
  NetworkConnection,
  NavigatorConnection,
  ServiceWorkerMessage,
  ServiceWorkerMessageType,
  ServiceWorkerClientMessage
};