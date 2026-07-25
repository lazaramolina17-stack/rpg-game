export enum EnemyType {
  Bandit = 'Bandit',
  Skeleton = 'Skeleton',
  Mage = 'Mage',
  Goblin = 'Goblin',
  Boss = 'Boss',
  Warlock = 'Warlock',
  Dragon = 'Dragon',
}

export enum SpellType {
  Fireball = 'Fireball',
  Heal = 'Heal',
  Shield = 'Shield',
}

export interface PlayerStats {
  attackDamage: number
  maxHp: number
  maxMana: number
  magicDamage: number
  damageReduction: number
  speedMultiplier: number
  skillPoints: number
  equipped: Record<string, string | null>
  skills: Record<string, number>
}

export interface Skill {
  id: string
  name: string
  description: string
  maxLevel: number
  requirements: { skillId: string; level: number }[]
  effects: { stat: string; perLevel: number }[]
  icon: string
}

export const SKILLS: Skill[] = [
  { id: 'strength', name: 'Fuerza', description: '+2 daño físico por nivel', maxLevel: 10, requirements: [], effects: [{ stat: 'attackDamage', perLevel: 2 }], icon: '⚔' },
  { id: 'vitality', name: 'Vitalidad', description: '+10 HP por nivel', maxLevel: 10, requirements: [], effects: [{ stat: 'maxHp', perLevel: 10 }], icon: '❤' },
  { id: 'magic', name: 'Magia', description: '+5 mana y +2 daño mágico por nivel', maxLevel: 10, requirements: [{ skillId: 'vitality', level: 3 }], effects: [{ stat: 'maxMana', perLevel: 5 }, { stat: 'magicDamage', perLevel: 2 }], icon: '✨' },
  { id: 'defense', name: 'Defensa', description: '-1 daño recibido por nivel', maxLevel: 10, requirements: [{ skillId: 'vitality', level: 2 }], effects: [{ stat: 'damageReduction', perLevel: 1 }], icon: '🛡' },
  { id: 'swiftness', name: 'Rapidez', description: '+5% velocidad por nivel', maxLevel: 5, requirements: [{ skillId: 'strength', level: 5 }], effects: [{ stat: 'speedMultiplier', perLevel: 0.05 }], icon: '💨' },
]

export type SlotType = 'weapon' | 'armor' | 'helmet' | 'accessory'

export interface EquipmentDef {
  id: string
  name: string
  slot: SlotType
  stats: Partial<PlayerStats>
  description: string
  tier: number
}

export const EQUIPMENT: EquipmentDef[] = [
  { id: 'iron_sword', name: 'Espada de Hierro', slot: 'weapon', stats: { attackDamage: 5 }, description: 'Espada básica de hierro', tier: 1 },
  { id: 'steel_sword', name: 'Espada de Acero', slot: 'weapon', stats: { attackDamage: 10 }, description: 'Espada de acero templado', tier: 2 },
  { id: 'magic_staff', name: 'Báculo Mágico', slot: 'weapon', stats: { magicDamage: 8, maxMana: 20 }, description: 'Báculo imbuido con poder arcano', tier: 2 },
  { id: 'leather_armor', name: 'Armadura de Cuero', slot: 'armor', stats: { maxHp: 20, damageReduction: 1 }, description: 'Armadura ligera de cuero', tier: 1 },
  { id: 'chain_mail', name: 'Cota de Malla', slot: 'armor', stats: { maxHp: 40, damageReduction: 2 }, description: 'Protección de anillos de acero', tier: 2 },
  { id: 'plate_armor', name: 'Armadura de Placas', slot: 'armor', stats: { maxHp: 70, damageReduction: 3 }, description: 'Armadura completa de placas', tier: 3 },
  { id: 'iron_helm', name: 'Yelmo de Hierro', slot: 'helmet', stats: { maxHp: 10 }, description: 'Protección básica para la cabeza', tier: 1 },
  { id: 'wizard_hat', name: 'Sombrero de Mago', slot: 'helmet', stats: { maxMana: 30, magicDamage: 3 }, description: 'Sombrero cónico con poderes arcanos', tier: 2 },
  { id: 'ring_of_power', name: 'Anillo de Poder', slot: 'accessory', stats: { attackDamage: 3, magicDamage: 3 }, description: 'Anillo que potencia todas las habilidades', tier: 3 },
  { id: 'amulet_of_life', name: 'Amuleto de Vida', slot: 'accessory', stats: { maxHp: 50, damageReduction: 1 }, description: 'Amuleto que aumenta la vitalidad', tier: 2 },
]

export interface EnemyStats {
  hp: number
  maxHp: number
  dmg: number
  speed: number
  xp: number
  name: string
  color: string
  type?: string
  level?: number
  damage?: number
  gold?: { min: number; max: number }
  attackRange?: number
  attackCooldown?: number
  spells?: string[]
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

export const MORE_ENEMIES: EnemyStats[] = [
  { hp: 100, maxHp: 100, dmg: 14, damage: 14, level: 8, type: EnemyType.Warlock, name: 'Brujo', xp: 40, speed: 60, gold: { min: 15, max: 35 }, attackRange: 100, attackCooldown: 1200, color: '#7c3aed', spells: ['shadow_bolt'] },
  { hp: 250, maxHp: 250, dmg: 25, damage: 25, level: 10, type: EnemyType.Dragon, name: 'Dragón Joven', xp: 80, speed: 40, gold: { min: 40, max: 80 }, attackRange: 80, attackCooldown: 1500, color: '#dc2626', spells: ['fire_breath'] },
]

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
