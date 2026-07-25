export interface ConfigSchema {
  [key: string]: ConfigValue | ConfigSchema;
}

export type ConfigValue = 
  | string 
  | number 
  | boolean 
  | null 
  | ConfigValue[] 
  | ConfigSchema;

export class Config {
  private data: ConfigSchema = {};
  private schemas = new Map<string, ConfigSchema>();
  private watchers = new Map<string, Set<(value: any) => void>>();

  constructor(private defaults: ConfigSchema = {}) {
    this.data = { ...defaults };
  }

  load(source: ConfigSchema | string): void {
    if (typeof source === 'string') {
      // Load from file (JSON/YAML)
      // Implementation depends on runtime
    } else {
      this.merge(this.data, source);
    }
  }

  get<T>(path: string, defaultValue?: T): T {
    const keys = path.split('.');
    let current: any = this.data;
    
    for (const key of keys) {
      if (current === null || current === undefined) return defaultValue as T;
      current = current[key];
    }
    
    return current !== undefined ? current : (defaultValue as T);
  }

  set(path: string, value: any): void {
    const keys = path.split('.');
    let current: any = this.data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    const oldValue = current[keys[keys.length - 1]];
    current[keys[keys.length - 1]] = value;
    this.notify(path, value, oldValue);
  }

  has(path: string): boolean {
    const keys = path.split('.');
    let current: any = this.data;
    
    for (const key of keys) {
      if (current === null || current === undefined) return false;
      current = current[key];
    }
    
    return current !== undefined;
  }

  delete(path: string): boolean {
    const keys = path.split('.');
    let current: any = this.data;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) return false;
      current = current[keys[i]];
    }
    
    const result = delete current[keys[keys.length - 1]];
    if (result) this.notify(path, undefined, current[keys[keys.length - 1]]);
    return result;
  }

  watch(path: string, callback: (value: any) => void): () => void {
    if (!this.watchers.has(path)) this.watchers.set(path, new Set());
    this.watchers.get(path)!.add(callback);
    return () => this.watchers.get(path)?.delete(callback);
  }

  getSchema(path: string): ConfigSchema | undefined {
    return this.schemas.get(path);
  }

  registerSchema(path: string, schema: ConfigSchema): void {
    this.schemas.set(path, schema);
  }

  getOr<T>(key: string, defaultValue: T): T {
    return this.get(key, defaultValue);
  }

  loadFromFile(source: ConfigSchema): void {
    this.merge(this.data, source);
  }

  validate(path: string): boolean {
    const schema = this.schemas.get(path);
    if (!schema) return true;
    return this.validateValue(this.get(path), schema);
  }

  getAll(): ConfigSchema {
    return { ...this.data };
  }

  private merge(target: ConfigSchema, source: ConfigSchema): void {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.merge(target[key] as ConfigSchema, source[key] as ConfigSchema);
      } else {
        target[key] = source[key];
      }
    }
  }

  private notify(path: string, newValue: any, oldValue: any): void {
    this.watchers.get(path)?.forEach(cb => cb(newValue));
    // Also notify parent paths
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parent = parts.slice(0, i).join('.');
      this.watchers.get(parent)?.forEach(cb => cb(this.get(parent)));
    }
  }

  private validateValue(value: any, schema: ConfigSchema): boolean {
    if (schema === null || schema === undefined) return true;
    if (typeof schema !== 'object') return typeof value === typeof schema;
    if (Array.isArray(schema)) return Array.isArray(value) && value.every(v => this.validateValue(v, schema[0]));
    // Object schema validation
    return Object.keys(schema).every(k => this.validateValue(value?.[k], schema[k]));
  }
}

export const config = new Config({
  game: {
    name: 'RPG Engine',
    version: '0.1.0',
    tickRate: 60
  },
  engine: {
    renderer: 'webgl2',
    physics: 'rapier',
    audio: 'web-audio'
  },
  world: {
    chunkSize: 64,
    viewDistance: 5,
    timeScale: 1.0
  },
  network: {
    tickRate: 20,
    maxPlayers: 64
  }
});