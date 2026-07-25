import { ContentManager, Quest, ShopItem, SpellData, EnemyStats, Skill, EquipmentDef, SlotType, EQUIPMENT, SKILLS } from './content.js'
import { CharacterSheet, Race, CharacterClass, AttributeSet, createCharacter, levelUp, rollDie, rollDice, rollD20, rollWithAdvantage, DiceRoll, getModifier } from './dnd.js'

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
  dndSheet?: CharacterSheet | null
  lastDiceRoll?: DiceRoll | null
}

export interface DamageText {
  text: string
  x: number
  y: number
  alpha: number
}

interface QuestState {
  quest: Quest
  current: number
  completed: boolean
}

interface CraftRecipe {
  resultId: string
  materials: { itemId: string; quantity: number }[]
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

const LOOT_ITEM_MAP: Record<string, { itemType: string; value: unknown }> = {
  'potion': { itemType: 'health_potion', value: 30 },
  'mana potion': { itemType: 'mana_potion', value: 20 },
  'weapon': { itemType: 'weapon', value: 'iron_sword' },
  'bone sword': { itemType: 'weapon', value: 'bone_sword' },
  'scroll': { itemType: 'scroll', value: 'scroll' },
  'rare weapon': { itemType: 'weapon', value: 'rare_weapon' },
  'spell scroll': { itemType: 'scroll', value: 'spell_scroll' },
}

const CRAFT_RECIPES: CraftRecipe[] = [
  { resultId: 'iron_sword', materials: [{ itemId: 'weapon', quantity: 2 }] },
  { resultId: 'leather_armor', materials: [{ itemId: 'potion', quantity: 3 }] },
  { resultId: 'magic_staff', materials: [{ itemId: 'scroll', quantity: 2 }] },
  { resultId: 'chain_mail', materials: [{ itemId: 'weapon', quantity: 3 }, { itemId: 'scroll', quantity: 1 }] },
  { resultId: 'ring_of_power', materials: [{ itemId: 'rare weapon', quantity: 2 }, { itemId: 'spell scroll', quantity: 1 }] },
]

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

  dndSheet: CharacterSheet | null = null
  private lastDiceRoll: DiceRoll | null = null

  constructor(
    private player: Record<string, unknown>,
    private enemies: Record<string, unknown>[],
    private items: Record<string, unknown>[],
    private content: ContentManager
  ) {
    this.player.attackDamage = (this.player.attackDamage as number) ?? 5
    this.player.magicDamage = (this.player.magicDamage as number) ?? 2
    this.player.damageReduction = (this.player.damageReduction as number) ?? 0
    this.player.speedMultiplier = (this.player.speedMultiplier as number) ?? 1
    this.player.skillPoints = (this.player.skillPoints as number) ?? 0
    this.player.equipped = (this.player.equipped as Record<string, string | null>) ?? { weapon: null, armor: null, helmet: null, accessory: null }
    this.player.skills = (this.player.skills as Record<string, number>) ?? {}

    const quests = content.getAllQuests()
    this.questStates = quests.map(q => ({
      quest: q,
      current: 0,
      completed: false,
    }))
  }

  initDndCharacter(name: string, race: Race, cls: CharacterClass, attrs: AttributeSet) {
    this.dndSheet = createCharacter(name, race, cls, attrs)
    this.player.hp = this.dndSheet.hitPoints
    this.player.maxHp = this.dndSheet.maxHitPoints
    this.player.attackDamage = this.dndSheet.modifiers.strength
    this.player.magicDamage = this.dndSheet.modifiers.intelligence
    this.player.level = this.dndSheet.level
  }

  rollD20WithAdvantage(): DiceRoll {
    const [r1, r2, best] = rollWithAdvantage()
    this.lastDiceRoll = { rolls: [r1, r2], total: best, sides: 20, type: 'advantage' }
    return this.lastDiceRoll
  }

  rollD20WithDisadvantage(): DiceRoll {
    const [r1, r2, worst] = rollWithDisadvantage()
    this.lastDiceRoll = { rolls: [r1, r2], total: worst, sides: 20, type: 'disadvantage' }
    return this.lastDiceRoll
  }

  rollAttackDice(): DiceRoll {
    const roll = rollD20()
    const dnd = this.dndSheet
    const bonus = dnd ? getModifier(dnd.attributes[dnd.class.primaryAbility]) : 0
    this.lastDiceRoll = { rolls: [roll], total: roll + bonus, sides: 20, type: 'normal' }
    return this.lastDiceRoll
  }

