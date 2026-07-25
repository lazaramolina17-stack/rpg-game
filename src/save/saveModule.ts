import { Module } from '../core/module.js';
import { World, Entity } from '../core/ecs.js';

export interface SaveData {
  version: number;
  timestamp: number;
  player: PlayerSaveData;
  world: WorldSaveData;
  quests: QuestSaveData[];
  inventory: InventorySaveData;
  stats: StatsSaveData;
  npcs: NpcSaveData[];
  metadata: SaveMetadata;
}

export interface PlayerSaveData {
  id: string;
  name: string;
  class: string;
  race: string;
  level: number;
  experience: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  health: number;
  mana: number;
  stamina: number;
  stats: Record<string, number>;
  talents: string[];
  abilities: string[];
  currency: Record<string, number>;
  reputation: Record<string, number>;
  settings: Record<string, any>;
}

export interface WorldSaveData {
  currentRegion: string;
  timeOfDay: number;
  day: number;
  season: number;
  weather: string;
  discoveredRegions: string[];
  discoveredPoints: PointOfInterest[];
  worldState: Record<string, any>;
  activeEvents: WorldEvent[];
}

export interface PointOfInterest {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  discoveredAt: number;
}

export interface WorldEvent {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  startedAt: number;
  endsAt?: number;
  data: Record<string, any>;
}

export interface QuestSaveData {
  questId: string;
  state: string;
  objectives: Record<string, { current: number; target: number; completed: boolean }>;
  variables: Record<string, any>;
  startedAt: number;
  updatedAt: number;
}

export interface InventorySaveData {
  containers: ContainerSaveData[];
  activeContainer: string;
  maxWeight: number;
  currentWeight: number;
}

export interface ContainerSaveData {
  id: string;
  name: string;
  type: string;
  maxSlots: number;
  maxWeight: number;
  items: ItemSaveData[];
}

export interface ItemSaveData {
  itemId: string;
  slot: number;
  count: number;
  metadata: Record<string, any>;
}

export interface StatsSaveData {
  base: Record<string, number>;
  current: Record<string, number>;
  modifiers: StatModifierData[];
}

export interface StatModifierData {
  stat: string;
  value: number;
  operation: string;
  source: string;
  duration?: number;
  stacks?: number;
}

export interface NpcSaveData {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  aiState: string;
  memory: any[];
  relationships: any[];
  schedule: any[];
  faction: string;
  reputation: number;
}

export interface SaveMetadata {
  saveId: string;
  gameVersion: string;
  playTime: number;
  screenshot?: string;
  tags: string[];
  description?: string;
}

export interface SaveSlot {
  id: string;
  name: string;
  data: SaveData | null;
  lastModified: number;
  autoSave: boolean;
  protected: boolean;
}

export class SaveModule implements Module {
  name = 'save';
  version = '1.0.0';
  dependencies = ['core', 'rpg', 'world', 'npc', 'quests', 'inventory'];

  private saveSlots = new Map<string, SaveSlot>();
  private currentSaveId: string | null = null;
  private autoSaveInterval: number = 300000; // 5 minutes
  private maxSaveSlots = 10;
  private maxAutoSaves = 5;
  private compressionEnabled = true;
  private encryptionEnabled = false;

  async initialize(ctx: any): Promise<void> {
    await this.loadSaveIndex();
    ctx.world.addSystem(new AutoSaveSystem(this));
    ctx.logger.info('Save module initialized');
  }

  async shutdown(): Promise<void> {
    if (this.currentSaveId) {
      await this.saveGame(this.currentSaveId, true);
    }
  }

  createNewGame(saveId: string, name: string, playerData: Partial<PlayerSaveData>): SaveData {
    const now = Date.now();
    const saveData: SaveData = {
      version: 1,
      timestamp: now,
      player: this.createDefaultPlayerSave(playerData),
      world: this.createDefaultWorldSave(),
      quests: [],
      inventory: this.createDefaultInventorySave(),
      stats: this.createDefaultStatsSave(),
      npcs: [],
      metadata: {
        saveId,
        gameVersion: '0.1.0',
        playTime: 0,
        tags: ['new'],
        description: name
      }
    };

    const slot: SaveSlot = {
      id: saveId,
      name,
      data: saveData,
      lastModified: now,
      autoSave: false,
      protected: false
    };

    this.saveSlots.set(saveId, slot);
    this.currentSaveId = saveId;
    this.saveSaveIndex();
    return saveData;
  }

  private createDefaultPlayerSave(overrides: Partial<PlayerSaveData>): PlayerSaveData {
    return {
      id: overrides.id || `player_${Date.now()}`,
      name: overrides.name || 'Hero',
      class: overrides.class || 'warrior',
      race: overrides.race || 'human',
      level: overrides.level || 1,
      experience: overrides.experience || 0,
      position: overrides.position || { x: 0, y: 0, z: 0 },
      rotation: overrides.rotation || { x: 0, y: 0, z: 0, w: 1 },
      health: 100,
      mana: 50,
      stamina: 100,
      stats: { strength: 10, agility: 10, intelligence: 10, vitality: 10 },
      talents: [],
      abilities: [],
      currency: { gold: 100 },
      reputation: {},
      settings: {}
    };
  }

