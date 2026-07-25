import { Module } from '../core/module.js';
import { World, Entity } from '../core/ecs.js';

export interface ModManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  website?: string;
  dependencies: ModDependency[];
  loadOrder: number;
  apiVersion: string;
  tags: string[];
  permissions: ModPermission[];
  entryPoint: string;
  assets: string[];
  scripts: string[];
  configs: string[];
}

export interface ModDependency {
  id: string;
  version: string;
  optional: boolean;
}

export type ModPermission = 
  | 'filesystem.read' | 'filesystem.write'
  | 'network.request'
  | 'game.modify'
  | 'ui.modify'
  | 'audio.play'
  | 'input.capture'
  | 'debug.access';

export interface ModContext {
  mod: ModInstance;
  api: ModAPI;
  logger: ModLogger;
  config: ModConfig;
  events: ModEventBus;
  assets: ModAssetManager;
  scripts: ModScriptManager;
}

export interface ModInstance {
  manifest: ModManifest;
  state: ModState;
  context: ModContext;
  exports: any;
}

export type ModState = 'unloaded' | 'loading' | 'loaded' | 'enabled' | 'disabled' | 'error' | 'unloading';

export interface ModAPI {
  registerContent: <T>(type: string, definition: any) => void;
  unregisterContent: (type: string, id: string) => void;
  getContent: <T>(type: string, id: string) => T | undefined;
  hook: (event: string, handler: Function, priority?: number) => ModHook;
  unhook: (hook: ModHook) => void;
  addCommand: (command: ModCommand) => void;
  removeCommand: (name: string) => void;
  registerUI: (component: ModUIComponent) => void;
  unregisterUI: (id: string) => void;
  registerSystem: (system: any) => void;
  unregisterSystem: (system: any) => void;
  getGameAPI: () => GameAPI;
}

export interface GameAPI {
  world: World;
  getPlayer: () => Entity | null;
  getEntity: (id: string) => Entity | null;
  findEntities: (query: any) => Entity[];
  createEntity: () => Entity;
  destroyEntity: (entity: Entity) => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: Function) => () => void;
}

export interface ModHook {
  event: string;
  handler: Function;
  priority: number;
  dispose: () => void;
}

export interface ModCommand {
  name: string;
  description: string;
  aliases: string[];
  usage: string;
  permission?: string;
  handler: (args: string[], context: ModCommandContext) => Promise<void>;
}

export interface ModCommandContext {
  player: Entity | null;
  args: string[];
  reply: (message: string) => void;
  error: (message: string) => void;
}

export interface ModUIComponent {
  id: string;
  name: string;
  component: any;
  props: Record<string, any>;
  position: 'hud' | 'menu' | 'overlay' | 'window';
  zIndex: number;
}

export interface ModLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

export interface ModConfig {
  get: <T>(key: string, defaultValue?: T) => T;
  set: <T>(key: string, value: T) => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  getAll: () => Record<string, any>;
  save: () => Promise<void>;
}

export interface ModEventBus {
  on: (event: string, handler: Function) => () => void;
  once: (event: string, handler: Function) => () => void;
  emit: (event: string, data: any) => void;
  off: (event: string, handler: Function) => void;
}

export interface ModAssetManager {
  loadImage: (path: string) => Promise<HTMLImageElement>;
  loadAudio: (path: string) => Promise<HTMLAudioElement>;
  loadModel: (path: string) => Promise<any>;
  loadText: (path: string) => Promise<string>;
  loadJSON: (path: string) => Promise<any>;
  getAssetUrl: (path: string) => string;
}

export interface ModScriptManager {
  loadScript: (path: string) => Promise<any>;
  runScript: (code: string, context: any) => Promise<any>;
  createContext: (globals?: Record<string, any>) => any;
}

export class ModModule implements Module {
  name = 'mods';
  version = '1.0.0';
  dependencies = ['core', 'content'];

  private mods = new Map<string, ModInstance>();
  private loadOrder: string[] = [];
  private api: ModAPI;
  private gameAPI: GameAPI;
  private sandbox: ModSandbox;

