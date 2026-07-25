# RPG Engine - Modular Game Architecture

A production-ready, modular RPG game engine built with TypeScript using ECS (Entity Component System) architecture. Designed for scalability, extensibility, and maintainability.

## Architecture Overview

### Core Principles
- **Modular Architecture**: Each system is independent and replaceable
- **Data-Driven**: Content in JSON/YAML/DB, not hardcoded
- **ECS Pattern**: Composition over inheritance for game entities
- **Event-Based**: Decoupled communication via EventBus
- **Extensible**: Mod support built-in from the start

### Module Structure
```
src/
├── core/           # Engine core (ECS, Events, Config, Logging, Modules)
├── world/          # World systems (regions, time, weather, streaming)
├── npc/            # NPC AI (behavior trees, schedules, memory, factions)
├── rpg/            # RPG systems (stats, progression, equipment, combat)
├── inventory/      # Items, containers, crafting, economy
├── economy/        # Currency, shops, markets, pricing
├── quests/         # Quest system (objectives, rewards, choices)
├── combat/         # Strategic combat (abilities, buffs, threat)
├── server/         # Multiplayer (networking, authority, replication)
├── database/       # Persistence (SQL, migrations, repositories)
├── save/           # Save system (versioning, migration, backup)
├── ui/             # UI/HUD system (screens, elements, events)
├── content/        # Data definitions (races, classes, items, zones)
├── mods/           # Mod API (scripting, sandboxing, workshop)
├── audio/          # Audio engine (music, SFX, spatial, adaptive)
├── debug/          # Dev tools (console, profiler, inspectors)
└── test/           # Testing utilities
```

## Implemented Modules

| Module | Status | Description |
|--------|--------|-------------|
| Core | ✅ | ECS, EventBus, Config, Logger, ModuleManager |
| World | ✅ | Time, Weather, Regions |
| NPC | ✅ | Behavior Trees, Schedules, Memory, Factions |
| RPG | ✅ | Stats, Progression, Equipment, Combat |
| Inventory | ✅ | Containers, Items, Crafting |
| Economy | ✅ | Currency, Shops, Market, Dynamic Pricing |
| Quests | ✅ | Objectives, Rewards, Choices, Branching |
| Combat | ✅ | Abilities, Buffs, Threat, Damage System |
| Server | ✅ | Networking, Authority, Regions, Replication |
| Database | ✅ | SQL, Migrations, Repositories |
| Save | ✅ | Versioning, Migration, Auto-save |
| UI | ✅ | HUD, Screens, Elements, Events |
| Content | ✅ | Data Definitions, Registry, Loaders |

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Development
npm run dev
```

## Core Systems Usage

### Creating the Game
```typescript
import { Game } from './src/core/game.js';

const game = new Game();
await game.initialize();
await game.start();
```

### Registering Modules
```typescript
import { WorldModule } from './src/world/worldModule.js';
import { NPCModule } from './src/npc/npcModule.js';
import { RPGModule } from './src/rpg/rpgModule.js';

const game = new Game();
game.moduleManager.register(new WorldModule());
game.moduleManager.register(new NPCModule());
game.moduleManager.register(new RPGModule());
```

### ECS Usage
```typescript
import { World } from './src/core/ecs.js';

const world = new World();

// Create entity
const player = world.createEntity();

// Add components
world.addComponent(player, { entity: player, x: 0, y: 0, z: 0 });
world.addComponent(player, { entity: player, health: 100, maxHealth: 100 });

// Query entities
const entities = world.getEntitiesWith('Position', 'Health');

// Systems
world.addSystem({
  update: (dt) => {
    for (const entity of world.getEntitiesWith('Position', 'Velocity')) {
      const pos = world.getComponent(entity, 'Position');
      const vel = world.getComponent(entity, 'Velocity');
      pos.x += vel.vx * dt;
      pos.y += vel.vy * dt;
      pos.z += vel.vz * dt;
    }
  }
});
```

### Event System
```typescript
import { EventBus } from './src/core/eventBus.js';

const eventBus = new EventBus();

// Subscribe
const unsub = eventBus.on('player:damage', (data) => {
  console.log(`Player took ${data.amount} damage`);
});

// Emit
eventBus.emit('player:damage', { amount: 10, source: 'enemy' });

// Cleanup
unsub();
```

### Configuration
```typescript
import { Config } from './src/core/config.js';

const config = new Config({
  game: { name: 'My RPG', version: '1.0.0' },
  graphics: { quality: 'high', vsync: true }
});

// Get values
const name = config.get('game.name');

// Watch for changes
config.watch('graphics.quality', (newVal) => {
  applyGraphicsSettings(newVal);
});
```

## Data-Driven Content

All game content is defined in JSON/YAML files:

```json
{
  "id": "human",
  "type": "race",
  "version": 1,
  "data": {
    "id": "human",
    "name": "Human",
    "description": "Versatile and adaptable",
    "attributes": { "size": "medium", "speed": 30, "languages": ["Common"] },
    "racialAbilities": ["diplomacy", "versatility"],
    "startingStats": { "strength": 10, "agility": 10, "intelligence": 10, "vitality": 10, "spirit": 10 }
  }
}
```

## Save System

```typescript
import { SaveModule } from './src/save/saveModule.js';

const saveModule = new SaveModule();

// Create new game
const saveData = saveModule.createNewGame('save_1', 'My Adventure', {});

// Save game
await saveModule.saveGame('save_1');

// Load game
const loaded = await saveModule.loadGame('save_1');
```

## Multiplayer Architecture

Server-authoritative with client prediction:

- **Networking**: WebSocket + custom binary protocol
- **Authority**: Server validates all actions
- **Replication**: Entity snapshot interpolation
- **Anti-cheat**: Server-side validation, rate limiting

## Modding Support

```typescript
import { ModModule } from './src/mods/modModule.js';

const modModule = new ModModule();

// Mod API exposes:
// - Game events
// - Content registration
// - UI hooks
// - Scripting (Lua/TypeScript)
// - Sandboxed execution
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Performance

- **ECS**: Archetype-based for cache-friendly iteration
- **Systems**: Priority-based execution order
- **Networking**: Delta compression, interest management
- **Database**: Connection pooling, query caching
- **Rendering**: Frustum culling, LOD, instancing (planned)

## Roadmap

- [ ] Rendering engine integration (Three.js / Bevy)
- [ ] Physics integration (Rapier / PhysX)
- [ ] Audio engine (Web Audio / FMOD)
- [ ] Animation system
- [ ] Navigation mesh / Pathfinding
- [ ] Particle systems
- [ ] Shader system
- [ ] Level editor
- [ ] Asset pipeline
- [ ] CI/CD pipeline

## License

MIT