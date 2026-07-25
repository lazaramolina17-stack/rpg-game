export interface DiceRoll {
  rolls: number[]
  total: number
  sides: number
  type?: 'normal' | 'advantage' | 'disadvantage'
}

export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

export function rollDice(count: number, sides: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(rollDie(sides))
  }
  return results
}

export function rollD20(): number {
  return rollDie(20)
}

export function rollWithAdvantage(): [number, number, number] {
  const r1 = rollD20()
  const r2 = rollD20()
  return [r1, r2, Math.max(r1, r2)]
}

export function rollWithDisadvantage(): [number, number, number] {
  const r1 = rollD20()
  const r2 = rollD20()
  return [r1, r2, Math.min(r1, r2)]
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export interface AttributeSet {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export const STANDARD_ARRAY: AttributeSet = {
  strength: 15,
  dexterity: 14,
  constitution: 13,
  intelligence: 12,
  wisdom: 10,
  charisma: 8,
}

export function rollAttributes(): AttributeSet {
  function rollFourDropLowest(): number {
    const rolls: number[] = []
    for (let i = 0; i < 4; i++) {
      rolls.push(rollDie(6))
    }
    rolls.sort((a, b) => a - b)
    return rolls[1] + rolls[2] + rolls[3]
  }

  return {
    strength: rollFourDropLowest(),
    dexterity: rollFourDropLowest(),
    constitution: rollFourDropLowest(),
    intelligence: rollFourDropLowest(),
    wisdom: rollFourDropLowest(),
    charisma: rollFourDropLowest(),
  }
}

const POINT_BUY_COST: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
}

export class PointBuySystem {
  static readonly MAX_POINTS = 27
  static readonly MIN_SCORE = 8
  static readonly MAX_SCORE = 15

  static getCost(score: number): number {
    return POINT_BUY_COST[score] ?? -1
  }

  static canAfford(attrs: AttributeSet): boolean {
    return this.totalCost(attrs) <= this.MAX_POINTS && this.isValid(attrs)
  }

  static totalCost(attrs: AttributeSet): number {
    const keys: (keyof AttributeSet)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    return keys.reduce((sum, key) => sum + (POINT_BUY_COST[attrs[key]] ?? 0), 0)
  }

  static isValid(attrs: AttributeSet): boolean {
    const keys: (keyof AttributeSet)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    return keys.every(key => attrs[key] >= this.MIN_SCORE && attrs[key] <= this.MAX_SCORE)
  }
}

const RACIAL_BONUSES: Record<string, Partial<AttributeSet>> = {
  Human: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
  Elf: { dexterity: 2 },
  Dwarf: { constitution: 2 },
  Halfling: { dexterity: 2 },
  Dragonborn: { strength: 2, charisma: 1 },
  HalfElf: { charisma: 2 },
}

export function applyRacialBonuses(attrs: AttributeSet, race: string): AttributeSet {
  const bonuses = RACIAL_BONUSES[race]
  if (!bonuses) return { ...attrs }
  const result = { ...attrs }
  const keys: (keyof AttributeSet)[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
  for (const key of keys) {
    const bonus = bonuses[key]
    if (bonus) {
      result[key] += bonus
    }
  }
  return result
}

export interface Race {
  id: string
  name: string
  description: string
  attributeBonuses: Partial<AttributeSet>
  speed: number
  size: 'Small' | 'Medium'
  traits: string[]
}

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versátiles y ambiciosos, los humanos son la raza más adaptable.',
    attributeBonuses: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    speed: 1,
    size: 'Medium',
    traits: ['Versatile: +1 a todos los atributos', 'Extra Language: Common +1'],
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Seres gráciles y longevos con agudos sentidos y conexión con la naturaleza.',
    attributeBonuses: { dexterity: 2 },
    speed: 1.05,
    size: 'Medium',
    traits: ['Darkvision: Visión en oscuridad 60ft', 'Keen Senses: Percepción competente', 'Fey Ancestry: Ventaja contra encantos', 'Trance: Meditar 4h equivale a dormir 8h'],
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Guerreros robustos y resistentes, forjados en las profundidades de la montaña.',
    attributeBonuses: { constitution: 2 },
    speed: 0.9,
    size: 'Medium',
    traits: ['Darkvision: Visión en oscuridad 60ft', 'Dwarven Resilience: Resistencia al veneno', 'Stonecunning: Competencia en historia de piedra'],
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Pequeños y afortunados, los halflings son sorprendentemente valientes.',
    attributeBonuses: { dexterity: 2 },
    speed: 0.9,
    size: 'Small',
    traits: ['Lucky: Puedes repetir 1 natural en ataques/pruebas/salvaciones', 'Brave: Ventaja contra miedo', 'Nimble: Puedes moverte a través de criaturas más grandes'],
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Descendientes de dragones, con escamas y aliento elemental.',
    attributeBonuses: { strength: 2, charisma: 1 },
    speed: 1,
    size: 'Medium',
    traits: ['Breath Weapon: Ataque de aliento elemental', 'Damage Resistance: Resistencia al tipo de daño de tu ascendencia'],
  },
  {
    id: 'halfelf',
    name: 'Half-Elf',
    description: 'Mezcla de sangre humana y élfica, heredan lo mejor de ambos mundos.',
    attributeBonuses: { charisma: 2 },
    speed: 1.05,
    size: 'Medium',
    traits: ['Darkvision: Visión en oscuridad 60ft', 'Fey Ancestry: Ventaja contra encantos', 'Skill Versatility: Dos habilidades adicionales', 'Extra Language: Common +1'],
  },
]

