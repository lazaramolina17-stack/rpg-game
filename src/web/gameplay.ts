import { Entity } from './renderer.js'
import { ContentManager } from './content.js'

export interface InventoryItem {
  type: string
  name: string
  quantity: number
}

export interface Quest {
  id: string
  name: string
  description: string
  objective: string
  current: number
  target: number
  completed: boolean
}

export type QuestProgress = Pick<Quest, 'current' | 'target' | 'completed'>

export interface DamageText {
  text: string
  x: number
  y: number
  alpha: number
  vy: number
  life: number
}

export interface HUDData {
  level: number
  xp: number
  xpToNext: number
  hp: number
  maxHp: number
  inventory: (InventoryItem | null)[]
  quests: Quest[]
  allQuestsComplete: boolean
  gold: number
}

const QUEST_CONFIG = [
  { id: 'kill_bandits', name: 'Cazador de Bandidos', description: 'Mata 3 bandidos', target: 3 },
  { id: 'collect_gold', name: 'Codicia', description: 'Consigue 50 de oro', target: 50 },
  { id: 'find_sword', name: 'La Espada Perdida', description: 'Encuentra la espada perdida', target: 1 },
]

const INVENTORY_SIZE = 10
const XP_BASE_MULTIPLIER = 100
const XP_LEVEL_MULTIPLIER = 1.5
const HP_PER_LEVEL = 10
const POTION_HEAL = 30
const XP_PER_KILL_BASE = 25
const XP_PER_KILL_VARIANCE = 15
const GOLD_MIN = 5
const GOLD_MAX = 15
const ITEM_DROP_SPREAD = 20
const DAMAGE_TEXT_SPEED = 1.5
const DAMAGE_TEXT_LIFE = 1.5

export class GameplayManager {
  private level = 1
  private xp = 0
  private gold = 0
  private hasSword = false
  private allQuestsComplete = false
  private damageTexts: DamageText[] = []
  private inventory: (InventoryItem | null)[] = new Array(INVENTORY_SIZE).fill(null)
  private quests: Quest[]

  constructor(
    private player: any,
    private enemies: any[],
    private items: any[],
    private content?: ContentManager
  ) {
    this.quests = QUEST_CONFIG.map(q => ({
      ...q,
      current: 0,
      objective: `${q.description} (0/${q.target})`,
      completed: false,
    }))
  }

