import { AttributeSet, getModifier, rollDice } from './dnd'

export interface MonsterAction {
  name: string
  description: string
  damageDice?: string
  attackBonus?: number
  damageType?: string
}

export interface MonsterTrait {
  name: string
  description: string
}

export interface MonsterLoot {
  goldMin: number
  goldMax: number
  items?: { name: string; chance: number; count?: number }[]
}

export interface MonsterSenses {
  darkvision?: number
  passivePerception: number
}

export interface Monster {
  name: string
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan'
  type: string
  armorClass: number
  hitPoints: number
  hitDice: string
  speed: number
  attributes: AttributeSet
  skills: Record<string, number>
  savingThrows: Partial<Record<keyof AttributeSet, number>>
  damageResistances: string[]
  damageImmunities: string[]
  conditionImmunities: string[]
  senses: MonsterSenses
  languages: string[]
  challengeRating: number
  xp: number
  traits: MonsterTrait[]
  actions: MonsterAction[]
  legendaryActions?: MonsterAction[]
  lootTable: MonsterLoot
}

export interface EncounterDifficulty {
  easy: number
  medium: number
  hard: number
  deadly: number
}

export const XP_BY_CR: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
}

export const XP_THRESHOLDS: Record<number, EncounterDifficulty> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
}

const ENCOUNTER_MULTIPLIERS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2,
  5: 2,
  6: 2,
  7: 2.5,
  8: 2.5,
  9: 2.5,
  10: 2.5,
  11: 3,
  12: 3,
  13: 3,
  14: 3,
  15: 4,
}

