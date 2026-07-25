import { Renderer, Entity } from './renderer.js'
import { Input } from './input.js'

const SPEED = 120
const ATTACK_RANGE = 40
const ATTACK_COOLDOWN = 500

interface GameEntity extends Entity {
  targetX?: number
  targetY?: number
  dialogue?: string[]
  dialogueIdx?: number
  lastAttack?: number
  alive: boolean
}

const npcs: GameEntity[] = []
const dialogues = [
  ['Hello traveler!', 'Welcome to our village.', 'Be careful of the bandits to the north!'],
  ['The forest is dangerous at night.', 'I heard strange noises...'],
  ['Can you spare some gold?', 'Just kidding, stay safe out there!'],
  ['I used to be an adventurer like you.', 'Then I took an arrow to the knee.'],
  ['The ancient ruins hold great treasures.', 'But also great dangers...']
]

let combatLog: string[] = []
let showMap = false
let gameOver = false

function spawnNPC(type: string, name: string, x: number, y: number, hp?: number) {
  const e: GameEntity = { type, name, x, y, alive: true, dialogue: dialogues[Math.floor(Math.random() * dialogues.length)] }
  if (hp) { e.hp = hp; e.maxHp = hp }
  npcs.push(e)
  return e
}

function spawnEnemy(x: number, y: number, patrolRange: number) {
  const e = spawnNPC('enemy', `Bandit lv${1 + Math.floor(Math.random() * 3)}`, x, y, 30 + Math.floor(Math.random() * 20))
  e.targetX = x + (Math.random() - 0.5) * patrolRange * 2
  e.targetY = y + (Math.random() - 0.5) * patrolRange * 2
  return e
}

function initWorld() {
  spawnNPC('npc', 'Merchant', 5 * 32, 8 * 32)
  spawnNPC('npc', 'Guard', 6 * 32, 9 * 32)
  spawnNPC('npc', 'Elder', 4 * 32, 7 * 32)
  spawnNPC('npc', 'Blacksmith', 7 * 32, 8 * 32)
  spawnNPC('npc', 'Farmer', 3 * 32, 10 * 32)
  
  for (let i = 0; i < 8; i++) {
    const ex = 20 * 32 + Math.random() * 10 * 32
    const ey = 5 * 32 + Math.random() * 8 * 32
    spawnEnemy(ex, ey, 4 * 32)
  }
}

function getEntities(gameEntities: GameEntity[], px: number, py: number): Entity[] {
  return gameEntities.filter(e => e.alive).map(e => ({ type: e.type, name: e.name, x: e.x, y: e.y, hp: e.hp, maxHp: e.maxHp }))
}

