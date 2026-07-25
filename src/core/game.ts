import { ModuleManager } from './module.js';
import { EventBus } from './eventBus.js';
import { ContentRegistry } from './contentRegistry.js';
import { Config } from './config.js';
import { Logger, createLogger } from './logger.js';

export interface GameContext {
  moduleManager: ModuleManager;
  eventBus: EventBus;
  contentRegistry: ContentRegistry;
  config: Config;
  logger: Logger;
  world: World;
}

import { World } from './ecs.js';

export class Game {
  private running = false;
  private lastTime = 0;
  private frameId = 0;
  private fixedTimestep = 1/60;
  private accumulator = 0;

  public readonly moduleManager: ModuleManager;
  public readonly eventBus: EventBus;
  public readonly contentRegistry: ContentRegistry;
  public readonly config: Config;
  public readonly logger: Logger;
  public readonly world: World;

  constructor() {
    this.eventBus = new EventBus();
    this.config = new Config();
    this.logger = new Logger('GAME');
    this.contentRegistry = new ContentRegistry();
    this.world = new World();
    this.moduleManager = new ModuleManager(
      this.eventBus,
      this.config,
      this.contentRegistry,
      this.logger
    );
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing game...');
    
    this.eventBus.on('game:quit', () => this.stop());
    this.eventBus.on('game:error', (err: Error) => this.logger.error('Game error', { error: err.message }));
    
    await this.moduleManager.initializeAll();
    
    this.logger.info('Game initialized');
    this.emit('game:ready');
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.logger.info('Starting game loop');
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.logger.info('Game stopped');
    this.emit('game:stopped');
  }

  private tick = (time: number = performance.now()): void => {
    if (!this.running) return;

    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.accumulator += Math.min(dt, 0.25);
    
    while (this.accumulator >= this.fixedTimestep) {
      this.fixedUpdate(this.fixedTimestep);
      this.accumulator -= this.fixedTimestep;
    }

    this.update(dt);
    this.emit('game:frame', { dt, time });

    this.frameId = requestAnimationFrame(this.tick);
  };

  private fixedUpdate(dt: number): void {
    this.world.update(dt);
    this.moduleManager.update(dt);
    this.emit('game:fixedUpdate', { dt });
  }

  private update(dt: number): void {
    this.emit('game:update', { dt });
  }

  emit<T>(event: string, data: T): void {
    this.eventBus.emit(event, data);
  }

  on<T>(event: string, handler: (data: T) => void): () => void {
    return this.eventBus.on(event, handler);
  }

  getContext(): GameContext {
    return {
      moduleManager: this.moduleManager,
      eventBus: this.eventBus,
      contentRegistry: this.contentRegistry,
      config: this.config,
      logger: this.logger,
      world: this.world
    };
  }

  async shutdown(): Promise<void> {
    this.stop();
    await this.moduleManager.shutdownAll();
    this.logger.info('Game shutdown complete');
  }
}

export const game = new Game();