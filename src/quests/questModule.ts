import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface QuestComponent extends Component {
  activeQuests: Map<string, QuestProgress>;
  completedQuests: Set<string>;
  failedQuests: Set<string>;
  availableQuests: Set<string>;
  questLog: QuestLogEntry[];
  maxActiveQuests: number;
}

export interface QuestProgress {
  questId: string;
  state: QuestState;
  startedAt: number;
  updatedAt: number;
  objectives: Map<string, ObjectiveProgress>;
  variables: Map<string, any>;
  chosenPath?: string;
  rewardsClaimed: boolean;
}

export type QuestState = 'active' | 'completed' | 'failed' | 'turned_in';

export interface ObjectiveProgress {
  objectiveId: string;
  current: number;
  target: number;
  completed: boolean;
  extraData?: Record<string, any>;
}

export interface QuestLogEntry {
  questId: string;
  timestamp: number;
  event: 'started' | 'updated' | 'completed' | 'failed' | 'turned_in' | 'abandoned';
  details?: string;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  category: QuestCategory;
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
  shareRange?: number;
  factionRequirements?: Map<string, number>;
  location?: { x: number; y: number; z: number };
  giverId?: string;
  turnInId?: string;
}

export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event' | 'bounty' | 'exploration' | 'crafting' | 'pvp' | 'dungeon' | 'raid' | 'world';

export type QuestCategory = 'combat' | 'collection' | 'delivery' | 'escort' | 'investigation' | 'puzzle' | 'social' | 'exploration' | 'crafting' | 'gathering';

export interface QuestPrerequisite {
  type: 'quest' | 'level' | 'skill' | 'reputation' | 'item' | 'class' | 'race' | 'achievement';
  value: string | number;
  comparison: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'has' | 'not_has';
}

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string | number;
  count: number;
  location?: { x: number; y: number; z: number; radius: number };
  markers?: MapMarker[];
  optional: boolean;
  hidden: boolean;
  prerequisites: string[];
  onComplete?: string[];
}

export type ObjectiveType = 
  | 'kill' | 'collect' | 'deliver' | 'talk' | 'visit' | 'interact' | 'craft' | 'gather'
  | 'escort' | 'defend' | 'destroy' | 'use' | 'learn' | 'reach_level' | 'gain_reputation'
  | 'complete_quest' | 'find' | 'photograph' | 'survive' | 'win_pvp' | 'clear_dungeon';

export interface MapMarker {
  id: string;
  type: 'npc' | 'object' | 'area' | 'path' | 'enemy';
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

export class QuestModule implements Module {
  name = 'quests';
  version = '1.0.0';
  dependencies = ['core', 'npc', 'rpg'];

  private questDatabase = new Map<string, QuestData>();

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new QuestSystem(this.questDatabase));
    ctx.world.addSystem(new QuestObjectiveSystem(this.questDatabase));
    ctx.world.addSystem(new QuestRewardSystem());
    ctx.logger.info('Quest module initialized');
  }

  async shutdown(): Promise<void> {}

  registerQuest(quest: QuestData): void {
    this.questDatabase.set(quest.id, quest);
  }

  getQuest(id: string): QuestData | undefined {
    return this.questDatabase.get(id);
  }

  getAllQuests(): QuestData[] {
    return Array.from(this.questDatabase.values());
  }
}

export class QuestSystem implements System {
  world!: World;
  enabled = true;
  priority = 60;

  constructor(private questDatabase: Map<string, QuestData>) {}

  update(dt: number): void {
    const players = this.world.query({ all: ['QuestComponent', 'PlayerComponent'] });
    for (const entity of players) {
      this.updateQuests(entity);
    }
  }

  private updateQuests(entity: Entity): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;

      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      if (quest.timeLimit && Date.now() - progress.startedAt > quest.timeLimit) {
        this.failQuest(entity, questId, 'Time limit exceeded');
        continue;
      }

      this.checkObjectives(entity, quest, progress);
      
