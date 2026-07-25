# RPG Game Architecture

## Core Principles
- Modular architecture: each system independent, replaceable
- Data-driven: content in JSON/YAML/DB, not code
- Extensible: new content without core changes
- Scalable: small to large projects
- Secure: server-authoritative multiplayer

## Module Structure

```
src/
├── core/           # Game kernel, module manager, event bus
├── engine/         # Rendering, physics, audio, input
├── gameplay/       # Player controller, character, progression
├── ai/             # Behavior trees, GOAP, utility AI, navigation
├── world/          # Regions, biomes, streaming, time/weather
├── npc/            # NPC routines, relationships, memory, factions
├── combat/         # Strategic combat, tactics, abilities, positioning
├── inventory/      # Items, equipment, containers, crafting
├── economy/        # Trading, markets, currency, supply/demand
├── quests/         # Quest system, objectives, rewards, branching
├── ui/             # HUD, menus, inventory UI, dialogue
├── server/         # Networking, authority, replication, matchmaking
├── database/       # Persistence, migrations, queries, caching
├── save/           # Serialization, versioning, migration, backup
├── content/        # Data definitions, registries, loaders
├── mods/           # Mod API, scripting, sandboxing, workshop
├── audio/          # Music, SFX, spatial, adaptive
├── debug/          # Console, dev tools, profiler, data editor
└── test/           # Unit, integration, E2E, performance tests
```

## Module Communication
- Event bus for decoupled communication
- Explicit interfaces for required dependencies
- No circular dependencies
- Core module has no dependencies

## Data Flow
```
Content (JSON/YAML/DB) -> Content Registry -> Systems -> Gameplay
                                      |
                              Save System <- Player State
                                      |
                              Network <- Server State
```

## Technology Stack
- Language: TypeScript (Node.js/Bun) + Rust (performance critical)
- Engine: Custom ECS + Three.js (web) / Bevy (native)
- Database: SQLite (local) / PostgreSQL (server)
- Networking: WebRTC / WebSocket + custom protocol
- Scripting: Lua (mods) / TypeScript (core)
- Build: Vite / Cargo
- Testing: Vitest / cargo test