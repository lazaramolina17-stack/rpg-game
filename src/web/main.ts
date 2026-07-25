import { Renderer, Entity, TILE, TILEMAP, HUDData } from './renderer.js'
import { Input } from './input.js'
import { GameplayManager } from './gameplay.js'

const SPEED = 120
const ATTACK_RANGE = 40
const ATTACK_COOLDOWN = 500
const INTERACT_RANGE = 50

interface GameEntity extends Entity {
  targetX?: number; targetY?: number
  dialogue?: string[]; dialogueIdx?: number
  lastAttack?: number; alive: boolean
}

function main() {
  let gameState = 'playing'
  let gameEntities: GameEntity[] = []
  let items: GameEntity[] = []
  let player: GameEntity
  let renderer: Renderer
  let input: Input
  let gameplay: GameplayManager
  let interactTarget: GameEntity | null = null
  let dialogueShowing = false
  let combatLog: string[] = []
  let lastTime = 0

  const dialogues = [
    ['Hello traveler!', 'Welcome to our village.', 'Be careful of the bandits to the north!'],
    ['The forest is dangerous at night.', 'I heard strange noises...'],
    ['Can you spare some gold?', 'Just kidding, stay safe out there!'],
    ['I used to be an adventurer like you.', 'Then I took an arrow to the knee.'],
    ['The ancient ruins hold great treasures.', 'But also great dangers...'],
  ]

  const questsLog: string[] = []

  function initGame() {
    gameState = 'playing'
    gameEntities = []
    items = []
    combatLog = []
    questsLog.length = 0
    dialogueShowing = false
    interactTarget = null

    player = { type: 'player', name: 'Hero', x: 4 * 32, y: 12 * 32, alive: true, hp: 100, maxHp: 100 }

    const npcs: GameEntity[] = []
    const spawnNPC = (type: string, name: string, x: number, y: number, hp?: number) => {
      const e: GameEntity = { type, name, x, y, alive: true, dialogue: dialogues[Math.floor(Math.random() * dialogues.length)] }
      if (hp) { e.hp = hp; e.maxHp = hp }
      npcs.push(e); return e
    }
    const spawnEnemy = (x: number, y: number, patrol: number) => {
      const e = spawnNPC('enemy', `Bandit lv${1 + Math.floor(Math.random() * 3)}`, x, y, 30 + Math.floor(Math.random() * 20))
      e.targetX = x + (Math.random() - 0.5) * patrol * 2
      e.targetY = y + (Math.random() - 0.5) * patrol * 2
      return e
    }

    spawnNPC('npc', 'Merchant', 5 * 32, 8 * 32)
    spawnNPC('npc', 'Guard', 6 * 32, 9 * 32)
    spawnNPC('npc', 'Elder', 4 * 32, 7 * 32)
    spawnNPC('npc', 'Blacksmith', 7 * 32, 8 * 32)
    spawnNPC('npc', 'Farmer', 3 * 32, 10 * 32)

    for (let i = 0; i < 8; i++) {
      spawnEnemy(20 * 32 + Math.random() * 10 * 32, 5 * 32 + Math.random() * 8 * 32, 4 * 32)
    }

    gameEntities = [player, ...npcs]
    gameplay = new GameplayManager(player, gameEntities.filter(e => e.type === 'enemy'), items)
    renderer.hud = gameplay.getHUDData()
    renderer.gameOver = false
    renderer.showVictory = false
  }

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  renderer = new Renderer(canvas)
  input = new Input()

  initGame()

  function triggerCombat(attacker: GameEntity, target: GameEntity) {
    const dmg = 8 + Math.floor(Math.random() * 12)
    target.hp! -= dmg
    const msg = `⚔️ ${attacker.name} hits ${target.name} for ${dmg}!`
    combatLog.push(msg); if (combatLog.length > 6) combatLog.shift()
    attacker.lastAttack = performance.now()
    gameplay.addDamageText(`-${dmg}`, target.x, target.y - 20)
    renderer.addParticles(target.x, target.y - 10, '#ef4444', 5)
    renderer.flashScreen()

    if (target.hp! <= 0) {
      target.alive = false
      target.hp = 0
      combatLog.push(`💀 ${target.name} defeated!`)
      if (combatLog.length > 6) combatLog.shift()
      renderer.addParticles(target.x, target.y, '#fbbf24', 12)

      if (target === player) {
        gameState = 'gameover'
        renderer.gameOver = true
      } else {
        gameplay.onEnemyKilled(target)
        if (gameplay.getHUDData().allQuestsComplete) {
          gameState = 'victory'
          renderer.showVictory = true
        }
      }
    }
  }

  const gameLoop = (time: number) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
    lastTime = time

    input.update()

    if (input.isPressed('KeyR') && (gameState === 'gameover' || gameState === 'victory')) {
      initGame()
    }

    if (gameState === 'playing') {
      let dx = input.dx(), dy = input.dy()
      if (dx || dy) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len; dy /= len
        const newX = player.x + dx * SPEED * dt
        const newY = player.y + dy * SPEED * dt
        const tileX = Math.floor(newX / TILE)
        const tileY = Math.floor(newY / TILE)
        if (TILEMAP[tileY]?.[tileX] !== undefined && TILEMAP[tileY][tileX] !== 2) {
          player.x = newX; player.y = newY
        }
      }

      if (input.isPressed('Space')) {
        const now = performance.now()
        if (!player.lastAttack || now - player.lastAttack > ATTACK_COOLDOWN) {
          player.lastAttack = now
          let closest: GameEntity | null = null
          let closestDist = ATTACK_RANGE
          for (const e of gameEntities) {
            if (e === player || !e.alive || e.type !== 'enemy') continue
            const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
            if (d < closestDist) { closestDist = d; closest = e }
          }
          if (closest) {
            triggerCombat(player, closest)
            renderer.addParticles(closest.x, closest.y - 10, '#fbbf24', 6)
          }
        }
      }

      if (input.isPressed('KeyE')) {
        let closest: GameEntity | null = null
        let closestDist = INTERACT_RANGE
        let closestItem: GameEntity | null = null

        for (const e of gameEntities) {
          if (e === player || !e.alive) continue
          if (e.type === 'npc') {
            const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
            if (d < closestDist) { closestDist = d; closest = e }
          }
        }

        for (const item of items) {
          if (!item.alive) continue
          const d = Math.sqrt((item.x - player.x) ** 2 + (item.y - player.y) ** 2)
          if (d < INTERACT_RANGE + 10) { closestItem = item }
        }

        if (closestItem) {
          closestItem.alive = false
          gameplay.onItemCollected(closestItem)
          renderer.addParticles(closestItem.x, closestItem.y, '#34d399', 5)
        } else if (closest) {
          if (!dialogueShowing || interactTarget !== closest) {
            interactTarget = closest
            closest.dialogueIdx = 0
            dialogueShowing = true
          } else {
            closest.dialogueIdx = (closest.dialogueIdx ?? 0) + 1
            if (closest.dialogueIdx >= (closest.dialogue?.length ?? 0)) {
              dialogueShowing = false
            }
          }
        }
      }

      if (input.isPressed('Escape')) dialogueShowing = false
      if (input.isPressed('KeyM')) renderer.toggleMinimap()

      for (let i = 0; i < 4; i++) {
        if (input.isPressed(`Digit${i + 1}`) || input.isPressed(`Numpad${i + 1}`)) {
          gameplay.useInventorySlot(i)
        }
      }

      const now = performance.now()
      for (const e of gameEntities) {
        if (e === player || !e.alive || (e.type !== 'npc' && e.type !== 'enemy')) continue

        if (e.targetX === undefined) {
          e.targetX = e.x + (Math.random() - 0.5) * 100
          e.targetY = e.y + (Math.random() - 0.5) * 100
        }
        const ddx = e.targetX - e.x, ddy = e.targetY - e.y
        const dist = Math.sqrt(ddx * ddx + ddy * ddy)
        if (dist > 5) {
          e.x += (ddx / dist) * 30 * dt
          e.y += (ddy / dist) * 30 * dt
        } else {
          e.targetX = e.x + (Math.random() - 0.5) * 150
          e.targetY = e.y + (Math.random() - 0.5) * 150
        }

        if (e.type === 'enemy' && !e.lastAttack || now - e.lastAttack! > 1500) {
          const d = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2)
          if (d < ATTACK_RANGE) triggerCombat(e, player)
        }
      }

      gameplay.update(dt, gameEntities)
    }

    gameplay.update(dt, gameEntities)

    renderer.setCamera({ x: player.x, y: player.y })

    const aliveEntities = gameEntities.filter(e => e.alive || e === player)
    const renderEntities: Entity[] = aliveEntities.map(e => ({
      type: e.type, name: e.name, x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp
    }))
    renderEntities.push(...items.filter(i => i.alive).map(i => ({
      type: 'item', name: i.name, x: i.x, y: i.y, itemType: i.itemType
    })))

    renderer.setEntities(renderEntities)
    renderer.hud = gameplay.getHUDData()
    const hud = renderer.hud
    if (hud && hud.allQuestsComplete && gameState === 'playing') {
      gameState = 'victory'
      renderer.showVictory = true
    }

    renderer.damageTexts = gameplay.getDamageTexts()
    renderer.render(time, dt)

    if (dialogueShowing && interactTarget && interactTarget.alive) {
      const ctx = canvas.getContext('2d')!
      const dw = 400, dh = 100
      const dx = canvas.width / 2 - dw / 2, dy = canvas.height - dh - 40
      ctx.fillStyle = 'rgba(15,23,42,0.92)'
      ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 10);
      ctx.fill()
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.roundRect(dx, dy, dw, dh, 10); ctx.stroke()
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 12px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`🗣️ ${interactTarget.name}`, dx + 16, dy + 24)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      const diag = interactTarget.dialogue!
      const idx = interactTarget.dialogueIdx ?? 0
      ctx.fillText(diag[idx % diag.length], canvas.width / 2, dy + 56)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px sans-serif'
      ctx.fillText('[E] continue  [ESC] close', canvas.width / 2, dy + 80)
    }

    if (combatLog.length > 0) {
      const ctx = canvas.getContext('2d')!
      const lw = 300, lh = Math.min(combatLog.length * 18 + 10, 120)
      const lx = canvas.width / 2 - lw / 2, ly = 16
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.beginPath(); ctx.roundRect(lx, ly, lw, lh, 6); ctx.fill()
      ctx.fillStyle = '#fbbf24'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      let lyOff = ly + 16
      for (const msg of combatLog.slice(-5)) {
        ctx.fillText(msg, canvas.width / 2, lyOff)
        lyOff += 18
      }
    }

    requestAnimationFrame(gameLoop)
  }

  requestAnimationFrame(gameLoop)
}

window.addEventListener('DOMContentLoaded', main)