      if (this.isQuestComplete(progress)) {
        if (quest.autoComplete) {
          this.completeQuest(entity, questId);
        } else {
          progress.state = 'completed';
          this.addLogEntry(entity, questId, 'completed', 'All objectives complete. Return to quest giver.');
        }
      }
    }
  }

  startQuest(entity: Entity, questId: string): boolean {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    const quest = this.questDatabase.get(questId);
    if (!questComp || !quest) return false;

    if (questComp.activeQuests.size >= questComp.maxActiveQuests) return false;
    if (!this.checkPrerequisites(entity, quest)) return false;
    if (questComp.completedQuests.has(questId) && !quest.repeatable) return false;
    if (questComp.activeQuests.has(questId)) return false;

    const progress: QuestProgress = {
      questId,
      state: 'active',
      startedAt: Date.now(),
      updatedAt: Date.now(),
      objectives: new Map(),
      variables: new Map(),
      rewardsClaimed: false
    };

    for (const obj of quest.objectives) {
      progress.objectives.set(obj.id, {
        objectiveId: obj.id,
        current: 0,
        target: obj.count,
        completed: false
      });
    }

    questComp.activeQuests.set(questId, progress);
    questComp.availableQuests.delete(questId);
    this.addLogEntry(entity, questId, 'started', `Quest started: ${quest.name}`);

    this.world.emit('quest:started', { entity, questId });
    return true;
  }

  abandonQuest(entity: Entity, questId: string): boolean {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return false;

    const progress = questComp.activeQuests.get(questId);
    if (!progress) return false;

    questComp.activeQuests.delete(questId);
    progress.state = 'failed';
    this.addLogEntry(entity, questId, 'abandoned', 'Quest abandoned by player');

    this.world.emit('quest:abandoned', { entity, questId });
    return true;
  }

  completeQuest(entity: Entity, questId: string): boolean {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    const quest = this.questDatabase.get(questId);
    if (!questComp || !quest) return false;

    const progress = questComp.activeQuests.get(questId);
    if (!progress || progress.state !== 'completed') return false;

    progress.state = 'turned_in';
    progress.rewardsClaimed = true;
    questComp.activeQuests.delete(questId);
    questComp.completedQuests.add(questId);

    if (quest.cooldown) {
      questComp.availableQuests.delete(questId);
      setTimeout(() => questComp.availableQuests.add(questId), quest.cooldown);
    }

    this.addLogEntry(entity, questId, 'turned_in', `Quest completed: ${quest.name}`);
    this.world.emit('quest:completed', { entity, questId, quest });
    return true;
  }

  failQuest(entity: Entity, questId: string, reason: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    const quest = this.questDatabase.get(questId);
    if (!questComp || !quest) return;

    const progress = questComp.activeQuests.get(questId);
    if (!progress) return;

    progress.state = 'failed';
    questComp.activeQuests.delete(questId);
    questComp.failedQuests.add(questId);

    this.addLogEntry(entity, questId, 'failed', `Quest failed: ${reason}`);
    this.world.emit('quest:failed', { entity, questId, reason });
  }

  private checkPrerequisites(entity: Entity, quest: QuestData): boolean {
    for (const prereq of quest.prerequisites) {
      if (!this.checkPrerequisite(entity, prereq)) return false;
    }
    return true;
  }

  private checkPrerequisite(entity: Entity, prereq: QuestPrerequisite): boolean {
    switch (prereq.type) {
      case 'quest':
        return this.world.getComponent<QuestComponent>(entity, 'QuestComponent')?.completedQuests.has(prereq.value as string) ?? false;
      case 'level': {
        const prog = this.world.getComponent(entity, 'ProgressionComponent');
        return this.compare(prog?.level ?? 0, prereq.value as number, prereq.comparison);
      }
      case 'reputation': {
        const faction = this.world.getComponent(entity, 'FactionComponent');
        return this.compare(faction?.reputation ?? 0, prereq.value as number, prereq.comparison);
      }
      case 'item': {
        const inv = this.world.getComponent(entity, 'InventoryComponent');
        return inv && this.hasItem(inv, prereq.value as string);
      }
      default:
        return true;
    }
  }

  private compare(a: number, b: number, op: string): boolean {
    switch (op) {
      case 'eq': return a === b;
      case 'neq': return a !== b;
      case 'gt': return a > b;
      case 'gte': return a >= b;
      case 'lt': return a < b;
      case 'lte': return a <= b;
      default: return false;
    }
  }

  private hasItem(inventory: any, itemId: string): boolean {
    return true;
  }

  private checkObjectives(entity: Entity, quest: QuestData, progress: QuestProgress): void {
    for (const obj of quest.objectives) {
      const objProgress = progress.objectives.get(obj.id);
      if (!objProgress || objProgress.completed) continue;

      const current = this.getObjectiveProgress(entity, obj, progress);
      if (current !== objProgress.current) {
        objProgress.current = Math.min(current, objProgress.target);
        objProgress.completed = objProgress.current >= objProgress.target;
        progress.updatedAt = Date.now();

        if (objProgress.completed) {
          this.world.emit('quest:objective_complete', { entity, questId: quest.id, objectiveId: obj.id });
          this.addLogEntry(entity, quest.id, 'updated', `Objective complete: ${obj.description}`);
        }
      }
    }
  }

  private getObjectiveProgress(entity: Entity, obj: QuestObjective, progress: QuestProgress): number {
    switch (obj.type) {
      case 'kill': return this.getKillCount(entity, obj.target as string);
      case 'collect': return this.getItemCount(entity, obj.target as string);
      case 'visit': return this.hasVisited(entity, obj.target as string) ? 1 : 0;
      case 'talk': return this.hasTalkedTo(entity, obj.target as string) ? 1 : 0;
      case 'craft': return this.getCraftCount(entity, obj.target as string);
      default: return objProgress?.current ?? 0;
    }
  }

  private getKillCount(entity: Entity, target: string): number {
    return 0;
  }

  private getItemCount(entity: Entity, itemId: string): number {
    return 0;
  }

  private hasVisited(entity: Entity, locationId: string): boolean {
    return false;
  }

  private hasTalkedTo(entity: Entity, npcId: string): boolean {
    return false;
  }

  private getCraftCount(entity: Entity, recipeId: string): number {
    return 0;
  }

  private isQuestComplete(progress: QuestProgress): boolean {
    return Array.from(progress.objectives.values())
      .filter(o => !this.isOptional(o.objectiveId, progress.questId))
      .every(o => o.completed);
  }

  private isOptional(objectiveId: string, questId: string): boolean {
    const quest = this.questDatabase.get(questId);
    return quest?.objectives.find(o => o.id === objectiveId)?.optional ?? false;
  }

  private addLogEntry(entity: Entity, questId: string, event: QuestLogEntry['event'], details?: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (questComp) {
      questComp.questLog.push({ questId, timestamp: Date.now(), event, details });
      if (questComp.questLog.length > 100) questComp.questLog.shift();
    }
  }
}