export interface ClassFeature {
  name: string
  description: string
  level: number
}

export interface CharacterClass {
  id: string
  name: string
  description: string
  hitDie: number
  primaryAbility: keyof AttributeSet
  savingThrowProficiencies: (keyof AttributeSet)[]
  features: ClassFeature[]
}

export const CLASSES: CharacterClass[] = [
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'Maestro del combate armado, experto en tácticas de guerra.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrowProficiencies: ['strength', 'constitution'],
    features: [
      { name: 'Fighting Style', description: 'Elige un estilo de combate: arquería, defensa, duelo, etc.', level: 1 },
      { name: 'Second Wind', description: 'Una vez por descanso, recupera 1d10 + nivel de HP como acción adicional.', level: 1 },
      { name: 'Action Surge', description: 'Una vez por descanso, toma una acción adicional en tu turno.', level: 2 },
      { name: 'Combat Superiority', description: 'Obtienes maniobras de combate y dados de superioridad.', level: 3 },
      { name: 'Extra Attack', description: 'Puedes atacar dos veces cuando tomas la acción de Ataque.', level: 5 },
    ],
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'Erudito de la magia arcana que lanza hechizos a través de su libro de conjuros.',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    features: [
      { name: 'Spellcasting', description: 'Lanzas hechizos arcanos usando tu libro de conjuros.', level: 1 },
      { name: 'Arcane Recovery', description: 'Una vez al día, recuperas niveles de conjuros gastados tras un descanso corto.', level: 1 },
      { name: 'Arcane Tradition', description: 'Elige una escuela de magia: evocación, abjuración, etc.', level: 2 },
      { name: 'Cantrip Formulas', description: 'Puedes preparar cantrips adicionales de tu libro.', level: 3 },
      { name: 'Spell Mastery', description: 'Dominas un conjuro de nivel 1 y uno de nivel 2 que puedes lanzar sin gastar espacio.', level: 5 },
    ],
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'Ladrón y asesino hábil, experto en sigilo, trampas y golpes precisos.',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrowProficiencies: ['dexterity', 'intelligence'],
    features: [
      { name: 'Sneak Attack', description: 'Ataque furtivo: +1d6 de daño una vez por turno con ventaja o aliado cercano.', level: 1 },
      { name: 'Thieves Cant', description: 'Lenguaje secreto de ladrones con señales y códigos ocultos.', level: 1 },
      { name: 'Cunning Action', description: 'Acción astuta: puede usar Correr, Retirarse o Esconderse como acción adicional.', level: 2 },
      { name: 'Steady Aim', description: 'Como acción adicional, obtienes ventaja en tu siguiente ataque a distancia.', level: 3 },
      { name: 'Uncanny Dodge', description: 'Cuando un atacante que ves te impacta, reduces el daño a la mitad con tu reacción.', level: 5 },
    ],
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'Campeón divino que canaliza el poder de los dioses para sanar y proteger.',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrowProficiencies: ['wisdom', 'charisma'],
    features: [
      { name: 'Spellcasting', description: 'Lanzas hechizos divinos canalizando el poder de tu deidad.', level: 1 },
      { name: 'Divine Domain', description: 'Elige un dominio divino que otorga hechizos y habilidades adicionales.', level: 1 },
      { name: 'Channel Divinity', description: 'Canalizas energía divina una vez por descanso para efectos sagrados.', level: 2 },
      { name: 'Destroy Undead', description: 'Tu Channel Divinity puede destruir no-muertos de CR menor a tu nivel.', level: 3 },
      { name: 'Divine Intervention', description: 'Imploras la intervención directa de tu deidad una vez cada 7 días.', level: 5 },
    ],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'Explorador y cazador, rastrea bestias y protege las fronteras de la civilización.',
    hitDie: 10,
    primaryAbility: 'dexterity',
    savingThrowProficiencies: ['strength', 'dexterity'],
    features: [
      { name: 'Favored Foe', description: 'Marca a un enemigo como presa favorita, añadiendo 1d4 de daño una vez por turno.', level: 1 },
      { name: 'Spellcasting', description: 'Lanzas hechizos de ranger relacionados con la naturaleza y la caza.', level: 2 },
      { name: 'Ranger Archetype', description: 'Elige un arquetipo: cazador, guardabosques o domador de bestias.', level: 3 },
      { name: 'Primeval Awareness', description: 'Puedes detectar criaturas sobrenaturales en un radio de 1 milla.', level: 3 },
      { name: 'Extra Attack', description: 'Puedes atacar dos veces cuando tomas la acción de Ataque.', level: 5 },
    ],
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Guerrero sagrado que jura defender la justicia y destruir el mal.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrowProficiencies: ['wisdom', 'charisma'],
    features: [
      { name: 'Lay on Hands', description: 'Toque sanador: tienes un pozo de HP × 5 puntos de curación para distribuir.', level: 1 },
      { name: 'Divine Sense', description: 'Puedes detectar presencias celestiales, infernales o no-muertas.', level: 1 },
      { name: 'Divine Smite', description: 'Gasta un espacio de conjuro al golpear para añadir daño radiante: 2d8 + 1d8 por nivel.', level: 2 },
      { name: 'Sacred Oath', description: 'Juras un juramento sagrado que otorga poderes y hechizos de juramento.', level: 3 },
      { name: 'Extra Attack', description: 'Puedes atacar dos veces cuando tomas la acción de Ataque.', level: 5 },
    ],
  },
]

