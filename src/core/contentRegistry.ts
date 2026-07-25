export interface ContentEntry<T = any> {
  id: string;
  type: string;
  data: T;
  version: number;
  source: string;
}

export interface ContentLoader<T = any> {
  type: string;
  load(path: string): Promise<T>;
  validate(data: T): boolean;
  migrate?(data: any, fromVersion: number): T;
}

export class ContentRegistry {
  private entries = new Map<string, ContentEntry>();
  private loaders = new Map<string, ContentLoader>();
  private indexes = new Map<string, Map<string, string>>();

  registerLoader(loader: ContentLoader): void {
    this.loaders.set(loader.type, loader);
  }

  async loadFromDirectory(basePath: string, type: string): Promise<void> {
    const loader = this.loaders.get(type);
    if (!loader) throw new Error(`No loader for type: ${type}`);

    // In real implementation, scan directory and load files
    // For now, placeholder
  }

  async loadFile(path: string, type: string): Promise<ContentEntry> {
    const loader = this.loaders.get(type);
    if (!loader) throw new Error(`No loader for type: ${type}`);

    const data = await loader.load(path);
    if (!loader.validate(data)) {
      throw new Error(`Validation failed for ${path}`);
    }

    const entry: ContentEntry = {
      id: data.id || path,
      type,
      data,
      version: data.version || 1,
      source: path
    };

    this.addEntry(entry);
    return entry;
  }

  addEntry(entry: ContentEntry): void {
    const key = `${entry.type}:${entry.id}`;
    this.entries.set(key, entry);
    
    if (!this.indexes.has(entry.type)) {
      this.indexes.set(entry.type, new Map());
    }
    this.indexes.get(entry.type)!.set(entry.id, key);
  }

  get<T>(type: string, id: string): ContentEntry<T> | undefined {
    const key = this.indexes.get(type)?.get(id);
    return key ? this.entries.get(key) as ContentEntry<T> : undefined;
  }

  getAll<T>(type: string): ContentEntry<T>[] {
    const index = this.indexes.get(type);
    if (!index) return [];
    return Array.from(index.values()).map(k => this.entries.get(k)! as ContentEntry<T>);
  }

  has(type: string, id: string): boolean {
    return this.indexes.get(type)?.has(id) ?? false;
  }

  remove(type: string, id: string): boolean {
    const key = this.indexes.get(type)?.get(id);
    if (!key) return false;
    this.indexes.get(type)!.delete(id);
    return this.entries.delete(key);
  }

  clear(): void {
    this.entries.clear();
    this.indexes.clear();
  }

  getTypes(): string[] {
    return Array.from(this.indexes.keys());
  }

  getIds(type: string): string[] {
    return Array.from(this.indexes.get(type)?.keys() ?? []);
  }
}

export const contentRegistry = new ContentRegistry();