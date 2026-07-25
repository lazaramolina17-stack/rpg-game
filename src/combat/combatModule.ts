import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface CombatComponent extends Component {
  state: CombatState;
  target: Entity | null;
  threatTable: Map<Entity, number>;
  combatStartTime: number;
  lastActionTime: number;
  actionQueue: CombatAction[];
  globalCooldown: number;
  globalCooldownEnd: number;
}

export type CombatState = 'out_of_combat' | 'in_combat' | 'preparing' | 'stunned' | 'channeling' | 'dead';

export interface CombatAction {
  id: string;
  abilityId: string;
  target: Entity | null;
  position?: { x: number; y: number; z: number };
  startTime: number;
  castTime: number;
  channelTime: number;
  state: 'queued' | 'casting' | 'channeling' | 'executing' | 'complete' | 'interrupted' | 'failed';
  interruptible: boolean;
}

export interface AbilityComponent extends Component {
  abilities: Map<string, AbilityInstance>;
  knownAbilities: Set<string>;
  cooldowns: Map<string, number>;
  charges: Map<string, number>;
  resources: Map<string, Resource>;
}

export interface AbilityInstance {
  abilityId: string;
  rank: number;
  experience: number;
  cooldownReduction: number;
  costReduction: number;
  modifiers: AbilityModifier[];
}

export interface AbilityModifier {
  type: 'damage' | 'heal' | 'cooldown' | 'cost' | 'range' | 'radius' | 'duration' | 'charges' | 'effect';
  value: number;
  operation: 'add' | 'multiply' | 'override';
  condition?: string;
}

export interface Resource {
  current: number;
  maximum: number;
  regeneration: number;
  type: ResourceType;
}

export type ResourceType = 'mana' | 'rage' | 'energy' | 'focus' | 'runic' | 'holy' | 'chi' | 'custom';

export interface StatsComponent extends Component {
  base: BaseStats;
  current: CurrentStats;
  modifiers: StatModifier[];
}

export interface BaseStats {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  spirit: number;
  armor: number;
  dodge: number;
  parry: number;
  block: number;
  criticalChance: number;
  criticalDamage: number;
  haste: number;
  mastery: number;
  versatility: number;
  leech: number;
  avoidance: number;
  speed: number;
}

export interface CurrentStats extends BaseStats {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attackPower: number;
  spellPower: number;
}

export interface StatModifier {
  stat: keyof BaseStats;
  value: number;
  operation: 'add' | 'multiply';
  source: string;
  duration?: number;
  stacks?: number;
}

export interface BuffComponent extends Component {
  buffs: Map<string, ActiveBuff>;
}

export interface ActiveBuff {
  id: string;
  sourceId: string;
  caster: Entity;
  startTime: number;
  duration: number;
  remainingTime: number;
  stacks: number;
  maxStacks: number;
  refreshable: boolean;
  stats: Partial<BaseStats>;
  effects: BuffEffect[];
  onExpire?: () => void;
}

export interface BuffEffect {
  type: 'periodic_damage' | 'periodic_heal' | 'stat_modifier' | 'immunity' | 'silence' | 'stun' | 'root' | 'slow' | 'speed' | 'invisibility' | 'invulnerability' | 'taunt' | 'disarm' | 'pacify' | 'fear' | 'charm' | 'sleep' | 'horror' | 'banish' | 'polymorph' | 'knockback' | 'pull' | 'teleport';
  value: number;
  interval?: number;
  nextTick?: number;
}

export interface AbilityData {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  school: SpellSchool;
  cooldown: number;
  charges: number;
  castTime: number;
  channelTime: number;
  range: number;
  radius: number;
  cost: AbilityCost[];
  requirements: AbilityRequirement[];
  effects: AbilityEffect[];
  scaling: AbilityScaling[];
  interruptible: boolean;
  usableWhileMoving: boolean;
  usableWhileStunned: boolean;
  gcdCategory: string;
  tags: string[];
}

export type AbilityType = 'spell' | 'ability' | 'item' | 'racial' | 'profession' | 'pet' | 'vehicle';

export type SpellSchool = 'physical' | 'holy' | 'fire' | 'nature' | 'frost' | 'shadow' | 'arcane' | 'chaos';

export interface AbilityCost {
  resource: string;
  amount: number;
  percentage: boolean;
}