  async initialize(ctx: any): Promise<void> {
    this.gameAPI = this.createGameAPI(ctx);
    this.sandbox = new ModSandbox();
    this.api = this.createModAPI(ctx);
    await this.discoverMods();
    await this.loadMods();
    ctx.logger.info('Mod module initialized');
  }

  async shutdown(): Promise<void> {
    for (const modId of [...this.loadOrder].reverse()) {
      await this.unloadMod(modId);
    }
  }

  private createGameAPI(ctx: any): GameAPI {
    return {
      world: ctx.world,
      getPlayer: () => null,
      getEntity: (id: string) => null,
      findEntities: () => [],
      createEntity: () => ctx.world.createEntity(),
      destroyEntity: (entity: Entity) => ctx.world.destroyEntity(entity),
      emit: (event: string, data: any) => ctx.eventBus.emit(event, data),
      on: (event: string, handler: Function) => ctx.eventBus.on(event, handler)
    };
  }

  private createModAPI(ctx: any): ModAPI {
    return {
      registerContent: (type: string, definition: any) => {
        ctx.contentModule?.registerDefinition(definition);
      },
      unregisterContent: (type: string, id: string) => {},
      getContent: <T>(type: string, id: string) => {
        return ctx.contentModule?.getDefinition<T>(type, id)?.data;
      },
      hook: (event: string, handler: Function, priority = 0) => {
        const unsubscribe = ctx.eventBus.on(event, handler);
        return { event, handler, priority, dispose: unsubscribe };
      },
      unhook: (hook: ModHook) => hook.dispose(),
      addCommand: (command: ModCommand) => {},
      removeCommand: (name: string) => {},
      registerUI: (component: ModUIComponent) => {},
      unregisterUI: (id: string) => {},
      registerSystem: (system: any) => ctx.world.addSystem(system),
      unregisterSystem: (system: any) => ctx.world.removeSystem(system),
      getGameAPI: () => this.gameAPI
    };
  }

  private async discoverMods(): Promise<void> {
    // Scan mods directory
  }

  private async loadMods(): Promise<void> {
    for (const modId of this.loadOrder) {
      await this.loadMod(modId);
    }
  }

  private async loadMod(modId: string): Promise<void> {
    const mod = this.mods.get(modId);
    if (!mod || mod.state !== 'unloaded') return;

    mod.state = 'loading';
    
    try {
      const context = this.createModContext(mod);
      mod.context = context;
      
      // Load scripts
      for (const script of mod.manifest.scripts) {
        await context.scripts.loadScript(script);
      }
      
      // Call entry point
      if (mod.manifest.entryPoint) {
        const entryModule = await context.scripts.loadScript(mod.manifest.entryPoint);
        mod.exports = await entryModule.default?.(context) ?? entryModule;
      }
      
      mod.state = 'enabled';
    } catch (error) {
      mod.state = 'error';
      console.error(`Failed to load mod ${modId}:`, error);
    }
  }

  private createModContext(mod: ModInstance): ModContext {
    return {
      mod,
      api: this.api,
      logger: this.createLogger(mod.manifest.id),
      config: this.createConfig(mod.manifest.id),
      events: this.createEventBus(),
      assets: this.createAssetManager(mod.manifest.id),
      scripts: this.createScriptManager(mod.manifest.id)
    };
  }

  private createLogger(modId: string): ModLogger {
    const prefix = `[Mod:${modId}]`;
    return {
      debug: (...args: any[]) => console.debug(prefix, ...args),
      info: (...args: any[]) => console.info(prefix, ...args),
      warn: (...args: any[]) => console.warn(prefix, ...args),
      error: (...args: any[]) => console.error(prefix, ...args)
    };
  }

  private createConfig(modId: string): ModConfig {
    const store = new Map<string, any>();
    return {
      get: <T>(key: string, defaultValue?: T) => store.has(key) ? store.get(key) : defaultValue as T,
      set: <T>(key: string, value: T) => store.set(key, value),
      has: (key: string) => store.has(key),
      delete: (key: string) => store.delete(key),
      getAll: () => Object.fromEntries(store),
      save: async () => {}
    };
  }

