import { ContentManager, Quest, ShopItem, SpellData, EnemyStats } from './content.js'

export interface InventoryItem {
  type: string
  name: string
  quantity: number
}

export interface HUDData {
  level: number
  xp: number
  xpToNext: number
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  gold: number
  inventory: (InventoryItem | null)[]
  quests: { name: string; objective: string; completed: boolean }[]
  allQuestsComplete: boolean
  shopItems?: { name: string; price: string; description: string }[]
  showShop?: boolean
}

export interface DamageText {
  text: string
  x: number
  y: number
  alpha: number
}

const INVENTORY_SIZE = 10
const HP_PER_LEVEL = 10
const POTION_HEAL = 30
const MANA_POTION_RESTORE = 20
const DAMAGE_TEXT_SPEED = 1.5
const DAMAGE_TEXT_LIFE = 1.5

const QUEST_TRACKING: Record<string, { type: 'kill' | 'gold' | 'talk'; target: number; enemyType?: string }> = {
  BanditSlayer: { type: 'kill', target: 5, enemyType: 'Bandit' },
  SkeletonHunter: { type: 'kill', target: 3, enemyType: 'Skeleton' },
  BossFight: { type: 'kill', target: 1, enemyType: 'Boss' },
  Gatherer: { type: 'gold', target: 100 },
  Tutorial: { type: 'talk', target: 1 },
}

const LOOT_ITEM_MAP: Record<string, { itemType: string; value: any }> = {
  'potion': { itemType: 'health_potion', value: 30 },
  'mana potion': { itemType: 'mana_potion', value: 20 },
  'weapon': { itemType: 'weapon', value: 'iron_sword' },
  'bone sword': { itemType: 'weapon', value: 'bone_sword' },
  'scroll': { itemType: 'scroll', value: 'scroll' },
  'rare weapon': { itemType: 'weapon', value: 'rare_weapon' },
  'spell scroll': { itemType: 'scroll', value: 'spell_scroll' },
}

interface QuestState {
  quest: Quest
  current: number
  completed: boolean
}

export class GameplayManager {
  onLevelUp: (() => void) | null = null

  private level = 1
  private xp = 0
  private gold = 0
  private allQuestsComplete = false
  private damageTexts: DamageText[] = []
  private inventory: (InventoryItem | null)[] = new Array(INVENTORY_SIZE).fill(null)
  private questStates: QuestState[] = []
  private pendingProjectiles: { type: string; x: number; y: number; targetX: number; targetY: number }[] = []

  constructor(
    private player: any,
    private enemies: any[],
    private items: any[],
    private content: ContentManager
  ) {
    const quests = content.getAllQuests()
    this.questStates = quests.map(q => ({
      quest: q,
      current: 0,
      completed: false,
    }))
  }