export interface AbilityRequirement {
  type: 'level' | 'skill' | 'talent' | 'item' | 'buff' | 'stance' | 'weapon' | 'resource';
  value: string | number;
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'teleport' | 'knockback' | 'pull' | 'interrupt' | 'dispel' | 'steal' | 'transform' | 'create_area' | 'apply_dot' | 'apply_hot' | 'resource_gain' | 'cooldown_reset' | 'charge_restore';
  target: 'self' | 'target' | 'friendly' | 'enemy' | 'all_friendly' | 'all_enemy' | 'area' | 'cone' | 'line' | 'cursor';
  value: number;
  scaling?: AbilityScaling;
  duration?: number;
  radius?: number;
  probability?: number;
  conditions?: string[];
  effectId?: string;
}

export interface AbilityScaling {
  stat: keyof BaseStats;
  coefficient: number;
  baseValue: number;
}

export class CombatModule implements Module {
  name = 'combat';
  version = '1.0.0';
  dependencies = ['core', 'rpg', 'stats'];

  private abilityDatabase = new Map<string, AbilityData>();

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new CombatStateSystem());
    ctx.world.addSystem(new AbilitySystem(this.abilityDatabase));
    ctx.world.addSystem(new BuffSystem());
    ctx.world.addSystem(new ThreatSystem());
    ctx.world.addSystem(new DamageSystem());
    ctx.logger.info('Combat module initialized');
  }

  async shutdown(): Promise<void> {}

  registerAbility(ability: AbilityData): void {
    this.abilityDatabase.set(ability.id, ability);
  }

  getAbility(id: string): AbilityData | undefined {
    return this.abilityDatabase.get(id);
  }
}

export class CombatStateSystem implements System {
  world!: World;
  enabled = true;
  priority = 100;

  update(dt: number): void {
    const combatants = this.world.query({ all: ['CombatComponent'] });
    for (const entity of combatants) {
      this.updateCombatState(entity, dt);
    }
  }

  private updateCombatState(entity: Entity, dt: number): void {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (!combat) return;

    if (combat.state === 'in_combat') {
      if (!combat.target || this.isDead(combat.target) || this.getDistance(entity, combat.target) > 100) {
        combat.target = this.findNewTarget(entity);
        if (!combat.target) {
          this.exitCombat(entity);
        }
      }
    }

    if (combat.globalCooldownEnd > Date.now()) {
      combat.globalCooldown = combat.globalCooldownEnd - Date.now();
    } else {
      combat.globalCooldown = 0;
    }

    this.processActionQueue(entity, combat, dt);
  }

  private findNewTarget(entity: Entity): Entity | null {
    const threat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent')?.threatTable;
    if (!threat) return null;

    let topThreat: Entity | null = null;
    let maxThreat = 0;
    for (const [target, threat] of threat) {
      if (!this.isDead(target) && threat > maxThreat) {
        maxThreat = threat;
        topThreat = target;
      }
    }
    return topThreat;
  }

  private exitCombat(entity: Entity): void {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (combat) {
      combat.state = 'out_of_combat';
      combat.target = null;
      combat.threatTable.clear();
      this.world.emit('combat:end', { entity });
    }
  }

  private processActionQueue(entity: Entity, combat: CombatComponent, dt: number): void {
    while (combat.actionQueue.length > 0) {
      const action = combat.actionQueue[0];
      if (action.state === 'queued') {
        if (this.canStartAction(entity, action)) {
          this.startAction(entity, action);
        } else break;
      } else if (action.state === 'casting') {
        action.castTime -= dt * 1000;
        if (action.castTime <= 0) {
          this.executeAction(entity, action);
        }
      } else if (action.state === 'channeling') {
        action.channelTime -= dt * 1000;
        if (action.channelTime <= 0) {
          action.state = 'complete';
          combat.actionQueue.shift();
        }
      } else if (action.state === 'executing' || action.state === 'complete') {
        combat.actionQueue.shift();
      } else {
        break;
      }
    }
  }

  private canStartAction(entity: Entity, action: CombatAction): boolean {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (!combat) return false;
    if (combat.globalCooldown > 0) return false;
    if (combat.state === 'stunned' || combat.state === 'dead') return false;
    return true;
  }

  private startAction(entity: Entity, action: CombatAction): void {
    action.state = action.castTime > 0 ? 'casting' : 'executing';
    action.startTime = Date.now();
  }