  private createDefaultWorldSave(): WorldSaveData {
    return {
      currentRegion: 'starting_area',
      timeOfDay: 12,
      day: 1,
      season: 0,
      weather: 'clear',
      discoveredRegions: ['starting_area'],
      discoveredPoints: [],
      worldState: {},
      activeEvents: []
    };
  }

  private createDefaultInventorySave(): InventorySaveData {
    return {
      containers: [{
        id: 'main',
        name: 'Backpack',
        type: 'inventory',
        maxSlots: 20,
        maxWeight: 100,
        items: []
      }],
      activeContainer: 'main',
      maxWeight: 100,
      currentWeight: 0
    };
  }

  private createDefaultStatsSave(): StatsSaveData {
    return {
      base: { strength: 10, agility: 10, intelligence: 10, vitality: 10 },
      current: { strength: 10, agility: 10, intelligence: 10, vitality: 10, health: 100, mana: 50, stamina: 100 },
      modifiers: []
    };
  }

  async saveGame(saveId: string, isAutoSave = false): Promise<boolean> {
    const slot = this.saveSlots.get(saveId);
    if (!slot || !slot.data) return false;

    try {
      slot.data.timestamp = Date.now();
      slot.data.metadata.playTime += Date.now() - (slot.data.metadata.timestamp || Date.now());
      slot.lastModified = Date.now();
      slot.autoSave = isAutoSave;

      if (isAutoSave) {
        await this.pruneAutoSaves();
      }

      await this.persistSave(slot);
      await this.saveSaveIndex();
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      return false;
    }
  }

  async loadGame(saveId: string): Promise<SaveData | null> {
    const slot = this.saveSlots.get(saveId);
    if (!slot) return null;

    try {
      const data = await this.loadSaveData(saveId);
      if (data) {
        slot.data = data;
        this.currentSaveId = saveId;
        return data;
      }
    } catch (error) {
      console.error('Load failed:', error);
    }
    return null;
  }

  async deleteSave(saveId: string): Promise<boolean> {
    const slot = this.saveSlots.get(saveId);
    if (!slot || slot.protected) return false;

    this.saveSlots.delete(saveId);
    await this.deleteSaveFile(saveId);
    await this.saveSaveIndex();
    return true;
  }

  getSaveSlots(): SaveSlot[] {
    return Array.from(this.saveSlots.values()).sort((a, b) => b.lastModified - a.lastModified);
  }

  getCurrentSave(): SaveData | null {
    return this.currentSaveId ? this.saveSlots.get(this.currentSaveId)?.data || null : null;
  }

  setCurrentSave(saveId: string): boolean {
    if (this.saveSlots.has(saveId)) {
      this.currentSaveId = saveId;
      return true;
    }
    return false;
  }

  protectedSlot(saveId: string, protected_: boolean): void {
    const slot = this.saveSlots.get(saveId);
    if (slot) slot.protected = protected_;
  }

  async migrateSave(saveData: SaveData, fromVersion: number): Promise<SaveData> {
    let migrated = { ...saveData };
    
    for (let v = fromVersion + 1; v <= migrated.version; v++) {
      migrated = this.applyMigration(migrated, v);
    }
    
    return migrated;
  }

  private applyMigration(saveData: SaveData, version: number): SaveData {
    return saveData;
  }

  private async loadSaveIndex(): Promise<void> {}
  private async saveSaveIndex(): Promise<void> {}
  private async persistSave(slot: SaveSlot): Promise<void> {}
  private async loadSaveData(saveId: string): Promise<SaveData | null> { return null; }
  private async deleteSaveFile(saveId: string): Promise<void> {}
  private async pruneAutoSaves(): Promise<void> {
    const autoSaves = this.getSaveSlots().filter(s => s.autoSave && !s.protected);
    autoSaves.sort((a, b) => a.lastModified - b.lastModified);
    
    while (autoSaves.length > this.maxAutoSaves) {
      const oldest = autoSaves.shift()!;
      this.saveSlots.delete(oldest.id);
    }
  }
}

export class AutoSaveSystem {
  constructor(private saveModule: SaveModule) {}

  update(dt: number): void {}
}

export class SaveManager {
  constructor(private saveModule: SaveModule) {}

  async captureGameState(world: World): Promise<SaveData> {
    const saveId = this.saveModule.getCurrentSave()?.metadata.saveId || `save_${Date.now()}`;
    return this.saveModule.getCurrentSave() || this.saveModule.createNewGame(saveId, 'New Game', {});
  }

  async restoreGameState(saveData: SaveData, world: World): Promise<void> {
    // Restore player, world, quests, inventory, NPCs
  }
}