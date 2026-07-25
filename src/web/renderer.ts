import { ProceduralTiles, drawEntitySprite, drawBackground, drawFogOfWar, drawLightning } from './graphics.js'

export const TILE = 32

export const TILEMAP: number[][] = (() => {
  const chars = [
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggtttttgggggggggggtttttgggggg',
    'ggggtgggggtgggggggggtgggggtggggg',
    'ggggtgggggtgggggggggtgggggtggggg',
    'gggggtttttgggggggggggtttttgggggg',
    'ggggggggggwggggggggggggggggggggg',
    'ggggggggggwggggggggggggggggggggg',
    'ggggggggggsssggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'ggggddddggggggggggggdddddggggggg',
    'ggggddddggggggggggggdddddggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
    'gggggggggggggggggggggggggggggggg',
  ]
  const map: Record<string, number> = { g: 0, t: 1, w: 2, s: 3, d: 4 }
  return chars.map(r => [...r].map(c => map[c] ?? 0))
})()

interface Camera { x: number; y: number; zoom: number }

export interface Entity {
  type: string; name: string; x: number; y: number
  hp?: number; maxHp?: number; itemType?: string
}

export interface HUDData {
  level: number; xp: number; xpToNext: number
  hp: number; maxHp: number
  inventory: ({ type: string; name: string; quantity: number } | null)[]
  quests: { name: string; objective: string; completed: boolean }[]
  allQuestsComplete: boolean; gold: number
}

export interface DamageText {
  text: string; x: number; y: number; alpha: number
}

interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; color: string; size: number
}

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private camera: Camera = { x: 0, y: 0, zoom: 1 }
  private entities: Entity[] = []
  private particles: Particle[] = []
  private screenFlash = 0
  private levelUpText = 0
  private levelUpY = 0
  private time = 0
  private fps = 0
  private frameCount = 0
  private lastFpsTime = 0
  hud: HUDData | null = null
  damageTexts: DamageText[] = []
  showVictory = false
  gameOver = false
  private minimapVisible = false

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  getCtx() { return this.ctx }

  setCamera(cam: Partial<Camera>) { Object.assign(this.camera, cam) }
  getCamera() { return this.camera }
  setEntities(es: Entity[]) { this.entities = es }
  toggleMinimap(visible: boolean) { this.minimapVisible = visible }

  addParticles(x: number, y: number, color: string, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 30 + Math.random() * 60
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
        color, size: 2 + Math.random() * 3,
      })
    }
  }

  flashScreen() { this.screenFlash = 0.15 }
  showLevelUp(x: number) { this.levelUpText = 2; this.levelUpY = x }

  render(time: number, dt: number) {
    this.time = time
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, cam = this.camera

    ctx.clearRect(0, 0, w, h)

    drawBackground(ctx, w, h, -cam.x, -cam.y, time)

    this.updateParticles(dt)
    this.drawTiles(ctx, w, h, cam, time)
    this.drawEntities(ctx, cam, time)
    this.drawParticles(ctx)
    this.drawHUD(ctx, w, h)
    this.drawDamageTexts(ctx)

    drawFogOfWar(ctx, w, h, w / 2, h / 2, 300)

    if (this.screenFlash > 0) {
      ctx.fillStyle = `rgba(255,0,0,${this.screenFlash * 0.3})`
      ctx.fillRect(0, 0, w, h)
      this.screenFlash -= dt
    }
    if (this.levelUpText > 0) {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✨ LEVEL UP! ✨', w / 2, this.levelUpY)
      this.levelUpText -= dt
    }
    this.drawDebug(ctx)

    if (this.gameOver) this.drawGameOver(ctx, w, h)
    if (this.showVictory) this.drawVictory(ctx, w, h)
    if (this.minimapVisible) this.drawMinimap(ctx, w, h, cam)

    this.frameCount++
    if (time - this.lastFpsTime >= 1000) { this.fps = this.frameCount; this.frameCount = 0; this.lastFpsTime = time }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt; p.y += p.vy * dt
      p.vy += 120 * dt; p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }
  }

  private drawTiles(ctx: CanvasRenderingContext2D, w: number, h: number, cam: Camera, time: number) {
    const sx = Math.max(0, Math.floor((cam.x - w / 2) / TILE) - 1)
    const sy = Math.max(0, Math.floor((cam.y - h / 2) / TILE) - 1)
    const ex = Math.min(TILEMAP[0].length, Math.ceil((cam.x + w / 2) / TILE) + 1)
    const ey = Math.min(TILEMAP.length, Math.ceil((cam.y + h / 2) / TILE) + 1)

    ctx.save()
    ctx.translate(w / 2 - cam.x, h / 2 - cam.y)

    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const tile = TILEMAP[y]?.[x] ?? 0
        ctx.save()
        ctx.translate(x * TILE, y * TILE)
        ProceduralTiles.generateTile(ctx, tile, x * 100 + y, time)
        ctx.restore()
      }
    }

    ctx.restore()
  }

  private drawEntities(ctx: CanvasRenderingContext2D, cam: Camera, time: number) {
    const sorted = [...this.entities].sort((a, b) => a.y - b.y)
    ctx.save()
    ctx.translate(this.canvas.width / 2 - cam.x, this.canvas.height / 2 - cam.y)
    const t = time
    for (const e of sorted) {
      const bob = e.type === 'player' || e.type === 'npc' || e.type === 'enemy' ? 1.5 : 0
      drawEntitySprite(ctx, e.type, e.name, e.x, e.y, t, bob)
      if (e.hp !== undefined && e.maxHp !== undefined && e.maxHp > 0) {
        const bw = 28, bh = 4, bx = e.x - bw / 2, by = e.y - 22
        ctx.fillStyle = '#374151'; ctx.fillRect(bx, by, bw, bh)
        const ratio = Math.max(0, (e.hp ?? 0) / e.maxHp)
        ctx.fillStyle = ratio < 0.3 ? '#ef4444' : ratio < 0.6 ? '#f59e0b' : '#34d399'
        ctx.fillRect(bx, by, bw * ratio, bh)
        ctx.strokeStyle = '#1e293b'; ctx.strokeRect(bx, by, bw, bh)
      }
    }
    ctx.restore()
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife)
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size)
    }
    ctx.globalAlpha = 1
  }

  private drawDamageTexts(ctx: CanvasRenderingContext2D) {
    const cam = this.camera, w = this.canvas.width, h = this.canvas.height
    for (const d of this.damageTexts) {
      ctx.globalAlpha = d.alpha
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 3
      ctx.fillText(d.text, d.x - cam.x + w / 2, d.y - cam.y + h / 2)
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const hud = this.hud
    if (!hud) return

    const px = 12, py = 12, pw = 220, ph = 100
    ctx.fillStyle = 'rgba(15,23,42,0.85)'
    this.roundRect(ctx, px, py, pw, ph, 8)
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1
    this.roundRect(ctx, px, py, pw, ph, 8)

    const bar = (label: string, val: number, max: number, y: number, color: string) => {
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText(label, px + 10, y + 10)
      const bw = 120, bh = 10, bx = px + 70, by = y
      ctx.fillStyle = '#374151'; ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = color
      ctx.fillRect(bx, by, bw * Math.min(val / max, 1), bh)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(val)}/${Math.round(max)}`, bx + bw / 2, by + 9)
    }

    bar(`❤️ Lv${hud.level}`, hud.hp, hud.maxHp, py + 8, '#34d399')
    bar('⭐ XP', hud.xp, hud.xpToNext, py + 26, '#a855f7')
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`💰 ${hud.gold}`, px + 10, py + 56)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px monospace'
    ctx.fillText(`FPS:${this.fps} En:${this.entities.length}`, px + 10, py + 76)

    if (hud.inventory.some(s => s !== null)) {
      const ix = px, iy = py + ph + 8
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      this.roundRect(ctx, ix, iy, 220, 34, 6)
      ctx.strokeStyle = '#a855f7'
      this.roundRect(ctx, ix, iy, 220, 34, 6)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('1          2          3          4', ix + 14, iy + 12)
      for (let i = 0; i < 4; i++) {
        const slot = hud.inventory[i]
        const sx = ix + 8 + i * 52, sy = iy + 16
        ctx.fillStyle = slot ? '#1e293b' : '#0f172a'
        ctx.fillRect(sx, sy, 46, 14)
        ctx.strokeStyle = '#475569'; ctx.strokeRect(sx, sy, 46, 14)
        if (slot) {
          ctx.fillStyle = slot.type === 'health_potion' ? '#ef4444' : '#fbbf24'
          ctx.font = '9px sans-serif'; ctx.textAlign = 'center'
          ctx.fillText(`${slot.quantity}x`, sx + 23, sy + 11)
        }
      }
    }

    if (hud.quests.length > 0) {
      const qx = w - 230, qy = 12
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8)
      ctx.strokeStyle = '#f59e0b'
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8)
      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left'
      ctx.fillText('📜 Quests', qx + 10, qy + 14)
      for (let i = 0; i < hud.quests.length; i++) {
        const q = hud.quests[i]
        ctx.fillStyle = q.completed ? '#34d399' : '#e2e8f0'
        ctx.font = '10px sans-serif'
        ctx.fillText(q.objective, qx + 10, qy + 32 + i * 18)
      }
    }
  }

  private drawGameOver(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center'
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 20
    ctx.fillText('💀 GAME OVER', w / 2, h / 2 - 30)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#94a3b8'
    ctx.font = '18px sans-serif'
    ctx.fillText('Presiona R para reiniciar', w / 2, h / 2 + 30)
  }

  private drawVictory(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'
    ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 30
    ctx.fillText('🎉 YOU WIN! 🎉', w / 2, h / 2 - 20)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '18px sans-serif'
    ctx.fillText('¡Todas las quests completadas!', w / 2, h / 2 + 30)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px sans-serif'
    ctx.fillText('Presiona R para reiniciar', w / 2, h / 2 + 60)
  }

  private drawDebug(ctx: CanvasRenderingContext2D) {
    const x = 12, y = this.canvas.height - 20
    ctx.fillStyle = 'rgba(15,23,42,0.7)'
    ctx.fillRect(x - 4, y - 14, 240, 18)
    ctx.fillStyle = '#475569'
    ctx.font = '10px monospace'; ctx.textAlign = 'left'
    ctx.fillText(`[WASD/Joystick] Mov  [Space/⚔] Atk  [E/✋] Int  [M/🗺] Mapa  [1-4]`, x, y - 2)
  }

  private drawMinimap(ctx: CanvasRenderingContext2D, w: number, h: number, cam: Camera) {
    const mw = 140, mh = Math.round(mw * TILEMAP.length / TILEMAP[0].length)
    const mx = w - mw - 16, my = 100, ts = mw / TILEMAP[0].length
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8)
    ctx.strokeStyle = '#a855f7'; ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 8)
    for (let y = 0; y < TILEMAP.length; y++)
      for (let x = 0; x < TILEMAP[0].length; x++) {
        const tile = TILEMAP[y][x]
        ctx.fillStyle = tile === 0 ? '#3a7d32' : tile === 1 ? '#2d5a27' : tile === 2 ? '#2563eb' : tile === 3 ? '#64748b' : '#8B6914'
        ctx.fillRect(mx + x * ts, my + y * ts, ts, ts)
      }
    const viewW = w / TILE * ts, viewH = h / TILE * ts
    const viewX = mx + (cam.x - w / 2) / TILE * ts
    const viewY = my + (cam.y - h / 2) / TILE * ts
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.strokeRect(viewX, viewY, viewW, viewH)
    for (const e of this.entities) {
      ctx.fillStyle = e.type === 'player' ? '#a855f7' : e.type === 'enemy' ? '#ef4444' : e.type === 'npc' ? '#f59e0b' : '#34d399'
      ctx.beginPath(); ctx.arc(mx + e.x / TILE * ts, my + e.y / TILE * ts, 2, 0, Math.PI * 2); ctx.fill()
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.stroke()
  }
}