  private executeAction(entity: Entity, action: CombatAction): void {
    const ability = this.world.getSystem(AbilitySystem)?.getAbility(action.abilityId);
    if (!ability) {
      action.state = 'failed';
      return;
    }

    const cost = this.calculateCost(entity, ability);
    if (!this.payCost(entity, cost)) {
      action.state = 'failed';
      return;
    }

    for (const effect of ability.effects) {
      this.applyEffect(entity, action.target, effect, action.position);
    }

    const cooldown = ability.cooldown * (1 - this.getCooldownReduction(entity, ability.id));
    this.setCooldown(entity, ability.id, cooldown);
    this.setGlobalCooldown(entity, ability.gcdCategory);

    action.state = 'executing';
  }

  private calculateCost(entity: Entity, ability: AbilityData): AbilityCost[] {
    return ability.cost;
  }

  private payCost(entity: Entity, costs: AbilityCost[]): boolean {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (!abilityComp) return false;

    for (const cost of costs) {
      const resource = abilityComp.resources.get(cost.resource);
      if (!resource || resource.current < (cost.percentage ? resource.maximum * cost.amount / 100 : cost.amount)) {
        return false;
      }
    }

    for (const cost of costs) {
      const resource = abilityComp.resources.get(cost.resource)!;
      resource.current -= cost.percentage ? resource.maximum * cost.amount / 100 : cost.amount;
    }
    return true;
  }

  private applyEffect(caster: Entity, target: Entity | null, effect: AbilityEffect, position?: any): void {
    if (!target && effect.target !== 'self' && effect.target !== 'cursor') return;
    const actualTarget = effect.target === 'self' ? caster : target!;

    switch (effect.type) {
      case 'damage':
        this.dealDamage(caster, actualTarget, effect.value, effect.scaling);
        break;
      case 'heal':
        this.heal(caster, actualTarget, effect.value, effect.scaling);
        break;
      case 'buff':
        this.applyBuff(actualTarget, caster, effect.effectId!, effect.duration!, effect.value);
        break;
      case 'debuff':
        this.applyDebuff(actualTarget, caster, effect.effectId!, effect.duration!, effect.value);
        break;
    }
  }

  private dealDamage(attacker: Entity, defender: Entity, baseDamage: number, scaling?: AbilityScaling): void {
    const damage = this.calculateDamage(attacker, defender, baseDamage, scaling);
    this.world.emit('combat:damage', { attacker, defender, damage, school: 'physical' });
  }

  private calculateDamage(attacker: Entity, defender: Entity, base: number, scaling?: AbilityScaling): number {
    const attackerStats = this.world.getComponent<StatsComponent>(attacker, 'StatsComponent');
    const defenderStats = this.world.getComponent<StatsComponent>(defender, 'StatsComponent');
    
    let damage = base;
    if (scaling && attackerStats) {
      damage += attackerStats.current[scaling.stat] * scaling.coefficient;
    }
    if (defenderStats) {
      damage *= (100 - defenderStats.current.armor) / 100;
    }
    return Math.max(1, Math.floor(damage));
  }

  private heal(caster: Entity, target: Entity, baseHeal: number, scaling?: AbilityScaling): void {
    const heal = baseHeal + (scaling && this.world.getComponent<StatsComponent>(caster, 'StatsComponent')?.current[scaling.stat] * scaling.coefficient ?? 0);
    this.world.emit('combat:heal', { caster, target, heal });
  }

  private applyBuff(target: Entity, caster: Entity, buffId: string, duration: number, value: number): void {
    this.world.emit('buff:apply', { target, caster, buffId, duration, value, type: 'buff' });
  }

  private applyDebuff(target: Entity, caster: Entity, debuffId: string, duration: number, value: number): void {
    this.world.emit('buff:apply', { target, caster, buffId: debuffId, duration, value, type: 'debuff' });
  }

  private getCooldownReduction(entity: Entity, abilityId: string): number {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    return abilityComp?.abilities.get(abilityId)?.cooldownReduction ?? 0;
  }

  private setCooldown(entity: Entity, abilityId: string, cooldown: number): void {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (abilityComp) abilityComp.cooldowns.set(abilityId, Date.now() + cooldown);
  }

