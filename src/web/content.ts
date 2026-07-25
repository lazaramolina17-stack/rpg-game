export enum EnemyType {
  Bandit = 'Bandit',
  Skeleton = 'Skeleton',
  Mage = 'Mage',
  Goblin = 'Goblin',
  Boss = 'Boss',
}

export enum SpellType {
  Fireball = 'Fireball',
  Heal = 'Heal',
  Shield = 'Shield',
}

export interface EnemyStats {
  hp: number
  maxHp: number
  dmg: number
  speed: number
  xp: number
  name: string
  color: string
}

export interface SpellData {
  cost: number
  dmg?: number
  heal?: number
  range: number
  cooldown: number
  duration?: number
  dmgReduction?: number
}

export interface LootEntry {
  chance: number
  goldMin?: number
  goldMax?: number
  item?: string
  count?: number
}

export interface LootTableEntry {
  entries: LootEntry[]
}

export interface ShopItem {
  name: string
  price: number
  description: string
}

export interface QuestReward {
  xp: number
  gold: number
  items: string[]
}

export interface Quest {
  id: string
  title: string
  description: string
  objective: string
  reward: QuestReward
}

export interface Entity {
  type: string
  x: number
  y: number
  data: Record<string, unknown>
}

const ENEMY_STATS: Record<string, Omit<EnemyStats, 'maxHp'>> = {
  [EnemyType.Bandit]: { hp: 30, dmg: 8, speed: 30, xp: 25, name: 'Bandit', color: '#ef4444' },
  [EnemyType.Skeleton]: { hp: 45, dmg: 12, speed: 25, xp: 40, name: 'Skeleton', color: '#e2e8f0' },
  [EnemyType.Mage]: { hp: 35, dmg: 18, speed: 20, xp: 50, name: 'Mage', color: '#3b82f6' },
  [EnemyType.Goblin]: { hp: 25, dmg: 6, speed: 40, xp: 20, name: 'Goblin', color: '#22c55e' },
  [EnemyType.Boss]: { hp: 120, dmg: 20, speed: 22, xp: 150, name: 'Boss', color: '#7c3aed' },
}

const SPELL_DATA: Record<string, SpellData> = {
  [SpellType.Fireball]: { cost: 20, dmg: 25, range: 100, cooldown: 800 },
  [SpellType.Heal]: { cost: 15, heal: 30, range: 0, cooldown: 1000 },
  [SpellType.Shield]: { cost: 25, range: 0, cooldown: 5000, duration: 3000, dmgReduction: 0.5 },
}

const LOOT_TABLES: Record<string, LootTableEntry> = {
  [EnemyType.Bandit]: {
    entries: [
      { chance: 0.4, goldMin: 5, goldMax: 15 },
      { chance: 0.3, item: 'potion' },
      { chance: 0.2, item: 'weapon' },
    ],
  },
  [EnemyType.Skeleton]: {
    entries: [
      { chance: 0.3, goldMin: 10, goldMax: 20 },
      { chance: 0.25, item: 'bone sword' },
      { chance: 0.2, item: 'potion' },
    ],
  },
  [EnemyType.Mage]: {
    entries: [
      { chance: 0.4, item: 'mana potion' },
      { chance: 0.25, goldMin: 15, goldMax: 25 },
      { chance: 0.15, item: 'scroll' },
    ],
  },
  [EnemyType.Goblin]: {
    entries: [
      { chance: 0.5, goldMin: 3, goldMax: 10 },
      { chance: 0.2, item: 'potion' },
      { chance: 0.1, item: 'weapon' },
    ],
  },
  [EnemyType.Boss]: {
    entries: [
      { chance: 1.0, item: 'rare weapon' },
      { chance: 1.0, goldMin: 50, goldMax: 100 },
      { chance: 0.5, item: 'spell scroll' },
    ],
  },
}

