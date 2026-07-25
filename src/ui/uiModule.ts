import { Module } from '../core/module.js';
import { World, Entity, Component, System } from '../core/ecs.js';

export interface UIComponent extends Component {
  elements: Map<string, UIElement>;
  activeScreen: string | null;
  focusElement: string | null;
  scale: number;
  language: string;
}

export interface UIElement {
  id: string;
  type: UIElementType;
  parent: string | null;
  children: string[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  anchor: Anchor;
  pivot: { x: number; y: number };
  visible: boolean;
  enabled: boolean;
  style: UIStyle;
  data: Record<string, any>;
  events: Map<string, UIEventHandler[]>;
}

export type UIElementType = 
  | 'panel' | 'button' | 'label' | 'image' | 'progress_bar' | 'slider'
  | 'input' | 'dropdown' | 'list' | 'grid' | 'tab' | 'window' | 'tooltip'
  | 'inventory_slot' | 'skill_button' | 'quest_tracker' | 'minimap' | 'chat';

export type Anchor = 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface UIStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll';
  cursor?: string;
  transition?: string;
  [key: string]: any;
}

export interface UIEventHandler {
  event: string;
  handler: (event: UIEvent) => void;
  once?: boolean;
}

export interface UIEvent {
  type: string;
  element: UIElement;
  target: UIElement;
  position: { x: number; y: number };
  nativeEvent?: any;
  prevented: boolean;
  stopped: boolean;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface ScreenData {
  id: string;
  name: string;
  elements: UIElement[];
  onOpen?: () => void;
  onClose?: () => void;
  onUpdate?: (dt: number) => void;
}

export interface HUDData {
  health: { current: number; max: number };
  mana: { current: number; max: number };
  stamina: { current: number; max: number };
  experience: { current: number; max: number; level: number };
  target: { name: string; health: number; maxHealth: number; level: number } | null;
  buffs: BuffDisplay[];
  debuffs: BuffDisplay[];
  actionBar: ActionButton[];
}

export interface BuffDisplay {
  id: string;
  icon: string;
  duration: number;
  maxDuration: number;
  stacks: number;
  type: 'buff' | 'debuff';
}

export interface ActionButton {
  slot: number;
  abilityId: string;
  icon: string;
  cooldown: number;
  maxCooldown: number;
  charges: number;
  maxCharges: number;
  usable: boolean;
  range: number;
  inRange: boolean;
}

export class UIModule implements Module {
  name = 'ui';
  version = '1.0.0';
  dependencies = ['core'];

  private screens = new Map<string, ScreenData>();
  private hudData: HUDData = this.createEmptyHUD();

  async initialize(ctx: any): Promise<void> {
    ctx.world.addSystem(new UISystem(this));
    ctx.world.addSystem(new HUDSystem(this));
    this.registerDefaultScreens();
    ctx.logger.info('UI module initialized');
  }

  async shutdown(): Promise<void> {}

  registerScreen(screen: ScreenData): void {
    this.screens.set(screen.id, screen);
  }

  getScreen(id: string): ScreenData | undefined {
    return this.screens.get(id);
  }

  openScreen(entity: Entity, screenId: string): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    if (ui) {
      const screen = this.screens.get(screenId);
      if (screen) {
        ui.activeScreen = screenId;
        screen.onOpen?.();
      }
    }
  }