  private setGlobalCooldown(entity: Entity, category: string): void {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (combat) combat.globalCooldownEnd = Date.now() + 1500;
  }

  private isDead(entity: Entity): boolean {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    return combat?.state === 'dead';
  }

  private getDistance(a: Entity, b: Entity): number {
    const posA = this.world.getComponent(a, 'PositionComponent');
    const posB = this.world.getComponent(b, 'PositionComponent');
    if (!posA || !posB) return 999;
    return Math.sqrt((posA.x - posB.x)**2 + (posA.y - posB.y)**2 + (posA.z - posB.z)**2);
  }
}

export class AbilitySystem implements System {
  world!: World;
  enabled = true;
  priority = 90;

  constructor(private abilityDatabase: Map<string, AbilityData>) {}

  update(dt: number): void {
    const entities = this.world.query({ all: ['AbilityComponent'] });
    for (const entity of entities) {
      this.updateCooldowns(entity, dt);
      this.updateResources(entity, dt);
    }
  }

  private updateCooldowns(entity: Entity, dt: number): void {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (!abilityComp) return;

    const now = Date.now();
    for (const [abilityId, endTime] of abilityComp.cooldowns) {
      if (endTime <= now) abilityComp.cooldowns.delete(abilityId);
    }
  }

  private updateResources(entity: Entity, dt: number): void {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (!abilityComp) return;

    for (const resource of abilityComp.resources.values()) {
      if (resource.current < resource.maximum) {
        resource.current = Math.min(resource.maximum, resource.current + resource.regeneration * dt);
      }
    }
  }

  getAbility(id: string): AbilityData | undefined {
    return this.abilityDatabase.get(id);
  }

  isOnCooldown(entity: Entity, abilityId: string): boolean {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (!abilityComp) return false;
    const endTime = abilityComp.cooldowns.get(abilityId);
    return endTime !== undefined && endTime > Date.now();
  }

  getCooldownRemaining(entity: Entity, abilityId: string): number {
    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    if (!abilityComp) return 0;
    const endTime = abilityComp.cooldowns.get(abilityId);
    return endTime ? Math.max(0, endTime - Date.now()) : 0;
  }

  castAbility(entity: Entity, abilityId: string, target: Entity | null, position?: any): boolean {
    const ability = this.abilityDatabase.get(abilityId);
    if (!ability) return false;
    if (this.isOnCooldown(entity, abilityId)) return false;

    const abilityComp = this.world.getComponent<AbilityComponent>(entity, 'AbilityComponent');
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (!abilityComp || !combat) return false;

    const action: CombatAction = {
      id: `action_${Date.now()}`,
      abilityId,
      target,
      position,
      startTime: Date.now(),
      castTime: ability.castTime,
      channelTime: ability.channelTime,
      state: 'queued',
      interruptible: ability.interruptible
    };

    combat.actionQueue.push(action);
    return true;
  }
}

export class BuffSystem implements System {
  world!: World;
  enabled = true;
  priority = 80;

  update(dt: number): void {
    const entities = this.world.query({ all: ['BuffComponent'] });
    for (const entity of entities) {
      this.updateBuffs(entity, dt);
    }
  }

  private updateBuffs(entity: Entity, dt: number): void {
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'BuffComponent');
    if (!buffComp) return;

