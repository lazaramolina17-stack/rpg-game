import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface NPCComponent extends Component {
  id: string;
  name: string;
  personality: Personality;
  memory: MemoryEntry[];
  relationships: Map<string, Relationship>;
  currentGoal: Goal | null;
  schedule: ScheduleEntry[];
}

export interface Personality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  traits: string[];
}

export interface MemoryEntry {
  id: string;
  type: 'event' | 'person' | 'place' | 'fact';
  timestamp: number;
  importance: number;
  data: any;
  associations: string[];
}

export interface Relationship {
  targetId: string;
  disposition: number; // -100 to 100
  trust: number;
  familiarity: number;
  history: Interaction[];
}

export interface Interaction {
  type: string;
  timestamp: number;
  outcome: 'positive' | 'negative' | 'neutral';
  summary: string;
}

export interface Goal {
  id: string;
  type: string;
  priority: number;
  target?: Entity;
  location?: { x: number; y: number; z: number };
  expiresAt?: number;
  subGoals: Goal[];
}

export interface ScheduleEntry {
  timeStart: number;
  timeEnd: number;
  activity: string;
  location?: { x: number; y: number; z: number };
  flexibility: number;
}

export interface AIStateComponent extends Component {
  currentBehavior: string;
  behaviorTree: BehaviorNode;
  blackboard: Map<string, any>;
}

export interface BehaviorNode {
  type: 'sequence' | 'selector' | 'parallel' | 'action' | 'condition';
  children?: BehaviorNode[];
  action?: (entity: Entity, world: World, dt: number) => BehaviorResult;
  condition?: (entity: Entity, world: World) => boolean;
}

export type BehaviorResult = 'success' | 'failure' | 'running';

export interface FactionComponent extends Component {
  factionId: string;
  rank: number;
  reputation: number;
  permissions: string[];
}

export interface DialogueComponent extends Component {
  dialogueTree: DialogueNode;
  currentNode: string;
  availableTopics: string[];
}

export interface DialogueNode {
  id: string;
  text: string;
  speaker: string;
  conditions: ((entity: Entity, player: Entity) => boolean)[];
  responses: DialogueResponse[];
  onEnter?: (entity: Entity, player: Entity) => void;
}

export interface DialogueResponse {
  id: string;
  text: string;
  conditions: ((entity: Entity, player: Entity) => boolean)[];
  nextNode: string;
  effects: ((entity: Entity, player: Entity) => void)[];
}

export class NPCModule implements Module {
  name = 'npc';
  version = '1.0.0';
  dependencies = ['core', 'world'];

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new AISystem());
    ctx.world.addSystem(new ScheduleSystem());
    ctx.world.addSystem(new MemorySystem());
    ctx.world.addSystem(new FactionSystem());
    ctx.logger.info('NPC module initialized');
  }

  async shutdown(): Promise<void> {}
}

export class AISystem implements System {
  world!: World;
  enabled = true;
  priority = 50;

  update(dt: number): void {
    const npcs = this.world.query({ all: ['NPCComponent', 'AIStateComponent'] });
    for (const entity of npcs) {
      this.tickAI(entity, dt);
    }
  }

  private tickAI(entity: Entity, dt: number): void {
    const aiState = this.world.getComponent<AIStateComponent>(entity, 'AIStateComponent');
    const npc = this.world.getComponent<NPCComponent>(entity, 'NPCComponent');
    if (!aiState || !npc) return;

    this.evaluateGoals(entity, npc);
    this.executeBehavior(entity, aiState, dt);
  }

  private evaluateGoals(entity: Entity, npc: NPCComponent): void {
    if (!npc.currentGoal || this.isGoalComplete(entity, npc.currentGoal)) {
      npc.currentGoal = this.selectNextGoal(entity, npc);
    }
  }

  private isGoalComplete(entity: Entity, goal: Goal): boolean {
    return goal.expiresAt !== undefined && goal.expiresAt < Date.now();
  }

