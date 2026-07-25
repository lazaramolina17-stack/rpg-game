# ARCHITECTURE

## RPG Game 3D — Arquitectura del Sistema

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Lenguaje | TypeScript 5.x |
| Renderizado 3D | Three.js (v0.160 vía CDN) |
| Renderizado 2D (HUD) | Canvas 2D API |
| Audio | Web Audio API |
| Build | esbuild |
| Despliegue | GitHub Pages |
| Bundling | Single bundle.js (~50KB) |

---

## Estructura de Directorios

```
rpg-project/
├── .opencode/
│   └── zeek/
│       ├── system.md
│       ├── PROJECT_STATE.md
│       ├── ARCHITECTURE.md
│       ├── TASKS.md
│       ├── DECISION_LOG.md
│       ├── CHANGELOG.md
│       └── agents/
├── docs/
│   ├── index.html          # Entry point (importmap + bundle)
│   └── bundle.js           # Built output
├── scripts/
│   └── build-web.ts        # esbuild bundler
├── src/
│   └── web/
│       ├── main.ts          # Game loop, entities, combat
│       ├── renderer.ts      # Three.js 3D renderer + 2D HUD overlay
│       ├── graphics.ts      # Tile/entity renderer (legacy 2D fallback)
│       ├── three-scene.ts   # Three.js scene setup (camera, lights)
│       ├── three-models.ts  # Procedural 3D model factories
│       ├── gameplay.ts      # RPG logic (skills, equipment, crafting)
│       ├── content.ts       # Game data (enemies, items, quests)
│       ├── input.ts         # Keyboard + mouse input
│       ├── touch.ts         # Touch controls (joystick, buttons, camera)
│       └── audio.ts         # Procedural Web Audio
└── devto-article.md
```

---

## Flujo de Datos

```
                    ┌─────────────┐
                    │   main.ts   │
                    │ Game Loop   │
                    └──────┬──────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌──────────┐    ┌────────────┐    ┌──────────┐
   │  input   │    │  renderer  │    │ gameplay │
   │  touch   │───▶│  (Three.js │◀───│  content │
   │  audio   │    │   + HUD)   │    │          │
   └──────────┘    └────────────┘    └──────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
             ┌──────────┐ ┌──────────┐
             │ three-   │ │ three-   │
             │ scene.ts │ │ models.ts│
             └──────────┘ └──────────┘
```

---

## Principios Arquitectónicos

1. **Modularidad**: Cada sistema es un archivo independiente con imports/exports claros
2. **Stateless**: game logic (gameplay.ts) es puramente funcional, no mantiene estado global
3. **Input agnóstico**: keyboard, mouse y touch convergen en el mismo sistema de input
4. **Procedural**: cero assets externos — todo se genera en runtime
5. **CDN first**: Three.js cargado vía importmap para minimizar bundle
6. **Overlay 2D**: HUD, diálogos, minimap y UI en canvas 2D separado

---

## Modelo de Datos

```
Entity
├── type: 'player' | 'npc' | 'enemy' | 'item'
├── name: string
├── x, y: number (pixel coordinates)
├── hp, maxHp: number
├── mana, maxMana: number
├── enemyType: string
├── alive: boolean
├── dialogue: string[]
└── shieldEnd: number

PlayerStats
├── attackDamage, magicDamage
├── damageReduction
├── speedMultiplier
├── skillPoints
├── skills: Record<string, number>
└── equipped: Record<SlotType, string | null>

Quest
├── id, title, description, objective
├── type: 'main' | 'side'
├── tier: 1 | 2 | 3
├── requiresQuest?: string
└── reward: { xp, gold, items }
```

---

## Ciclo del Game Loop

```
1. Calcular delta time (dt)
2. Leer input (mouse + touch camera look)
3. input.update()
4. Procesar estado del juego:
   a. Movimiento del jugador (relativo a cámara)
   b. Combate (ataques, daño, muerte)
   c. Interacciones (NPCs, items, tiendas)
   d. Hechizos
   e. Inventario
   f. Movimiento de entidades (enemigos)
5. renderer.render():
   a. updateThreeCamera()
   b. updateTileMeshes()
   c. updateEntityMeshes()
   d. updateParticles3D()
   e. threeRenderer.render()
   f. drawHUD() (2D overlay)
   g. drawCrosshair()
   h. drawDamageTexts()
   i. drawGameOver/Victory/Minimap
6. touch.update()
7. requestAnimationFrame
```