export class QuestObjectiveSystem implements System {
  world!: World;
  enabled = true;
  priority = 50;

  constructor(private questDatabase: Map<string, QuestData>) {}

  update(dt: number): void {}

  onEntityKilled(killer: Entity, victim: Entity): void {
    this.updateKillObjectives(killer, this.getEnemyType(victim));
  }

  onItemCollected(entity: Entity, itemId: string, count: number): void {
    this.updateCollectObjectives(entity, itemId, count);
  }

  onLocationVisited(entity: Entity, locationId: string): void {
    this.updateVisitObjectives(entity, locationId);
  }

  onNpcTalked(entity: Entity, npcId: string): void {
    this.updateTalkObjectives(entity, npcId);
  }

  onItemCrafted(entity: Entity, recipeId: string): void {
    this.updateCraftObjectives(entity, recipeId);
  }

  private updateKillObjectives(entity: Entity, enemyType: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;
      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'kill' && obj.target === enemyType) {
          const objProgress = progress.objectives.get(obj.id);
          if (objProgress && !objProgress.completed) {
            objProgress.current = Math.min(objProgress.target, objProgress.current + 1);
            objProgress.completed = objProgress.current >= objProgress.target;
          }
        }
      }
    }
  }

  private updateCollectObjectives(entity: Entity, itemId: string, count: number): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;
      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'collect' && obj.target === itemId) {
          const objProgress = progress.objectives.get(obj.id);
          if (objProgress && !objProgress.completed) {
            objProgress.current = Math.min(objProgress.target, objProgress.current + count);
            objProgress.completed = objProgress.current >= objProgress.target;
          }
        }
      }
    }
  }

  private updateVisitObjectives(entity: Entity, locationId: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;
      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'visit' && obj.target === locationId) {
          const objProgress = progress.objectives.get(obj.id);
          if (objProgress && !objProgress.completed) {
            objProgress.current = 1;
            objProgress.completed = true;
          }
        }
      }
    }
  }

  private updateTalkObjectives(entity: Entity, npcId: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;
      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'talk' && obj.target === npcId) {
          const objProgress = progress.objectives.get(obj.id);
          if (objProgress && !objProgress.completed) {
            objProgress.current = 1;
            objProgress.completed = true;
          }
        }
      }
    }
  }

  private updateCraftObjectives(entity: Entity, recipeId: string): void {
    const questComp = this.world.getComponent<QuestComponent>(entity, 'QuestComponent');
    if (!questComp) return;

    for (const [questId, progress] of questComp.activeQuests) {
      if (progress.state !== 'active') continue;
      const quest = this.questDatabase.get(questId);
      if (!quest) continue;

      for (const obj of quest.objectives) {
        if (obj.type === 'craft' && obj.target === recipeId) {
          const objProgress = progress.objectives.get(obj.id);
          if (objProgress && !objProgress.completed) {
            objProgress.current = Math.min(objProgress.target, objProgress.current + 1);
            objProgress.completed = objProgress.current >= objProgress.target;
          }
        }
      }
    }
  }

  private getEnemyType(entity: Entity): string {
    return 'enemy';
  }
}

