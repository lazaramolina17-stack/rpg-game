import { Module } from '../core/module.js';
import { World, Entity, Component } from '../core/ecs.js';

export interface ContentDefinition<T = any> {
  id: string;
  type: string;
  version: number;
  data: T;
  dependencies: string[];
  tags: string[];
  metadata: ContentMetadata;
}

export interface ContentMetadata {
  author: string;
  createdAt: number;
  updatedAt: number;
  description: string;
  category: string;
  rarity?: string;
  icon?: string;
  previewImage?: string;
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  attributes: RaceAttributes;
  racialAbilities: string[];
  startingStats: BaseStats;
  customizationOptions: CustomizationOption[];
  lore: string;
}

export interface RaceAttributes {
  size: 'small' | 'medium' | 'large';
  speed: number;
  languages: string[];
  traits: string[];
}

export interface BaseStats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  spirit: number;
}

export interface CustomizationOption {
  category: 'face' | 'hair' | 'skin' | 'tattoos' | 'piercings' | 'body';
  options: CustomizationChoice[];
}

export interface CustomizationChoice {
  id: string;
  name: string;
  previewIcon: string;
  data: any;
}

export interface ClassData {
  id: string;
  name: string;
  description: string;
  archetype: string;
  primaryStat: keyof BaseStats;
  secondaryStat: keyof BaseStats;
  resourceType: string;
  resourceName: string;
  startingAbilities: string[];
  talentTrees: TalentTreeData[];
  specializations: SpecializationData[];
  armorTypes: string[];
  weaponTypes: string[];
}

export interface TalentTreeData {
  id: string;
  name: string;
  icon: string;
  talents: TalentData[];
}

export interface TalentData {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: number;
  column: number;
  maxRank: number;
  prerequisites: string[];
  effects: TalentEffect[];
  ranks: TalentRankData[];
}

export interface TalentEffect {
  type: string;
  value: number;
  scaling?: string;
}

export interface TalentRankData {
  rank: number;
  description: string;
  effects: TalentEffect[];
}

export interface SpecializationData {
  id: string;
  name: string;
  description: string;
  icon: string;
  role: 'tank' | 'healer' | 'dps' | 'support';
  talentTreeId: string;
  passiveAbilities: string[];
  activeAbilities: string[];
}

export interface WeaponData {
  id: string;
  name: string;
  description: string;
  type: WeaponType;
  subtype: string;
  rarity: ItemRarity;
  level: number;
  damage: DamageRange;
  attackSpeed: number;
  range: number;
  stats: WeaponStats;
  properties: WeaponProperty[];
  requirements: ItemRequirements;
  appearance: WeaponAppearance;
}

export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'staff' | 'bow' | 'crossbow' | 'gun' | 'fist' | 'polearm' | 'wand';

export interface DamageRange {
  min: number;
  max: number;
  type: string;
}

export interface WeaponStats {
  dps: number;
  criticalChance: number;
  criticalDamage: number;
  armorPenetration: number;
  attackPower: number;
  spellPower: number;
}

export interface WeaponProperty {
  type: string;
  value: number;
  description: string;
}

export interface ItemRequirements {
  level: number;
  stats?: Partial<BaseStats>;
  skills?: Record<string, number>;
  reputation?: Record<string, number>;
  class?: string[];
  race?: string[];
}

export interface WeaponAppearance {
  model: string;
  icon: string;
  sheathModel?: string;
  particleEffect?: string;
  colorVariants: string[];
}

export interface ArmorData {
  id: string;
  name: string;
  description: string;
  type: ArmorType;
  slot: EquipmentSlot;
  rarity: ItemRarity;
  level: number;
  armor: number;
  stats: ArmorStats;
  setId?: string;
  setBonuses?: SetBonus[];
  requirements: ItemRequirements;
  appearance: ArmorAppearance;
}

export type ArmorType = 'cloth' | 'leather' | 'mail' | 'plate' | 'shield';

export interface ArmorStats {
  health: number;
  mana: number;
  primaryStat: number;
  secondaryStat: number;
  resistances: Record<string, number>;
  avoidance: number;
}

export interface SetBonus {
  piecesRequired: number;
  description: string;
  effects: TalentEffect[];
}

export interface ArmorAppearance {
  model: string;
  icon: string;
  colorVariants: string[];
  hideSlots?: EquipmentSlot[];
}

export interface ConsumableData {
  id: string;
  name: string;
  description: string;
  type: ConsumableType;
  rarity: ItemRarity;
  level: number;
  cooldown: number;
  maxStack: number;
  effects: ConsumableEffect[];
  requirements: ItemRequirements;
  appearance: ItemAppearance;
}

export type ConsumableType = 'potion' | 'elixir' | 'food' | 'drink' | 'scroll' | 'bandage' | 'toy' | 'utility';

