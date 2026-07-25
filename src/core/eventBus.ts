export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private onceHandlers = new Map<string, Set<EventHandler>>();
  private history: Array<{ event: string; data: any; timestamp: number }> = [];
  private maxHistory = 1000;

  on<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return { unsubscribe: () => this.off(event, handler) };
  }

  once<T>(event: string, handler: EventHandler<T>): EventSubscription {
    if (!this.onceHandlers.has(event)) this.onceHandlers.set(event, new Set());
    this.onceHandlers.get(event)!.add(handler);
    return { unsubscribe: () => this.offOnce(event, handler) };
  }

  off(event: string, handler: EventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  offOnce(event: string, handler: EventHandler): void {
    this.onceHandlers.get(event)?.delete(handler);
  }

  emit<T>(event: string, data: T): void {
    this.history.push({ event, data, timestamp: Date.now() });
    if (this.history.length > this.maxHistory) this.history.shift();

    this.handlers.get(event)?.forEach(h => h(data));
    this.onceHandlers.get(event)?.forEach(h => h(data));
    this.onceHandlers.get(event)?.clear();
  }

  emitAsync<T>(event: string, data: T): Promise<void[]> {
    const promises: Promise<void>[] = [];
    this.handlers.get(event)?.forEach(h => {
      const result = h(data);
      if (result instanceof Promise) promises.push(result);
    });
    this.onceHandlers.get(event)?.forEach(h => {
      const result = h(data);
      if (result instanceof Promise) promises.push(result);
    });
    this.onceHandlers.get(event)?.clear();
    return Promise.all(promises);
  }

  getHistory(event?: string): Array<{ event: string; data: any; timestamp: number }> {
    if (event) return this.history.filter(h => h.event === event);
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}