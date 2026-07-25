export interface Module {
  name: string;
  version: string;
  dependencies: string[];
  initialize(ctx: ModuleContext): Promise<void>;
  shutdown(): Promise<void>;
  update?(dt: number): void;
}

export interface ModuleContext {
  eventBus: EventBus;
  config: Config;
  registry: ContentRegistry;
  logger: Logger;
  modules: Map<string, Module>;
}

export class ModuleManager {
  private modules = new Map<string, Module>();
  private initOrder: string[] = [];
  private context: ModuleContext;

  constructor(
    private eventBus: EventBus,
    private config: Config,
    private registry: ContentRegistry,
    private logger: Logger
  ) {
    this.context = { eventBus, config, registry, logger, modules: this.modules };
  }

  register(module: Module): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module ${module.name} already registered`);
    }
    this.modules.set(module.name, module);
    this.logger.info(`Module registered: ${module.name} v${module.version}`);
  }

  async initializeAll(): Promise<void> {
    this.resolveDependencies();
    
    for (const name of this.initOrder) {
      const module = this.modules.get(name)!;
      this.logger.info(`Initializing: ${name}`);
      await module.initialize(this.context);
    }
    this.logger.info('All modules initialized');
  }

  async shutdownAll(): Promise<void> {
    for (const name of [...this.initOrder].reverse()) {
      const module = this.modules.get(name)!;
      this.logger.info(`Shutting down: ${name}`);
      await module.shutdown();
    }
  }

  update(dt: number): void {
    for (const module of this.modules.values()) {
      if (module.update) module.update(dt);
    }
  }

  getModule<T extends Module>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  private resolveDependencies(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      visiting.add(name);
      const module = this.modules.get(name)!;
      for (const dep of module.dependencies) {
        if (!this.modules.has(dep)) {
          throw new Error(`Missing dependency: ${dep} for ${name}`);
        }
        visit(dep);
      }
      visiting.delete(name);
      visited.add(name);
      this.initOrder.push(name);
    };

    for (const name of this.modules.keys()) {
      visit(name);
    }
  }
}