export interface ConsumableEffect {
  type: 'heal' | 'mana' | 'stamina' | 'buff' | 'debuff' | 'teleport' | 'learn' | 'currency' | 'reputation';
  value: number;
  duration?: number;
  stat?: string;
  probability?: number;
}

export interface ItemAppearance {
  model: string;
  icon: string;
  colorVariants: string[];
}

export interface ZoneData {
  id: string;
  name: string;
  description: string;
  type: ZoneType;
  levelRange: [number, number];
  recommendedPlayers: number;
  music: string;
  skybox: string;
  weather: WeatherPattern[];
  subZones: SubZoneData[];
  npcs: NPCSpawnData[];
  resources: ResourceNodeData[];
  quests: string[];
  dungeons: string[];
  raidInstances: string[];
  pvpEnabled: boolean;
  flyingEnabled: boolean;
}

export type ZoneType = 'continent' | 'zone' | 'subzone' | 'dungeon' | 'raid' | 'battleground' | 'arena' | 'city' | 'village' | 'wilderness';

export interface WeatherPattern {
  type: string;
  probability: number;
  duration: [number, number];
  effects: WeatherEffect[];
}

export interface WeatherEffect {
  type: string;
  intensity: number;
  visualEffect: string;
  audioEffect: string;
}

export interface SubZoneData {
  id: string;
  name: string;
  bounds: BoundingBox;
  levelRange: [number, number];
  npcs: string[];
  resources: string[];
}

export interface BoundingBox {
  minX: number; maxX: number;
  minY: number; maxY: number;
  minZ: number; maxZ: number;
}

export interface NPCSpawnData {
  npcId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  spawnRadius: number;
  respawnTime: number;
  maxCount: number;
  conditions: SpawnCondition[];
  patrolPath?: PatrolPoint[];
}

export interface SpawnCondition {
  type: 'time' | 'weather' | 'quest' | 'event' | 'population' | 'player_level';
  value: any;
}

export interface PatrolPoint {
  x: number; y: number; z: number;
  waitTime: number;
  action?: string;
}

export interface ResourceNodeData {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  respawnTime: number;
  maxCount: number;
  requiredSkill: string;
  requiredLevel: number;
  lootTable: string;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  level: number;
  suggestedLevel: number;
  prerequisites: QuestPrerequisite[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  choices?: QuestChoice[];
  repeatable: boolean;
  cooldown?: number;
  timeLimit?: number;
  autoComplete: boolean;
  shareable: boolean;
  giverId?: string;
  turnInId?: string;
  location?: { x: number; y: number; z: number };
}

export interface QuestPrerequisite {
  type: 'quest' | 'level' | 'skill' | 'reputation' | 'item' | 'class' | 'race' | 'achievement';
  value: string | number;
  comparison: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'has' | 'not_has';
}

export interface QuestObjective {
  id: string;
  type: string;
  description: string;
  target: string | number;
  count: number;
  location?: { x: number; y: number; z: number; radius: number };
  markers?: MapMarker[];
  optional: boolean;
  hidden: boolean;
  prerequisites: string[];
}

export interface MapMarker {
  id: string;
  type: string;
  position: { x: number; y: number; z: number };
  icon: string;
  color: string;
  label?: string;
}

export interface QuestReward {
  type: 'experience' | 'currency' | 'item' | 'skill' | 'reputation' | 'attribute' | 'title' | 'unlock' | 'choice';
  value: string | number;
  count?: number;
  probability?: number;
  scaling?: RewardScaling;
  choices?: QuestRewardChoice[];
}

export interface RewardScaling {
  baseLevel: number;
  perLevel: number;
  maxLevel: number;
}

export interface QuestRewardChoice {
  id: string;
  rewards: QuestReward[];
  exclusive: boolean;
}

export interface QuestChoice {
  id: string;
  description: string;
  requirements: QuestPrerequisite[];
  consequences: QuestConsequence[];
  rewards: QuestReward[];
  unlocksQuests?: string[];
  locksQuests?: string[];
}

export interface QuestConsequence {
  type: 'reputation' | 'faction' | 'npc_disposition' | 'world_state' | 'unlock' | 'lock' | 'spawn' | 'despawn';
  target: string;
  value: number | string;
  permanent: boolean;
}

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  criteria: AchievementCriteria[];
  rewards: QuestReward[];
  hidden: boolean;
  accountWide: boolean;
}

export interface AchievementCriteria {
  type: string;
  target: string;
  count: number;
}

export interface ItemRarity {
  common: 'common';
  uncommon: 'uncommon';
  rare: 'rare';
  epic: 'epic';
  legendary: 'legendary';
  mythic: 'mythic';
  artifact: 'artifact';
}

export type EquipmentSlot = 
  | 'head' | 'neck' | 'shoulders' | 'back' | 'chest' | 'wrist' | 'hands' | 'waist' | 'legs' | 'feet'
  | 'finger1' | 'finger2' | 'trinket1' | 'trinket2'
  | 'mainHand' | 'offHand' | 'ranged' | 'ammo'
  | 'tabard' | 'shirt';

