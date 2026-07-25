import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface StatsComponent extends Component {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHealth: number;
  currentHealth: number;
  maxMana: number;
  currentMana: number;
  maxStamina: number;
  currentStamina: number;
  armor: number;
  evasion: number;
  criticalChance: number;
  criticalDamage: number;
}

export interface SkillsComponent extends Component {
  skills: Map<string, Skill>;
  skillPoints: number;
}

export interface Skill {
  id: string;
  level: number;
  experience: number;
  tier: number;
}

export interface ProgressionComponent extends Component {
  level: number;
  experience: number;
  experienceToNext: number;
  attributePoints: number;
  talentPoints: number;
  classId: string;
  subclassId?: string;
}

export interface TalentComponent extends Component {
  tree: TalentTree;
  unlockedTalents: Set<string>;
}

export interface TalentTree {
  id: string;
  name: string;
  tiers: TalentTier[];
}

export interface TalentTier {
  level: number;
  talents: Talent[];
}

export interface Talent {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  maxRanks: number;
  currentRank: number;
  prerequisites: string[];
  effects: TalentEffect[];
}

export interface TalentEffect {
  type: string;
  value: number;
  scaling?: string;
}

export interface EquipmentComponent extends Component {
  slots: Map<EquipmentSlot, Entity | null>;
  loadout: EquipmentLoadout;
}

export type EquipmentSlot = 
  | 'head' | 'neck' | 'shoulders' | 'chest' | 'wrist' | 'hands' | 'waist' | 'legs' | 'feet'
  | 'finger1' | 'finger2' | 'trinket1' | 'trinket2'
  | 'mainHand' | 'offHand' | 'ranged' | 'ammo';

export interface EquipmentLoadout {
  name: string;
  primaryWeapon: Entity | null;
  secondaryWeapon: Entity | null;
}

export interface ItemComponent extends Component {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  level: number;
  value: number;
  weight: number;
  stackSize: number;
  currentStack: number;
  properties: ItemProperty[];
  requirements: ItemRequirement[];
}

export type ItemType = 
  | 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'tool' 
  | 'gem' | 'scroll' | 'potion' | 'food' | 'drink' | 'currency' | 'key';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'artifact';

export interface ItemProperty {
  type: string;
  value: number;
  scaling?: string;
}

export interface ItemRequirement {
  type: 'level' | 'class' | 'stat' | 'skill' | 'reputation';
  value: string | number;
}

export interface WeaponComponent extends Component {
  damageType: DamageType;
  minDamage: number;
  maxDamage: number;
  attackSpeed: number;
  range: number;
  weaponType: WeaponType;
  properties: WeaponProperty[];
}

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'arcane' | 'holy' | 'shadow';

export type WeaponType = 'sword' | 'axe' | 'mace' | 'dagger' | 'staff' | 'bow' | 'crossbow' | 'gun' | 'fist' | 'polearm';

export interface WeaponProperty {
  type: string;
  value: number;
}

export interface ArmorComponent extends Component {
  armorType: ArmorType;
  armorValue: number;
  resistances: Map<DamageType, number>;
  setId?: string;
}

export type ArmorType = 'cloth' | 'leather' | 'mail' | 'plate';

export interface ConsumableComponent extends Component {
  effects: ConsumableEffect[];
  cooldown: number;
  uses: number;
  maxUses: number;
}

export interface ConsumableEffect {
  type: 'heal' | 'mana' | 'stamina' | 'buff' | 'debuff' | 'teleport' | 'learn';
  value: number;
  duration?: number;
  stat?: string;
}

export class RPGModule implements Module {
  name = 'rpg';
  version = '1.0.0';
  dependencies = ['core'];

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new StatsSystem());
    ctx.world.addSystem(new ProgressionSystem());
    ctx.world.addSystem(new EquipmentSystem());
    ctx.world.addSystem(new CombatSystem());
    ctx.logger.info('RPG module initialized');
  }

  async shutdown(): Promise<void> {}
}

export class StatsSystem implements System {
  world!: World;
  enabled = true;
  priority = 80;

  update(dt: number): void {
    const entities = this.world.query({ all: ['StatsComponent'] });
    for (const entity of entities) {
      this.recalculateStats(entity);
      this.regenerateResources(entity, dt);
    }
  }

