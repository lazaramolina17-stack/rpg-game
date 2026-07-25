import { getModifier, getProficiencyBonus, SpellSlots } from './dnd'

export interface School {
  name: string
  description: string
  color: string
}

export const SCHOOLS: School[] = [
  { name: 'Abjuration', description: 'Magia protectora que crea barreras, niega efectos y daña a intrusos.', color: '#4a90d9' },
  { name: 'Conjuration', description: 'Magia de transporte y creación que trae objetos o criaturas de otras ubicaciones.', color: '#f5a623' },
  { name: 'Divination', description: 'Magia de conocimiento que revela información oculta y permite ver el futuro.', color: '#7ed321' },
  { name: 'Enchantment', description: 'Magia que afecta la mente, imponiendo compulsiones o alterando emociones.', color: '#d0021b' },
  { name: 'Evocation', description: 'Magia elemental que canaliza energía cruda para causar destrucción masiva.', color: '#f8e71c' },
  { name: 'Illusion', description: 'Magia de engaño que crea imágenes y sonidos falsos para confundir al enemigo.', color: '#9b59b6' },
  { name: 'Necromancy', description: 'Magia que manipula las fuerzas de la vida y la muerte, animando a los muertos.', color: '#2c3e50' },
  { name: 'Transmutation', description: 'Magia que cambia las propiedades físicas de objetos, criaturas o el entorno.', color: '#1abc9c' },
]

export interface Damage {
  type: string
  dice: string
}

export interface Healing {
  dice: string
  modifier?: string
}

export interface Spell {
  name: string
  level: number
  school: string
  castingTime: string
  range: string
  duration: string
  components: string[]
  description: string
  damage?: Damage
  healing?: Healing
  classes: string[]
  ritual: boolean
  concentration: boolean
}

