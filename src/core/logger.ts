export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  source?: string;
}

export class Logger {
  private level: LogLevel = 'info';
  private entries: LogEntry[] = [];
  private maxEntries = 5000;
  private outputs: Array<(entry: LogEntry) => void> = [];

  constructor(private prefix = '') {}

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  addOutput(fn: (entry: LogEntry) => void): () => void {
    this.outputs.push(fn);
    return () => {
      const idx = this.outputs.indexOf(fn);
      if (idx >= 0) this.outputs.splice(idx, 1);
    };
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) < levels.indexOf(this.level)) return;

    const entry: LogEntry = {
      level,
      message: this.prefix ? `[${this.prefix}] ${message}` : message,
      timestamp: Date.now(),
      context,
      source: this.getCaller()
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();

    this.outputs.forEach(fn => fn(entry));
  }

  getEntries(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = level 
      ? this.entries.filter(e => e.level === level) 
      : this.entries;
    if (limit) filtered = filtered.slice(-limit);
    return filtered;
  }

  clear(): void {
    this.entries = [];
  }

  private getCaller(): string | undefined {
    try {
      throw new Error();
    } catch (e) {
      const stack = e.stack?.split('\n')?.[3];
      return stack?.trim();
    }
  }
}

export const logger = new Logger('ENGINE');

export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}