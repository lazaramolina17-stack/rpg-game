import { EventBus } from './eventBus';
import { Config } from './config';
import { Logger } from './logger';
import { ModuleManager, Module } from './moduleManager';

export interface EngineModules extends ModuleManager {
  update(dt: number): void;
}

export class GameEngine implements Module {
  name = 'GameEngine';
  version = '1.0.0';
  dependencies: string[] = [];
  
  private running = false;
  private lastTime = 0;
  private modules?: EngineModules;

  async initialize(ctx: ModuleContext): Promise<void> {
    this.modules = ctx.modules as EngineModules;
    console.log('[GameEngine] Initialized');
  }

  async shutdown(): Promise<void> {
    this.running = false;
  }

  update(dt: number): void {
    if (this.modules) {
      this.modules.update(dt);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
  }

  private tick = (): void => {
    if (!this.running) return;
    
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    this.update(dt);

    requestAnimationFrame(this.tick);
  };
}

export interface ModuleContext {
  eventBus: EventBus;
  config: Config;
  registry: any;
  logger: Logger;
  modules: Map<string, Module>;
}

export function createEngine(config?: Record<string, any>): GameEngine {
  const eventBus = new EventBus();
  const cfg = new Config(config);
  const log = new Logger();
  const modules = new ModuleManager(eventBus, cfg, null, log);
  
  const engine = new GameEngine();
  modules.register(engine);
  
  return engine;
}