function main() {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  const uiOverlay = document.getElementById('ui-overlay')!
  
  const renderer = new Renderer(canvas)
  const input = new Input()
  
  const player: GameEntity = { type: 'player', name: 'Hero', x: 4 * 32, y: 12 * 32, alive: true, hp: 100, maxHp: 100 }
  
  initWorld()
  
  const gameEntities = [player, ...npcs]
  let interactTarget: GameEntity | null = null
  let dialogueShowing = false
  let lastTime = 0
  
  const triggerCombat = (attacker: GameEntity, target: GameEntity) => {
    const dmg = 8 + Math.floor(Math.random() * 12)
    target.hp! -= dmg
    const msg = `${attacker.name} hits ${target.name} for ${dmg} damage!`
    combatLog.push(msg)
    if (combatLog.length > 5) combatLog.shift()
    attacker.lastAttack = performance.now()
    
    if (target.hp! <= 0) {
      target.alive = false
      target.hp = 0
      combatLog.push(`${target.name} has been defeated!`)
      if (target === player) gameOver = true
    }
  }
  
  const gameLoop = (time: number) => {
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016
    lastTime = time
    
    input.update()
    
    if (!gameOver) {
      // Player movement
      let dx = input.dx(), dy = input.dy()
      if (dx || dy) {
        const len = Math.sqrt(dx * dx + dy * dy)
        dx /= len; dy /= len
        const newX = player.x + dx * SPEED * dt
        const newY = player.y + dy * SPEED * dt
        const tileX = Math.floor(newX / 32)
        const tileY = Math.floor(newY / 32)
        if (TILEMAP[tileY]?.[tileX] !== undefined && TILEMAP[tileY][tileX] !== 2) {
          player.x = newX
          player.y = newY
        }
      }
      
      // Attack
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
          if (closest) triggerCombat(player, closest)
        }
      }
      
      // Interact
      if (input.isPressed('KeyE')) {
        let closest: GameEntity | null = null
        let closestDist = 50
        for (const e of gameEntities) {
          if (e === player || !e.alive || e.type !== 'npc') continue
          const d = Math.sqrt((e.x - player.x) ** 2 + (e.y - player.y) ** 2)
          if (d < closestDist) { closestDist = d; closest = e }
        }
        if (closest) {
          interactTarget = closest
          dialogueShowing = !dialogueShowing
          if (dialogueShowing) closest.dialogueIdx = 0
        }
      }
      
      if (input.isPressed('KeyM')) showMap = !showMap
      
      // NPC AI - wander
      const now = performance.now()
      for (const e of gameEntities) {
        if (e === player || !e.alive || (e.type !== 'npc' && e.type !== 'enemy')) continue
        if (e.targetX === undefined) {
          e.targetX = e.x + (Math.random() - 0.5) * 100
          e.targetY = e.y + (Math.random() - 0.5) * 100
        }
        const tx = e.targetX, ty = e.targetY
        const ddx = tx - e.x, ddy = ty - e.y
        const dist = Math.sqrt(ddx * ddx + ddy * ddy)
        if (dist > 5) {
          e.x += (ddx / dist) * 30 * dt
          e.y += (ddy / dist) * 30 * dt
        } else {
          e.targetX = e.x + (Math.random() - 0.5) * 150
          e.targetY = e.y + (Math.random() - 0.5) * 150
        }
        
        // Enemies attack player if close
        if (e.type === 'enemy' && !e.lastAttack || now - e.lastAttack! > 1500) {
          const d = Math.sqrt((player.x - e.x) ** 2 + (player.y - e.y) ** 2)
          if (d < ATTACK_RANGE) {
            triggerCombat(e, player)
          }
        }
      }
    }
    
    // Camera follows player
    renderer.setCamera({ x: player.x, y: player.y })
    
    // Render
    renderer.setEntities(getEntities(gameEntities, player.x, player.y))
    renderer.render(time)
    
    if (showMap && !gameOver) {
      (renderer as any).drawMiniMap(renderer['ctx'], canvas.width, canvas.height, player.x, player.y)
    }
    
    // Dialogue overlay
    if (dialogueShowing && interactTarget) {
      const ctx2 = canvas.getContext('2d')!
      ctx2.fillStyle = 'rgba(15,23,42,0.85)'
      ctx2.fillRect(canvas.width / 2 - 200, canvas.height - 160, 400, 120)
      ctx2.strokeStyle = '#a855f7'
      ctx2.strokeRect(canvas.width / 2 - 200, canvas.height - 160, 400, 120)
      ctx2.fillStyle = '#e2e8f0'
      ctx2.font = '14px sans-serif'
      ctx2.textAlign = 'center'
      const diag = interactTarget.dialogue!
      const idx = interactTarget.dialogueIdx ?? 0
      ctx2.fillText(diag[idx % diag.length], canvas.width / 2, canvas.height - 120)
      ctx2.fillStyle = '#94a3b8'
      ctx2.font = '11px sans-serif'
      ctx2.fillText('[E] continue  [ESC] close', canvas.width / 2, canvas.height - 90)
      if (input.isPressed('Escape')) dialogueShowing = false
      if (input.isPressed('KeyE')) {
        interactTarget.dialogueIdx = (interactTarget.dialogueIdx ?? 0) + 1
      }
    }
    
    // Combat log
    if (combatLog.length > 0) {
      const ctx3 = canvas.getContext('2d')!
      ctx3.fillStyle = 'rgba(0,0,0,0.6)'
      ctx3.fillRect(canvas.width / 2 - 150, 20, 300, 100)
      ctx3.fillStyle = '#fbbf24'
      ctx3.font = '12px monospace'
      ctx3.textAlign = 'center'
      let y = 44
      for (const msg of combatLog.slice(-4)) {
        ctx3.fillText(msg, canvas.width / 2, y)
        y += 18
      }
    }
    
    // Game over
    if (gameOver) {
      const ctx4 = canvas.getContext('2d')!
      ctx4.fillStyle = 'rgba(0,0,0,0.7)'
      ctx4.fillRect(0, 0, canvas.width, canvas.height)
      ctx4.fillStyle = '#ef4444'
      ctx4.font = '48px sans-serif'
      ctx4.textAlign = 'center'
      ctx4.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20)
      ctx4.fillStyle = '#94a3b8'
      ctx4.font = '18px sans-serif'
      ctx4.fillText('Refresh to restart', canvas.width / 2, canvas.height / 2 + 30)
    }
    
    requestAnimationFrame(gameLoop)
  }
  
  requestAnimationFrame(gameLoop)
}

window.addEventListener('DOMContentLoaded', main)