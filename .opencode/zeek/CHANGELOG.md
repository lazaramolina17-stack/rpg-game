# CHANGELOG

## [0.5.0] - 2026-07-25

### Added
- D&D Character Creation: raza, clase, atributos (STR/DEX/CON/INT/WIS/CHA), dado d20
- 6 razas jugables: Humano, Elfo, Enano, Halfling, Dragonborn, SemiElfo
- 6 clases: Fighter, Wizard, Rogue, Cleric, Ranger, Paladin
- Sistema de dados D&D (d20 ventaja/desventaja, damage dice)
- Sistema de magia D&D: 20 hechizos, 8 escuelas, grimorio, spell slots tabla completa
- Items mágicos: 10 objetos con rareza, atunement, efectos
- Monsters Manual D&D: 24 monstruos con statblocks completos (CR 1/8 a CR 24)
- Generador de encuentros balanceados por nivel y dificultad
- Character Sheet UI: panel completo con atributos, skills, spellcasting, features
- Pantalla de creación de personaje con 4 fases interactivas
- Display de tiradas de dados en HUD de combate
- Atajo [C] para abrir/cerrar ficha de personaje

### Changed
- main.ts: flujo con character creation antes del juego
- gameplay.ts: daño basado en dados D&D cuando hay personaje D&D
- renderer.ts: sheet toggle, scroll, dark theme UI profesional

## [0.4.0] - 2026-07-25

### Added
- Manos/brazos a modelos 3D de player, enemigos y NPCs
- `touch-action:none` al body para soporte Android táctil
- Documentación de arquitectura en `.opencode/zeek/`

### Changed
- Cámara elevada a nivel de ojos (y=1.0)
- Movimiento unificado keyboard + touch relativo a yaw

### Fixed
- Yaw invertido en mouse look
- Eje Z de movimiento invertido
- Touch camera look no funcionaba en Android (passive:false)

## [0.3.0] - 2026-07-25

### Added
- Conversión a 3D con Three.js
- Cámara en primera persona (PerspectiveCamera)
- Pointer lock para mouse look
- Camera look táctil (deslizar en lado derecho)
- Fog, sombras, iluminación directional
- Modelos 3D procedimentales para todas las entidades
- Crosshair en overlay 2D

### Changed
- Renderer reescrito para Three.js
- index.html con importmap para Three.js CDN
- build-web.ts con external three

## [0.2.0] - 2026-07-25

### Added
- Motor gráfico AAA 2D con iluminación, clima, post-procesado
- Sistema de habilidades (skill tree, 5 habilidades)
- Sistema de equipo (4 slots, 10 items)
- Sistema de crafting (5 recetas)
- 5 nuevos tipos de enemigos
- 5 nuevas misiones (total 10)
- Diálogos para 6 NPCs
- Artículo publicado en dev.to

## [0.1.0] - 2026-07-24

### Added
- Proyecto inicial con TypeScript y esbuild
- Renderizado 2D Canvas con tiles procedurales
- Sprites vectoriales (sin imágenes)
- Audio procedural Web Audio API (15 SFX + música)
- Controles táctiles DOM overlay
- Sistema de combate, XP, niveles
- Inventario, misiones, tiendas
- Despliegue GitHub Pages