  update(dt: number, entities: any[]) {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i]
      d.y -= DAMAGE_TEXT_SPEED * dt * 60
      const lifeProperty = (d as any).life
      if (lifeProperty !== undefined) {
        (d as any).life -= dt
        d.alpha = Math.max(0, (d as any).life / DAMAGE_TEXT_LIFE)
        if ((d as any).life <= 0) this.damageTexts.splice(i, 1)
      }
    }
  }

  addDamageText(text: string, x: number, y: number) {
    this.damageTexts.push({
      text,
      x,
      y,
      alpha: 1,
      vy: DAMAGE_TEXT_SPEED,
      life: DAMAGE_TEXT_LIFE,
    } as any)
  }

  onEnemyKilled(enemy: any) {
    const enemyType = enemy.enemyType || 'Unknown'
    const stats = this.content.getEnemyStats(enemyType)
    this.addXp(stats.xp)
    this.addDamageText(`+${stats.xp} XP`, enemy.x, enemy.y - 40)

    const lootEntities = this.content.generateLoot(enemyType, enemy.x, enemy.y)
    for (const le of lootEntities) {
      const item = this.convertLootEntity(le)
      if (item) this.items.push(item)
    }

    for (const state of this.questStates) {
      if (state.completed) continue
      const tracking = QUEST_TRACKING[state.quest.id]
      if (tracking && tracking.type === 'kill' && tracking.enemyType === enemyType) {
        state.current = Math.min(state.current + 1, tracking.target)
        if (state.current >= tracking.target) {
          state.completed = true
          this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
          this.grantQuestReward(state.quest.id)
        }
      }
    }

    this.checkAllQuests()
  }

  onItemCollected(item: any) {
    if (item.itemType === 'gold') {
      this.gold += item.value
      this.addDamageText(`+${item.value} Gold`, this.player.x, this.player.y - 30)
      this.addToInventory('gold', 'Gold', item.value)
    } else if (item.itemType === 'health_potion') {
      this.addToInventory('health_potion', 'Health Potion', 1)
    } else if (item.itemType === 'mana_potion') {
      this.addToInventory('mana_potion', 'Mana Potion', 1)
    } else if (item.itemType === 'weapon') {
      this.addToInventory(item.value, item.name, 1)
    } else {
      this.addToInventory(item.itemType || 'item', item.name || 'Item', 1)
    }

    for (const state of this.questStates) {
      if (state.completed) continue
      const tracking = QUEST_TRACKING[state.quest.id]
      if (tracking && tracking.type === 'gold') {
        state.current = Math.min(this.gold, tracking.target)
        if (state.current >= tracking.target) {
          state.completed = true
          this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
          this.grantQuestReward(state.quest.id)
        }
      }
    }

    this.checkAllQuests()
  }

  completeQuest(questId: string) {
    const state = this.questStates.find(qs => qs.quest.id === questId)
    if (!state || state.completed) return
    const tracking = QUEST_TRACKING[state.quest.id]
    const target = tracking ? tracking.target : 1
    state.current = target
    state.completed = true
    this.addDamageText('Quest Complete!', this.player.x, this.player.y - 70)
    this.grantQuestReward(questId)
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
    } else if (slot.type === 'mana_potion' && slot.quantity > 0) {
      const maxMana = this.player.maxMana ?? 50
      this.player.mana = Math.min((this.player.mana ?? 0) + MANA_POTION_RESTORE, maxMana)
      this.addDamageText(`+${MANA_POTION_RESTORE} Mana`, this.player.x, this.player.y - 30)
      slot.quantity--
      if (slot.quantity <= 0) this.inventory[index] = null
    }
  }

  castSpell(type: string, targetX: number, targetY: number): boolean {
    const data = this.content.getSpellData(type)
    if (!data) return false
    if ((this.player.mana ?? 0) < data.cost) return false

    this.player.mana = Math.max(0, (this.player.mana ?? 0) - data.cost)

    if (type === 'Fireball') {
      this.pendingProjectiles.push({
        type,
        x: this.player.x,
        y: this.player.y,
        targetX,
        targetY,
      })
      this.addDamageText('🔥 Fireball!', this.player.x, this.player.y - 40)
    } else if (type === 'Heal') {
      const healAmt = data.heal ?? 30
      this.player.hp = Math.min((this.player.hp ?? 0) + healAmt, this.player.maxHp ?? 100)
      this.addDamageText(`+${healAmt} HP`, this.player.x, this.player.y - 30)
    }

    return true
  }

  getPendingProjectiles(): { type: string; x: number; y: number; targetX: number; targetY: number }[] {
    const result = [...this.pendingProjectiles]
    this.pendingProjectiles = []
    return result
  }

  getShopItems(shopType: string): ShopItem[] {
    return this.content.getShopItems(shopType)
  }

  buyItem(shopType: string, index: number): boolean {
    const items = this.content.getShopItems(shopType)
    if (index < 0 || index >= items.length) return false
    const item = items[index]
    if (this.gold < item.price) return false
    this.gold -= item.price
    const invType = item.name.toLowerCase().replace(/\s+/g, '_')
    this.addToInventory(invType, item.name, 1)
    return true
  }

  getDamageTexts(): DamageText[] {
    return this.damageTexts.map(d => ({
      text: d.text,
      x: d.x,
      y: d.y,
      alpha: d.alpha,
    }))
  }

  getHUDData(): HUDData {
    return {
      level: this.level,
      xp: this.xp,
      xpToNext: this.getXpToNext(),
      hp: this.player.hp ?? 0,
      maxHp: this.player.maxHp ?? 100,
      mana: this.player.mana ?? 0,
      maxMana: this.player.maxMana ?? 50,
      gold: this.gold,
      inventory: this.inventory,
      quests: this.questStates.map(qs => ({
        name: qs.quest.title,
        objective: this.getQuestObjective(qs),
        completed: qs.completed,
      })),
      allQuestsComplete: this.allQuestsComplete,
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
      this.player.mana = this.player.maxMana ?? 50
      this.addDamageText(`¡Level ${this.level}!`, this.player.x, this.player.y - 60)
      if (this.onLevelUp) this.onLevelUp()
      this.checkLevelUp()
    }
  }

  private getXpToNext(): number {
    return Math.floor(100 * this.level * 1.5)
  }

  private getQuestTarget(questId: string): number {
    const tracking = QUEST_TRACKING[questId]
    return tracking ? tracking.target : 1
  }

  private getQuestObjective(state: QuestState): string {
    const tracking = QUEST_TRACKING[state.quest.id]
    if (!tracking) return state.quest.objective
    let desc = state.quest.objective
    if (desc.includes(String(tracking.target))) {
      const idx = desc.lastIndexOf('(')
      if (idx >= 0) desc = desc.substring(0, idx).trim()
    }
    return `${desc} (${state.current}/${tracking.target})${state.completed ? ' ✓' : ''}`
  }

  private grantQuestReward(questId: string) {
    const reward = this.content.getQuestReward(questId)
    if (reward.xp > 0) this.addXp(reward.xp)
    if (reward.gold > 0) this.gold += reward.gold
    for (const itemName of reward.items) {
      this.addToInventory(itemName.toLowerCase().replace(/\s+/g, '_'), itemName, 1)
    }
  }

  private checkAllQuests() {
    this.allQuestsComplete = this.questStates.every(qs => qs.completed)
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

  private convertLootEntity(entity: { type: string; x: number; y: number; data: Record<string, unknown> }): any {
    if (entity.type === 'gold') {
      const amount = entity.data.amount as number
      return { type: 'item', name: `${amount} Gold`, x: entity.x, y: entity.y, alive: true, itemType: 'gold', value: amount }
    }
    const itemName = entity.data.name as string
    const mapped = LOOT_ITEM_MAP[itemName] || { itemType: 'item', value: itemName }
    return { type: 'item', name: itemName, x: entity.x, y: entity.y, alive: true, itemType: mapped.itemType, value: mapped.value }
  }
}