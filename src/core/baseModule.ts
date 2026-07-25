export interface ModuleContext {
  eventBus: EventBus;
  config: Config;
  logger: Logger;
  modules: ModuleManager;
}

export interface Module {
  name: string;
  version: string;
  dependencies: string[];
  initialize(context: ModuleContext): Promise<void>;
  shutdown(): Promise<void>;
  update?(dt: number): void;
}

export class BaseModule implements Module {
  name: string;
  version: string;
  dependencies: string[] = [];

  protected eventBus!: EventBus;
  protected config!: Config;
  protected logger!: Logger;
  protected modules!: ModuleManager;

  async initialize(context: ModuleContext): Promise<void> {
    this.eventBus = context.eventBus;
    this.config = context.config;
    this.logger = context.logger;
    this.modules = context.modules;
    await this.onInitialize();
  }

  protected async onInitialize(): Promise<void> {}

  async shutdown(): Promise<void> {
    await this.onShutdown();
  }

  protected async onShutdown(): Promise<void> {}

  update?(dt: number): void;

  protected subscribe<T>(event: string, handler: (data: T) => void): () => void {
    return this.eventBus.on(event, handler).unsubscribe;
  }

  protected emit<T>(event: string, data: T): void {
    this.eventBus.emit(event, data);
  }

  protected getConfig<T>(key: string, defaultValue?: T): T {
    return this.config.getOr(key, defaultValue as T);
  }
}

import { EventBus } from './eventBus';
import { Config } from './config';
import { Logger } from './logger';
import { ModuleManager } from './module';