export class ContentModule implements Module {
  name = 'content';
  version = '1.0.0';
  dependencies = ['core'];

  private definitions = new Map<string, Map<string, ContentDefinition>>();
  private loaders = new Map<string, ContentLoader>();

  async initialize(ctx: any): Promise<void> {
    this.registerDefaultLoaders();
    await this.loadCoreContent();
    ctx.logger.info('Content module initialized');
  }

  async shutdown(): Promise<void> {}

  registerLoader(loader: ContentLoader): void {
    this.loaders.set(loader.type, loader);
  }

  registerDefinition(def: ContentDefinition): void {
    if (!this.definitions.has(def.type)) {
      this.definitions.set(def.type, new Map());
    }
    this.definitions.get(def.type)!.set(def.id, def);
  }

  getDefinition<T>(type: string, id: string): ContentDefinition<T> | undefined {
    return this.definitions.get(type)?.get(id) as ContentDefinition<T> | undefined;
  }

  getAllDefinitions<T>(type: string): ContentDefinition<T>[] {
    return Array.from(this.definitions.get(type)?.values() || []) as ContentDefinition<T>[];
  }

  hasDefinition(type: string, id: string): boolean {
    return this.definitions.get(type)?.has(id) ?? false;
  }

  getTypes(): string[] {
    return Array.from(this.definitions.keys());
  }

  getIds(type: string): string[] {
    return Array.from(this.definitions.get(type)?.keys() || []);
  }

  async loadFromDirectory(basePath: string, type: string): Promise<void> {
    const loader = this.loaders.get(type);
    if (!loader) throw new Error(`No loader for type: ${type}`);
  }

  private registerDefaultLoaders(): void {
    this.registerLoader({
      type: 'json',
      load: async (path: string) => {
        const response = await fetch(path);
        return response.json();
      },
      validate: (data: any) => !!data && typeof data === 'object'
    });
  }

  private async loadCoreContent(): void {
    this.registerDefinition({
      id: 'human',
      type: 'race',
      version: 1,
      data: {
        id: 'human',
        name: 'Human',
        description: 'Versatile and adaptable',
        attributes: { size: 'medium', speed: 30, languages: ['Common'], traits: ['Adaptable'] },
        racialAbilities: ['diplomacy', 'versatility'],
        startingStats: { strength: 10, agility: 10, intelligence: 10, vitality: 10, spirit: 10 },
        customizationOptions: [],
        lore: 'Humans are the most adaptable race...'
      },
      dependencies: [],
      tags: ['core', 'playable'],
      metadata: { author: 'System', createdAt: Date.now(), updatedAt: Date.now(), description: '', category: 'race' }
    } as ContentDefinition<RaceData>);
  }
}

export interface ContentLoader {
  type: string;
  load(path: string): Promise<any>;
  validate(data: any): boolean;
  migrate?(data: any, fromVersion: number): any;
}

export class ContentRegistry {
  constructor(private contentModule: ContentModule) {}

  getRace(id: string): RaceData | undefined {
    return this.contentModule.getDefinition<RaceData>('race', id)?.data;
  }

  getAllRaces(): RaceData[] {
    return this.contentModule.getAllDefinitions<RaceData>('race').map(d => d.data);
  }

  getClass(id: string): ClassData | undefined {
    return this.contentModule.getDefinition<ClassData>('class', id)?.data;
  }

  getAllClasses(): ClassData[] {
    return this.contentModule.getAllDefinitions<ClassData>('class').map(d => d.data);
  }

  getWeapon(id: string): WeaponData | undefined {
    return this.contentModule.getDefinition<WeaponData>('weapon', id)?.data;
  }

  getAllWeapons(): WeaponData[] {
    return this.contentModule.getAllDefinitions<WeaponData>('weapon').map(d => d.data);
  }

  getArmor(id: string): ArmorData | undefined {
    return this.contentModule.getDefinition<ArmorData>('armor', id)?.data;
  }

  getAllArmor(): ArmorData[] {
    return this.contentModule.getAllDefinitions<ArmorData>('armor').map(d => d.data);
  }

  getConsumable(id: string): ConsumableData | undefined {
    return this.contentModule.getDefinition<ConsumableData>('consumable', id)?.data;
  }

  getZone(id: string): ZoneData | undefined {
    return this.contentModule.getDefinition<ZoneData>('zone', id)?.data;
  }

  getAllZones(): ZoneData[] {
    return this.contentModule.getAllDefinitions<ZoneData>('zone').map(d => d.data);
  }

  getQuest(id: string): QuestData | undefined {
    return this.contentModule.getDefinition<QuestData>('quest', id)?.data;
  }

  getAchievement(id: string): AchievementData | undefined {
    return this.contentModule.getDefinition<AchievementData>('achievement', id)?.data;
  }
}