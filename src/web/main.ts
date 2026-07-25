import { TILE, TILEMAP } from './renderer.js'
import { TouchController } from './touch.js'
import { AudioManager } from './audio.js'
import { ContentManager, EnemyType as ET } from './content.js'
import { Renderer, Entity, HUDData } from './renderer.js'
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
  enemyType?: string; mana?: number; maxMana?: number
  shieldEnd?: number
}

function main() {
  let gameState = 'playing'
  let gameEntities: GameEntity[] = []
  let items: GameEntity[] = []
  let player: GameEntity
  let renderer: Renderer
  let input: Input
  let touch: TouchController
  let audio: AudioManager
  let content: ContentManager
  let gameplay: GameplayManager
  let interactTarget: GameEntity | null = null
  let dialogueShowing = false
  let combatLog: string[] = []
  let lastTime = 0
  let stepTimer = 0
  let showMinimap = false
  let showShop = false
  let shopType = ''
  let spells: { type: string; x: number; y: number; targetX: number; targetY: number; time: number }[] = []

  const dialogues = [
    ['Hello traveler!', 'Welcome to our village.', 'Be careful of the bandits to the north!'],
    ['The forest is dangerous at night.', 'I heard strange noises...'],
    ['Can you spare some gold?', 'Just kidding, stay safe out there!'],
    ['I used to be an adventurer like you.', 'Then I took an arrow to the knee.'],
    ['The ancient ruins hold great treasures.', 'But also great dangers...'],
  ]

  function initGame() {
    gameState = 'playing'
    gameEntities = []
    items = []
    combatLog = []
    dialogueShowing = false
    interactTarget = null
    spells = []
    showMinimap = false
    showShop = false
    shopType = ''
    content = new ContentManager()

    player = { type: 'player', name: 'Hero', x: 4 * 32, y: 12 * 32, alive: true, hp: 100, maxHp: 100, mana: 50, maxMana: 50 }

    const enemies: GameEntity[] = []
    const spawnNPC = (type: string, name: string, x: number, y: number, hp?: number, enemyType?: string) => {
      const e: GameEntity = { type, name, x, y, alive: true, dialogue: dialogues[Math.floor(Math.random() * dialogues.length)], enemyType }
      if (hp) { e.hp = hp; e.maxHp = hp }
      gameEntities.push(e); return e
    }

    spawnNPC('npc', 'Merchant', 5 * 32, 8 * 32)
    spawnNPC('npc', 'Guard', 6 * 32, 9 * 32)
    spawnNPC('npc', 'Elder', 4 * 32, 7 * 32)
    spawnNPC('npc', 'Blacksmith', 7 * 32, 8 * 32)
    spawnNPC('npc', 'Farmer', 3 * 32, 10 * 32)

    for (let i = 0; i < 5; i++) {
      const stats = content.getEnemyStats(ET.Bandit)
      const e = spawnNPC('enemy', `${ET.Bandit} lv${1 + Math.floor(Math.random() * 2)}`, 20 * 32 + Math.random() * 8 * 32, 5 * 32 + Math.random() * 6 * 32, stats.hp, ET.Bandit)
      e.targetX = e.x + (Math.random() - 0.5) * 4 * 32
      e.targetY = e.y + (Math.random() - 0.5) * 4 * 32
      enemies.push(e)
    }
    for (let i = 0; i < 3; i++) {
      const stats = content.getEnemyStats(ET.Skeleton)
      const e = spawnNPC('enemy', `${ET.Skeleton} lv${1 + Math.floor(Math.random() * 2)}`, 26 * 32 + Math.random() * 6 * 32, 2 * 32 + Math.random() * 4 * 32, stats.hp, ET.Skeleton)
      e.targetX = e.x + (Math.random() - 0.5) * 3 * 32
      e.targetY = e.y + (Math.random() - 0.5) * 3 * 32
      enemies.push(e)
    }
    for (let i = 0; i < 2; i++) {
      const stats = content.getEnemyStats(ET.Mage)
      const e = spawnNPC('enemy', `${ET.Mage} lv1`, 28 * 32 + Math.random() * 4 * 32, 8 * 32 + Math.random() * 4 * 32, stats.hp, ET.Mage)
      e.targetX = e.x + (Math.random() - 0.5) * 2 * 32
      e.targetY = e.y + (Math.random() - 0.5) * 2 * 32
      enemies.push(e)
    }
    const bossStats = content.getEnemyStats(ET.Boss)
    const boss = spawnNPC('enemy', `${ET.Boss}`, 30 * 32, 6 * 32, bossStats.hp, ET.Boss)
    boss.targetX = boss.x
    boss.targetY = boss.y
    enemies.push(boss)

    gameplay = new GameplayManager(player, enemies, items, content)
    gameplay.onLevelUp = () => { audio.playSound('levelup'); renderer.showLevelUp(player.y - 60) }
    renderer.hud = gameplay.getHUDData()
    renderer.gameOver = false
    renderer.showVictory = false
  }

  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  renderer = new Renderer(canvas)
  input = new Input()
  touch = new TouchController(canvas)
  audio = new AudioManager()

  initGame()
  audio.playMusic()

  function triggerCameraShake() {}

  function findNearestEnemy(): GameEntity | null {
    let closest: GameEntity | null = null
    let closestDist = ATTACK_RANGE * 3
    for (const e of gameEntities) {
      if (e === player || !e.alive || e.type !== 'enemy') continue
      const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
      if (d < closestDist) { closestDist = d; closest = e }
    }
    return closest
  }

  function triggerCombat(attacker: GameEntity, target: GameEntity) {
    let dmg: number
    const stats = target.enemyType ? content.getEnemyStats(target.enemyType) : null
    const baseDmg = stats ? stats.dmg : 10

    if (attacker === player) {
      dmg = 8 + Math.floor(Math.random() * 12)
      if (target.shieldEnd && performance.now() < target.shieldEnd) dmg = Math.floor(dmg * 0.5)
      target.hp! -= dmg
      const msg = `⚔️ ${attacker.name} hits ${target.name} for ${dmg}!`
      combatLog.push(msg); if (combatLog.length > 6) combatLog.shift()
      audio.playSound('attack')
    } else {
      dmg = baseDmg + Math.floor(Math.random() * 5)
      if (player.shieldEnd && performance.now() < player.shieldEnd) dmg = Math.floor(dmg * 0.5)
      player.hp! -= dmg
      const msg = `💢 ${attacker.name} hits you for ${dmg}!`
      combatLog.push(msg); if (combatLog.length > 6) combatLog.shift()
      audio.playSound('hit')
      audio.playSound('enemyHit')
    }
    attacker.lastAttack = performance.now()
    gameplay.addDamageText(`-${dmg}`, target.x, target.y - 20)
    renderer.addParticles(target.x, target.y - 10, '#ef4444', 5)
    renderer.flashScreen()
    triggerCameraShake()

    if (target.hp! <= 0) {
      target.alive = false; target.hp = 0
      const msg2 = `💀 ${target.name} defeated!`
      combatLog.push(msg2); if (combatLog.length > 6) combatLog.shift()
      renderer.addParticles(target.x, target.y, '#fbbf24', 12)
      audio.playSound('death')

      if (target === player) {
        gameState = 'gameover'; renderer.gameOver = true
        audio.playSound('gameover'); audio.stopMusic()
      } else {
        gameplay.onEnemyKilled(target)
        if (gameplay.getHUDData().allQuestsComplete) {
          gameState = 'victory'; renderer.showVictory = true
          audio.playSound('victory')
        }
      }
    }
  }

  const gameLoop = (time: number) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
    lastTime = time

    input.update()

    const touchDx = touch.dx(), touchDy = touch.dy()
    const useTouch = touch.isTouchDevice() && (touchDx !== 0 || touchDy !== 0)

    if (input.isPressed('KeyR') && (gameState === 'gameover' || gameState === 'victory')) {
      initGame(); audio.playMusic()
    }

    if (gameState === 'playing') {
      let dx = input.dx(), dy = input.dy()
      if (useTouch) { dx = touchDx; dy = touchDy }
      if (dx !== 0 || dy !== 0) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len; dy /= len
        const newX = player.x + dx * SPEED * dt
        const newY = player.y + dy * SPEED * dt
        const tileX = Math.floor(newX / TILE)
        const tileY = Math.floor(newY / TILE)
        if (TILEMAP[tileY]?.[tileX] !== undefined && TILEMAP[tileY][tileX] !== 2) {
          player.x = newX; player.y = newY
          stepTimer += dt
          if (stepTimer > 0.3) { stepTimer = 0; audio.playSound('step') }
        }
      }

      const attackPressed = input.isPressed('Space') || touch.isPressed('attack')
      if (attackPressed) {
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

      const interactPressed = input.isPressed('KeyE') || touch.isPressed('interact')
      if (interactPressed) {
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
          audio.playSound('pickup')
        } else if (closest) {
          if (closest.name === 'Merchant' || closest.name === 'Blacksmith') {
            showShop = true
            shopType = closest.name === 'Merchant' ? 'merchant' : 'blacksmith'
            dialogueShowing = false
          } else {
            showShop = false
            shopType = ''
            if (!dialogueShowing || interactTarget !== closest) {
              interactTarget = closest; closest.dialogueIdx = 0; dialogueShowing = true
              audio.playSound('dialogue')
            } else {
              closest.dialogueIdx = (closest.dialogueIdx ?? 0) + 1
              if (closest.dialogueIdx >= (closest.dialogue?.length ?? 0)) dialogueShowing = false
            }
          }
        }
      }

      if (showShop) {
        if (input.isPressed('Digit1')) { if (gameplay.buyItem(shopType, 0)) audio.playSound('coin') }
        if (input.isPressed('Digit2')) { if (gameplay.buyItem(shopType, 1)) audio.playSound('coin') }
        if (input.isPressed('Digit3')) { if (gameplay.buyItem(shopType, 2)) audio.playSound('coin') }
      }

      if (input.isPressed('Escape')) dialogueShowing = false
      if (input.isPressed('Escape') || touch.isPressed('map')) { dialogueShowing = false; showShop = false; shopType = '' }
      if (input.isPressed('KeyM') || touch.isPressed('map')) showMinimap = !showMinimap
      renderer.toggleMinimap(showMinimap)

      if (input.isPressed('KeyQ')) {
        const nearest = findNearestEnemy()
        if (nearest) {
          const ok = gameplay.castSpell('Fireball', nearest.x, nearest.y)
          if (ok) {
            audio.playSound('fireball')
            const projs = gameplay.getPendingProjectiles()
            for (const p of projs) spells.push({ ...p, time: performance.now() })
          }
        }
      }

      if (input.isPressed('KeyF')) {
        const ok = gameplay.castSpell('Heal', 0, 0)
        if (ok) audio.playSound('heal')
      }

      for (let i = 0; i < 4; i++) {
        if (input.isPressed(`Digit${i + 1}`) || input.isPressed(`Numpad${i + 1}`) || touch.isPressed(`inventory${i + 1}`)) {
          gameplay.useInventorySlot(i)
          audio.playSound('heal')
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
        const speed = e.enemyType ? content.getEnemyStats(e.enemyType).speed : 30
        if (dist > 5) {
          e.x += (ddx / dist) * speed * dt
          e.y += (ddy / dist) * speed * dt
        } else {
          e.targetX = e.x + (Math.random() - 0.5) * 150
          e.targetY = e.y + (Math.random() - 0.5) * 150
        }
        if (e.type === 'enemy' && (!e.lastAttack || now - e.lastAttack > 1500)) {
          const d = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2)
          if (d < ATTACK_RANGE) triggerCombat(e, player)
        }
      }

      for (let i = spells.length - 1; i >= 0; i--) {
        const s = spells[i]
        if (now - s.time > 500) { spells.splice(i, 1); continue }
        const p = (now - s.time) / 500
        s.x += (s.targetX - s.x) * 0.1
        s.y += (s.targetY - s.y) * 0.1
      }

      gameplay.update(dt, gameEntities)
    }

    renderer.setCamera({ x: player.x, y: player.y })

    const aliveEntities = gameEntities.filter(e => e.alive || e === player)
    const renderEntities: Entity[] = aliveEntities.map(e => ({
      type: e.type, name: e.name || e.enemyType || '', x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp
    }))
    renderEntities.push(...items.filter(i => i.alive).map(i => ({
      type: 'item', name: i.name || '', x: i.x, y: i.y, itemType: i.itemType
    })))

    renderer.setEntities(renderEntities)
    renderer.hud = gameplay.getHUDData()
    const hud = renderer.hud
    if (showShop && shopType) {
      hud.shopItems = gameplay.getShopItems(shopType) as any
      hud.showShop = true
    }
    if (hud && hud.allQuestsComplete && gameState === 'playing') {
      gameState = 'victory'; renderer.showVictory = true
      audio.playSound('victory')
    }
    renderer.damageTexts = gameplay.getDamageTexts()
    renderer.render(time, dt)

    if (touch.isTouchDevice()) touch.update()

    if (dialogueShowing && interactTarget && interactTarget.alive) {
      const ctx = canvas.getContext('2d')!
      const dw = 400, dh = 100, dx = canvas.width / 2 - dw / 2, dy = canvas.height - dh - 40
      ctx.fillStyle = 'rgba(15,23,42,0.92)'
      ctx.beginPath(); (ctx as any).roundRect(dx, dy, dw, dh, 10); ctx.fill()
      ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 2
      ctx.beginPath(); (ctx as any).roundRect(dx, dy, dw, dh, 10); ctx.stroke()
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(`🗣️ ${interactTarget.name}`, dx + 16, dy + 24)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '14px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(interactTarget.dialogue![interactTarget.dialogueIdx ?? 0], canvas.width / 2, dy + 56)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '11px sans-serif'
      ctx.fillText('[E] continue  [ESC] close', canvas.width / 2, dy + 80)
    }

    if (combatLog.length > 0) {
      const ctx = canvas.getContext('2d')!
      const lw = 300, lh = Math.min(combatLog.length * 18 + 10, 120)
      const lx = canvas.width / 2 - lw / 2, ly = 16
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.beginPath(); (ctx as any).roundRect(lx, ly, lw, lh, 6); ctx.fill()
      ctx.fillStyle = '#fbbf24'
      ctx.font = '11px monospace'; ctx.textAlign = 'center'
      let lyOff = ly + 16
      for (const msg of combatLog.slice(-5)) { ctx.fillText(msg, canvas.width / 2, lyOff); lyOff += 18 }
    }

    requestAnimationFrame(gameLoop)
  }

  requestAnimationFrame(gameLoop)
}

window.addEventListener('DOMContentLoaded', main)