const SHOPS: Record<string, ShopItem[]> = {
  merchant: [
    { name: 'Health Potion', price: 25, description: 'Restaura 30 HP' },
    { name: 'Mana Potion', price: 20, description: 'Restaura 20 mana' },
    { name: 'Iron Sword', price: 80, description: 'Espada de hierro básica' },
  ],
  blacksmith: [
    { name: 'Steel Sword', price: 150, description: 'Espada de acero de alta calidad' },
    { name: 'Shield', price: 100, description: 'Escudo protector' },
    { name: 'Fire Scroll', price: 200, description: 'Pergamino de hechizo de fuego' },
  ],
}

const QUESTS: Quest[] = [
  {
    id: 'Tutorial',
    title: 'El Comienzo',
    description: 'Habla con el Elder para comenzar tu aventura',
    objective: 'Habla con el Elder',
    reward: { xp: 0, gold: 0, items: [] },
  },
  {
    id: 'BanditSlayer',
    title: 'Cazador de Bandidos',
    description: 'Los bandidos están aterrorizando el camino real',
    objective: 'Mata 5 bandidos',
    reward: { xp: 100, gold: 30, items: [] },
  },
  {
    id: 'SkeletonHunter',
    title: 'Cazador de Esqueletos',
    description: 'Esqueletos han emergido del antiguo cementerio',
    objective: 'Mata 3 skeletons',
    reward: { xp: 200, gold: 50, items: [] },
  },
  {
    id: 'BossFight',
    title: 'El Jefe Final',
    description: 'Un poderoso jefe amenaza el reino',
    objective: 'Derrota al Boss',
    reward: { xp: 500, gold: 100, items: ['Legendary Sword'] },
  },
  {
    id: 'Gatherer',
    title: 'Acumulador',
    description: 'Demuestra tu valía reuniendo riqueza',
    objective: 'Consigue 100 de oro',
    reward: { xp: 150, gold: 0, items: ['Health Potion', 'Health Potion', 'Health Potion'] },
  },
]

function rollChance(): boolean {
  return Math.random() < 0.5
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class ContentManager {
  getEnemyStats(type: string): EnemyStats {
    const base = ENEMY_STATS[type]
    if (!base) {
      return { hp: 10, maxHp: 10, dmg: 1, speed: 10, xp: 0, name: 'Unknown', color: '#ffffff' }
    }
    return { ...base, maxHp: base.hp }
  }

  getSpellData(type: string): SpellData {
    const data = SPELL_DATA[type]
    if (!data) {
      return { cost: 0, range: 0, cooldown: 0 }
    }
    return { ...data }
  }

  generateLoot(enemyType: string, x: number, y: number): Entity[] {
    const table = LOOT_TABLES[enemyType]
    if (!table) return []

    const drops: Entity[] = []

    for (const entry of table.entries) {
      if (Math.random() > entry.chance) continue

      if (entry.goldMin !== undefined && entry.goldMax !== undefined) {
        const amount = randomInt(entry.goldMin, entry.goldMax)
        drops.push({
          type: 'gold',
          x,
          y,
          data: { amount },
        })
      }

      if (entry.item) {
        const count = entry.count ?? 1
        for (let i = 0; i < count; i++) {
          drops.push({
            type: 'item',
            x: x + (rollChance() ? -1 : 1) * randomInt(0, 16),
            y: y + (rollChance() ? -1 : 1) * randomInt(0, 16),
            data: { name: entry.item },
          })
        }
      }
    }

    return drops
  }

  getShopItems(shopType: string): ShopItem[] {
    const items = SHOPS[shopType]
    if (!items) return []
    return items.map((item) => ({ ...item }))
  }

  getAllQuests(): Quest[] {
    return QUESTS.map((q) => ({ ...q, reward: { ...q.reward, items: [...q.reward.items] } }))
  }

  getQuestReward(questId: string): { xp: number; gold: number; items: string[] } {
    const quest = QUESTS.find((q) => q.id === questId)
    if (!quest) {
      return { xp: 0, gold: 0, items: [] }
    }
    return { ...quest.reward, items: [...quest.reward.items] }
  }
}