  rollDamageDice(): DiceRoll {
    const dnd = this.dndSheet
    if (!dnd) {
      const dmg = 8 + rollDie(12)
      this.lastDiceRoll = { rolls: [dmg - 8], total: dmg, sides: 12 }
      return this.lastDiceRoll
    }
    const count = dnd.class.id === 'rogue' ? 2 : 1
    const hitDie = Math.min(dnd.hitDie, 12)
    const mod = getModifier(dnd.attributes[dnd.class.primaryAbility])
    const rolls = rollDice(count, hitDie)
    const total = rolls.reduce((s, r) => s + r, 0) + mod
    this.lastDiceRoll = { rolls, total, sides: hitDie }
    return this.lastDiceRoll
  }

  getLastDiceRoll(): DiceRoll | null {
    return this.lastDiceRoll
  }

  learnSkill(skillId: string): boolean {
    const skill = SKILLS.find(s => s.id === skillId)
    if (!skill) return false
    const currentLevel = (this.player.skills as Record<string, number>)[skillId] ?? 0
    if (currentLevel >= skill.maxLevel) return false
    for (const req of skill.requirements) {
      const reqLevel = (this.player.skills as Record<string, number>)[req.skillId] ?? 0
      if (reqLevel < req.level) return false
    }
    const sp = this.player.skillPoints as number
    if (sp < 1) return false
    this.player.skillPoints = sp - 1
    ;(this.player.skills as Record<string, number>)[skillId] = currentLevel + 1
    this.applySkillEffects(skill)
    return true
  }

  getSkillLevel(skillId: string): number {
    return (this.player.skills as Record<string, number>)[skillId] ?? 0
  }

  getSkillPoints(): number {
    return (this.player.skillPoints as number) ?? 0
  }

  getAvailableSkills(): Skill[] {
    return SKILLS.filter(s => {
      const currentLevel = (this.player.skills as Record<string, number>)[s.id] ?? 0
      if (currentLevel >= s.maxLevel) return false
      for (const req of s.requirements) {
        const reqLevel = (this.player.skills as Record<string, number>)[req.skillId] ?? 0
        if (reqLevel < req.level) return false
      }
      return true
    })
  }

  private applySkillEffects(skill: Skill): void {
    const level = (this.player.skills as Record<string, number>)[skill.id] ?? 0
    for (const effect of skill.effects) {
      const key = effect.stat as keyof typeof this.player
      const current = this.player[key] as number ?? 0
      ;(this.player as Record<string, unknown>)[key] = effect.perLevel * level
    }
  }

  equipItem(itemId: string): boolean {
    const def = EQUIPMENT.find(e => e.id === itemId)
    if (!def) return false
    const invIndex = this.inventory.findIndex(s => s && s.type === def.id)
    if (invIndex < 0) return false
    const equipped = this.player.equipped as Record<string, string | null>
    const oldItemId = equipped[def.slot]
    equipped[def.slot] = itemId
    this.inventory[invIndex] = null
    if (oldItemId) {
      const emptyIdx = this.inventory.findIndex(s => !s)
      if (emptyIdx >= 0) {
        const oldDef = EQUIPMENT.find(e => e.id === oldItemId)
        this.inventory[emptyIdx] = { type: oldItemId, name: oldDef?.name ?? oldItemId, quantity: 1 }
      }
    }
    return true
  }

  unequipSlot(slot: SlotType): boolean {
    const equipped = this.player.equipped as Record<string, string | null>
    const itemId = equipped[slot]
    if (!itemId) return false
    const emptyIdx = this.inventory.findIndex(s => !s)
    if (emptyIdx < 0) return false
    const def = EQUIPMENT.find(e => e.id === itemId)
    this.inventory[emptyIdx] = { type: itemId, name: def?.name ?? itemId, quantity: 1 }
    equipped[slot] = null
    return true
  }

  getEquippedStats(): Partial<Record<string, number>> {
    const totals: Record<string, number> = {}
    const slots: SlotType[] = ['weapon', 'armor', 'helmet', 'accessory']
    const equipped = this.player.equipped as Record<string, string | null>
    for (const slot of slots) {
      const itemId = equipped[slot]
      if (!itemId) continue
      const def = EQUIPMENT.find(e => e.id === itemId)
      if (!def) continue
      for (const [key, value] of Object.entries(def.stats)) {
        totals[key] = (totals[key] ?? 0) + (value as number)
      }
    }
    return totals
  }

  canCraft(itemId: string): boolean {
    const recipe = CRAFT_RECIPES.find(r => r.resultId === itemId)
    if (!recipe) return false
    for (const mat of recipe.materials) {
      const count = this.inventory.reduce((sum, slot) => {
        if (slot && slot.type === mat.itemId) return sum + slot.quantity
        return sum
      }, 0)
      if (count < mat.quantity) return false
    }
    return true
  }

