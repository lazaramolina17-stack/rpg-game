import { describe, it, expect, beforeEach } from 'vitest';
import { World } from '../src/core/ecs.js';
import { EventBus } from '../src/core/eventBus.js';
import { Config } from '../src/core/config.js';
import { Logger } from '../src/core/logger.js';
import { ContentRegistry } from '../src/core/contentRegistry.js';
import { ModuleManager } from '../src/core/moduleManager.js';

describe('Core Systems', () => {
  let world: World;
  let eventBus: EventBus;
  let config: Config;
  let logger: Logger;
  let contentRegistry: ContentRegistry;

  beforeEach(() => {
    world = new World();
    eventBus = new EventBus();
    config = new Config();
    logger = new Logger('TEST');
    contentRegistry = new ContentRegistry();
  });

  describe('World (ECS)', () => {
    it('should create and destroy entities', () => {
      const entity = world.createEntity();
      expect(entity).toBeGreaterThan(0);
      
      world.destroyEntity(entity);
      expect(world.entities.has(entity)).toBe(false);
    });

    it('should add and remove components', () => {
      const entity = world.createEntity();
      
      const position = { entity, _type: 'Position', x: 10, y: 20, z: 30 };
      world.addComponent(entity, position);
      
      expect(world.hasComponent(entity, 'Position')).toBe(true);
      const retrieved = world.getComponent(entity, 'Position');
      expect(retrieved).toEqual(position);
      
      world.removeComponent(entity, 'Position');
      expect(world.hasComponent(entity, 'Position')).toBe(false);
    });

    it('should query entities with components', () => {
      const e1 = world.createEntity();
      const e2 = world.createEntity();
      const e3 = world.createEntity();
      
      world.addComponent(e1, { entity: e1, _type: 'Position', x: 0, y: 0 });
      world.addComponent(e2, { entity: e2, _type: 'Position', x: 0, y: 0 });
      world.addComponent(e3, { entity: e3, _type: 'Position', x: 0, y: 0 });
      world.addComponent(e1, { entity: e1, _type: 'Velocity', vx: 1, vy: 0 });
      
      const withPosition = world.getEntitiesWith('Position');
      expect(withPosition).toHaveLength(3);
      
      const withVelocity = world.getEntitiesWith('Velocity');
      expect(withVelocity).toHaveLength(1);
      
      const withBoth = world.getEntitiesWith('Position', 'Velocity');
      expect(withBoth).toHaveLength(1);
      expect(withBoth[0]).toBe(e1);
    });

    it('should add and run systems', () => {
      let updateCount = 0;
      const system = {
        world,
        enabled: true,
        priority: 0,
        update(dt: number) { updateCount++; }
      };
      
      world.addSystem(system);
      world.update(0.016);
      expect(updateCount).toBe(1);
      
      system.enabled = false;
      world.update(0.016);
      expect(updateCount).toBe(1);
    });
  });

  describe('EventBus', () => {
    it('should subscribe and emit events', () => {
      let received: any = null;
      const unsubscribe = eventBus.on('test', (data) => { received = data; });
      
      eventBus.emit('test', { value: 42 });
      expect(received).toEqual({ value: 42 });
      
      unsubscribe.unsubscribe();
      eventBus.emit('test', { value: 100 });
      expect(received).toEqual({ value: 42 });
    });

    it('should support once', () => {
      let count = 0;
      eventBus.once('once', () => count++);
      
      eventBus.emit('once', {});
      eventBus.emit('once', {});
      expect(count).toBe(1);
    });

    it('should maintain history', () => {
      eventBus.emit('history', { a: 1 });
      eventBus.emit('history', { b: 2 });
      
      const hist = eventBus.getHistory('history');
      expect(hist).toHaveLength(2);
      expect(hist[0].data).toEqual({ a: 1 });
      expect(hist[1].data).toEqual({ b: 2 });
    });
  });

  describe('Config', () => {
    it('should get and set values', () => {
      config.set('game.name', 'Test Game');
      config.set('game.version', 1.0);
      config.set('nested.deep.value', true);
      
      expect(config.get('game.name')).toBe('Test Game');
      expect(config.get('game.version')).toBe(1.0);
      expect(config.get('nested.deep.value')).toBe(true);
    });

    it('should return default for missing keys', () => {
      expect(config.get('missing', 'default')).toBe('default');
      expect(config.get('missing', 42)).toBe(42);
    });

    it('should watch for changes', () => {
      let changed = false;
      config.watch('watched', () => { changed = true; });
      
      config.set('watched', 'new value');
      expect(changed).toBe(true);
    });

    it('should load from object', () => {
      config.loadFromFile({
        server: { port: 8080, host: 'localhost' },
        client: { fps: 60 }
      });
      
      expect(config.get('server.port')).toBe(8080);
      expect(config.get('client.fps')).toBe(60);
    });
  });

  describe('Logger', () => {
    it('should log at different levels', () => {
      logger.setLevel('debug');
      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');
      
      const entries = logger.getEntries();
      expect(entries.length).toBe(4);
    });

    it('should filter by level', () => {
      logger.setLevel('warn');
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      
      const entries = logger.getEntries();
      expect(entries.length).toBe(1);
      expect(entries[0].level).toBe('warn');
    });
  });

  describe('ContentRegistry', () => {
    it('should register and retrieve loaders', () => {
      const loader = {
        type: 'test',
        load: async () => ({ id: 'test', value: 1 }),
        validate: (data: any) => data.id === 'test'
      };
      
      contentRegistry.registerLoader(loader);
      expect(contentRegistry.get('test', 'test')).toBeUndefined();
    });

    it('should add and retrieve entries', () => {
      contentRegistry.addEntry({
        id: 'item1',
        type: 'item',
        data: { name: 'Sword', damage: 10 },
        version: 1,
        source: 'test'
      });
      
      const entry = contentRegistry.get('item', 'item1');
      expect(entry).toBeDefined();
      expect(entry?.data.name).toBe('Sword');
    });

    it('should list types and ids', () => {
      contentRegistry.addEntry({ id: 'a', type: 'type1', data: {}, version: 1, source: '' });
      contentRegistry.addEntry({ id: 'b', type: 'type1', data: {}, version: 1, source: '' });
      contentRegistry.addEntry({ id: 'c', type: 'type2', data: {}, version: 1, source: '' });
      
      expect(contentRegistry.getTypes()).toContain('type1');
      expect(contentRegistry.getTypes()).toContain('type2');
      expect(contentRegistry.getIds('type1')).toEqual(['a', 'b']);
    });
  });

  describe('ModuleManager', () => {
    it('should resolve dependencies', async () => {
      const mm = new ModuleManager(eventBus, config, logger);
      
      const modA = { name: 'A', version: '1', dependencies: [], initialize: async () => {}, shutdown: async () => {} };
      const modB = { name: 'B', version: '1', dependencies: ['A'], initialize: async () => {}, shutdown: async () => {} };
      
      mm.register(modA);
      mm.register(modB);
      
      await mm.initializeAll();
      
      expect(mm.getModule('A')).toBeDefined();
      expect(mm.getModule('B')).toBeDefined();
    });

    it('should detect circular dependencies', async () => {
      const mm = new ModuleManager(eventBus, config, logger);
      
      const modA = { name: 'A', version: '1', dependencies: ['B'], initialize: async () => {}, shutdown: async () => {} };
      const modB = { name: 'B', version: '1', dependencies: ['A'], initialize: async () => {}, shutdown: async () => {} };
      
      mm.register(modA);
      mm.register(modB);
      
      await expect(mm.initializeAll()).rejects.toThrow('Circular dependency');
    });

    it('should detect missing dependencies', async () => {
      const mm = new ModuleManager(eventBus, config, logger);
      
      const modA = { name: 'A', version: '1', dependencies: ['Missing'], initialize: async () => {}, shutdown: async () => {} };
      
      mm.register(modA);
      
      await expect(mm.initializeAll()).rejects.toThrow('Missing dependency');
    });
  });
});