export function getProficiencyBonus(level: number): number {
  if (level <= 4) return 2
  if (level <= 8) return 3
  if (level <= 12) return 4
  if (level <= 16) return 5
  return 6
}

export interface SpellSlots {
  level1: number
  level2: number
  level3: number
  level4: number
  level5: number
  level6: number
  level7: number
  level8: number
  level9: number
}

const SPELL_SLOTS_BY_LEVEL: Record<number, SpellSlots> = {
  1: { level1: 2, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  2: { level1: 3, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  3: { level1: 4, level2: 2, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  4: { level1: 4, level2: 3, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  5: { level1: 4, level2: 3, level3: 2, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  6: { level1: 4, level2: 3, level3: 3, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  7: { level1: 4, level2: 3, level3: 3, level4: 1, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  8: { level1: 4, level2: 3, level3: 3, level4: 2, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 },
  9: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 1, level6: 0, level7: 0, level8: 0, level9: 0 },
  10: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 0, level7: 0, level8: 0, level9: 0 },
  11: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  12: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 0, level8: 0, level9: 0 },
  13: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  14: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 0, level9: 0 },
  15: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  16: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 0 },
  17: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 2, level6: 1, level7: 1, level8: 1, level9: 1 },
  18: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 1, level7: 1, level8: 1, level9: 1 },
  19: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 1, level8: 1, level9: 1 },
  20: { level1: 4, level2: 3, level3: 3, level4: 3, level5: 3, level6: 2, level7: 2, level8: 1, level9: 1 },
}

