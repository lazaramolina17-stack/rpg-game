export interface Component {
  entity: Entity;
  _type?: string;
}

export type ComponentType = string;

export type Entity = number;

export interface System {
  world: World;
  enabled: boolean;
  priority: number;
  update(dt: number): void;
}

export interface Query {
  all?: ComponentType[];
  any?: ComponentType[];
  none?: ComponentType[];
}

export class World {
  private nextEntityId = 1;
  private entities = new Map<Entity, Set<ComponentType>>();
  private components = new Map<ComponentType, Map<Entity, Component>>();
  private systems: System[] = [];
  private archetypes = new Map<string, Set<Entity>>();

  createEntity(): Entity {
    const id = this.nextEntityId++;
    this.entities.set(id, new Set());
    this.refreshArchetype(id);
    return id;
  }

  destroyEntity(entity: Entity): void {
    const types = this.entities.get(entity);
    if (!types) return;
    
    for (const type of types) {
      this.components.get(type)?.delete(entity);
    }
    this.entities.delete(entity);
    this.refreshArchetype(entity);
  }

  addComponent<T extends Component>(entity: Entity, component: T): T {
    const type = component._type || component.constructor.name as ComponentType;
    if (!this.components.has(type)) {
      this.components.set(type, new Map());
    }
    this.components.get(type)!.set(entity, component);
    this.entities.get(entity)!.add(type);
    this.refreshArchetype(entity);
    return component;
  }

  removeComponent(entity: Entity, type: ComponentType): void {
    this.components.get(type)?.delete(entity);
    this.entities.get(entity)?.delete(type);
    this.refreshArchetype(entity);
  }

  getComponent<T extends Component>(entity: Entity, type: ComponentType): T | undefined {
    return this.components.get(type)?.get(entity) as T | undefined;
  }

  hasComponent(entity: Entity, type: ComponentType): boolean {
    return this.entities.get(entity)?.has(type) ?? false;
  }

  getEntitiesWith(...types: ComponentType[]): Entity[] {
    const sorted = [...types].sort();
    const entities = new Set<Entity>();
    for (const [key, set] of this.archetypes) {
      const comps = key.split(',').filter(Boolean);
      if (sorted.every(t => comps.includes(t))) {
        for (const e of set) entities.add(e);
      }
    }
    return Array.from(entities);
  }

  query(query: Query): Entity[] {
    let candidates = new Set<Entity>();
    
    if (query.all && query.all.length > 0) {
      candidates = new Set(this.getEntitiesWith(...query.all));
    } else {
      candidates = new Set(this.entities.keys());
    }

    if (query.any && query.any.length > 0) {
      const anyEntities = new Set<Entity>();
      for (const type of query.any) {
        for (const e of this.getEntitiesWith(type)) anyEntities.add(e);
      }
      candidates = new Set([...candidates].filter(e => anyEntities.has(e)));
    }

    if (query.none && query.none.length > 0) {
      for (const type of query.none) {
        for (const e of this.getEntitiesWith(type)) candidates.delete(e);
      }
    }

    return Array.from(candidates);
  }

  addSystem(system: System): void {
    system.world = this;
    this.systems.push(system);
    this.systems.sort((a, b) => b.priority - a.priority);
  }

  removeSystem(system: System): void {
    const idx = this.systems.indexOf(system);
    if (idx >= 0) this.systems.splice(idx, 1);
  }

  update(dt: number): void {
    for (const system of this.systems) {
      if (system.enabled) system.update(dt);
    }
  }

  private refreshArchetype(entity: Entity): void {
    const types = this.entities.get(entity);
    if (!types) return;
    
    const key = Array.from(types).sort().join(',');
    
    for (const [k, set] of this.archetypes) {
      set.delete(entity);
    }
    
    if (!this.archetypes.has(key)) this.archetypes.set(key, new Set());
    this.archetypes.get(key)!.add(entity);
  }
}

export function defineComponent<T extends Component>(type: ComponentType, factory: (entity: Entity) => T) {
  return { type, factory };
}