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

  setCamera(cam: Partial<Camera>) { Object.assign(this.camera, cam) }
  getCamera() { return this.camera }
  setEntities(es: Entity[]) { this.entities = es }
  toggleMinimap() { this.minimapVisible = !this.minimapVisible }

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

    this.updateParticles(dt)
    this.drawTiles(ctx, w, h, cam)
    this.drawEntities(ctx, cam)
    this.drawParticles(ctx)
    this.drawHUD(ctx, w, h)
    this.drawDamageTexts(ctx)
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

    if (this.minimapVisible) this.drawMinimap(ctx, w, h)

    this.frameCount++
    if (time - this.lastFpsTime >= 1000) { this.fps = this.frameCount; this.frameCount = 0; this.lastFpsTime = time }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 120 * dt
      p.life -= dt
      if (p.life <= 0) this.particles.splice(i, 1)
    }
  }

  private drawTiles(ctx: CanvasRenderingContext2D, w: number, h: number, cam: Camera) {
    const sx = Math.max(0, Math.floor((cam.x - w / 2) / TILE) - 1)
    const sy = Math.max(0, Math.floor((cam.y - h / 2) / TILE) - 1)
    const ex = Math.min(TILEMAP[0].length, Math.ceil((cam.x + w / 2) / TILE) + 1)
    const ey = Math.min(TILEMAP.length, Math.ceil((cam.y + h / 2) / TILE) + 1)

    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const tile = TILEMAP[y]?.[x] ?? 0
        const px = x * TILE, py = y * TILE

        if (tile === 0) {
          ctx.fillStyle = '#3a7d32'
          ctx.fillRect(px, py, TILE, TILE)
          ctx.fillStyle = '#4a8d42'
          if ((x + y) % 3 === 0) ctx.fillRect(px + 8, py + 12, 3, 6)
          if ((x + y) % 5 === 0) ctx.fillStyle = '#5a9d52'; ctx.fillRect(px + 20, py + 8, 2, 5)
        } else if (tile === 1) {
          ctx.fillStyle = '#2d5a27'
          ctx.fillRect(px, py, TILE, TILE)
          ctx.fillStyle = '#1a4a17'
          ctx.fillRect(px + 4, py + 8, 24, 18)
          ctx.fillStyle = '#3a6d37'
          ctx.beginPath(); ctx.arc(px + 16, py + 6, 8, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(px + 10, py + 4, 6, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(px + 22, py + 5, 7, 0, Math.PI * 2); ctx.fill()
        } else if (tile === 2) {
          ctx.fillStyle = '#2563eb'
          ctx.fillRect(px, py, TILE, TILE)
          ctx.fillStyle = '#1d4ed8'
          ctx.fillRect(px + 2, py + 2, 10, 2)
          ctx.fillRect(px + 18, py + 8, 8, 2)
          ctx.fillRect(px + 6, py + 20, 12, 2)
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(px + 14, py + 14, 4, 4)
        } else if (tile === 3) {
          ctx.fillStyle = '#64748b'
          ctx.fillRect(px, py, TILE, TILE)
          ctx.fillStyle = '#475569'
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(px + 4 + i * 10, py + 6 + i * 8, 6, 3)
          }
        } else if (tile === 4) {
          ctx.fillStyle = '#8B6914'
          ctx.fillRect(px, py, TILE, TILE)
          ctx.fillStyle = '#9B7924'
          ctx.fillRect(px + 4, py + 4, 24, 2)
          ctx.fillRect(px + 2, py + 12, 28, 2)
          ctx.fillRect(px + 6, py + 20, 20, 2)
        }

        ctx.strokeStyle = 'rgba(0,0,0,0.05)'
        ctx.strokeRect(px, py, TILE, TILE)
      }
    }
  }

  private drawEntities(ctx: CanvasRenderingContext2D, cam: Camera) {
    const sorted = [...this.entities].sort((a, b) => a.y - b.y)
    const t = this.time / 1000
    for (const e of sorted) this.drawEntity(ctx, e, t)
  }

  private drawEntity(ctx: CanvasRenderingContext2D, e: Entity, t: number) {
    const bob = e.type === 'player' || e.type === 'npc' || e.type === 'enemy' ? Math.sin(t * 3 + e.x) * 1.5 : 0
    const x = e.x - 16, y = e.y - 16 + bob

    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 14, 12, 4, 0, 0, Math.PI * 2); ctx.fill()

    if (e.type === 'player') {
      ctx.fillStyle = '#a855f7'
      ctx.fillRect(x + 8, y + 12, 16, 16)
      ctx.fillStyle = '#9333ea'
      ctx.fillRect(x + 4, y + 6, 24, 8)
      ctx.fillStyle = '#c084fc'
      ctx.fillRect(x + 6, y + 4, 8, 3)
      ctx.fillRect(x + 18, y + 4, 8, 3)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x + 8, y + 8, 4, 4)
      ctx.fillRect(x + 20, y + 8, 4, 4)
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(x + 14, y - 2, 4, 6)
    } else if (e.type === 'enemy') {
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(x + 6, y + 10, 20, 18)
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(x + 4, y + 4, 24, 8)
      ctx.fillStyle = '#f87171'
      ctx.fillRect(x + 6, y + 2, 8, 3)
      ctx.fillRect(x + 18, y + 2, 8, 3)
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(x + 8, y + 6, 4, 4)
      ctx.fillRect(x + 20, y + 6, 4, 4)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x + 11, y + 7, 2, 2)
      ctx.fillRect(x + 19, y + 7, 2, 2)
      ctx.fillStyle = '#450a0a'
      ctx.fillRect(x + 12, y + 12, 8, 2)
    } else if (e.type === 'npc') {
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(x + 8, y + 12, 16, 16)
      ctx.fillStyle = '#d97706'
      ctx.fillRect(x + 6, y + 8, 20, 6)
      ctx.fillStyle = '#fde68a'
      ctx.fillRect(x + 8, y + 4, 16, 5)
      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(x + 9, y + 8, 3, 3)
      ctx.fillRect(x + 20, y + 8, 3, 3)
      if (e.name === 'Guard') {
        ctx.fillStyle = '#64748b'
        ctx.fillRect(x + 2, y + 14, 4, 12)
        ctx.fillRect(x + 26, y + 14, 4, 12)
      }
    } else if (e.type === 'item') {
      const pulse = Math.sin(t * 4) * 0.3 + 0.7
      ctx.globalAlpha = pulse
      if (e.itemType === 'health_potion') {
        ctx.fillStyle = '#ef4444'
        ctx.beginPath(); ctx.arc(e.x, e.y, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fca5a5'
        ctx.fillRect(e.x - 2, e.y - 8, 4, 4)
      } else if (e.itemType === 'gold') {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath(); ctx.arc(e.x, e.y, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(e.x - 3, e.y - 2, 6, 4)
        ctx.fillRect(e.x - 2, e.y - 1, 4, 2)
      } else if (e.itemType === 'weapon') {
        ctx.fillStyle = '#94a3b8'
        ctx.fillRect(e.x - 2, e.y - 10, 4, 14)
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(e.x - 1, e.y - 10, 2, 12)
        ctx.fillStyle = '#8B6914'
        ctx.fillRect(e.x - 3, e.y + 4, 6, 3)
      }
      ctx.globalAlpha = 1
    }

    if (e.hp !== undefined && e.maxHp !== undefined && e.maxHp > 0) {
      const bw = 28, bh = 4
      const bx = e.x - bw / 2, by = y - 6
      ctx.fillStyle = '#374151'; ctx.fillRect(bx, by, bw, bh)
      const ratio = Math.max(0, (e.hp ?? 0) / e.maxHp)
      ctx.fillStyle = ratio < 0.3 ? '#ef4444' : ratio < 0.6 ? '#f59e0b' : '#34d399'
      ctx.fillRect(bx, by, bw * ratio, bh)
      ctx.strokeStyle = '#1e293b'; ctx.strokeRect(bx, by, bw, bh)
    }

    ctx.fillStyle = '#e2e8f0'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 2
    ctx.fillText(e.name || '', e.x, y - 12)
    ctx.shadowBlur = 0
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
    for (const d of this.damageTexts) {
      ctx.globalAlpha = d.alpha
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 3
      ctx.fillText(d.text, d.x, d.y)
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const hud = this.hud
    if (!hud) return

    const panelX = 12, panelY = 12, panelW = 220, panelH = 100
    ctx.fillStyle = 'rgba(15,23,42,0.85)'
    this.roundRect(ctx, panelX, panelY, panelW, panelH, 8)
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1
    this.roundRect(ctx, panelX, panelY, panelW, panelH, 8)

    const bar = (label: string, val: number, max: number, y: number, color: string) => {
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, panelX + 10, y + 10)
      const bw = 120, bh = 10, bx = panelX + 70, by = y
      ctx.fillStyle = '#374151'; ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = color
      ctx.fillRect(bx, by, bw * Math.min(val / max, 1), bh)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`${Math.round(val)}/${Math.round(max)}`, bx + bw / 2, by + 9)
    }

    bar(`❤️ Lv${hud.level}`, hud.hp, hud.maxHp, panelY + 8, '#34d399')
    bar('⭐ XP', hud.xp, hud.xpToNext, panelY + 26, '#a855f7')
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`💰 ${hud.gold}`, panelX + 10, panelY + 56)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`FPS:${this.fps}`, panelX + 10, panelY + 76)
    ctx.fillText(`En:${this.entities.length}`, panelX + 80, panelY + 76)

    if (hud.inventory.some(s => s !== null)) {
      const invX = panelX, invY = panelY + panelH + 8
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      this.roundRect(ctx, invX, invY, 220, 34, 6)
      ctx.strokeStyle = '#a855f7'
      this.roundRect(ctx, invX, invY, 220, 34, 6)

      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('1          2          3          4', invX + 14, invY + 12)

      for (let i = 0; i < 4; i++) {
        const slot = hud.inventory[i]
        const sx = invX + 8 + i * 52, sy = invY + 16
        ctx.fillStyle = slot ? '#1e293b' : '#0f172a'
        ctx.fillRect(sx, sy, 46, 14)
        ctx.strokeStyle = '#475569'
        ctx.strokeRect(sx, sy, 46, 14)
        if (slot) {
          ctx.fillStyle = slot.type === 'health_potion' ? '#ef4444' : '#fbbf24'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(`${slot.quantity}x`, sx + 23, sy + 11)
        }
      }
    }

    if (hud.quests.length > 0) {
      const qx = w - 230, qy = 12
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8)
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1
      this.roundRect(ctx, qx, qy, 220, 16 + hud.quests.length * 20, 8)

      ctx.fillStyle = '#f59e0b'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('📜 Quests', qx + 10, qy + 14)

      for (let i = 0; i < hud.quests.length; i++) {
        const q = hud.quests[i]
        ctx.fillStyle = q.completed ? '#34d399' : '#e2e8f0'
        ctx.font = q.completed ? '10px sans-serif' : '10px sans-serif'
        ctx.fillText(q.objective, qx + 10, qy + 32 + i * 18)
      }
    }
  }

  private drawGameOver(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 56px sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 20
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
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = '#fbbf24'
    ctx.shadowBlur = 30
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
    ctx.fillRect(x - 4, y - 14, 200, 18)
    ctx.fillStyle = '#475569'
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(`[WASD] Mov  [Space] Atk  [E] Interact  [M] Mapa  [1-4] Items`, x, y - 2)
  }

  private drawMinimap(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const mw = 140, mh = Math.round(mw * TILEMAP.length / TILEMAP[0].length)
    const mx = w - mw - 16, my = 100, ts = mw / TILEMAP[0].length
    ctx.fillStyle = 'rgba(15,23,42,0.85)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8)
    ctx.strokeStyle = '#a855f7'; ctx.lineWidth = 1
    ctx.strokeRect(mx - 4, my - 4, mw + 8, mh + 8)
    for (let y = 0; y < TILEMAP.length; y++) {
      for (let x = 0; x < TILEMAP[0].length; x++) {
        const tile = TILEMAP[y][x]
        ctx.fillStyle = tile === 0 ? '#3a7d32' : tile === 1 ? '#2d5a27' : tile === 2 ? '#2563eb' : tile === 3 ? '#64748b' : '#8B6914'
        ctx.fillRect(mx + x * ts, my + y * ts, ts, ts)
      }
    }
    const cam = this.camera
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
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
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