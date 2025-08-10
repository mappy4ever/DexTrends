import { Page, ConsoleMessage } from '@playwright/test';

export type ConsoleMessageType = 'log' | 'info' | 'warn' | 'error' | 'debug';

export interface ConsoleLogEntry {
  type: ConsoleMessageType;
  text: string;
  args: unknown[];
  timestamp: Date;
  location?: {
    url?: string;
    lineNumber?: number;
    columnNumber?: number;
  };
}

export class ConsoleLogger {
  private messages: ConsoleLogEntry[] = [];
  private messageCountByType: Record<ConsoleMessageType, number> = {
    log: 0,
    info: 0,
    warn: 0,
    error: 0,
    debug: 0,
  };

  constructor() {}

  /**
   * Attach console logger to a page
   */
  async attachToPage(page: Page): Promise<void> {
    page.on('console', async (consoleMessage: ConsoleMessage) => {
      const type = consoleMessage.type() as ConsoleMessageType;
      const location = consoleMessage.location();
      
      // Extract text and arguments
      let text = consoleMessage.text();
      const args: unknown[] = [];
      
      // Try to get actual argument values
      for (const arg of consoleMessage.args()) {
        try {
          const value = await arg.jsonValue();
          args.push(value);
        } catch (e) {
          // If we can't serialize the value, store the handle string
          args.push(arg.toString());
        }
      }

      const entry: ConsoleLogEntry = {
        type,
        text,
        args,
        timestamp: new Date(),
        location: location ? {
          url: location.url,
          lineNumber: location.lineNumber,
          columnNumber: location.columnNumber,
        } : undefined,
      };

      this.messages.push(entry);
      this.messageCountByType[type]++;
    });

    // Also capture uncaught errors
    page.on('pageerror', (error: Error) => {
      const entry: ConsoleLogEntry = {
        type: 'error',
        text: error.message,
        args: [error],
        timestamp: new Date(),
      };

      this.messages.push(entry);
      this.messageCountByType.error++;
    });
  }

  /**
   * Get all console messages
   */
  getAllMessages(): ConsoleLogEntry[] {
    return [...this.messages];
  }

  /**
   * Get messages by type
   */
  getMessagesByType(type: ConsoleMessageType): ConsoleLogEntry[] {
    return this.messages.filter(msg => msg.type === type);
  }

  /**
   * Get error messages
   */
  getErrors(): ConsoleLogEntry[] {
    return this.getMessagesByType('error');
  }

  /**
   * Get warnings
   */
  getWarnings(): ConsoleLogEntry[] {
    return this.getMessagesByType('warn');
  }

  /**
   * Get message count by type
   */
  getMessageCount(type?: ConsoleMessageType): number {
    if (type) {
      return this.messageCountByType[type];
    }
    return this.messages.length;
  }

  /**
   * Check if there are any errors
   */
  hasErrors(): boolean {
    return this.messageCountByType.error > 0;
  }

  /**
   * Check if there are any warnings
   */
  hasWarnings(): boolean {
    return this.messageCountByType.warn > 0;
  }

  /**
   * Clear all messages
   */
  clear(): void {
    this.messages = [];
    this.messageCountByType = {
      log: 0,
      info: 0,
      warn: 0,
      error: 0,
      debug: 0,
    };
  }

  /**
   * Get messages containing specific text
   */
  findMessages(searchText: string, caseSensitive = false): ConsoleLogEntry[] {
    const searchLower = caseSensitive ? searchText : searchText.toLowerCase();
    return this.messages.filter(msg => {
      const msgText = caseSensitive ? msg.text : msg.text.toLowerCase();
      return msgText.includes(searchLower);
    });
  }

  /**
   * Assert no console errors
   */
  assertNoErrors(): void {
    const errors = this.getErrors();
    if (errors.length > 0) {
      const errorMessages = errors.map(err => 
        `[${err.timestamp.toISOString()}] ${err.text}${err.location ? ` at ${err.location.url}:${err.location.lineNumber}` : ''}`
      ).join('\n');
      throw new Error(`Found ${errors.length} console errors:\n${errorMessages}`);
    }
  }

  /**
   * Assert no console warnings
   */
  assertNoWarnings(): void {
    const warnings = this.getWarnings();
    if (warnings.length > 0) {
      const warningMessages = warnings.map(warn => 
        `[${warn.timestamp.toISOString()}] ${warn.text}${warn.location ? ` at ${warn.location.url}:${warn.location.lineNumber}` : ''}`
      ).join('\n');
      throw new Error(`Found ${warnings.length} console warnings:\n${warningMessages}`);
    }
  }

  /**
   * Get a formatted report of all console messages
   */
  getReport(): string {
    const report: string[] = [
      '=== Console Log Report ===',
      `Total messages: ${this.messages.length}`,
      `Errors: ${this.messageCountByType.error}`,
      `Warnings: ${this.messageCountByType.warn}`,
      `Info: ${this.messageCountByType.info}`,
      `Logs: ${this.messageCountByType.log}`,
      `Debug: ${this.messageCountByType.debug}`,
      '',
      '=== Messages ===',
    ];

    this.messages.forEach((msg, index) => {
      const location = msg.location ? ` at ${msg.location.url}:${msg.location.lineNumber}` : '';
      report.push(`[${index + 1}] [${msg.type.toUpperCase()}] ${msg.text}${location}`);
      if (msg.args.length > 0) {
        report.push(`    Args: ${JSON.stringify(msg.args, null, 2)}`);
      }
    });

    return report.join('\n');
  }

  /**
   * Save console logs to a file (useful for debugging)
   */
  async saveToFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    const report = this.getReport();
    await fs.writeFile(filePath, report, 'utf-8');
  }
}