export class TouchController {
  private dxVal = 0
  private dyVal = 0
  private pressed = new Set<string>()
  private justPressed = new Set<string>()
  private prevPressed = new Set<string>()
  private container: HTMLDivElement
  private joystickKnob: HTMLDivElement
  private cameraDeltaX = 0
  private cameraDeltaY = 0
  private lookTouchId: number | null = null
  private lastLookX = 0
  private lastLookY = 0

  constructor(private canvas: HTMLCanvasElement) {
    this.container = document.createElement('div')
    this.container.id = 'touch-overlay'
    this.container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:100'
    document.body.appendChild(this.container)

    this.joystickKnob = this.createJoystick()
    this.createButtons()
    this.initCameraLook()
  }

  private initCameraLook() {
    const rightHalf = (tx: number) => tx > window.innerWidth * 0.4

    document.addEventListener('touchstart', (e: Event) => {
      const t = (e as TouchEvent).changedTouches[0]
      if (rightHalf(t.clientX) && this.lookTouchId === null) {
        this.lookTouchId = t.identifier
        this.lastLookX = t.clientX
        this.lastLookY = t.clientY
      }
    }, { passive: true })

    document.addEventListener('touchmove', (e: Event) => {
      for (const t of (e as TouchEvent).changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.cameraDeltaX += t.clientX - this.lastLookX
          this.cameraDeltaY += t.clientY - this.lastLookY
          this.lastLookX = t.clientX
          this.lastLookY = t.clientY
        }
      }
    }, { passive: true })

    document.addEventListener('touchend', (e: Event) => {
      for (const t of (e as TouchEvent).changedTouches) {
        if (t.identifier === this.lookTouchId) {
          this.lookTouchId = null
        }
      }
    }, { passive: true })

    document.addEventListener('touchcancel', () => {
      this.lookTouchId = null
    }, { passive: true })
  }

  private el(tag: string, style: string): HTMLElement {
    const e = document.createElement(tag)
    e.style.cssText = style
    return e
  }

  private createJoystick(): HTMLDivElement {
    const base = this.el('div', `
      position:fixed;bottom:24px;left:24px;width:140px;height:140px;
      border-radius:50%;background:rgba(15,23,42,0.6);border:3px solid rgba(168,85,247,0.7);
      pointer-events:auto;touch-action:none;z-index:101;
    `)
    const knob = this.el('div', `
      position:absolute;top:50%;left:50%;width:50px;height:50px;
      border-radius:50%;background:radial-gradient(circle,#c084fc,#7c3aed);
      border:2px solid rgba(192,132,252,0.8);transform:translate(-50%,-50%);
      pointer-events:none;
    `)
    base.appendChild(knob)
    this.container.appendChild(base)

    let touchId: number | null = null
    const updatePos = (tx: number, ty: number) => {
      const r = base.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      let dx = (tx - cx) / (r.width / 2)
      let dy = (ty - cy) / (r.height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 1) { dx /= dist; dy /= dist }
      this.dxVal = dx
      this.dyVal = dy
      knob.style.transform = `translate(calc(-50% + ${dx * 40}px),calc(-50% + ${dy * 40}px))`
    }

    base.addEventListener('touchstart', (e: Event) => {
      e.preventDefault()
      const t = (e as TouchEvent).changedTouches[0]
      touchId = t.identifier
      updatePos(t.clientX, t.clientY)
    }, { passive: false })
    base.addEventListener('touchmove', (e: Event) => {
      e.preventDefault()
      const t = (e as TouchEvent).changedTouches[0]
      updatePos(t.clientX, t.clientY)
    }, { passive: false })
    base.addEventListener('touchend', (e: Event) => {
      e.preventDefault()
      if ((e as TouchEvent).changedTouches[0].identifier === touchId) {
        touchId = null
        this.dxVal = 0
        this.dyVal = 0
        knob.style.transform = 'translate(-50%,-50%)'
      }
    }, { passive: false })

    return knob
  }

  private createButtons() {
    const btns: { action: string; label: string; x: string; y: string; color: string; size: string }[] = [
      { action: 'attack', label: '⚔', x: 'right:20px', y: 'bottom:20px', color: '#ef4444', size: '64px' },
      { action: 'interact', label: '✋', x: 'right:96px', y: 'bottom:20px', color: '#3b82f6', size: '48px' },
      { action: 'map', label: '🗺', x: 'right:20px', y: 'top:100px', color: '#a855f7', size: '44px' },
    ]

    for (let i = 0; i < 4; i++) {
      btns.push({
        action: `inventory${i + 1}`,
        label: `${i + 1}`,
        x: `left:${50 + i * 56}px`,
        y: 'bottom:90px',
        color: '#8b5cf6',
        size: '40px',
      })
    }

    for (const b of btns) {
      const btn = this.el('div', `
        position:fixed;${b.x};${b.y};width:${b.size};height:${b.size};
        border-radius:50%;background:${b.color}44;border:2px solid ${b.color};
        display:flex;align-items:center;justify-content:center;
        font-size:${Math.round(parseInt(b.size) * 0.5)}px;color:#f8fafc;
        pointer-events:auto;touch-action:none;z-index:101;
        user-select:none;-webkit-user-select:none;
        transition:transform 0.08s,background 0.08s;
      `)
      btn.textContent = b.label

      btn.addEventListener('touchstart', (e: Event) => {
        e.preventDefault()
        btn.style.transform = 'scale(0.8)'
        btn.style.background = b.color + '99'
        this.pressed.add(b.action)
        this.justPressed.add(b.action)
      }, { passive: false })
      btn.addEventListener('touchend', (e: Event) => {
        e.preventDefault()
        btn.style.transform = 'scale(1)'
        btn.style.background = b.color + '44'
        this.pressed.delete(b.action)
      }, { passive: false })
      btn.addEventListener('touchcancel', () => {
        btn.style.transform = 'scale(1)'
        btn.style.background = b.color + '44'
        this.pressed.delete(b.action)
      }, { passive: false })

      this.container.appendChild(btn)
    }
  }

  isTouchDevice(): boolean { return true }

  dx(): number { return this.dxVal }
  dy(): number { return this.dyVal }
  cameraDx(): number { return this.cameraDeltaX }
  cameraDy(): number { return this.cameraDeltaY }

  isPressed(action: string): boolean { return this.justPressed.has(action) }
  isDown(action: string): boolean { return this.pressed.has(action) }

  update() {
    this.justPressed.clear()
    this.cameraDeltaX = 0
    this.cameraDeltaY = 0
  }

  destroy() {
    if (this.container.parentNode) this.container.parentNode.removeChild(this.container)
  }
}