  update(dt: number, entities: any[]) {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i]
      d.y -= d.vy * dt * 60
      d.life -= dt
      d.alpha = Math.max(0, d.life / DAMAGE_TEXT_LIFE)
      if (d.life <= 0) this.damageTexts.splice(i, 1)
    }
  }

  addDamageText(text: string, x: number, y: number) {
    this.damageTexts.push({
      text, x, y, alpha: 1,
      vy: DAMAGE_TEXT_SPEED,
      life: DAMAGE_TEXT_LIFE,
    })
  }

  onEnemyKilled(enemy: any) {
    const xpGain = XP_PER_KILL_BASE + Math.floor(Math.random() * XP_PER_KILL_VARIANCE)
    this.addXp(xpGain)
    this.addDamageText(`+${xpGain} XP`, enemy.x, enemy.y - 40)

    const banditQuest = this.quests.find(q => q.id === 'kill_bandits')
    if (banditQuest && !banditQuest.completed) {
      banditQuest.current = Math.min(banditQuest.current + 1, banditQuest.target)
      banditQuest.objective = `${banditQuest.description} (${banditQuest.current}/${banditQuest.target})`
      if (banditQuest.current >= banditQuest.target) {
        banditQuest.completed = true
        this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
      }
    }

    const loot = this.generateLoot(enemy)
    if (loot) this.items.push(loot)

    this.checkAllQuests()
  }

  private generateLoot(enemy: any): any {
    const roll = Math.random()
    const x = enemy.x + (Math.random() - 0.5) * ITEM_DROP_SPREAD
    const y = enemy.y + (Math.random() - 0.5) * ITEM_DROP_SPREAD

    if (roll < 0.4) {
      return { type: 'item', name: 'Health Potion', x, y, alive: true, itemType: 'health_potion', value: POTION_HEAL }
    }
    if (roll < 0.7) {
      const amount = GOLD_MIN + Math.floor(Math.random() * (GOLD_MAX - GOLD_MIN))
      return { type: 'item', name: `${amount} Gold`, x, y, alive: true, itemType: 'gold', value: amount }
    }
    if (roll < 0.88) {
      const isLostSword = Math.random() < 0.2
      return { type: 'item', name: isLostSword ? 'Lost Sword' : 'Iron Sword', x, y, alive: true, itemType: 'weapon', value: isLostSword ? 'lost_sword' : 'iron_sword' }
    }

    return null
  }

  onItemCollected(item: any) {
    if (item.itemType === 'gold') {
      this.gold += item.value
      this.addDamageText(`+${item.value} Gold`, this.player.x, this.player.y - 30)
      const goldQuest = this.quests.find(q => q.id === 'collect_gold')
      if (goldQuest && !goldQuest.completed) {
        goldQuest.current = Math.min(this.gold, goldQuest.target)
        goldQuest.objective = `${goldQuest.description} (${goldQuest.current}/${goldQuest.target})`
        if (goldQuest.current >= goldQuest.target) {
          goldQuest.completed = true
          this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
        }
      }
      this.addToInventory('gold', 'Gold', item.value)
    } else if (item.itemType === 'health_potion') {
      this.addToInventory('health_potion', 'Health Potion', 1)
    } else if (item.itemType === 'weapon') {
      const isLostSword = item.value === 'lost_sword'
      this.addToInventory(isLostSword ? 'lost_sword' : 'iron_sword', isLostSword ? 'Lost Sword' : 'Iron Sword', 1)
      if (isLostSword) {
        this.hasSword = true
        const swordQuest = this.quests.find(q => q.id === 'find_sword')
        if (swordQuest && !swordQuest.completed) {
          swordQuest.current = 1
          swordQuest.objective = `${swordQuest.description} (1/${swordQuest.target})`
          swordQuest.completed = true
          this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
        }
      }
    }

    this.checkAllQuests()
  }

  useInventorySlot(index: number) {
    const slot = this.inventory[index]
    if (!slot) return

    if (slot.type === 'health_potion' && slot.quantity > 0) {
      const maxHp = this.player.maxHp ?? 100
      this.player.hp = Math.min((this.player.hp ?? 0) + POTION_HEAL, maxHp)
      this.addDamageText(`+${POTION_HEAL} HP`, this.player.x, this.player.y - 30)
      slot.quantity--
      if (slot.quantity <= 0) this.inventory[index] = null
    }
  }

  private addToInventory(type: string, name: string, quantity: number) {
    for (let i = 0; i < this.inventory.length; i++) {
      const slot = this.inventory[i]
      if (slot && slot.type === type && type === 'gold') {
        slot.quantity += quantity
        return
      }
    }
    for (let i = 0; i < this.inventory.length; i++) {
      if (!this.inventory[i]) {
        this.inventory[i] = { type, name, quantity }
        return
      }
    }
  }

  private addXp(amount: number) {
    this.xp += amount
    this.checkLevelUp()
  }

  private checkLevelUp() {
    const needed = this.getXpToNext()
    if (this.xp >= needed) {
      this.xp -= needed
      this.level++
      this.player.maxHp = (this.player.maxHp ?? 100) + HP_PER_LEVEL
      this.player.hp = this.player.maxHp
      this.addDamageText(`¡Level ${this.level}!`, this.player.x, this.player.y - 60)
      this.checkLevelUp()
    }
  }

  private getXpToNext(): number {
    return Math.floor(XP_BASE_MULTIPLIER * this.level * XP_LEVEL_MULTIPLIER)
  }

  private checkAllQuests() {
    this.allQuestsComplete = this.quests.every(q => q.completed)
    for (const q of this.quests) {
      q.objective = `${q.description} (${q.current}/${q.target})${q.completed ? ' ✓' : ''}`
    }
  }

  getDamageTexts(): { text: string; x: number; y: number; alpha: number }[] {
    return this.damageTexts.map(d => ({ text: d.text, x: d.x, y: d.y, alpha: d.alpha }))
  }

  getHUDData(): HUDData {
    return {
      level: this.level,
      xp: this.xp,
      xpToNext: this.getXpToNext(),
      hp: this.player.hp ?? 0,
      maxHp: this.player.maxHp ?? 100,
      inventory: this.inventory,
      quests: this.quests,
      allQuestsComplete: this.allQuestsComplete,
      gold: this.gold,
    }
  }
}
