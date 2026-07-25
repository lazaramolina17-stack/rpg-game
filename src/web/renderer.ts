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

const TILE_COLORS = ['#3a7d32', '#2d5a27', '#2563eb', '#64748b', '#8B6914']
const COLORS = {
  grass: '#3a7d32', dirt: '#8B6914', water: '#2563eb', stone: '#64748b',
  player: '#a855f7', npc: '#f59e0b', enemy: '#ef4444', tree: '#166534',
  ui: 'rgba(15,23,42,0.85)', hpBar: '#34d399', hpBg: '#374151', text: '#e2e8f0'
}

interface Camera { x: number; y: number; zoom: number }

export interface Entity {
  type: string; name: string; x: number; y: number
  hp?: number; maxHp?: number
}

export class Renderer {
  private ctx: CanvasRenderingContext2D
  private camera: Camera = { x: 0, y: 0, zoom: 1 }
  private entities: Entity[] = []
  private fps = 0
  private frameCount = 0
  private lastFpsTime = 0

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

  screenToWorld(sx: number, sy: number) {
    return { x: sx + this.camera.x - this.canvas.width / 2, y: sy + this.camera.y - this.canvas.height / 2 }
  }

  render(time: number) {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height, cam = this.camera
    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.translate(w / 2 - cam.x, h / 2 - cam.y)

    const sx = Math.max(0, Math.floor((cam.x - w / 2) / TILE) - 1)
    const sy = Math.max(0, Math.floor((cam.y - h / 2) / TILE) - 1)
    const ex = Math.min(TILEMAP[0].length, Math.ceil((cam.x + w / 2) / TILE) + 1)
    const ey = Math.min(TILEMAP.length, Math.ceil((cam.y + h / 2) / TILE) + 1)

    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const tile = TILEMAP[y]?.[x] ?? 0
        ctx.fillStyle = TILE_COLORS[tile] ?? '#3a7d32'
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE)
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'
        ctx.strokeRect(x * TILE, y * TILE, TILE, TILE)
      }
    }

    const sorted = [...this.entities].sort((a, b) => a.y - b.y)
    for (const e of sorted) this.drawEntity(ctx, e)

    ctx.restore()

    this.frameCount++
    if (time - this.lastFpsTime >= 1000) { this.fps = this.frameCount; this.frameCount = 0; this.lastFpsTime = time }
    ctx.fillStyle = COLORS.text; ctx.font = '12px monospace'
    ctx.fillText(`FPS: ${this.fps}`, 8, 16)
    ctx.fillText(`Entities: ${this.entities.length}`, 8, 32)
    ctx.fillText(`Pos: ${Math.round(cam.x)},${Math.round(cam.y)}`, 8, 48)
  }

  private drawEntity(ctx: CanvasRenderingContext2D, e: Entity) {
    const x = e.x - 12, y = e.y - 16
    const color = COLORS[e.type as keyof typeof COLORS] ?? COLORS.npc

    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.beginPath(); ctx.ellipse(e.x, e.y + 14, 10, 4, 0, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = color
    ctx.fillRect(x + 4, y + 8, 16, 20)
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(x + 6, y + 2, 12, 8)
    ctx.fillStyle = color; ctx.fillRect(x + 6, y, 12, 2)

    ctx.fillStyle = '#fff'
    ctx.fillRect(x + 7, y + 4, 3, 3); ctx.fillRect(x + 14, y + 4, 3, 3)

    if (e.hp !== undefined && e.maxHp !== undefined) {
      const bw = 24, bh = 3; const bx = e.x - bw / 2, by = y - 6
      ctx.fillStyle = COLORS.hpBg; ctx.fillRect(bx, by, bw, bh)
      ctx.fillStyle = COLORS.hpBar; ctx.fillRect(bx, by, bw * (e.hp / e.maxHp), bh)
    }

    ctx.fillStyle = COLORS.text; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
    ctx.fillText(e.name || '', e.x, y - 10)
  }

  drawMiniMap(w: number, h: number, px: number, py: number) {
    const ctx = this.ctx
    const mw = 140, mh = Math.round(mw * TILEMAP.length / TILEMAP[0].length)
    const mx = w - mw - 16, my = 100, ts = mw / TILEMAP[0].length
    ctx.fillStyle = 'rgba(15,23,42,0.8)'; ctx.fillRect(mx - 4, my - 4, mw + 8, mh + 8)
    for (let y = 0; y < TILEMAP.length; y++)
      for (let x = 0; x < TILEMAP[0].length; x++) {
        ctx.fillStyle = TILE_COLORS[TILEMAP[y][x]]; ctx.fillRect(mx + x * ts, my + y * ts, ts, ts)
      }
    ctx.fillStyle = COLORS.player
    ctx.beginPath(); ctx.arc(mx + px / TILE * ts, my + py / TILE * ts, 3, 0, Math.PI * 2); ctx.fill()
  }
}