export class Input {
  keys = new Set<string>()
  justPressed = new Set<string>()
  mouse = { x: 0, y: 0, left: false, right: false }
  private prevKeys = new Set<string>()
  private handlers: (() => void)[] = []

  constructor() {
    window.addEventListener('keydown', e => {
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault()
      this.keys.add(e.code)
    })
    window.addEventListener('keyup', e => this.keys.delete(e.code))
    window.addEventListener('mousemove', e => { this.mouse.x = e.clientX; this.mouse.y = e.clientY })
    window.addEventListener('mousedown', e => { if (e.button === 0) this.mouse.left = true })
    window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.left = false })
    window.addEventListener('blur', () => this.keys.clear())
  }

  update() {
    this.justPressed.clear()
    for (const k of this.keys) { if (!this.prevKeys.has(k)) this.justPressed.add(k) }
    this.prevKeys = new Set(this.keys)
  }

  isDown(key: string) { return this.keys.has(key) }
  isPressed(key: string) { return this.justPressed.has(key) }

  dx(): number { return (this.isDown('KeyD') ? 1 : 0) - (this.isDown('KeyA') ? 1 : 0) }
  dy(): number { return (this.isDown('KeyS') ? 1 : 0) - (this.isDown('KeyW') ? 1 : 0) }
}