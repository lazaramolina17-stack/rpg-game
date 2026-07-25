import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

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

export type ContainerType = 'inventory' | 'bank' | 'trade' | 'crafting' | 'loot' | 'equipment';

export interface ItemStack {
  itemEntity: Entity;
  count: number;
  slot: number;
  metadata?: ItemMetadata;
}

export interface ItemMetadata {
  durability?: number;
  maxDurability?: number;
  enchantments?: Enchantment[];
  craftedBy?: string;
  bound?: boolean;
  quality?: number;
}

export interface Enchantment {
  id: string;
  level: number;
  properties: Map<string, number>;
}

export interface CurrencyComponent extends Component {
  currencies: Map<string, number>;
  primaryCurrency: string;
}

export interface CraftingComponent extends Component {
  knownRecipes: Set<string>;
  professionLevels: Map<string, number>;
  activeRecipe?: string;
  progress: number;
}

export interface Recipe {
  id: string;
  name: string;
  profession: string;
  levelRequired: number;
  ingredients: RecipeIngredient[];
  results: RecipeResult[];
  craftingTime: number;
  stationRequired?: string;
  experience: number;
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

export interface EconomyModule implements Module {
  name: 'economy';
  version: '1.0.0';
  dependencies: ['core', 'rpg'];
}

export class InventoryModule implements Module {
  name = 'inventory';
  version = '1.0.0';
  dependencies = ['core', 'rpg'];

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new InventorySystem());
    ctx.world.addSystem(new ContainerSystem());
    ctx.world.addSystem(new CraftingSystem());
    ctx.logger.info('Inventory module initialized');
  }

  async shutdown(): Promise<void> {}
}

export class InventorySystem implements System {
  world!: World;
  enabled = true;
  priority = 50;

  update(dt: number): void {}

  addItem(entity: Entity, itemEntity: Entity, count: number = 1, containerId = 1): boolean {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    const item = this.world.getComponent<ItemComponent>(itemEntity, 'ItemComponent');
    if (!inventory || !item) return false;

    const container = inventory.containers.get(inventory.activeContainer);
    if (!container) return false;

    const itemWeight = item.weight * count;
    if (inventory.currentWeight + itemWeight > inventory.maxWeight) return false;

    let remaining = count;
    
    for (const [slot, stack] of container.slots) {
      if (stack.itemEntity === itemEntity && stack.count < item.stackSize && this.stacksMatch(stack, itemEntity)) {
        const canAdd = Math.min(remaining, item.stackSize - stack.count);
        stack.count += canAdd;
        remaining -= canAdd;
        if (remaining === 0) break;
      }
    }

    if (remaining > 0) {
      const emptySlots = this.findEmptySlots(container, remaining, item.stackSize);
      if (emptySlots.length === 0) return false;

      for (const slot of emptySlots) {
        const addCount = Math.min(remaining, item.stackSize);
        container.slots.set(slot, {
          itemEntity,
          count: addCount,
          slot,
          metadata: {}
        });
        remaining -= addCount;
        if (remaining === 0) break;
      }
    }

    inventory.currentWeight += (count - remaining) * item.weight;
    this.world.emit('inventory:changed', { entity, container: containerId });
    return remaining === 0;
  }

  removeItem(entity: Entity, itemEntity: Entity, count: number, containerId?: string): boolean {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory) return false;

    const container = inventory.containers.get(containerId ?? inventory.activeContainer);
    if (!container) return false;

    let remaining = count;
    for (const [slot, stack] of container.slots) {
      if (stack.itemEntity === itemEntity && this.stacksMatch(stack, itemEntity)) {
        const remove = Math.min(remaining, stack.count);
        stack.count -= remove;
        remaining -= remove;
        
        const item = this.world.getComponent<ItemComponent>(itemEntity, 'ItemComponent');
        if (item) {
          inventory.currentWeight -= remove * item.weight;
        }

        if (stack.count === 0) container.slots.delete(slot);
        if (remaining === 0) break;
      }
    }

    if (remaining < count) {
      this.world.emit('inventory:changed', { entity, container: containerId ?? inventory.activeContainer });
      return true;
    }
    return false;
  }

  hasItem(entity: Entity, itemId: string, count: number = 1): boolean {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory) return false;

    let found = 0;
    for (const container of inventory.containers.values()) {
      for (const stack of container.slots.values()) {
        const item = this.world.getComponent<ItemComponent>(stack.itemEntity, 'ItemComponent');
        if (item?.id === itemId) {
          found += stack.count;
          if (found >= count) return true;
        }
      }
    }
    return false;
  }

  getItemCount(entity: Entity, itemId: string): number {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory) return 0;

    let count = 0;
    for (const container of inventory.containers.values()) {
      for (const stack of container.slots.values()) {
        const item = this.world.getComponent<ItemComponent>(stack.itemEntity, 'ItemComponent');
        if (item?.id === itemId) count += stack.count;
      }
    }
    return count;
  }

  transferItem(fromEntity: Entity, toEntity: Entity, itemEntity: Entity, count: number, fromContainer?: string, toContainer?: string): boolean {
    if (this.removeItem(fromEntity, itemEntity, count, fromContainer)) {
      return this.addItem(toEntity, itemEntity, count, toContainer);
    }
    return false;
  }

  private stacksMatch(stack: ItemStack, itemEntity: Entity): boolean {
    return stack.itemEntity === itemEntity;
  }

  private findEmptySlots(container: Container, count: number, stackSize: number): number[] {
    const slots: number[] = [];
    const needed = Math.ceil(count / stackSize);
    
    for (let i = 0; i < container.maxSlots && slots.length < needed; i++) {
      if (!container.slots.has(i)) slots.push(i);
    }
    return slots;
  }
}

