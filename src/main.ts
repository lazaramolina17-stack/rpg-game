import { Game } from './core/game.js';
import { ModuleManager } from './core/moduleManager.js';
import { EventBus } from './core/eventBus.js';
import { ContentRegistry } from './core/contentRegistry.js';
import { Config } from './core/config.js';
import { Logger, createLogger } from './core/logger.js';
import { World } from './core/ecs.js';

import { WorldModule } from './world/worldModule.js';
import { NPCModule } from './npc/npcModule.js';
import { RPGModule } from './rpg/rpgModule.js';
import { InventoryModule } from './inventory/inventoryModule.js';
import { EconomyModule } from './economy/economyModule.js';
import { QuestModule } from './quests/questModule.js';
import { CombatModule } from './combat/combatModule.js';
import { ServerModule } from './server/serverModule.js';
import { DatabaseModuleImpl } from './database/databaseModule.js';
import { SaveModule } from './save/saveModule.js';
import { ModModule } from './mods/modModule.js';

async function main() {
  const eventBus = new EventBus();
  const config = new Config();
  const logger = new Logger('GAME');
  const contentRegistry = new ContentRegistry();
  const world = new World();
  
  const moduleManager = new ModuleManager(eventBus, config, logger);
  
  const game = new Game();
  
  const modules = [
    new WorldModule(),
    new NPCModule(),
    new RPGModule(),
    new InventoryModule(),
    new EconomyModule(),
    new QuestModule(),
    new CombatModule(),
    new ServerModule(),
    new DatabaseModuleImpl(),
    new SaveModule(),
    new ModModule()
  ];

  for (const module of modules) {
    moduleManager.register(module);
  }

  try {
    await game.initialize();
    await game.start();
    logger.info('RPG Game started successfully');
  } catch (error) {
    logger.error('Failed to start game', { error });
    process.exit(1);
  }
}

main();