  private selectNextGoal(entity: Entity, npc: NPCComponent): Goal | null {
    const candidates = this.generateGoalCandidates(entity, npc);
    if (candidates.length === 0) return null;
    
    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0];
  }

  private generateGoalCandidates(entity: Entity, npc: NPCComponent): Goal[] {
    const goals: Goal[] = [];
    const now = Date.now();
    
    for (const entry of npc.schedule) {
      if (entry.timeStart <= now && entry.timeEnd > now) {
        goals.push({
          id: `schedule_${entry.activity}`,
          type: 'schedule',
          priority: 50,
          location: entry.location,
          expiresAt: entry.timeEnd
        });
      }
    }

    if (Math.random() < 0.01) {
      goals.push({
        id: `wander_${now}`,
        type: 'wander',
        priority: 10,
        location: { x: Math.random() * 100, y: 0, z: Math.random() * 100 }
      });
    }

    return goals;
  }

  private executeBehavior(entity: Entity, aiState: AIStateComponent, dt: number): void {
    this.runBehaviorTree(entity, aiState.behaviorTree, dt);
  }

  private runBehaviorTree(entity: Entity, node: BehaviorNode, dt: number): BehaviorResult {
    switch (node.type) {
      case 'action':
        return node.action?.(entity, this.world, dt) ?? 'success';
      case 'condition':
        return node.condition?.(entity, this.world) ? 'success' : 'failure';
      case 'sequence':
        for (const child of node.children ?? []) {
          const result = this.runBehaviorTree(entity, child, dt);
          if (result !== 'success') return result;
        }
        return 'success';
      case 'selector':
        for (const child of node.children ?? []) {
          const result = this.runBehaviorTree(entity, child, dt);
          if (result !== 'failure') return result;
        }
        return 'failure';
      case 'parallel':
        const results = (node.children ?? []).map(c => this.runBehaviorTree(entity, c, dt));
        return results.every(r => r === 'success') ? 'success' : 'running';
    }
  }
}

export class ScheduleSystem implements System {
  world!: World;
  enabled = true;
  priority = 40;

  update(dt: number): void {
    const npcs = this.world.query({ all: ['NPCComponent'] });
    const time = this.world.query({ all: ['TimeComponent'] })[0];
    if (!time) return;
    
    const timeComp = this.world.getComponent(time, 'TimeComponent');
    if (!timeComp) return;

    for (const entity of npcs) {
      this.updateSchedule(entity, timeComp);
    }
  }

  private updateSchedule(entity: Entity, time: any): void {
    const npc = this.world.getComponent<NPCComponent>(entity, 'NPCComponent');
    if (!npc) return;

    const currentHour = time.timeOfDay;
    for (const entry of npc.schedule) {
      if (currentHour >= entry.timeStart && currentHour < entry.timeEnd) {
        if (entry.activity !== npc.currentGoal?.type) {
          npc.currentGoal = {
            id: `schedule_${entry.activity}`,
            type: 'schedule',
            priority: 50,
            location: entry.location
          };
        }
        break;
      }
    }
  }
}

export class MemorySystem implements System {
  world!: World;
  enabled = true;
  priority = 30;

  update(dt: number): void {
    const npcs = this.world.query({ all: ['NPCComponent'] });
    for (const entity of npcs) {
      this.decayMemory(entity);
      this.consolidateMemory(entity);
    }
  }

  private decayMemory(entity: Entity): void {
    const npc = this.world.getComponent<NPCComponent>(entity, 'NPCComponent');
    if (!npc) return;

    const now = Date.now();
    npc.memory = npc.memory.filter(m => {
      const age = now - m.timestamp;
      const decay = Math.exp(-age / (m.importance * 86400000)); // decay over days
      return decay > 0.01;
    });
  }

  private consolidateMemory(entity: Entity): void {
    const npc = this.world.getComponent<NPCComponent>(entity, 'NPCComponent');
    if (!npc || npc.memory.length < 10) return;

    const related = new Map<string, MemoryEntry[]>();
    for (const mem of npc.memory) {
      for (const assoc of mem.associations) {
        if (!related.has(assoc)) related.set(assoc, []);
        related.get(assoc)!.push(mem);
      }
    }
  }
}

export class FactionSystem implements System {
  world!: World;
  enabled = true;
  priority = 20;

  update(dt: number): void {
    const factions = this.world.query({ all: ['FactionComponent'] });
    this.processFactionRelations(factions);
  }

  private processFactionRelations(factions: Entity[]): void {
    // Process faction interactions, wars, alliances, etc.
  }
}

export function createDefaultPersonality(): Personality {
  return {
    openness: Math.random(),
    conscientiousness: Math.random(),
    extraversion: Math.random(),
    agreeableness: Math.random(),
    neuroticism: Math.random(),
    traits: []
  };
}

export function createBehaviorTree(): BehaviorNode {
  return {
    type: 'selector',
    children: [
      {
        type: 'sequence',
        children: [
          { type: 'condition', condition: (e, w) => hasGoal(e, 'combat') },
          { type: 'action', action: combatBehavior }
        ]
      },
      {
        type: 'sequence',
        children: [
          { type: 'condition', condition: (e, w) => hasGoal(e, 'schedule') },
          { type: 'action', action: followScheduleBehavior }
        ]
      },
      {
        type: 'action',
        action: idleBehavior
      }
    ]
  };
}

function hasGoal(entity: Entity, type: string): boolean {
  // Check if entity has goal of type
  return false;
}

function combatBehavior(entity: Entity, world: World, dt: number): BehaviorResult {
  return 'running';
}

function followScheduleBehavior(entity: Entity, world: World, dt: number): BehaviorResult {
  return 'running';
}

function idleBehavior(entity: Entity, world: World, dt: number): BehaviorResult {
  return 'success';
}