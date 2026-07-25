export interface InventoryComponent extends Component {
  containers: Map<string, Container>;
  activeContainer: string;
  maxWeight: number;
  currentWeight: number;
  autoSort: boolean;
}

export interface Container {
  id: string;
  name: string;
  slots: Map<number, ItemStack>;
  maxSlots: number;
  maxWeight: number;
  type: ContainerType;
}

export type ContainerType = 'inventory' | 'bank' | 'chest' | 'trade' | 'crafting' | 'quest' | 'equipment';

export interface ItemStack {
  itemEntity: Entity;
  count: number;
  slot: number;
  metadata: Record<string, any>;
}

export interface ItemComponent extends Component {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  subtype: string;
  weight: number;
  value: number;
  stackSize: number;
  rarity: ItemRarity;
  levelRequired: number;
  stats: ItemStats;
  effects: ItemEffect[];
  tags: string[];
  icon: string;
  model: string;
}

export type ItemType = 
  | 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'currency' 
  | 'tool' | 'recipe' | 'gem' | 'container' | 'key' | 'book' | 'other';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'artifact';

export interface ItemStats {
  damage?: number;
  armor?: number;
  health?: number;
  mana?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  criticalChance?: number;
  criticalDamage?: number;
  attackSpeed?: number;
  movementSpeed?: number;
  [key: string]: number | undefined;
}

export interface ItemEffect {
  type: 'heal' | 'mana' | 'buff' | 'debuff' | 'teleport' | 'transform' | 'summon' | 'learn';
  value: number;
  duration: number;
  probability: number;
  conditions: string[];
}

export interface EquipmentComponent extends Component {
  slots: Map<EquipmentSlot, Entity>;
  setBonuses: Map<string, SetBonus>;
}

export type EquipmentSlot = 
  | 'head' | 'neck' | 'shoulders' | 'back' | 'chest' | 'wrist' | 'hands' | 'waist' | 'legs' | 'feet'
  | 'finger1' | 'finger2' | 'trinket1' | 'trinket2'
  | 'mainHand' | 'offHand' | 'ranged' | 'ammo'
  | 'tabard' | 'shirt' | 'tabard';

export interface SetBonus {
  setId: string;
  piecesEquipped: number;
  bonuses: ItemStats[];
}

export interface CraftingComponent extends Component {
  knownRecipes: Set<string>;
  professionLevels: Map<string, number>;
  activeRecipe: string | undefined;
  progress: number;
  specialization: string | undefined;
}

export interface Recipe {
  id: string;
  name: string;
  profession: string;
  levelRequired: number;
  ingredients: RecipeIngredient[];
  results: RecipeResult[];
  craftingTime: number;
  experience: number;
  stationRequired: string[];
  tags: string[];
}

export interface RecipeIngredient {
  itemId: string;
  count: number;
  consume: boolean;
  alternatives?: string[];
}

export interface RecipeResult {
  itemId: string;
  count: number;
  chance: number;
  qualityRange?: [number, number];
}