  craftItem(itemId: string): boolean {
    if (!this.canCraft(itemId)) return false
    const recipe = CRAFT_RECIPES.find(r => r.resultId === itemId)!
    for (const mat of recipe.materials) {
      let remaining = mat.quantity
      for (let i = 0; i < this.inventory.length && remaining > 0; i++) {
        const slot = this.inventory[i]
        if (slot && slot.type === mat.itemId) {
          const taken = Math.min(slot.quantity, remaining)
          slot.quantity -= taken
          remaining -= taken
          if (slot.quantity <= 0) this.inventory[i] = null
        }
      }
    }
    const def = EQUIPMENT.find(e => e.id === itemId)
    this.addToInventory(itemId, def?.name ?? itemId, 1)
    return true
  }

  calculateDamage(enemy?: Record<string, unknown>): number {
    if (this.dndSheet) {
      const roll = this.rollDamageDice()
      return roll.total
    }
    const baseAtk = (this.player.attackDamage as number) ?? 5
    const strBonus = ((this.player.skills as Record<string, number>)?.strength ?? 0) * 2
    const equipStats = this.getEquippedStats()
    const equipAtk = equipStats.attackDamage ?? 0
    const levelBonus = this.level
    const totalAtk = baseAtk + strBonus + equipAtk + levelBonus + Math.floor(Math.random() * 5)
    let enemyDef = 0
    if (enemy) {
      const enemyType = enemy.enemyType as string | undefined
      if (enemyType) {
        const stats = this.content.getEnemyStats(enemyType)
        enemyDef = stats.damageReduction ?? 0
      }
    }
    return Math.max(1, totalAtk - enemyDef)
  }

