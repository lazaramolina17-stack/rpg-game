interface TouchPoint {
  id: number
  x: number
  y: number
}

interface TouchButton {
  action: string
  label: string
  x: number
  y: number
  radius: number
  color: string
  down: boolean
  scale: number
}

export class TouchController {
  private ctx: CanvasRenderingContext2D
  private activeTouches: Map<number, TouchPoint> = new Map()
  private joystickId: number | null = null
  private jx = 0
  private jy = 0
  private jcx = 0
  private jcy = 0
  private jr = 120
  private jknobX = 0
  private jknobY = 0
  private jActive = false
  private buttons: TouchButton[] = []
  private down = new Set<string>()
  private justDown = new Set<string>()
  private prevDown = new Set<string>()
  private itemR = 24

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.layout()
    window.addEventListener('resize', () => this.layout())
    this.bind()
  }

  private layout() {
    const w = this.canvas.width
    const h = this.canvas.height
    const s = Math.min(w, h) / 800
    this.jr = Math.max(60, Math.round(120 * s))
    this.jcx = this.jr + 24
    this.jcy = h - this.jr - 24

    const br = Math.max(36, Math.round(60 * s))
    this.itemR = Math.max(18, Math.round(24 * s))

    this.buttons = [
      { action: 'attack', label: '⚔', x: w - br - 16, y: h - br - 16, radius: br, color: '#ef4444', down: false, scale: 1 },
      { action: 'interact', label: '✋', x: w - br - 16, y: h - br * 3 - 32, radius: br * 0.75, color: '#3b82f6', down: false, scale: 1 },
      { action: 'map', label: '🗺', x: w - br * 0.75 - 12, y: br * 0.75 + 12, radius: br * 0.65, color: '#a855f7', down: false, scale: 1 },
    ]

    const gap = 10
    const tw = 4 * this.itemR * 2 + 3 * gap
    const sx = (w - tw) / 2 + this.itemR
    const sy = h - this.itemR - 12
    for (let i = 0; i < 4; i++) {
      this.buttons.push({
        action: `inventory${i + 1}`,
        label: `${i + 1}`,
        x: sx + i * (this.itemR * 2 + gap),
        y: sy,
        radius: this.itemR,
        color: '#8b5cf6',
        down: false,
        scale: 1,
      })
    }
  }

  private pos(t: Touch): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect()
    return { x: t.clientX - r.left, y: t.clientY - r.top }
  }

  private bind() {
    const p = { passive: false }
    this.canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const p = this.pos(t)
        this.activeTouches.set(t.identifier, { id: t.identifier, x: p.x, y: p.y })
        this.touchStart(t.identifier, p.x, p.y)
      }
    }, p)

    this.canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        const p = this.pos(t)
        const tp = this.activeTouches.get(t.identifier)
        if (tp) { tp.x = p.x; tp.y = p.y }
        this.touchMove(t.identifier, p.x, p.y)
      }
    }, p)

    this.canvas.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault()
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i]
        this.activeTouches.delete(t.identifier)
        this.touchEnd(t.identifier)
      }
    }, p)

    this.canvas.addEventListener('touchcancel', (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        this.activeTouches.delete(e.changedTouches[i].identifier)
        this.touchEnd(e.changedTouches[i].identifier)
      }
    }, p)
  }

  private touchStart(id: number, x: number, y: number) {
    if (this.joystickId === null) {
      const dx = x - this.jcx
      const dy = y - this.jcy
      if (dx * dx + dy * dy < (this.jr + 40) * (this.jr + 40)) {
        this.joystickId = id
        this.jActive = true
        this.updateJoy(x, y)
        return
      }
    }

    for (const b of this.buttons) {
      const dx = x - b.x
      const dy = y - b.y
      if (dx * dx + dy * dy <= b.radius * b.radius * 1.3) {
        b.down = true
        b.scale = 0.8
        this.down.add(b.action)
        this.justDown.add(b.action)
        return
      }
    }
  }

  private touchMove(id: number, x: number, y: number) {
    if (this.joystickId === id) {
      this.updateJoy(x, y)
    }
  }

  private touchEnd(id: number) {
    if (this.joystickId === id) {
      this.joystickId = null
      this.jActive = false
      this.jknobX = 0
      this.jknobY = 0
      return
    }

    for (const b of this.buttons) {
      if (b.down) {
        b.down = false
        b.scale = 1
        this.down.delete(b.action)
      }
    }
  }

  private updateJoy(tx: number, ty: number) {
    let dx = tx - this.jcx
    let dy = ty - this.jcy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxD = this.jr * 0.6
    if (dist > maxD) {
      dx = dx / dist * maxD
      dy = dy / dist * maxD
    }
    this.jknobX = dx
    this.jknobY = dy
  }

  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  dx(): number {
    if (!this.jActive) return 0
    const maxD = this.jr * 0.6
    return Math.max(-1, Math.min(1, this.jknobX / maxD))
  }

  dy(): number {
    if (!this.jActive) return 0
    const maxD = this.jr * 0.6
    return Math.max(-1, Math.min(1, this.jknobY / maxD))
  }

  isPressed(action: string): boolean {
    return this.justDown.has(action)
  }

  isDown(action: string): boolean {
    return this.down.has(action)
  }

  update() {
    this.justDown.clear()

    if (!this.isTouchDevice()) return

    const ctx = this.ctx
    for (const b of this.buttons) {
      if (!b.down && b.scale < 1) {
        b.scale = Math.min(1, b.scale + 0.06)
      }
    }

    this.drawJoystick(ctx)
    for (const b of this.buttons) {
      this.drawButton(ctx, b)
    }
  }

  private drawJoystick(ctx: CanvasRenderingContext2D) {
    ctx.save()

    ctx.globalAlpha = 0.3
    ctx.beginPath()
    ctx.arc(this.jcx, this.jcy, this.jr, 0, Math.PI * 2)
    ctx.fillStyle = '#1e1b4b'
    ctx.fill()
    ctx.strokeStyle = 'rgba(168,85,247,0.5)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.globalAlpha = this.jActive ? 0.85 : 0.45
    ctx.beginPath()
    ctx.arc(this.jcx + this.jknobX, this.jcy + this.jknobY, this.jr * 0.32, 0, Math.PI * 2)
    const grad = ctx.createRadialGradient(
      this.jcx + this.jknobX, this.jcy + this.jknobY, 0,
      this.jcx + this.jknobX, this.jcy + this.jknobY, this.jr * 0.32
    )
    grad.addColorStop(0, '#c084fc')
    grad.addColorStop(1, '#7c3aed')
    ctx.fillStyle = grad
    ctx.fill()
    ctx.strokeStyle = 'rgba(192,132,252,0.7)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.restore()
  }

  private drawButton(ctx: CanvasRenderingContext2D, b: TouchButton) {
    const r = b.radius * b.scale
    ctx.save()

    ctx.globalAlpha = b.down ? 0.9 : 0.4

    ctx.beginPath()
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
    const alpha = b.down ? '66' : '22'
    ctx.fillStyle = b.color + alpha
    ctx.fill()
    ctx.strokeStyle = b.down ? b.color : b.color + '99'
    ctx.lineWidth = Math.max(1.5, r * 0.04)
    ctx.stroke()

    if (b.down) {
      ctx.shadowColor = b.color
      ctx.shadowBlur = 20
      ctx.beginPath()
      ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
      ctx.strokeStyle = b.color
      ctx.lineWidth = 3
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    ctx.globalAlpha = b.down ? 1 : 0.65
    ctx.font = `${Math.round(r * 1.2)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#f8fafc'
    ctx.fillText(b.label, b.x, b.y + 1)

    ctx.restore()
  }
}