    for (const [id, buff] of buffComp.buffs) {
      buff.remainingTime -= dt * 1000;
      
      for (const effect of buff.effects) {
        if (effect.interval && effect.nextTick !== undefined) {
          effect.nextTick -= dt * 1000;
          if (effect.nextTick <= 0) {
            this.applyPeriodicEffect(entity, effect);
            effect.nextTick = effect.interval;
          }
        }
      }

      if (buff.remainingTime <= 0) {
        this.removeBuff(entity, id);
      }
    }
  }

  private applyPeriodicEffect(entity: Entity, effect: BuffEffect): void {
    switch (effect.type) {
      case 'periodic_damage':
        this.world.emit('combat:periodic_damage', { entity, amount: effect.value });
        break;
      case 'periodic_heal':
        this.world.emit('combat:periodic_heal', { entity, amount: effect.value });
        break;
    }
  }

  private removeBuff(entity: Entity, buffId: string): void {
    const buffComp = this.world.getComponent<BuffComponent>(entity, 'BuffComponent');
    if (!buffComp) return;

    const buff = buffComp.buffs.get(buffId);
    if (buff) {
      buffComp.buffs.delete(buffId);
      if (buff.onExpire) buff.onExpire();
      this.world.emit('buff:expire', { entity, buffId });
    }
  }

  addBuff(target: Entity, caster: Entity, buffId: string, duration: number, value: number, maxStacks = 1): void {
    const buffComp = this.world.getComponent<BuffComponent>(target, 'BuffComponent');
    if (!buffComp) return;

    const existing = buffComp.buffs.get(buffId);
    if (existing) {
      existing.stacks = Math.min(existing.maxStacks, existing.stacks + 1);
      existing.remainingTime = Math.max(existing.remainingTime, duration * 1000);
      return;
    }

    buffComp.buffs.set(buffId, {
      id: buffId,
      sourceId: buffId,
      caster,
      startTime: Date.now(),
      duration: duration * 1000,
      remainingTime: duration * 1000,
      stacks: 1,
      maxStacks,
      refreshable: true,
      stats: {},
      effects: []
    });

    this.world.emit('buff:apply', { target, caster, buffId, duration, value, type: 'buff' });
  }
}

export class ThreatSystem implements System {
  world!: World;
  enabled = true;
  priority = 70;

  update(dt: number): void {}

  addThreat(attacker: Entity, target: Entity, amount: number, isHealing = false): void {
    const combat = this.world.getComponent<CombatComponent>(target, 'CombatComponent');
    if (!combat) return;

    const multiplier = isHealing ? 0.5 : 1.0;
    const threat = amount * multiplier;

    const current = combat.threatTable.get(attacker) ?? 0;
    combat.threatTable.set(attacker, current + threat);

    if (combat.state === 'out_of_combat') {
      combat.state = 'in_combat';
      combat.combatStartTime = Date.now();
      this.world.emit('combat:start', { entity: target, attacker });
    }
  }

  getThreat(target: Entity, attacker: Entity): number {
    const combat = this.world.getComponent<CombatComponent>(target, 'CombatComponent');
    return combat?.threatTable.get(attacker) ?? 0;
  }

  clearThreat(target: Entity, attacker?: Entity): void {
    const combat = this.world.getComponent<CombatComponent>(target, 'CombatComponent');
    if (!combat) return;

    if (attacker) combat.threatTable.delete(attacker);
    else combat.threatTable.clear();
  }

  taunt(attacker: Entity, target: Entity): void {
    const combat = this.world.getComponent<CombatComponent>(target, 'CombatComponent');
    if (!combat) return;

    let maxThreat = 0;
    for (const threat of combat.threatTable.values()) {
      maxThreat = Math.max(maxThreat, threat);
    }
    combat.threatTable.set(attacker, maxThreat * 1.1);
    combat.target = attacker;
  }
}

export class DamageSystem implements System {
  world!: World;
  enabled = true;
  priority = 60;

  update(dt: number): void {}

  onDamage(event: { attacker: Entity; defender: Entity; damage: number; school: string }): void {
    const defenderStats = this.world.getComponent<StatsComponent>(event.defender, 'StatsComponent');
    if (!defenderStats) return;

    defenderStats.current.health = Math.max(0, defenderStats.current.health - event.damage);

    this.world.emit('combat:health_changed', { entity: event.defender, health: defenderStats.current.health, maxHealth: defenderStats.current.maxHealth });

    if (defenderStats.current.health <= 0) {
      this.killEntity(event.defender, event.attacker);
    }
  }

  onHeal(event: { caster: Entity; target: Entity; heal: number }): void {
    const targetStats = this.world.getComponent<StatsComponent>(event.target, 'StatsComponent');
    if (!targetStats) return;

    const overheal = Math.max(0, targetStats.current.health + event.heal - targetStats.current.maxHealth);
    targetStats.current.health = Math.min(targetStats.current.maxHealth, targetStats.current.health + event.heal);

    this.world.emit('combat:health_changed', { entity: event.target, health: targetStats.current.health, maxHealth: targetStats.current.maxHealth, overheal });
  }

  private killEntity(entity: Entity, killer: Entity): void {
    const combat = this.world.getComponent<CombatComponent>(entity, 'CombatComponent');
    if (combat) {
      combat.state = 'dead';
      combat.target = null;
    }
    this.world.emit('entity:death', { entity, killer });
  }
}