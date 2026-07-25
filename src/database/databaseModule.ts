import { Module } from '../core/module.js';
import { DatabaseModule, DatabaseConfig, QueryResult, Migration, EntitySchema, Transaction } from '../save/saveModule.js';

export class DatabaseModuleImpl implements DatabaseModule {
  name = 'database';
  version = '1.0.0';
  dependencies = ['core'];

  private config: DatabaseConfig;
  private connected = false;
  private migrations: Migration[] = [];
  private schemas = new Map<string, EntitySchema>();
  private queryCache = new Map<string, any>();
  private cacheEnabled = true;

  async initialize(ctx: any): Promise<void> {
    this.config = ctx.config.get('database') || {
      type: 'sqlite',
      database: 'game.db',
      poolSize: 10
    };

    await this.connect();
    await this.runMigrations();
    ctx.logger.info('Database module initialized');
  }

  async shutdown(): Promise<void> {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    this.connected = true;
  }

  private async disconnect(): Promise<void> {
    this.connected = false;
  }

  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    const cacheKey = sql + JSON.stringify(params);
    
    if (this.cacheEnabled && this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey);
    }

    const result: QueryResult<T> = {
      rows: [],
      rowCount: 0,
      fields: [],
      command: sql.split(' ')[0],
      duration: Date.now() - start
    };

    if (this.cacheEnabled) {
      this.queryCache.set(cacheKey, result);
    }

    return result;
  }

  async execute(sql: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    this.invalidateCache(sql);
    
    return {
      rows: [],
      rowCount: 0,
      fields: [],
      command: sql.split(' ')[0],
      duration: Date.now() - start
    };
  }

  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx: Transaction = {
      query: this.query.bind(this),
      execute: this.execute.bind(this),
      commit: async () => {},
      rollback: async () => {}
    };

    try {
      const result = await fn(tx);
      await tx.commit();
      return result;
    } catch (error) {
      await tx.rollback();
      throw error;
    }
  }

  async migrate(): Promise<void> {
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    for (const migration of this.migrations) {
      try {
        await this.execute(migration.up);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
      }
    }
  }

  addMigration(migration: Migration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  registerSchema(schema: EntitySchema): void {
    this.schemas.set(schema.table, schema);
  }

  getSchema(table: string): EntitySchema | undefined {
    return this.schemas.get(table);
  }

  async backup(path: string): Promise<void> {
    // Implement backup
  }

  async restore(path: string): Promise<void> {
    // Implement restore
  }

  enableCache(enabled: boolean): void {
    this.cacheEnabled = enabled;
    if (!enabled) this.queryCache.clear();
  }

  clearCache(): void {
    this.queryCache.clear();
  }

  private invalidateCache(sql: string): void {
    const tableMatch = sql.match(/(?:from|into|update|delete from)\s+(\w+)/i);
    if (tableMatch) {
      const table = tableMatch[1];
      for (const key of this.queryCache.keys()) {
        if (key.includes(table)) this.queryCache.delete(key);
      }
    }
  }
}

export class DatabaseSystem {
  constructor(private db: DatabaseModuleImpl) {}

  async saveEntity(table: string, entity: any): Promise<void> {
    const schema = this.db.getSchema(table);
    if (!schema) throw new Error(`No schema for table: ${table}`);

    const columns = schema.columns.filter(c => !c.autoIncrement).map(c => c.name);
    const values = columns.map(c => entity[c]);
    const placeholders = columns.map(() => '?').join(', ');

    await this.db.execute(
      `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }

  async loadEntity<T>(table: string, id: string | number): Promise<T | null> {
    const result = await this.db.query<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    return result.rows[0] || null;
  }

  async loadEntities<T>(table: string, conditions: Record<string, any> = {}): Promise<T[]> {
    const where = Object.keys(conditions).map(k => `${k} = ?`).join(' AND ');
    const params = Object.values(conditions);
    const sql = where ? `SELECT * FROM ${table} WHERE ${where}` : `SELECT * FROM ${table}`;
    const result = await this.db.query<T>(sql, params);
    return result.rows;
  }

  async deleteEntity(table: string, id: string | number): Promise<void> {
    await this.db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
  }
}

export const defaultMigrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: `
      CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT NOT NULL,
        character_name TEXT NOT NULL UNIQUE,
        class_id TEXT NOT NULL,
        race_id TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        position_z REAL DEFAULT 0,
        rotation_x REAL DEFAULT 0,
        rotation_y REAL DEFAULT 0,
        rotation_z REAL DEFAULT 0,
        rotation_w REAL DEFAULT 1,
        health INTEGER DEFAULT 100,
        max_health INTEGER DEFAULT 100,
        mana INTEGER DEFAULT 50,
        max_mana INTEGER DEFAULT 50,
        gold INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      CREATE INDEX IF NOT EXISTS idx_players_account ON players(account_id);
      CREATE INDEX IF NOT EXISTS idx_players_name ON players(character_name);
    `,
    down: 'DROP TABLE IF EXISTS players;'
  },
  {
    version: 2,
    name: 'inventory_schema',
    up: `
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        container_id TEXT NOT NULL,
        slot_index INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        count INTEGER DEFAULT 1,
        durability INTEGER,
        max_durability INTEGER,
        enchantments TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory_items(player_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_container ON inventory_items(player_id, container_id);
    `,
    down: 'DROP TABLE IF EXISTS inventory_items;'
  },
  {
    version: 3,
    name: 'quest_schema',
    up: `
      CREATE TABLE IF NOT EXISTS player_quests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        quest_id TEXT NOT NULL,
        state TEXT NOT NULL DEFAULT 'active',
        objectives TEXT NOT NULL,
        variables TEXT,
        started_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now')),
        completed_at INTEGER,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_quests_player ON player_quests(player_id);
      CREATE INDEX IF NOT EXISTS idx_quests_quest ON player_quests(quest_id);
    `,
    down: 'DROP TABLE IF EXISTS player_quests;'
  },
  {
    version: 4,
    name: 'skills_and_talents',
    up: `
      CREATE TABLE IF NOT EXISTS player_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        skill_id TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        tier INTEGER DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS player_talents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_id INTEGER NOT NULL,
        talent_id TEXT NOT NULL,
        rank INTEGER DEFAULT 1,
        FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_skills_player ON player_skills(player_id);
      CREATE INDEX IF NOT EXISTS idx_talents_player ON player_talents(player_id);
    `,
    down: 'DROP TABLE IF EXISTS player_skills; DROP TABLE IF EXISTS player_talents;'
  }
];