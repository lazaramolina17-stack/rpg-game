---
title: "How I Built a Full RPG Game in TypeScript — Zero Images, Pure Canvas 2D"
published: true
description: "A deep dive into building a playable RPG with procedural vector graphics, touch controls, and Web Audio — all in a single HTML file."
tags: typescript, gamedev, canvas, webdev
canonical_url: https://github.com/lazaramolina17-stack/rpg-game
---

## The Challenge

No sprites. No assets. No external images. Just a browser, TypeScript, and the Canvas 2D API. Could I build a playable RPG?

The answer is yes — and it's live at [lazaramolina17-stack.github.io/rpg-game](https://lazaramolina17-stack.github.io/rpg-game). Everything you see is drawn procedurally at runtime: the grass, the water, the characters, the enemies, even the UI. Here's how.

---

## Architecture Overview

The game is organised into seven modules, each with a single responsibility:

```
src/web/
├── main.ts        # Game loop, entity management, combat, dialogue
├── graphics.ts    # Procedural vector engine (tiles, sprites, effects)
├── renderer.ts    # Canvas rendering (tilemap, HUD, minimap, particles)
├── gameplay.ts    # RPG systems (XP, inventory, quests, spells, shop)
├── content.ts     # Data definitions (enemies, items, quests)
├── input.ts       # Keyboard input handler
├── touch.ts       # DOM overlay touch controls
└── audio.ts       # Procedural Web Audio SFX + music
```

The bundler (`scripts/build-web.ts`) uses esbuild to compile everything into a single `docs/bundle.js` (~69KB minified). GitHub Pages serves `docs/index.html`, which loads the bundle.

---

## 1. Procedural Vector Graphics Engine

The most distinctive part of the project: **zero bitmap images**. All visuals are drawn with Canvas 2D paths, gradients, and shadows.

### Tiles (7 biomes)

Each tile is 32x32 pixels, generated procedurally with a seeded PRNG (Mulberry32) so the same tile always looks the same:

| Tile | Technique |
|------|-----------|
| Grass | Linear gradient floor + quadratic grass blades + radial flower dots |
| Forest | Darker radial gradient + tree trunk arcs + canopy circles |
| Water | Animated sine waves + moving specular highlights + foam edges |
| Stone | Fractal-like gray patches + cracks (thin strokes) |
| Sand | Warm gradient + speckled noise dots |
| Lava | Pulsating orange-red gradient + drifting bright embers |
| Snow | White gradient + translucent blue overlay + snowflake specks |

```typescript
function drawWaterTile(ctx: CanvasRenderingContext2D, rng: () => number, t: number) {
  const grad = ctx.createRadialGradient(16, 16 - Math.sin(t * 2) * 2, 0, 16, 16, 22)
  grad.addColorStop(0, '#1d4ed8')
  grad.addColorStop(0.5, '#1e40af')
  grad.addColorStop(1, '#1e3a8a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 32, 32)

  // Animated waves
  for (let x = 0; x < 32; x += 4) {
    const wy = 16 + Math.sin(x * 0.4 + t * 3) * 3 + Math.sin(x * 0.7 + t * 2) * 1.5
    ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(x * 0.3 + t * 2.5) * 0.04})`
    ctx.beginPath()
    ctx.arc(x, wy, 1.5, 0, Math.PI * 2)
    ctx.fill()
  }
}
```

### Character Sprites

Every character is built from the same set of geometric primitives — arcs, ellipses, bezier curves, quadratic curves — assembled differently per type:

![Player visual breakdown — head, cape, torso, legs, sword, shield, all gradients]

The player sprite uses **no `fillRect`** for its body. Instead:

- **Cape**: Bezier curves with sine-wave animation for flowing movement
- **Armor**: Quadratic curve torso with purple gradient (`#8b5cf6` → `#5b21b6`)
- **Skirt**: Animated scalloped edge with per-vertex wave offset
- **Sword**: Rotated rectangle with gradient steel + gem in guard
- **Shield**: Circle with gradient (`#4a4a6a` → `#6a6a8a`) + gold border arc
- **Hair**: Bezier curves for volume, `#fbbf24` (blonde)

Enemies are equally detailed:

- **Bandit**: Torn brown cape, eye patch, crooked smile
- **Skeleton**: Skull with red glowing eyes, bone lines for ribs
- **Mage**: Pointed hat with stars, robe glow effect (radial gradient)
- **Goblin**: Big green head, triangle ears, large circular nose
- **Boss**: 1.5x scale, crown, spikes on armor, yellow glowing eyes

---

## 2. Audio — Fully Procedural

No audio files either. The `AudioManager` uses the Web Audio API to synthesise everything:

```typescript
playAttack() { this.play([[0.15,400,0.3,0,0.3,0.4,0.02,0.01,0.01]]) }
playHit()    { this.play([[0.2,200,0.2,0,0.2,0.3,0.02,0.01,0.02]]) }
playLevelup(){ this.play([[0.1,600,0.3,0,0.3,0.4,0.02],[0.15,800,0.3,0,0.3,0.4,0.02,0.1]]) }
```

Each sound is an array of oscillator parameters: `[duration, frequency, volume, detune, ...]`. The ambient music generates a bass drone, chord pads, and a pentatonic melody — all in real time.

15 distinct SFX: `attack`, `hit`, `enemyHit`, `death`, `pickup`, `levelup`, `heal`, `fireball`, `explosion`, `coin`, `dialogue`, `step`, `gameover`, `victory`.

---

## 3. Touch Controls — DOM Overlay

On mobile (and desktop, since detection is hardcoded), a joystick and action buttons appear as a DOM overlay. Why DOM instead of canvas?

- DOM elements handle multi-touch natively without gesture conflicts
- They stay fixed-position regardless of camera scroll
- Opacity is reduced (`alpha: 0.8`) so game content is still visible underneath

```
┌──────────┐          ┌──┐ ┌──┐ ┌──┐ ┌──┐
│  ⬆       │          │⚔ │ │✋ │ │🗺 │ │  │
│⬅ 🟣 ➡   │          └──┘ └──┘ └──┘ └──┘
│  ⬇       │          Items 1-4 action bar
│ Joystick │
└──────────┘
```

Each button sends events to the same `Input` system as keyboard, so the game loop is input-agnostic.

---

## 4. RPG Systems

### Content Manager (`content.ts`)
Pure data. Defines 5 enemy types, 3 spells, loot tables per enemy (with drop rates), quests with objectives, and shop inventories for Merchant and Blacksmith.

### Gameplay Manager (`gameplay.ts`)
Stateless logic layer:
- XP/level progression (scaling formula: `xpToNext = level * 60 + 40`)
- 10-slot inventory
- Quest state tracking with completion detection
- Loot generation with weighted random drops
- Spell casting with mana cost validation
- Shop transactions (buying with gold)
- Damage floating text creation

### Combat
Right-click or Space to attack. The nearest enemy within range takes damage, knockback, and flashes red. Damage numbers float upward with alpha fade. Player has invincibility frames (500ms) after being hit.

---

## 5. Environment & Effects

### Day/Night Cycle
The background sky transitions through 4 phases:
- **Dawn** (`t % 240 < 60`): warm orange-pink gradient
- **Day** (`t % 240 < 120`): bright blue with sun
- **Dusk** (`t % 240 < 180`): purple-orange transition
- **Night** (else): dark blue with stars + moon

The sun follows a sine arc across the sky. At night, stars twinkle and a crescent moon appears.

### Clouds & Mountains
5 cloud layers drift at different speeds (parallax). 3 mountain planes in the background provide depth.

### Fog of War
A radial gradient overlay around the player reveals a limited portion of the map. The edge blurs into darkness.

### Floating Damage Text
Numbers float upward with decreasing opacity over 1 second. Critical hits are larger and yellow.

---

## 6. Performance

The game runs at 60fps on desktop and a stable 30-50fps on mid-range Android. Key techniques:

1. **Tile caching**: Each unique tile is drawn once to an offscreen canvas, then `drawImage`-d to the main canvas
2. **Camera culling**: Only tiles and entities within the viewport (±1 tile margin) are drawn
3. **Efficient gradients**: Gradients are created once per frame, not per tile
4. **Minimal GC pressure**: Object pools for particles and damage texts

---

## Build & Deployment

```bash
# Build
node node_modules/esbuild/bin/esbuild src/web/main.ts \
  --bundle --minify --outfile=docs/bundle.js \
  --format=esm --platform=browser

# Deploy (GitHub Pages)
git add docs/ && git commit -m "build" && git push
```

GitHub Pages is configured to serve from the `docs/` directory on the `main` branch. Every push triggers an automatic redeploy.

---

## Lessons Learned

1. **Canvas 2D is powerful** for vector-style games. You don't need WebGL for this art style.
2. **Procedural generation** eliminates asset pipelines. Change a color, recompile, and every tile updates instantly.
3. **Touch controls as DOM** is much more reliable than canvas hit detection for mobile.
4. **Web Audio API** can replace entire sound libraries for simple games.
5. **TypeScript** catches so many game logic bugs at compile time — worth the build step.

---

## Try It

Play now: [lazaramolina17-stack.github.io/rpg-game](https://lazaramolina17-stack.github.io/rpg-game)

Source code: [github.com/lazaramolina17-stack/rpg-game](https://github.com/lazaramolina17-stack/rpg-game)

---

*Built with TypeScript, Canvas 2D, Web Audio API, esbuild, and GitHub Pages.*
