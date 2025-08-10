export interface FastRefreshEvent {
  type: 'status' | 'error' | 'warning' | 'update';
  message: string;
  timestamp: Date;
  details?: unknown;
}

export class FastRefreshMonitor {
  private events: FastRefreshEvent[] = [];
  private listeners: ((event: FastRefreshEvent) => void)[] = [];
  private isMonitoring = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if ((module as any).hot) {
      this.isMonitoring = true;
      const hot = (module as any).hot;

      hot.addStatusHandler((status: string) => {
        this.logEvent({
          type: 'status',
          message: `HMR Status: ${status}`,
          timestamp: new Date(),
          details: { status }
        });
      });

      hot.addDisposeHandler((data: unknown) => {
        this.logEvent({
          type: 'update',
          message: 'Module disposing',
          timestamp: new Date(),
          details: data
        });
      });

      this.interceptConsole();
    }
  }

  private interceptConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      originalError(...args);
      const message = args.join(' ');
      if (message.includes('Fast Refresh') || message.includes('HMR')) {
        this.logEvent({
          type: 'error',
          message,
          timestamp: new Date()
        });
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      const message = args.join(' ');
      if (message.includes('Fast Refresh') || message.includes('HMR')) {
        this.logEvent({
          type: 'warning',
          message,
          timestamp: new Date()
        });
      }
    };
  }

  private logEvent(event: FastRefreshEvent) {
    this.events.push(event);
    if (this.events.length > 50) {
      this.events = this.events.slice(-50);
    }
    this.listeners.forEach(listener => listener(event));
  }

  public subscribe(listener: (event: FastRefreshEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getEvents() {
    return [...this.events];
  }

  public clearEvents() {
    this.events = [];
  }

  public isActive() {
    return this.isMonitoring;
  }

  public getStatus() {
    return {
      active: this.isMonitoring,
      eventCount: this.events.length,
      lastEvent: this.events[this.events.length - 1] || null,
      errorCount: this.events.filter(e => e.type === 'error').length,
      warningCount: this.events.filter(e => e.type === 'warning').length
    };
  }
}

export const globalMonitor = new FastRefreshMonitor();