export class QuestRewardSystem implements System {
  world!: World;
  enabled = true;
  priority = 40;

  update(dt: number): void {}

  grantRewards(entity: Entity, quest: QuestData): void {
    for (const reward of quest.rewards) {
      this.grantReward(entity, reward);
    }
  }

  private grantReward(entity: Entity, reward: QuestReward): void {
    switch (reward.type) {
      case 'experience':
        this.grantExperience(entity, reward.value as number);
        break;
      case 'currency':
        this.grantCurrency(entity, reward.value as string, reward.count ?? 1);
        break;
      case 'item':
        this.grantItem(entity, reward.value as string, reward.count ?? 1);
        break;
      case 'reputation':
        this.grantReputation(entity, reward.value as string, reward.count ?? 1);
        break;
      case 'skill':
        this.grantSkill(entity, reward.value as string, reward.count ?? 1);
        break;
    }
  }

  private grantExperience(entity: Entity, amount: number): void {
    const prog = this.world.getComponent(entity, 'ProgressionComponent');
    if (prog) this.world.emit('entity:experience', { entity, amount });
  }

  private grantCurrency(entity: Entity, currency: string, amount: number): void {
    const wallet = this.world.getComponent(entity, 'WalletComponent');
    if (wallet) wallet.currencies.set(currency, (wallet.currencies.get(currency) ?? 0) + amount);
  }

  private grantItem(entity: Entity, itemId: string, count: number): void {
    this.world.emit('inventory:add', { entity, itemId, count });
  }

  private grantReputation(entity: Entity, faction: string, amount: number): void {
    const factionComp = this.world.getComponent(entity, 'FactionComponent');
    if (factionComp) factionComp.reputation = (factionComp.reputation ?? 0) + amount;
  }

  private grantSkill(entity: Entity, skillId: string, amount: number): void {
    const skills = this.world.getComponent(entity, 'SkillsComponent');
    if (skills) {
      const skill = skills.skills.get(skillId);
      if (skill) skill.experience += amount;
    }
  }
}

export interface PlayerComponent extends Component {
  isPlayer: boolean;
  accountId: string;
  characterId: string;
}