  recalculateStats(entity: Entity): void {
    const stats = this.world.getComponent<StatsComponent>(entity, 'StatsComponent');
    const equipment = this.world.getComponent<EquipmentComponent>(entity, 'EquipmentComponent');
    if (!stats) return;

    const base = this.getBaseStats(entity);
    let equipmentBonus = { strength: 0, dexterity: 0, constitution: 0, intelligence: 0, wisdom: 0, charisma: 0 };

    if (equipment) {
      for (const [slot, itemEntity] of equipment.slots) {
        if (itemEntity) {
          const item = this.world.getComponent<ItemComponent>(itemEntity, 'ItemComponent');
          if (item) {
            for (const prop of item.properties) {
              if (prop.type in equipmentBonus) {
                (equipmentBonus as any)[prop.type] += prop.value;
              }
            }
          }
        }
      }
    }

    stats.strength = base.strength + equipmentBonus.strength;
    stats.dexterity = base.dexterity + equipmentBonus.dexterity;
    stats.constitution = base.constitution + equipmentBonus.constitution;
    stats.intelligence = base.intelligence + equipmentBonus.intelligence;
    stats.wisdom = base.wisdom + equipmentBonus.wisdom;
    stats.charisma = base.charisma + equipmentBonus.charisma;

    stats.maxHealth = 50 + stats.constitution * 10;
    stats.maxMana = 30 + stats.intelligence * 5;
    stats.maxStamina = 50 + stats.dexterity * 5;
    stats.armor = Math.floor(stats.constitution * 0.5);
    stats.evasion = Math.floor(stats.dexterity * 0.3);
    stats.criticalChance = Math.min(0.5, stats.dexterity * 0.01);
    stats.criticalDamage = 1.5 + stats.strength * 0.01;

    if (stats.currentHealth > stats.maxHealth) stats.currentHealth = stats.maxHealth;
    if (stats.currentMana > stats.maxMana) stats.currentMana = stats.maxMana;
    if (stats.currentStamina > stats.maxStamina) stats.currentStamina = stats.maxStamina;
  }

  private getBaseStats(entity: Entity): StatsComponent {
    const progression = this.world.getComponent<ProgressionComponent>(entity, 'ProgressionComponent');
    const level = progression?.level ?? 1;
    
    return {
      entity,
      strength: 10 + Math.floor(level * 0.5),
      dexterity: 10 + Math.floor(level * 0.5),
      constitution: 10 + Math.floor(level * 0.5),
      intelligence: 10 + Math.floor(level * 0.5),
      wisdom: 10 + Math.floor(level * 0.5),
      charisma: 10 + Math.floor(level * 0.5),
      maxHealth: 100,
      currentHealth: 100,
      maxMana: 50,
      currentMana: 50,
      maxStamina: 100,
      currentStamina: 100,
      armor: 0,
      evasion: 0,
      criticalChance: 0,
      criticalDamage: 1.5
    };
  }

  private regenerateResources(entity: Entity, dt: number): void {
    const stats = this.world.getComponent<StatsComponent>(entity, 'StatsComponent');
    if (!stats) return;

    stats.currentHealth = Math.min(stats.maxHealth, stats.currentHealth + stats.maxHealth * 0.001 * dt);
    stats.currentMana = Math.min(stats.maxMana, stats.currentMana + stats.maxMana * 0.005 * dt);
    stats.currentStamina = Math.min(stats.maxStamina, stats.currentStamina + stats.maxStamina * 0.02 * dt);
  }
}

export class ProgressionSystem implements System {
  world!: World;
  enabled = true;
  priority = 70;

  update(dt: number): void {
    const entities = this.world.query({ all: ['ProgressionComponent'] });
    for (const entity of entities) {
      this.checkLevelUp(entity);
    }
  }

  addExperience(entity: Entity, amount: number): void {
    const progression = this.world.getComponent<ProgressionComponent>(entity, 'ProgressionComponent');
    if (!progression) return;

    progression.experience += amount;
    while (progression.experience >= progression.experienceToNext) {
      this.levelUp(entity, progression);
    }
  }

  private checkLevelUp(entity: Entity): void {
    const progression = this.world.getComponent<ProgressionComponent>(entity, 'ProgressionComponent');
    if (!progression) return;

    while (progression.experience >= progression.experienceToNext) {
      this.levelUp(entity, progression);
    }
  }