export class ContainerSystem implements System {
  world!: World;
  enabled = true;
  priority = 40;

  update(dt: number): void {}

  createContainer(entity: Entity, id: string, name: string, maxSlots: number, maxWeight: number, type: ContainerType): Container {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory) throw new Error('No inventory component');

    const container: Container = {
      id,
      name,
      slots: new Map(),
      maxSlots,
      maxWeight,
      type
    };

    inventory.containers.set(id, container);
    return container;
  }

  openContainer(entity: Entity, containerId: string): boolean {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory || !inventory.containers.has(containerId)) return false;
    
    inventory.activeContainer = containerId;
    return true;
  }

  closeContainer(entity: Entity): void {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (inventory) inventory.activeContainer = 'inventory';
  }
}

export class CraftingSystem implements System {
  world!: World;
  enabled = true;
  priority = 30;

  private recipes = new Map<string, Recipe>();

  update(dt: number): void {
    const crafters = this.world.query({ all: ['CraftingComponent'] });
    for (const entity of crafters) {
      this.updateCrafting(entity, dt);
    }
  }

  registerRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  getRecipe(id: string): Recipe | undefined {
    return this.recipes.get(id);
  }

  getRecipesForProfession(profession: string): Recipe[] {
    return Array.from(this.recipes.values()).filter(r => r.profession === profession);
  }

  startCrafting(entity: Entity, recipeId: string): boolean {
    const crafting = this.world.getComponent<CraftingComponent>(entity, 'CraftingComponent');
    const recipe = this.recipes.get(recipeId);
    if (!crafting || !recipe) return false;

    if (!this.canCraft(entity, recipe)) return false;

    if (!this.consumeIngredients(entity, recipe)) return false;

    crafting.activeRecipe = recipeId;
    crafting.progress = 0;
    return true;
  }

  private updateCrafting(entity: Entity, dt: number): void {
    const crafting = this.world.getComponent<CraftingComponent>(entity, 'CraftingComponent');
    if (!crafting || !crafting.activeRecipe) return;

    const recipe = this.recipes.get(crafting.activeRecipe)!;
    crafting.progress += dt;

    if (crafting.progress >= recipe.craftingTime) {
      this.completeCrafting(entity, recipe);
      crafting.activeRecipe = undefined;
      crafting.progress = 0;
    }
  }

  private canCraft(entity: Entity, recipe: Recipe): boolean {
    const crafting = this.world.getComponent<CraftingComponent>(entity, 'CraftingComponent');
    if (!crafting) return false;

    if (!crafting.knownRecipes.has(recipe.id)) return false;
    if ((crafting.professionLevels.get(recipe.profession) ?? 0) < recipe.levelRequired) return false;

    for (const ing of recipe.ingredients) {
      const has = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
      if (!has) return false;
      let found = 0;
      for (const container of has.containers.values()) {
        for (const stack of container.slots.values()) {
          const item = this.world.getComponent<ItemComponent>(stack.itemEntity, 'ItemComponent');
          if (item?.id === ing.itemId || ing.alternatives?.includes(item?.id ?? '')) {
            found += stack.count;
          }
        }
      }
      if (found < ing.count) return false;
    }
    return true;
  }

  private consumeIngredients(entity: Entity, recipe: Recipe): boolean {
    const inventory = this.world.getComponent<InventoryComponent>(entity, 'InventoryComponent');
    if (!inventory) return false;

    for (const ing of recipe.ingredients) {
      if (ing.consume) {
        const sys = this.world.getSystem(InventorySystem);
        if (sys && !sys.removeItem(entity, null, ing.count)) return false;
      }
    }
    return true;
  }

  private completeCrafting(entity: Entity, recipe: Recipe): void {
    const crafting = this.world.getComponent<CraftingComponent>(entity, 'CraftingComponent');
    if (!crafting) return;

    for (const result of recipe.results) {
      if (Math.random() < result.chance) {
        const quality = result.qualityRange 
          ? result.qualityRange[0] + Math.random() * (result.qualityRange[1] - result.qualityRange[0])
          : 1;
        
        this.createItem(entity, result.itemId, result.count, quality);
      }
    }

    if (crafting.professionLevels.has(recipe.profession)) {
      crafting.professionLevels.set(recipe.profession, crafting.professionLevels.get(recipe.profession)! + recipe.experience);
    } else {
      crafting.professionLevels.set(recipe.profession, recipe.experience);
    }

    this.world.emit('crafting:complete', { entity, recipe: recipe.id });
  }

  private createItem(entity: Entity, itemId: string, count: number, quality: number): void {
    // Implementation depends on item factory
  }
}