const MONSTERS: Monster[] = [
  {
    name: 'Bandit',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 12,
    hitPoints: 11,
    hitDice: '2d8+2',
    speed: 30,
    attributes: { strength: 11, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 10, charisma: 10 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { passivePerception: 10 },
    languages: ['Common'],
    challengeRating: 0.125,
    xp: 25,
    traits: [],
    actions: [
      { name: 'Scimitar', description: 'Melee Weapon Attack', damageDice: '1d6+1', attackBonus: 3, damageType: 'slashing' },
      { name: 'Light Crossbow', description: 'Ranged Weapon Attack', damageDice: '1d8+1', attackBonus: 3, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 2, goldMax: 8, items: [{ name: 'potion', chance: 0.3 }, { name: 'common weapon', chance: 0.15 }] },
  },
  {
    name: 'Kobold',
    size: 'Small',
    type: 'humanoid',
    armorClass: 12,
    hitPoints: 5,
    hitDice: '2d6-2',
    speed: 30,
    attributes: { strength: 7, dexterity: 15, constitution: 9, intelligence: 8, wisdom: 7, charisma: 8 },
    skills: { stealth: 4 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 8 },
    languages: ['Common', 'Draconic'],
    challengeRating: 0.125,
    xp: 25,
    traits: [
      { name: 'Pack Tactics', description: 'Has advantage on attack rolls against a creature if at least one ally is within 5 ft of the target.' },
      { name: 'Sunlight Sensitivity', description: 'Has disadvantage on attack rolls and Perception checks in direct sunlight.' },
    ],
    actions: [
      { name: 'Dagger', description: 'Melee Weapon Attack', damageDice: '1d4+2', attackBonus: 4, damageType: 'piercing' },
      { name: 'Sling', description: 'Ranged Weapon Attack', damageDice: '1d4+2', attackBonus: 4, damageType: 'bludgeoning' },
    ],
    lootTable: { goldMin: 1, goldMax: 4, items: [{ name: 'trinket', chance: 0.5 }] },
  },
  {
    name: 'Goblin',
    size: 'Small',
    type: 'humanoid',
    armorClass: 15,
    hitPoints: 7,
    hitDice: '2d6',
    speed: 30,
    attributes: { strength: 8, dexterity: 14, constitution: 10, intelligence: 10, wisdom: 8, charisma: 8 },
    skills: { stealth: 6 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 9 },
    languages: ['Common', 'Goblin'],
    challengeRating: 0.25,
    xp: 50,
    traits: [
      { name: 'Nimble Escape', description: 'Can take Disengage or Hide as a bonus action on each turn.' },
    ],
    actions: [
      { name: 'Scimitar', description: 'Melee Weapon Attack', damageDice: '1d6+2', attackBonus: 4, damageType: 'slashing' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack', damageDice: '1d6+2', attackBonus: 4, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 1, goldMax: 8, items: [{ name: 'trinket', chance: 0.4 }] },
  },
  {
    name: 'Skeleton',
    size: 'Medium',
    type: 'undead',
    armorClass: 13,
    hitPoints: 13,
    hitDice: '2d8+4',
    speed: 30,
    attributes: { strength: 10, dexterity: 14, constitution: 15, intelligence: 6, wisdom: 8, charisma: 5 },
    skills: {},
    savingThrows: {},
    damageResistances: ['piercing'],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60, passivePerception: 9 },
    languages: ['understands Common but cannot speak'],
    challengeRating: 0.25,
    xp: 50,
    traits: [],
    actions: [
      { name: 'Shortsword', description: 'Melee Weapon Attack', damageDice: '1d6+2', attackBonus: 4, damageType: 'piercing' },
      { name: 'Shortbow', description: 'Ranged Weapon Attack', damageDice: '1d6+2', attackBonus: 4, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 1, goldMax: 6, items: [{ name: 'bones', chance: 0.5 }, { name: 'rusty weapon', chance: 0.2 }] },
  },
  {
    name: 'Zombie',
    size: 'Medium',
    type: 'undead',
    armorClass: 8,
    hitPoints: 22,
    hitDice: '3d8+9',
    speed: 20,
    attributes: { strength: 13, dexterity: 6, constitution: 16, intelligence: 3, wisdom: 6, charisma: 5 },
    skills: {},
    savingThrows: { wisdom: 0 },
    damageResistances: [],
    damageImmunities: ['poison'],
    conditionImmunities: ['poisoned'],
    senses: { darkvision: 60, passivePerception: 8 },
    languages: ['understands Common but cannot speak'],
    challengeRating: 0.25,
    xp: 50,
    traits: [
      { name: 'Undead Fortitude', description: 'If damage reduces it to 0 HP, make a Con save DC 5+damage taken. On success, drops to 1 HP instead.' },
    ],
    actions: [
      { name: 'Slam', description: 'Melee Weapon Attack', damageDice: '1d6+1', attackBonus: 3, damageType: 'bludgeoning' },
    ],
    lootTable: { goldMin: 0, goldMax: 4, items: [{ name: 'rotten cloth', chance: 0.4 }] },
  },
  {
    name: 'Hobgoblin',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 18,
    hitPoints: 11,
    hitDice: '2d8+2',
    speed: 30,
    attributes: { strength: 13, dexterity: 12, constitution: 12, intelligence: 10, wisdom: 10, charisma: 9 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 10 },
    languages: ['Common', 'Goblin'],
    challengeRating: 0.5,
    xp: 100,
    traits: [
      { name: 'Martial Advantage', description: 'Once per turn, deals an extra 2d6 damage when an ally is within 5 ft of the target.' },
    ],
    actions: [
      { name: 'Longsword', description: 'Melee Weapon Attack', damageDice: '1d8+1', attackBonus: 3, damageType: 'slashing' },
      { name: 'Longbow', description: 'Ranged Weapon Attack', damageDice: '1d8+1', attackBonus: 3, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 5, goldMax: 20, items: [{ name: 'weapon', chance: 0.4 }, { name: 'shield', chance: 0.3 }] },
  },
  {
    name: 'Orc',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 13,
    hitPoints: 15,
    hitDice: '2d8+6',
    speed: 30,
    attributes: { strength: 16, dexterity: 12, constitution: 16, intelligence: 7, wisdom: 11, charisma: 10 },
    skills: { intimidation: 2 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 10 },
    languages: ['Common', 'Orc'],
    challengeRating: 0.5,
    xp: 100,
    traits: [
      { name: 'Aggressive', description: 'As a bonus action, can move up to its speed toward a hostile creature.' },
    ],
    actions: [
      { name: 'Greataxe', description: 'Melee Weapon Attack', damageDice: '1d12+3', attackBonus: 5, damageType: 'slashing' },
      { name: 'Javelin', description: 'Ranged Weapon Attack', damageDice: '1d6+3', attackBonus: 5, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 2, goldMax: 12, items: [{ name: 'weapon', chance: 0.5 }, { name: 'trophy', chance: 0.2 }] },
  },
  {
    name: 'Gnoll',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 15,
    hitPoints: 22,
    hitDice: '5d8',
    speed: 30,
    attributes: { strength: 14, dexterity: 12, constitution: 11, intelligence: 6, wisdom: 10, charisma: 7 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 10 },
    languages: ['Gnoll'],
    challengeRating: 1,
    xp: 200,
    traits: [
      { name: 'Rampage', description: 'When it reduces a creature to 0 HP, can take a bonus action to move half speed and make a bite attack.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '1d4+2', attackBonus: 4, damageType: 'piercing' },
      { name: 'Spear', description: 'Melee or Ranged Weapon Attack', damageDice: '1d6+2', attackBonus: 4, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 2, goldMax: 10, items: [{ name: 'bone jewelry', chance: 0.3 }] },
  },
  {
    name: 'Ghoul',
    size: 'Medium',
    type: 'undead',
    armorClass: 12,
    hitPoints: 22,
    hitDice: '5d8',
    speed: 30,
    attributes: { strength: 13, dexterity: 15, constitution: 10, intelligence: 7, wisdom: 10, charisma: 6 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: ['poison'],
    conditionImmunities: ['charmed', 'exhaustion', 'poisoned'],
    senses: { darkvision: 60, passivePerception: 10 },
    languages: ['Common'],
    challengeRating: 1,
    xp: 200,
    traits: [],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '1d6+1', attackBonus: 2, damageType: 'piercing' },
      { name: 'Claws', description: 'Melee Weapon Attack. DC 10 Con save or paralyzed for 1 minute.', damageDice: '2d4+2', attackBonus: 4, damageType: 'slashing' },
    ],
    lootTable: { goldMin: 1, goldMax: 8, items: [{ name: 'rotten cloth', chance: 0.5 }] },
  },
  {
    name: 'Giant Spider',
    size: 'Large',
    type: 'beast',
    armorClass: 14,
    hitPoints: 26,
    hitDice: '4d10+4',
    speed: 30,
    attributes: { strength: 14, dexterity: 16, constitution: 12, intelligence: 2, wisdom: 11, charisma: 4 },
    skills: { stealth: 7 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 10 },
    languages: [],
    challengeRating: 1,
    xp: 200,
    traits: [
      { name: 'Spider Climb', description: 'Can climb difficult surfaces, including ceilings, without ability checks.' },
      { name: 'Web Sense', description: 'While in contact with webs, knows exact location of any creature touching the same web.' },
      { name: 'Web Walker', description: 'Ignores movement restrictions caused by webbing.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack. DC 11 Con save or take 2d6 poison damage.', damageDice: '1d8+3', attackBonus: 5, damageType: 'piercing' },
      { name: 'Web', description: 'Ranged Weapon Attack. DC 12 Dex save or restrained by webbing.', attackBonus: 5, damageType: '' },
    ],
    lootTable: { goldMin: 2, goldMax: 10, items: [{ name: 'spider silk', chance: 0.6 }] },
  },
  {
    name: 'Ogre',
    size: 'Large',
    type: 'giant',
    armorClass: 11,
    hitPoints: 59,
    hitDice: '7d10+21',
    speed: 40,
    attributes: { strength: 19, dexterity: 8, constitution: 16, intelligence: 5, wisdom: 7, charisma: 7 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 8 },
    languages: ['Common', 'Giant'],
    challengeRating: 2,
    xp: 450,
    traits: [],
    actions: [
      { name: 'Greatclub', description: 'Melee Weapon Attack', damageDice: '2d8+4', attackBonus: 6, damageType: 'bludgeoning' },
      { name: 'Javelin', description: 'Ranged Weapon Attack', damageDice: '2d6+4', attackBonus: 6, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 5, goldMax: 30, items: [{ name: 'large weapon', chance: 0.5 }, { name: 'food', chance: 0.6 }] },
  },
  {
    name: 'Griffon',
    size: 'Large',
    type: 'monstrosity',
    armorClass: 12,
    hitPoints: 59,
    hitDice: '7d10+21',
    speed: 30,
    attributes: { strength: 18, dexterity: 15, constitution: 16, intelligence: 2, wisdom: 13, charisma: 8 },
    skills: { perception: 5 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 15 },
    languages: [],
    challengeRating: 2,
    xp: 450,
    traits: [
      { name: 'Keen Sight', description: 'Has advantage on Perception checks that rely on sight.' },
    ],
    actions: [
      { name: 'Multiattack', description: 'Makes two attacks: one with its beak and one with its claws.' },
      { name: 'Beak', description: 'Melee Weapon Attack', damageDice: '1d8+4', attackBonus: 6, damageType: 'piercing' },
      { name: 'Claws', description: 'Melee Weapon Attack', damageDice: '2d6+4', attackBonus: 6, damageType: 'slashing' },
    ],
    lootTable: { goldMin: 5, goldMax: 20, items: [{ name: 'griffon feathers', chance: 0.5 }] },
  },
  {
    name: 'Werewolf',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 12,
    hitPoints: 58,
    hitDice: '9d8+18',
    speed: 30,
    attributes: { strength: 15, dexterity: 13, constitution: 14, intelligence: 10, wisdom: 11, charisma: 10 },
    skills: { perception: 4, stealth: 3 },
    savingThrows: {},
    damageResistances: ['bludgeoning', 'piercing', 'slashing from non-silvered weapons'],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { passivePerception: 14 },
    languages: ['Common'],
    challengeRating: 3,
    xp: 700,
    traits: [
      { name: 'Keen Hearing and Smell', description: 'Has advantage on Perception checks that rely on hearing or smell.' },
      { name: 'Regeneration', description: 'Regains 10 HP at start of its turn unless damaged with silvered weapon.' },
      { name: 'Shapechanger', description: 'Can use action to polymorph into wolf-humanoid hybrid or wolf form.' },
    ],
    actions: [
      { name: 'Multiattack', description: 'Makes two attacks: one bite and one claws.' },
      { name: 'Bite', description: 'Melee Weapon Attack. DC 12 Con save or contract lycanthropy.', damageDice: '2d4+2', attackBonus: 4, damageType: 'piercing' },
      { name: 'Claws', description: 'Melee Weapon Attack', damageDice: '2d4+2', attackBonus: 4, damageType: 'slashing' },
    ],
    lootTable: { goldMin: 5, goldMax: 20, items: [{ name: 'silver trinket', chance: 0.3 }, { name: 'pelt', chance: 0.5 }] },
  },
  {
    name: 'Minotaur',
    size: 'Large',
    type: 'monstrosity',
    armorClass: 14,
    hitPoints: 76,
    hitDice: '9d10+27',
    speed: 40,
    attributes: { strength: 18, dexterity: 11, constitution: 16, intelligence: 6, wisdom: 16, charisma: 9 },
    skills: { perception: 7 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 17 },
    languages: ['Abyssal'],
    challengeRating: 3,
    xp: 700,
    traits: [
      { name: 'Charge', description: 'If moves 10+ ft toward target, gore attack deals 2d8 extra damage.' },
      { name: 'Labyrinthine Recall', description: 'Can perfectly recall any path it has traveled.' },
      { name: 'Reckless', description: 'At start of turn, can gain advantage on melee attacks but attacks against it have advantage.' },
    ],
    actions: [
      { name: 'Greataxe', description: 'Melee Weapon Attack', damageDice: '2d12+4', attackBonus: 6, damageType: 'slashing' },
      { name: 'Gore', description: 'Melee Weapon Attack', damageDice: '2d8+4', attackBonus: 6, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 10, goldMax: 40, items: [{ name: 'large weapon', chance: 0.5 }, { name: 'horn', chance: 0.8 }] },
  },
  {
    name: 'Basilisk',
    size: 'Medium',
    type: 'monstrosity',
    armorClass: 15,
    hitPoints: 52,
    hitDice: '8d8+16',
    speed: 20,
    attributes: { strength: 16, dexterity: 8, constitution: 15, intelligence: 2, wisdom: 8, charisma: 7 },
    skills: {},
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 9 },
    languages: [],
    challengeRating: 3,
    xp: 700,
    traits: [
      { name: 'Petrifying Gaze', description: 'If a creature starts its turn within 30 ft and sees the basilisk, DC 12 Con save or restrained. Failing 2 saves causes petrification.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '2d6+3', attackBonus: 5, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 5, goldMax: 25, items: [{ name: 'petrified remains', chance: 0.4 }] },
  },
  {
    name: 'Hell Hound',
    size: 'Medium',
    type: 'fiend',
    armorClass: 15,
    hitPoints: 45,
    hitDice: '7d8+14',
    speed: 50,
    attributes: { strength: 17, dexterity: 12, constitution: 14, intelligence: 6, wisdom: 13, charisma: 6 },
    skills: { perception: 5, stealth: 3 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: ['fire'],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 15 },
    languages: ['understands Infernal but cannot speak'],
    challengeRating: 3,
    xp: 700,
    traits: [
      { name: 'Keen Hearing and Smell', description: 'Has advantage on Perception checks that rely on hearing or smell.' },
      { name: 'Pack Tactics', description: 'Has advantage on attack rolls if an ally is within 5 ft of target.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '1d8+3', attackBonus: 5, damageType: 'piercing' },
      { name: 'Fire Breath', description: 'Recharge 5-6. 15 ft cone, DC 12 Dex save for half.', damageDice: '4d6', attackBonus: 0, damageType: 'fire' },
    ],
    lootTable: { goldMin: 5, goldMax: 20, items: [{ name: 'infernal item', chance: 0.3 }] },
  },
  {
    name: 'Wight',
    size: 'Medium',
    type: 'undead',
    armorClass: 14,
    hitPoints: 45,
    hitDice: '6d8+18',
    speed: 30,
    attributes: { strength: 15, dexterity: 14, constitution: 16, intelligence: 10, wisdom: 13, charisma: 15 },
    skills: { perception: 3, stealth: 4 },
    savingThrows: {},
    damageResistances: ['necrotic', 'bludgeoning', 'piercing', 'slashing from nonmagical weapons'],
    damageImmunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'],
    senses: { darkvision: 60, passivePerception: 13 },
    languages: ['Common'],
    challengeRating: 3,
    xp: 700,
    traits: [
      { name: 'Sunlight Sensitivity', description: 'Has disadvantage on attack rolls and Perception checks in direct sunlight.' },
    ],
    actions: [
      { name: 'Multiattack', description: 'Makes two longsword attacks or two longbow attacks.' },
      { name: 'Life Drain', description: 'Melee Weapon Attack. DC 13 Con save or max HP reduced by necrotic damage.', damageDice: '1d6+2', attackBonus: 4, damageType: 'necrotic' },
      { name: 'Longsword', description: 'Melee Weapon Attack', damageDice: '1d8+2', attackBonus: 4, damageType: 'slashing' },
      { name: 'Longbow', description: 'Ranged Weapon Attack', damageDice: '1d8+2', attackBonus: 4, damageType: 'piercing' },
    ],
    lootTable: { goldMin: 5, goldMax: 30, items: [{ name: 'weapon', chance: 0.4 }] },
  },
  {
    name: 'Vampire Spawn',
    size: 'Medium',
    type: 'undead',
    armorClass: 15,
    hitPoints: 82,
    hitDice: '11d8+33',
    speed: 30,
    attributes: { strength: 16, dexterity: 16, constitution: 16, intelligence: 11, wisdom: 10, charisma: 12 },
    skills: { perception: 3, stealth: 6 },
    savingThrows: { dexterity: 6, wisdom: 3, charisma: 4 },
    damageResistances: ['necrotic', 'bludgeoning', 'piercing', 'slashing from nonmagical weapons'],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 13 },
    languages: ['Common'],
    challengeRating: 5,
    xp: 1800,
    traits: [
      { name: 'Regeneration', description: 'Regains 10 HP at start of turn if not in sunlight or running water.' },
      { name: 'Spider Climb', description: 'Can climb difficult surfaces, including ceilings, without ability checks.' },
      { name: 'Vampire Weaknesses', description: 'Takes 20 radiant damage in sunlight, cannot enter residence without invitation.' },
    ],
    actions: [
      { name: 'Multiattack', description: 'Makes two attacks: one bite and one claws.' },
      { name: 'Bite', description: 'Melee Weapon Attack. HP maximum reduced by necrotic damage. Target dies if HP max reaches 0.', damageDice: '1d6+3', attackBonus: 6, damageType: 'piercing' },
      { name: 'Claws', description: 'Melee Weapon Attack', damageDice: '2d4+3', attackBonus: 6, damageType: 'slashing' },
    ],
    lootTable: { goldMin: 10, goldMax: 50, items: [{ name: 'fine clothes', chance: 0.5 }, { name: 'gem', chance: 0.3 }] },
  },
  {
    name: 'Mage',
    size: 'Medium',
    type: 'humanoid',
    armorClass: 12,
    hitPoints: 40,
    hitDice: '9d8',
    speed: 30,
    attributes: { strength: 9, dexterity: 14, constitution: 11, intelligence: 17, wisdom: 12, charisma: 11 },
    skills: { arcana: 6, history: 6 },
    savingThrows: { intelligence: 6, wisdom: 4 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { passivePerception: 11 },
    languages: ['Common', 'Draconic'],
    challengeRating: 6,
    xp: 2300,
    traits: [
      { name: 'Spellcasting', description: '9th-level spellcaster. Spell save DC 14, spell attack +6.' },
    ],
    actions: [
      { name: 'Dagger', description: 'Melee or Ranged Weapon Attack', damageDice: '1d4+2', attackBonus: 5, damageType: 'piercing' },
      { name: 'Fireball', description: '20 ft radius. DC 14 Dex save for half.', damageDice: '8d6', attackBonus: 0, damageType: 'fire' },
      { name: 'Magic Missile', description: 'Three darts hit automatically.', damageDice: '3d4+3', attackBonus: 0, damageType: 'force' },
    ],
    lootTable: { goldMin: 10, goldMax: 40, items: [{ name: 'spell scroll', chance: 0.5 }, { name: 'mana potion', chance: 0.4 }, { name: 'arcane focus', chance: 0.3 }] },
  },
  {
    name: 'Chimera',
    size: 'Large',
    type: 'monstrosity',
    armorClass: 14,
    hitPoints: 114,
    hitDice: '12d10+48',
    speed: 30,
    attributes: { strength: 19, dexterity: 11, constitution: 19, intelligence: 3, wisdom: 14, charisma: 10 },
    skills: { perception: 8 },
    savingThrows: {},
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 18 },
    languages: ['understands Draconic but cannot speak'],
    challengeRating: 6,
    xp: 2300,
    traits: [],
    actions: [
      { name: 'Multiattack', description: 'Makes three attacks: bite, horns, and claws.' },
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '2d6+4', attackBonus: 7, damageType: 'piercing' },
      { name: 'Horns', description: 'Melee Weapon Attack', damageDice: '1d12+4', attackBonus: 7, damageType: 'bludgeoning' },
      { name: 'Claws', description: 'Melee Weapon Attack', damageDice: '2d6+4', attackBonus: 7, damageType: 'slashing' },
      { name: 'Fire Breath', description: 'Recharge 5-6. 15 ft cone. DC 15 Dex save for half.', damageDice: '6d8', attackBonus: 0, damageType: 'fire' },
    ],
    lootTable: { goldMin: 20, goldMax: 80, items: [{ name: 'dragon horn', chance: 0.6 }, { name: 'lion pelt', chance: 0.4 }] },
  },
  {
    name: 'Mind Flayer',
    size: 'Medium',
    type: 'aberration',
    armorClass: 15,
    hitPoints: 71,
    hitDice: '13d8+13',
    speed: 30,
    attributes: { strength: 11, dexterity: 12, constitution: 12, intelligence: 19, wisdom: 17, charisma: 17 },
    skills: { arcana: 7, deception: 6, insight: 6, perception: 6, persuasion: 6, stealth: 4 },
    savingThrows: { intelligence: 7, wisdom: 6, charisma: 6 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: [],
    senses: { darkvision: 120, passivePerception: 16 },
    languages: ['Deep Speech', 'Undercommon', 'telepathy 120 ft'],
    challengeRating: 7,
    xp: 2900,
    traits: [
      { name: 'Magic Resistance', description: 'Has advantage on saving throws against spells and magical effects.' },
      { name: 'Innate Spellcasting', description: 'Can cast detect thoughts, levitate, and shield at will. Dominate monster 1/day.' },
    ],
    actions: [
      { name: 'Tentacles', description: 'Melee Weapon Attack. Grappled target must make DC 15 Int save or have brain extracted.', damageDice: '2d8+2', attackBonus: 7, damageType: 'psychic' },
      { name: 'Mind Blast', description: 'Recharge 5-6. 60 ft cone. DC 15 Int save or stunned for 1 minute.', damageDice: '4d8', attackBonus: 0, damageType: 'psychic' },
    ],
    lootTable: { goldMin: 20, goldMax: 80, items: [{ name: 'psionic crystal', chance: 0.6 }, { name: 'brain jar', chance: 0.3 }] },
  },
  {
    name: 'Young Red Dragon',
    size: 'Large',
    type: 'dragon',
    armorClass: 18,
    hitPoints: 178,
    hitDice: '17d10+85',
    speed: 40,
    attributes: { strength: 23, dexterity: 10, constitution: 21, intelligence: 14, wisdom: 11, charisma: 19 },
    skills: { perception: 8, stealth: 4 },
    savingThrows: { dexterity: 4, constitution: 9, wisdom: 4, charisma: 8 },
    damageResistances: [],
    damageImmunities: ['fire'],
    conditionImmunities: [],
    senses: { darkvision: 120, passivePerception: 18 },
    languages: ['Common', 'Draconic'],
    challengeRating: 10,
    xp: 5900,
    traits: [],
    actions: [
      { name: 'Multiattack', description: 'Makes three attacks: one bite and two claws.' },
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '2d10+6', attackBonus: 10, damageType: 'piercing' },
      { name: 'Claw', description: 'Melee Weapon Attack', damageDice: '2d6+6', attackBonus: 10, damageType: 'slashing' },
      { name: 'Fire Breath', description: 'Recharge 5-6. 30 ft cone. DC 17 Dex save for half.', damageDice: '16d6', attackBonus: 0, damageType: 'fire' },
    ],
    lootTable: { goldMin: 100, goldMax: 400, items: [{ name: 'dragon scale', chance: 0.8 }, { name: 'magic item', chance: 0.4 }, { name: 'gem', chance: 0.6 }] },
  },
  {
    name: 'Beholder',
    size: 'Large',
    type: 'aberration',
    armorClass: 18,
    hitPoints: 180,
    hitDice: '19d10+76',
    speed: 20,
    attributes: { strength: 10, dexterity: 14, constitution: 18, intelligence: 17, wisdom: 15, charisma: 19 },
    skills: { perception: 12 },
    savingThrows: { intelligence: 8, wisdom: 7, charisma: 9 },
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: ['prone'],
    senses: { darkvision: 120, passivePerception: 22 },
    languages: ['Deep Speech', 'Undercommon'],
    challengeRating: 13,
    xp: 10000,
    traits: [
      { name: 'Antimagic Cone', description: 'All magic and magical effects within 150 ft cone from the central eye are suppressed.' },
      { name: 'Legendary Resistance', description: '3/day. If fails a saving throw, can choose to succeed instead.' },
    ],
    actions: [
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '4d10', attackBonus: 5, damageType: 'piercing' },
      { name: 'Eye Rays', description: 'Fires 3 random eye rays from 10 options at targets within 120 ft.' },
    ],
    legendaryActions: [
      { name: 'Eye Ray', description: 'Uses one random eye ray effect.' },
      { name: 'Skewer', description: 'Melee weapon attack with bite against one target.' },
    ],
    lootTable: { goldMin: 100, goldMax: 500, items: [{ name: 'beholder eye', chance: 0.9 }, { name: 'magic item', chance: 0.6 }, { name: 'gem', chance: 0.7 }] },
  },
  {
    name: 'Ancient Red Dragon',
    size: 'Gargantuan',
    type: 'dragon',
    armorClass: 22,
    hitPoints: 546,
    hitDice: '28d20+252',
    speed: 40,
    attributes: { strength: 30, dexterity: 10, constitution: 29, intelligence: 18, wisdom: 15, charisma: 23 },
    skills: { perception: 16, stealth: 7 },
    savingThrows: { dexterity: 7, constitution: 16, wisdom: 9, charisma: 13 },
    damageResistances: [],
    damageImmunities: ['fire'],
    conditionImmunities: [],
    senses: { darkvision: 60, passivePerception: 26 },
    languages: ['Common', 'Draconic'],
    challengeRating: 24,
    xp: 62000,
    traits: [
      { name: 'Legendary Resistance', description: '3/day. If fails a saving throw, can choose to succeed instead.' },
    ],
    actions: [
      { name: 'Multiattack', description: 'Can use Frightful Presence then makes three attacks: bite, claw, tail.' },
      { name: 'Bite', description: 'Melee Weapon Attack', damageDice: '2d10+10', attackBonus: 17, damageType: 'piercing' },
      { name: 'Claw', description: 'Melee Weapon Attack', damageDice: '2d6+10', attackBonus: 17, damageType: 'slashing' },
      { name: 'Tail', description: 'Melee Weapon Attack', damageDice: '2d8+10', attackBonus: 17, damageType: 'bludgeoning' },
      { name: 'Fire Breath', description: 'Recharge 5-6. 90 ft cone. DC 24 Dex save for half.', damageDice: '26d6', attackBonus: 0, damageType: 'fire' },
    ],
    legendaryActions: [
      { name: 'Detect', description: 'Makes a Perception check.' },
      { name: 'Tail Attack', description: 'Makes a tail attack.' },
      { name: 'Wing Attack', description: 'Beats wings. DC 24 Dex or knocked prone. Can then fly up to half speed.', damageDice: '2d6+10', attackBonus: 17, damageType: 'bludgeoning' },
    ],
    lootTable: { goldMin: 1000, goldMax: 5000, items: [{ name: 'dragon hoard', chance: 1.0 }, { name: 'legendary item', chance: 0.6 }, { name: 'dragon scale', chance: 1.0 }] },
  },
]

function getMultiplier(count: number): number {
  if (count <= 1) return 1
  if (count === 2) return 1.5
  if (count <= 6) return 2
  if (count <= 10) return 2.5
  if (count <= 14) return 3
  return 4
}

export function getMonsterStats(name: string): Monster | undefined {
  return MONSTERS.find(m => m.name.toLowerCase() === name.toLowerCase())
}

export function getMonstersByCR(minCR: number, maxCR: number): Monster[] {
  return MONSTERS.filter(m => m.challengeRating >= minCR && m.challengeRating <= maxCR)
}

export function getMonstersByType(type: string): Monster[] {
  return MONSTERS.filter(m => m.type.toLowerCase() === type.toLowerCase())
}

export function calculateMonsterXP(monster: Monster): number {
  return monster.xp
}

export function generateMonsterLoot(monster: Monster): { gold: number; items: string[] } {
  const gold = Math.floor(Math.random() * (monster.lootTable.goldMax - monster.lootTable.goldMin + 1)) + monster.lootTable.goldMin
  const items: string[] = []
  if (monster.lootTable.items) {
    for (const entry of monster.lootTable.items) {
      if (Math.random() < entry.chance) {
        const count = entry.count ?? 1
        for (let i = 0; i < count; i++) {
          items.push(entry.name)
        }
      }
    }
  }
  return { gold, items }
}

function parseHitDice(hitDice: string): { count: number; sides: number; bonus: number } {
  const match = hitDice.match(/^(\d+)d(\d+)(?:\+(\d+))?$/)
  if (!match) return { count: 0, sides: 0, bonus: 0 }
  return {
    count: parseInt(match[1], 10),
    sides: parseInt(match[2], 10),
    bonus: parseInt(match[3], 10) || 0,
  }
}

export function rollMonsterHP(monster: Monster): number {
  const { count, sides, bonus } = parseHitDice(monster.hitDice)
  if (count === 0) return monster.hitPoints
  const rolls = rollDice(count, sides)
  return rolls.reduce((sum, r) => sum + r, 0) + bonus
}

function pickForEncounter(budget: number, usedCRs: Set<number>): Monster | null {
  const candidates = MONSTERS.filter(m => {
    if (usedCRs.has(m.challengeRating)) return false
    const adjusted = m.xp * getMultiplier(1)
    return adjusted <= budget
  })
  if (candidates.length === 0) return null
  candidates.sort((a, b) => b.xp - a.xp)
  return candidates[0]
}

export function generateEncounter(
  partyLevel: number,
  partySize: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly'
): Monster[] {
  const thresholds = XP_THRESHOLDS[Math.min(partyLevel, 20)]
  if (!thresholds) return []
  const perChar = thresholds[difficulty]
  const totalBudget = perChar * partySize
  const maxMonsterCR = Math.min(partyLevel + (difficulty === 'deadly' ? 4 : difficulty === 'hard' ? 3 : 2), 30)
  const pool = MONSTERS.filter(m => m.challengeRating <= maxMonsterCR)
  const attempts = 50
  let best: Monster[] = []
  let bestAdjusted = 0
  for (let attempt = 0; attempt < attempts; attempt++) {
    const selected: Monster[] = []
    const usedCRs = new Set<number>()
    let remaining = totalBudget
    const maxMonsters = Math.min(partySize * 2, 15)
    while (selected.length < maxMonsters) {
      const crPool = pool.filter(m => {
        if (usedCRs.has(m.challengeRating)) return false
        const testCount = selected.length + 1
        const mult = getMultiplier(testCount)
        return m.xp * mult <= remaining
      })
      if (crPool.length === 0) break
      const weighted = crPool.flatMap(m => {
        const copies = Math.max(1, Math.round(m.xp / 100))
        return Array(copies).fill(m)
      })
      const pick = weighted[Math.floor(Math.random() * weighted.length)]
      selected.push(pick)
      usedCRs.add(pick.challengeRating)
      const mult = getMultiplier(selected.length)
      const totalXP = selected.reduce((s, m) => s + m.xp, 0)
      remaining = totalBudget - totalXP * mult
      if (remaining <= 0) break
    }
    if (selected.length === 0) continue
    const mult = getMultiplier(selected.length)
    const adjusted = selected.reduce((s, m) => s + m.xp, 0) * mult
    const diff = Math.abs(adjusted - totalBudget)
    if (diff < Math.abs(bestAdjusted - totalBudget) || bestAdjusted === 0) {
      best = selected
      bestAdjusted = adjusted
    }
  }
  return best
}