  private levelUp(entity: Entity, progression: ProgressionComponent): void {
    progression.experience -= progression.experienceToNext;
    progression.level++;
    progression.experienceToNext = Math.floor(progression.experienceToNext * 1.2);
    progression.attributePoints += 3;
    progression.talentPoints += 1;

    this.world.emit('entity:levelup', { entity, level: progression.level });
  }
}

export class EquipmentSystem implements System {
  world!: World;
  enabled = true;
  priority = 60;

  update(dt: number): void {}

  equip(entity: Entity, itemEntity: Entity, slot: EquipmentSlot): boolean {
    const equipment = this.world.getComponent<EquipmentComponent>(entity, 'EquipmentComponent');
    const item = this.world.getComponent<ItemComponent>(itemEntity, 'ItemComponent');
    if (!equipment || !item) return false;

    if (!this.meetsRequirements(entity, item)) return false;

    const current = equipment.slots.get(slot);
    if (current) this.unequip(entity, slot);

    equipment.slots.set(slot, itemEntity);
    this.world.emit('entity:equip', { entity, item: itemEntity, slot });
    return true;
  }

  unequip(entity: Entity, slot: EquipmentSlot): Entity | null {
    const equipment = this.world.getComponent<EquipmentComponent>(entity, 'EquipmentComponent');
    if (!equipment) return null;

    const item = equipment.slots.get(slot) ?? null;
    if (item) {
      equipment.slots.set(slot, null);
      this.world.emit('entity:unequip', { entity, item, slot });
    }
    return item;
  }

  private meetsRequirements(entity: Entity, item: ItemComponent): boolean {
    for (const req of item.requirements) {
      if (req.type === 'level') {
        const progression = this.world.getComponent<ProgressionComponent>(entity, 'ProgressionComponent');
        if (!progression || progression.level < (req.value as number)) return false;
      }
      if (req.type === 'stat') {
        const stats = this.world.getComponent<StatsComponent>(entity, 'StatsComponent');
        const [stat, value] = (req.value as string).split(':');
        if (stats && (stats as any)[stat] < (value as number)) return false;
      }
    }
    return true;
  }
}

export class CombatSystem implements System {
  world!: World;
  enabled = true;
  priority = 90;

  update(dt: number): void {}

  attack(attacker: Entity, target: Entity): AttackResult {
    const attackerStats = this.world.getComponent<StatsComponent>(attacker, 'StatsComponent');
    const targetStats = this.world.getComponent<StatsComponent>(target, 'StatsComponent');
    const weapon = this.getEquippedWeapon(attacker);

    if (!attackerStats || !targetStats) return { hit: false, damage: 0, critical: false };

    const hitChance = 0.75 + (attackerStats.dexterity - targetStats.evasion) * 0.005;
    const hit = Math.random() < Math.max(0.05, Math.min(0.95, hitChance));

    if (!hit) return { hit: false, damage: 0, critical: false };

    const isCritical = Math.random() < attackerStats.criticalChance;
    let damage = 0;

    if (weapon) {
      const weaponComp = this.world.getComponent<WeaponComponent>(weapon, 'WeaponComponent');
      if (weaponComp) {
        damage = weaponComp.minDamage + Math.random() * (weaponComp.maxDamage - weaponComp.minDamage);
      }
    } else {
      damage = attackerStats.strength * 0.5 + Math.random() * 5;
    }

    damage *= isCritical ? attackerStats.criticalDamage : 1;
    damage = Math.max(1, damage - targetStats.armor * 0.5);

    targetStats.currentHealth = Math.max(0, targetStats.currentHealth - damage);

    if (targetStats.currentHealth <= 0) {
      this.world.emit('entity:death', { entity: target, killer: attacker });
    }

    this.world.emit('entity:damage', { attacker, target, damage, critical: isCritical });

    return { hit: true, damage, critical: isCritical };
  }

  private getEquippedWeapon(entity: Entity): Entity | null {
    const equipment = this.world.getComponent<EquipmentComponent>(entity, 'EquipmentComponent');
    if (!equipment) return null;
    return equipment.slots.get('mainHand') ?? equipment.slots.get('offHand') ?? null;
  }
}

export interface AttackResult {
  hit: boolean;
  damage: number;
  critical: boolean;
}