export const SPELLS: Spell[] = [
  {
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 ft',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Disparas un mota de fuego a una criatura u objeto dentro del rango.',
    damage: { type: 'fire', dice: '1d10' },
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Sacred Flame',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 ft',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Llama radiante desciende sobre una criatura que debes poder ver.',
    damage: { type: 'radiant', dice: '1d8' },
    classes: ['cleric'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Eldritch Blast',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 ft',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Un rayo de energía de crackling golpea a una criatura dentro del rango.',
    damage: { type: 'force', dice: '1d10' },
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Vicious Mockery',
    level: 0,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 ft',
    duration: 'Instantaneous',
    components: ['V'],
    description: 'Un insulto mágico lleno de poder causa daño psíquico y desventaja en el siguiente ataque.',
    damage: { type: 'psychic', dice: '1d4' },
    classes: ['rogue'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Bless',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 ft',
    duration: 'Concentration, up to 1 minute',
    components: ['V', 'S', 'M'],
    description: 'Bendices hasta tres criaturas. Cuando hacen una tirada de ataque o salvación, añaden 1d4.',
    classes: ['cleric', 'paladin'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Shield',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    duration: '1 round',
    components: ['V', 'S'],
    description: 'Una barrera invisible de fuerza mágica te protege, aumentando tu CA en +5.',
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Mage Armor',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 action',
    range: 'Touch',
    duration: '8 hours',
    components: ['V', 'S', 'M'],
    description: 'Toques a una criatura voluntaria y su CA base se convierte en 13 + su modificador de Destreza.',
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 ft',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Tres dardos de fuerza mágica golpean automáticamente a tus enemigos.',
    damage: { type: 'force', dice: '3d4+3' },
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Una criatura que tocas recupera puntos de golpe.',
    healing: { dice: '1d8', modifier: 'spellcasting' },
    classes: ['cleric', 'paladin', 'ranger'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Hold Person',
    level: 2,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 ft',
    duration: 'Concentration, up to 1 minute',
    components: ['V', 'S', 'M'],
    description: 'Paralizas a un humanoide que debe superar una salvación de Sabiduría o quedar incapacitado.',
    classes: ['cleric', 'wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Invisibility',
    level: 2,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 1 hour',
    components: ['V', 'S', 'M'],
    description: 'Una criatura que tocas se vuelve invisible hasta que el conjuro termine.',
    classes: ['wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Misty Step',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 bonus action',
    range: 'Self',
    duration: 'Instantaneous',
    components: ['V'],
    description: 'Te envuelves en un destello de niebla plateada y te teletransportas hasta 30 ft.',
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Darkness',
    level: 2,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 ft',
    duration: 'Concentration, up to 10 minutes',
    components: ['V', 'M'],
    description: 'Oscuridad mágica se extiende desde un punto que elijas, llenando un área de 15 ft de radio.',
    classes: ['wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Spiritual Weapon',
    level: 2,
    school: 'Evocation',
    castingTime: '1 bonus action',
    range: '60 ft',
    duration: '1 minute',
    components: ['V', 'S'],
    description: 'Crear un arma flotante que ataca a tus enemigos a distancia.',
    damage: { type: 'force', dice: '1d8' },
    classes: ['cleric'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 ft',
    duration: 'Instantaneous',
    components: ['V', 'S', 'M'],
    description: 'Una explosión de llamas brota de tu dedo y envuelve un área de 20 ft de radio.',
    damage: { type: 'fire', dice: '8d6' },
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Lightning Bolt',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (100 ft line)',
    duration: 'Instantaneous',
    components: ['V', 'S', 'M'],
    description: 'Un rayo de electricidad de 100 ft de largo y 5 ft de ancho surge de tu pecho.',
    damage: { type: 'lightning', dice: '8d6' },
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Counterspell',
    level: 3,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: '60 ft',
    duration: 'Instantaneous',
    components: ['S'],
    description: 'Intentas interrumpir a una criatura en medio de un conjuro.',
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Fly',
    level: 3,
    school: 'Transmutation',
    castingTime: '1 action',
    range: 'Touch',
    duration: 'Concentration, up to 10 minutes',
    components: ['V', 'S', 'M'],
    description: 'Una criatura que tocas obtiene una velocidad de vuelo de 60 ft.',
    classes: ['wizard'],
    ritual: false,
    concentration: true,
  },
  {
    name: 'Power Word Kill',
    level: 9,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 ft',
    duration: 'Instantaneous',
    components: ['V'],
    description: 'Pronuncias una palabra de poder que mata instantáneamente a una criatura con 100 HP o menos.',
    classes: ['wizard'],
    ritual: false,
    concentration: false,
  },
  {
    name: 'Fire Storm',
    level: 7,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 ft',
    duration: 'Instantaneous',
    components: ['V', 'S'],
    description: 'Un muro rugiente de llamas divinas llena el área que elijas.',
    damage: { type: 'fire', dice: '7d10' },
    classes: ['cleric'],
    ritual: false,
    concentration: false,
  },
]

export interface Spellbook {
  spells: Spell[]
  prepared: string[]
  maxPrepared: number
}

const SPELLCASTING_ABILITY: Record<string, keyof import('./dnd').AttributeSet> = {
  wizard: 'intelligence',
  cleric: 'wisdom',
  paladin: 'charisma',
  ranger: 'wisdom',
  rogue: 'charisma',
}

export function getMaxPrepared(classId: string, level: number, abilityMod: number): number {
  if (classId === 'wizard') {
    return level + abilityMod
  }
  return level + abilityMod
}

export function createSpellbook(spells: Spell[], classId: string, level: number, abilityMod: number): Spellbook {
  const classSpells = spells.filter(s => s.classes.includes(classId))
  return {
    spells: classSpells,
    prepared: [],
    maxPrepared: getMaxPrepared(classId, level, abilityMod),
  }
}

export function prepareSpell(book: Spellbook, spellName: string): Spellbook {
  if (book.prepared.includes(spellName)) return book
  if (book.prepared.length >= book.maxPrepared) return book
  const spell = book.spells.find(s => s.name === spellName)
  if (!spell) return book
  return { ...book, prepared: [...book.prepared, spellName] }
}

export function unprepareSpell(book: Spellbook, spellName: string): Spellbook {
  return { ...book, prepared: book.prepared.filter(s => s !== spellName) }
}

export function hasSpellSlot(slots: SpellSlots, level: number): boolean {
  const key = `level${level}` as keyof SpellSlots
  return slots[key] > 0
}

export function canCastSpell(book: Spellbook, spellName: string, slots: SpellSlots): boolean {
  const spell = book.spells.find(s => s.name === spellName)
  if (!spell) return false
  if (spell.level > 0 && !book.prepared.includes(spellName)) return false
  if (spell.level > 0 && !hasSpellSlot(slots, spell.level)) return false
  return true
}

export interface MagicItem {
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'
  type: 'weapon' | 'armor' | 'ring' | 'wand' | 'staff' | 'rod' | 'wondrous'
  attunement: boolean
  description: string
  effects: Record<string, string | number | boolean>
}

export const MAGIC_ITEMS: MagicItem[] = [
  {
    name: 'Bag of Holding',
    rarity: 'uncommon',
    type: 'wondrous',
    attunement: false,
    description: 'Una bolsa que tiene un espacio interior mayor que sus dimensiones exteriores. Puede contener hasta 500 lbs.',
    effects: { weightReduction: 0.2, capacity: 500, internalSpace: '64 cubic feet' },
  },
  {
    name: 'Boots of Elvenkind',
    rarity: 'uncommon',
    type: 'wondrous',
    attunement: false,
    description: 'Estas botas de cuero gastado hacen que tus pasos no hagan ruido.',
    effects: { stealthAdvantage: true },
  },
  {
    name: 'Cloak of Invisibility',
    rarity: 'legendary',
    type: 'wondrous',
    attunement: true,
    description: 'Esta capa de color gris plateado te hace invisible mientras la lleves puesta con la capucha hacia arriba.',
    effects: { invisible: true },
  },
  {
    name: 'Wand of Magic Missiles',
    rarity: 'uncommon',
    type: 'wand',
    attunement: false,
    description: 'Esta varita tiene 7 cargas. Mientras la sostienes, puedes usar una acción para gastar 1 o más cargas y lanzar Magic Missile.',
    effects: { charges: 7, spell: 'Magic Missile', damageDice: '3d4+3' },
  },
  {
    name: 'Staff of the Magi',
    rarity: 'legendary',
    type: 'staff',
    attunement: true,
    description: 'Un poderoso báculo que contiene una vasta reserva de energía arcana. Otorga +2 a los ataques de conjuro y CD de salvación.',
    effects: { spellAttackBonus: 2, saveDCBonus: 2, charges: 50 },
  },
  {
    name: 'Ring of Protection',
    rarity: 'rare',
    type: 'ring',
    attunement: true,
    description: 'Un anillo de platino con una gema azul que otorga +1 a la CA y a las tiradas de salvación.',
    effects: { armorClassBonus: 1, savingThrowBonus: 1 },
  },
  {
    name: 'Gauntlets of Ogre Power',
    rarity: 'uncommon',
    type: 'wondrous',
    attunement: true,
    description: 'Estos guanteletes de malla de acero otorgan una Fuerza de 19 mientras los lleves puestos.',
    effects: { strength: 19 },
  },
  {
    name: 'Amulet of Health',
    rarity: 'rare',
    type: 'wondrous',
    attunement: true,
    description: 'Este amuleto de jade otorga una Constitución de 19 mientras lo lleves puesto.',
    effects: { constitution: 19 },
  },
  {
    name: 'Boots of Speed',
    rarity: 'rare',
    type: 'wondrous',
    attunement: true,
    description: 'Mientras llevas estas botas, puedes usar una acción adicional para duplicar tu velocidad de movimiento.',
    effects: { speedMultiplier: 2 },
  },
  {
    name: 'Holy Avenger',
    rarity: 'legendary',
    type: 'weapon',
    attunement: true,
    description: 'Esta espada larga de plata reluciente otorga +3 a tiradas de ataque y daño. En un radio de 10 ft, los aliados tienen ventaja en salvaciones contra magia.',
    effects: { attackBonus: 3, damageBonus: 3, auraRadius: 10, auraEffect: 'advantage on saves vs magic' },
  },
]

export function rollSpellDamage(spell: Spell, casterLevel: number): number {
  if (!spell.damage) return 0
  const diceMatch = spell.damage.dice.match(/(\d+)d(\d+)(?:\+(\d+))?/)
  if (!diceMatch) return 0
  const count = parseInt(diceMatch[1], 10)
  const sides = parseInt(diceMatch[2], 10)
  const flatBonus = diceMatch[3] ? parseInt(diceMatch[3], 10) : 0
  let total = 0
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1
  }
  if (spell.level === 0 && casterLevel >= 5) {
    const extraDice = Math.floor((casterLevel + 1) / 6)
    for (let i = 0; i < extraDice; i++) {
      total += Math.floor(Math.random() * sides) + 1
    }
  }
  if (spell.level > 0 && casterLevel >= spell.level + 1) {
    const upcastBonus = Math.floor((casterLevel - 1) / 2)
    for (let i = 0; i < upcastBonus; i++) {
      total += Math.floor(Math.random() * sides) + 1
    }
  }
  return total + flatBonus
}

export function getSpellSaveDC(casterAbility: number, proficiency: number): number {
  return 8 + getModifier(casterAbility) + proficiency
}

export function getSpellAttackBonus(casterAbility: number, proficiency: number): number {
  return getModifier(casterAbility) + proficiency
}