  private createEventBus(): ModEventBus {
    const handlers = new Map<string, Set<Function>>();
    return {
      on: (event: string, handler: Function) => {
        if (!handlers.has(event)) handlers.set(event, new Set());
        handlers.get(event)!.add(handler);
        return () => handlers.get(event)?.delete(handler);
      },
      once: (event: string, handler: Function) => {
        const wrapper = (...args: any[]) => {
          handler(...args);
          handlers.get(event)?.delete(wrapper);
        };
        handlers.get(event)?.add(wrapper);
        return () => handlers.get(event)?.delete(wrapper);
      },
      emit: (event: string, data: any) => {
        handlers.get(event)?.forEach(h => h(data));
      },
      off: (event: string, handler: Function) => {
        handlers.get(event)?.delete(handler);
      }
    };
  }

  private createAssetManager(modId: string): ModAssetManager {
    const basePath = `/mods/${modId}/assets/`;
    return {
      loadImage: async (path: string) => {
        const img = new Image();
        img.src = basePath + path;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        return img;
      },
      loadAudio: async (path: string) => {
        const audio = new Audio(basePath + path);
        return audio;
      },
      loadModel: async (path: string) => null,
      loadText: async (path: string) => {
        const res = await fetch(basePath + path);
        return res.text();
      },
      loadJSON: async (path: string) => {
        const res = await fetch(basePath + path);
        return res.json();
      },
      getAssetUrl: (path: string) => basePath + path
    };
  }

  private createScriptManager(modId: string): ModScriptManager {
    return {
      loadScript: async (path: string) => {
        const res = await fetch(`/mods/${modId}/scripts/${path}`);
        const code = await res.text();
        return this.sandbox.evaluate(code, { modId, path });
      },
      runScript: async (code: string, context: any) => {
        return this.sandbox.evaluate(code, context);
      },
      createContext: (globals = {}) => this.sandbox.createContext(globals)
    };
  }

  private async unloadMod(modId: string): Promise<void> {
    const mod = this.mods.get(modId);
    if (!mod) return;

    mod.state = 'unloading';
    
    try {
      if (mod.exports?.onUnload) {
        await mod.exports.onUnload(mod.context);
      }
      mod.state = 'unloaded';
      mod.exports = null;
      mod.context = null as any;
    } catch (error) {
      mod.state = 'error';
      console.error(`Failed to unload mod ${modId}:`, error);
    }
  }

  enableMod(modId: string): boolean {
    const mod = this.mods.get(modId);
    if (mod && mod.state === 'disabled') {
      mod.state = 'enabled';
      mod.exports?.onEnable?.(mod.context);
      return true;
    }
    return false;
  }

  disableMod(modId: string): boolean {
    const mod = this.mods.get(modId);
    if (mod && mod.state === 'enabled') {
      mod.state = 'disabled';
      mod.exports?.onDisable?.(mod.context);
      return true;
    }
    return false;
  }

  getMod(modId: string): ModInstance | undefined {
    return this.mods.get(modId);
  }

  getAllMods(): ModInstance[] {
    return Array.from(this.mods.values());
  }

  getEnabledMods(): ModInstance[] {
    return Array.from(this.mods.values()).filter(m => m.state === 'enabled');
  }
}

export class ModSandbox {
  private globals: Map<string, any> = new Map();

  evaluate(code: string, context: any): any {
    const fn = new Function('context', 'globals', `
      with (globals) {
        with (context) {
          ${code}
        }
      }
    `);
    return fn(context, Object.fromEntries(this.globals));
  }

  createContext(globals: Record<string, any>): any {
    return new Proxy(globals, {
      get: (target, prop) => target[prop] ?? this.globals.get(prop),
      set: (target, prop, value) => { target[prop] = value; return true; },
      has: (target, prop) => prop in target || this.globals.has(prop)
    });
  }

  setGlobal(key: string, value: any): void {
    this.globals.set(key, value);
  }

  getGlobal(key: string): any {
    return this.globals.get(key);
  }
}