  update(dt: number, entities: Record<string, unknown>[]) {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const d = this.damageTexts[i]
      d.y -= DAMAGE_TEXT_SPEED * dt * 60
      const lifeProperty = (d as Record<string, unknown>).life
      if (lifeProperty !== undefined) {
        (d as Record<string, unknown>).life = (lifeProperty as number) - dt
        d.alpha = Math.max(0, (lifeProperty as number) / DAMAGE_TEXT_LIFE)
        if ((lifeProperty as number) <= 0) this.damageTexts.splice(i, 1)
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
    } as DamageText & { vy: number; life: number })
  }

  onEnemyKilled(enemy: Record<string, unknown>) {
    const enemyType = (enemy.enemyType as string) || 'Unknown'
    const stats = this.content.getEnemyStats(enemyType)
    this.addXp(stats.xp)
    this.addDamageText(`+${stats.xp} XP`, enemy.x as number, (enemy.y as number) - 40)

    const lootEntities = this.content.generateLoot(enemyType, enemy.x as number, enemy.y as number)
    for (const le of lootEntities) {
      const item = this.convertLootEntity(le)
      if (item) this.items.push(item)
    }

    if (Math.random() < 0.15) {
      const tier = Math.min(5, Math.ceil(this.level / 3) + 1)
      const pool = EQUIPMENT.filter(e => e.tier <= tier)
      if (pool.length > 0) {
        const eq = pool[Math.floor(Math.random() * pool.length)]
        this.items.push({
          type: 'item',
          name: eq.name,
          x: (enemy.x as number) + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 16),
          y: (enemy.y as number) + (Math.random() < 0.5 ? -1 : 1) * Math.floor(Math.random() * 16),
          alive: true,
          itemType: 'equipment',
          value: eq.id,
        })
      }
    }

    for (const state of this.questStates) {
      if (state.completed) continue
      const tracking = QUEST_TRACKING[state.quest.id]
      if (tracking && tracking.type === 'kill' && tracking.enemyType === enemyType) {
        state.current = Math.min(state.current + 1, tracking.target)
        if (state.current >= tracking.target) {
          state.completed = true
          this.addDamageText('Quest Complete!', this.player.x as number, (this.player.y as number) - 70)
          this.grantQuestReward(state.quest.id)
        }
      }
    }

    this.checkAllQuests()
  }

  onItemCollected(item: Record<string, unknown>) {
    if (item.itemType === 'gold') {
      this.gold += item.value as number
      this.addDamageText(`+${item.value} Gold`, this.player.x as number, (this.player.y as number) - 30)
      this.addToInventory('gold', 'Gold', item.value as number)
    } else if (item.itemType === 'equipment') {
      const def = EQUIPMENT.find(e => e.id === item.value)
      this.addToInventory(item.value as string, def?.name ?? (item.name as string), 1)
    } else if (item.itemType === 'health_potion') {
      this.addToInventory('health_potion', 'Health Potion', 1)
    } else if (item.itemType === 'mana_potion') {
      this.addToInventory('mana_potion', 'Mana Potion', 1)
    } else if (item.itemType === 'weapon') {
      this.addToInventory(item.value as string, item.name as string, 1)
    } else {
      this.addToInventory((item.itemType as string) || 'item', (item.name as string) || 'Item', 1)
    }

    for (const state of this.questStates) {
      if (state.completed) continue
      const tracking = QUEST_TRACKING[state.quest.id]
      if (tracking && tracking.type === 'gold') {
        state.current = Math.min(this.gold, tracking.target)
        if (state.current >= tracking.target) {
          state.completed = true
          this.addDamageText('Quest Complete!', this.player.x as number, (this.player.y as number) - 70)
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
    this.addDamageText('Quest Complete!', this.player.x as number, (this.player.y as number) - 70)
    this.grantQuestReward(questId)
    this.checkAllQuests()
  }

  useInventorySlot(index: number) {
    const slot = this.inventory[index]
    if (!slot) return

    if (slot.type === 'health_potion' && slot.quantity > 0) {
      const maxHp = (this.player.maxHp as number) ?? 100
      this.player.hp = Math.min(((this.player.hp as number) ?? 0) + POTION_HEAL, maxHp)
      this.addDamageText(`+${POTION_HEAL} HP`, this.player.x as number, (this.player.y as number) - 30)
      slot.quantity--
      if (slot.quantity <= 0) this.inventory[index] = null
    } else if (slot.type === 'mana_potion' && slot.quantity > 0) {
      const maxMana = (this.player.maxMana as number) ?? 50
      this.player.mana = Math.min(((this.player.mana as number) ?? 0) + MANA_POTION_RESTORE, maxMana)
      this.addDamageText(`+${MANA_POTION_RESTORE} Mana`, this.player.x as number, (this.player.y as number) - 30)
      slot.quantity--
      if (slot.quantity <= 0) this.inventory[index] = null
    }
  }

  castSpell(type: string, targetX: number, targetY: number): boolean {
    const data = this.content.getSpellData(type)
    if (!data) return false
    if (((this.player.mana as number) ?? 0) < data.cost) return false

    this.player.mana = Math.max(0, ((this.player.mana as number) ?? 0) - data.cost)

    if (type === 'Fireball') {
      this.pendingProjectiles.push({
        type,
        x: this.player.x as number,
        y: this.player.y as number,
        targetX,
        targetY,
      })
      this.addDamageText('🔥 Fireball!', this.player.x as number, (this.player.y as number) - 40)
    } else if (type === 'Heal') {
      const healAmt = data.heal ?? 30
      this.player.hp = Math.min(((this.player.hp as number) ?? 0) + healAmt, (this.player.maxHp as number) ?? 100)
      this.addDamageText(`+${healAmt} HP`, this.player.x as number, (this.player.y as number) - 30)
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
      hp: (this.player.hp as number) ?? 0,
      maxHp: (this.player.maxHp as number) ?? 100,
      mana: (this.player.mana as number) ?? 0,
      maxMana: (this.player.maxMana as number) ?? 50,
      gold: this.gold,
      inventory: this.inventory,
      quests: this.questStates.map(qs => ({
        name: qs.quest.title,
        objective: this.getQuestObjective(qs),
        completed: qs.completed,
      })),
      allQuestsComplete: this.allQuestsComplete,
      dndSheet: this.dndSheet,
      lastDiceRoll: this.lastDiceRoll,
    }
  }

  getDndAttackBonus(): number {
    if (!this.dndSheet) return 0
    const mod = getModifier(this.dndSheet.attributes[this.dndSheet.class.primaryAbility])
    return mod + this.dndSheet.proficiencyBonus
  }

  getDndArmorClass(): number {
    if (!this.dndSheet) return 10
    return this.dndSheet.armorClass
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
      this.player.maxHp = ((this.player.maxHp as number) ?? 100) + HP_PER_LEVEL
      this.player.hp = this.player.maxHp
      this.player.mana = (this.player.maxMana as number) ?? 50
      if (this.level % 2 === 0) {
        this.player.skillPoints = ((this.player.skillPoints as number) ?? 0) + 1
      }
      this.addDamageText(`¡Level ${this.level}!`, this.player.x as number, (this.player.y as number) - 60)
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

  private convertLootEntity(entity: { type: string; x: number; y: number; data: Record<string, unknown> }): Record<string, unknown> | null {
    if (entity.type === 'gold') {
      const amount = entity.data.amount as number
      return { type: 'item', name: `${amount} Gold`, x: entity.x, y: entity.y, alive: true, itemType: 'gold', value: amount }
    }
    const itemName = entity.data.name as string
    const mapped = LOOT_ITEM_MAP[itemName] || { itemType: 'item', value: itemName }
    return { type: 'item', name: itemName, x: entity.x, y: entity.y, alive: true, itemType: mapped.itemType, value: mapped.value }
  }
}