export function getSpellSlots(level: number, cls: string): SpellSlots {
  const casterClasses = ['wizard', 'cleric', 'paladin', 'ranger']
  if (!casterClasses.includes(cls)) {
    return { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 }
  }
  if (cls === 'paladin' || cls === 'ranger') {
    const halfLevel = Math.ceil(level / 2)
    return SPELL_SLOTS_BY_LEVEL[halfLevel] ?? { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 }
  }
  return SPELL_SLOTS_BY_LEVEL[level] ?? { level1: 0, level2: 0, level3: 0, level4: 0, level5: 0, level6: 0, level7: 0, level8: 0, level9: 0 }
}

export interface CharacterSheet {
  name: string
  race: Race
  class: CharacterClass
  level: number
  attributes: AttributeSet
  modifiers: AttributeSet
  hitPoints: number
  maxHitPoints: number
  hitDie: number
  hitDieCurrent: number
  proficiencyBonus: number
  speed: number
  features: ClassFeature[]
  spellSlots: SpellSlots
  armorClass: number
  initiative: number
  inspiration: boolean
}

function computeModifiers(attrs: AttributeSet): AttributeSet {
  return {
    strength: getModifier(attrs.strength),
    dexterity: getModifier(attrs.dexterity),
    constitution: getModifier(attrs.constitution),
    intelligence: getModifier(attrs.intelligence),
    wisdom: getModifier(attrs.wisdom),
    charisma: getModifier(attrs.charisma),
  }
}

function computeMaxHp(hitDie: number, level: number, conMod: number): number {
  return hitDie + conMod + (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod)
}

export function createCharacter(name: string, race: Race, cls: CharacterClass, attrs: AttributeSet): CharacterSheet {
  const level = 1
  const bonuses = race.attributeBonuses
  const finalAttrs = applyRacialBonuses(attrs, race.name)
  const modifiers = computeModifiers(finalAttrs)
  const conMod = modifiers.constitution
  const profBonus = getProficiencyBonus(level)
  const maxHp = computeMaxHp(cls.hitDie, level, conMod)
  const spellSlots = getSpellSlots(level, cls.id)
  const dexMod = modifiers.dexterity

  return {
    name,
    race,
    class: cls,
    level,
    attributes: finalAttrs,
    modifiers,
    hitPoints: maxHp,
    maxHitPoints: maxHp,
    hitDie: cls.hitDie,
    hitDieCurrent: level,
    proficiencyBonus: profBonus,
    speed: race.speed,
    features: cls.features.filter(f => f.level <= level),
    spellSlots,
    armorClass: 10 + dexMod,
    initiative: dexMod,
    inspiration: false,
  }
}

export function levelUp(character: CharacterSheet): CharacterSheet {
  const newLevel = character.level + 1
  const conMod = character.modifiers.constitution
  const hpGain = Math.floor(character.hitDie / 2) + 1 + conMod
  const maxHp = character.maxHitPoints + Math.max(1, hpGain)

  const spellSlots = getSpellSlots(newLevel, character.class.id)
  const profBonus = getProficiencyBonus(newLevel)

  const newFeatures = character.class.features.filter(f => f.level === newLevel)
  const allFeatures = [...character.features, ...newFeatures]

  return {
    ...character,
    level: newLevel,
    maxHitPoints: maxHp,
    hitPoints: maxHp,
    hitDieCurrent: newLevel,
    proficiencyBonus: profBonus,
    features: allFeatures,
    spellSlots,
  }
}