  closeScreen(entity: Entity): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    if (ui && ui.activeScreen) {
      const screen = this.screens.get(ui.activeScreen);
      screen?.onClose?.();
      ui.activeScreen = null;
    }
  }

  updateHUD(entity: Entity, data: Partial<HUDData>): void {
    this.hudData = { ...this.hudData, ...data };
  }

  getHUD(): HUDData {
    return { ...this.hudData };
  }

  addElement(entity: Entity, parentId: string | null, element: UIElement): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    if (ui) {
      ui.elements.set(element.id, element);
      if (parentId) {
        const parent = ui.elements.get(parentId);
        if (parent) parent.children.push(element.id);
      }
      element.parent = parentId;
    }
  }

  removeElement(entity: Entity, elementId: string): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    if (ui) {
      const element = ui.elements.get(elementId);
      if (element) {
        if (element.parent) {
          const parent = ui.elements.get(element.parent);
          if (parent) parent.children = parent.children.filter(c => c !== elementId);
        }
        for (const childId of element.children) {
          this.removeElement(entity, childId);
        }
        ui.elements.delete(elementId);
      }
    }
  }

  setElementStyle(entity: Entity, elementId: string, style: Partial<UIStyle>): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    const element = ui?.elements.get(elementId);
    if (element) element.style = { ...element.style, ...style };
  }

  setElementData(entity: Entity, elementId: string, data: Record<string, any>): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    const element = ui?.elements.get(elementId);
    if (element) element.data = { ...element.data, ...data };
  }

  onEntityClick(entity: Entity, elementId: string, handler: (event: UIEvent) => void): void {
    const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
    const element = ui?.elements.get(elementId);
    if (element) {
      const handlers = element.events.get('click') || [];
      handlers.push({ event: 'click', handler });
      element.events.set('click', handlers);
    }
  }

  private registerDefaultScreens(): void {
    this.registerScreen({
      id: 'main_menu',
      name: 'Main Menu',
      elements: []
    });

    this.registerScreen({
      id: 'character_select',
      name: 'Character Select',
      elements: []
    });

    this.registerScreen({
      id: 'inventory',
      name: 'Inventory',
      elements: []
    });

    this.registerScreen({
      id: 'character_sheet',
      name: 'Character Sheet',
      elements: []
    });

    this.registerScreen({
      id: 'quest_log',
      name: 'Quest Log',
      elements: []
    });

    this.registerScreen({
      id: 'skill_tree',
      name: 'Skill Tree',
      elements: []
    });

    this.registerScreen({
      id: 'settings',
      name: 'Settings',
      elements: []
    });
  }

  private createEmptyHUD(): HUDData {
    return {
      health: { current: 100, max: 100 },
      mana: { current: 50, max: 50 },
      stamina: { current: 100, max: 100 },
      experience: { current: 0, max: 1000, level: 1 },
      target: null,
      buffs: [],
      debuffs: [],
      actionBar: Array(12).fill(null).map((_, i) => ({
        slot: i,
        abilityId: '',
        icon: '',
        cooldown: 0,
        maxCooldown: 0,
        charges: 0,
        maxCharges: 0,
        usable: false,
        range: 0,
        inRange: false
      }))
    };
  }

  private world!: World;
}

export class UISystem implements System {
  world!: World;
  enabled = true;
  priority = 50;

  constructor(private uiModule: UIModule) {}

  update(dt: number): void {
    const entities = this.world.query({ all: ['UIComponent'] });
    for (const entity of entities) {
      const ui = this.world.getComponent<UIComponent>(entity, 'UIComponent');
      if (ui && ui.activeScreen) {
        const screen = this.uiModule.getScreen(ui.activeScreen);
        screen?.onUpdate?.(dt);
      }
    }
  }
}

export class HUDSystem implements System {
  world!: World;
  enabled = true;
  priority = 40;

  constructor(private uiModule: UIModule) {}

  update(dt: number): void {
    const players = this.world.query({ all: ['UIComponent', 'PlayerComponent'] });
    for (const entity of players) {
      this.updatePlayerHUD(entity);
    }
  }

  private updatePlayerHUD(entity: Entity): void {
    const stats = this.world.getComponent(entity, 'StatsComponent');
    const combat = this.world.getComponent(entity, 'CombatComponent');
    const progression = this.world.getComponent(entity, 'ProgressionComponent');
    const target = combat?.target ? this.world.getComponent(combat.target, 'StatsComponent') : null;

    this.uiModule.updateHUD(entity, {
      health: stats ? { current: stats.currentHealth, max: stats.maxHealth } : undefined,
      mana: stats ? { current: stats.currentMana, max: stats.maxMana } : undefined,
      stamina: stats ? { current: stats.currentStamina, max: stats.maxStamina } : undefined,
      experience: progression ? { 
        current: progression.experience, 
        max: progression.experienceToNext, 
        level: progression.level 
      } : undefined,
      target: target ? { 
        name: 'Enemy', 
        health: target.currentHealth, 
        maxHealth: target.maxHealth, 
        level: 1 
      } : null
    });
  }
}

export interface PlayerComponent extends Component {
  isPlayer: boolean;
  accountId: string;
  characterId: string;
}