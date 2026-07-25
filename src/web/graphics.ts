export const TILE_SIZE = 32

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = seed + 0x6d2b79f5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function drawGrassTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const g = ctx.createLinearGradient(0, 0, 0, 32)
  g.addColorStop(0, '#4a8c3a')
  g.addColorStop(0.5, '#3a7d32')
  g.addColorStop(1, '#2d6b25')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 6; i++) {
    const gx = 2 + rng() * 28, gy = 2 + rng() * 28
    ctx.strokeStyle = `rgb(${60 + rng() * 40 | 0},${120 + rng() * 50 | 0},${30 + rng() * 30 | 0})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(gx, gy)
    ctx.quadraticCurveTo(gx + rng() * 4 - 2, gy - 6 - rng() * 4, gx + rng() * 3 - 1.5, gy + 2)
    ctx.stroke()
  }
  for (let i = 0; i < 3; i++) {
    const fx = 4 + rng() * 24, fy = 4 + rng() * 24
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 3)
    grad.addColorStop(0, `rgb(${180 + rng() * 75 | 0},${80 + rng() * 60 | 0},${80 + rng() * 80 | 0})`)
    grad.addColorStop(1, `rgba(${180 + rng() * 75 | 0},${80 + rng() * 60 | 0},${80 + rng() * 80 | 0},0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(fx, fy, 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawForestTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 20)
  g.addColorStop(0, '#1e4a1a')
  g.addColorStop(0.6, '#153a12')
  g.addColorStop(1, '#0d2a0a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 4; i++) {
    const lx = 4 + rng() * 24, ly = 4 + rng() * 20
    const grad = ctx.createRadialGradient(lx, ly, 0, lx, ly, 8 + rng() * 4)
    grad.addColorStop(0, `rgb(${20 + rng() * 30 | 0},${70 + rng() * 30 | 0},${20 + rng() * 20 | 0})`)
    grad.addColorStop(1, `rgba(20,50,15,0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(lx, ly, 6 + rng() * 4, 4 + rng() * 3, rng() * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 2; i++) {
    const mx = 6 + rng() * 20, my = 6 + rng() * 20
    ctx.shadowColor = `rgba(180,100,60,0.3)`
    ctx.shadowBlur = 3
    ctx.fillStyle = `rgb(${160 + rng() * 40 | 0},${100 + rng() * 40 | 0},${60 + rng() * 30 | 0})`
    ctx.beginPath()
    ctx.arc(mx, my, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
  }
}

function drawWaterTile(ctx: CanvasRenderingContext2D, rng: () => number, t: number) {
  const wave = Math.sin(t * 2 + rng() * 10) * 0.15 + 0.85
  const g = ctx.createLinearGradient(0, 0, 0, 32)
  g.addColorStop(0, `rgb(${20 * wave | 0},${80 * wave | 0},${200 * wave | 0})`)
  g.addColorStop(1, `rgb(${40 * wave | 0},${120 * wave | 0},${240 * wave | 0})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 4; i++) {
    const wy = (i * 8 + Math.sin(t * 1.5 + i * 1.5 + rng() * 10) * 3 + 4)
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + Math.sin(t * 2 + i * 2 + rng()) * 0.04})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let x = 2; x <= 30; x += 2) {
      const yy = wy + Math.sin(x * 0.3 + t * 2 + i) * 1.5
      if (x === 2) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  for (let i = 0; i < 3; i++) {
    const rx = 4 + rng() * 20, ry = 4 + rng() * 20
    ctx.fillStyle = `rgba(180,220,255,${0.15 + Math.sin(t * 1.2 + rx) * 0.08})`
    ctx.beginPath()
    ctx.ellipse(rx, ry, 4 + rng() * 3, 2, 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawStoneTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 100 + rng() * 40
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 20)
  g.addColorStop(0, `rgb(${base + 20},${base + 30},${base + 40})`)
  g.addColorStop(0.5, `rgb(${base},${base + 10},${base + 20})`)
  g.addColorStop(1, `rgb(${base - 20},${base - 10},${base})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 3; i++) {
    const sx = 4 + i * 10 + rng() * 4, sy = 6 + i * 8 + rng() * 4
    ctx.fillStyle = `rgb(${base - 15},${base - 5},${base + 5})`
    ctx.beginPath()
    ctx.ellipse(sx, sy, 4 + rng() * 3, 2 + rng() * 1.5, rng() * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 3; i++) {
    const cx = 4 + rng() * 20, cy = 4 + rng() * 20
    ctx.strokeStyle = `rgb(${base - 30},${base - 25},${base - 20})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    const steps = 2 + rng() * 3 | 0
    for (let j = 0; j < steps; j++) {
      ctx.quadraticCurveTo(cx + rng() * 6 - 3, cy + 3 + j * 3, cx + rng() * 5 - 2.5, cy + 4 + j * 3)
    }
    ctx.stroke()
  }
  for (let i = 0; i < 2; i++) {
    const mx = 4 + rng() * 24, my = 4 + rng() * 24
    ctx.fillStyle = `rgb(${50 + rng() * 30 | 0},${80 + rng() * 30 | 0},${30 + rng() * 20 | 0})`
    ctx.beginPath()
    ctx.ellipse(mx, my, 3 + rng() * 2, 2 + rng() * 1.5, rng() * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawSandTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 160 + rng() * 40
  const g = ctx.createLinearGradient(0, 0, 32, 32)
  g.addColorStop(0, `rgb(${base + 30},${base + 10},${70 + rng() * 30 | 0})`)
  g.addColorStop(0.5, `rgb(${base + 20},${base},${60 + rng() * 30 | 0})`)
  g.addColorStop(1, `rgb(${base},${base - 20},${50 + rng() * 20 | 0})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 15; i++) {
    const sx = rng() * 30, sy = rng() * 30
    ctx.fillStyle = `rgb(${base + 15},${base - 5},${55 + rng() * 20 | 0})`
    ctx.beginPath()
    ctx.arc(sx, sy, 0.8 + rng() * 0.8, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 3; i++) {
    const sx = rng() * 26, sy = rng() * 26
    ctx.fillStyle = `rgb(${base + 30},${base + 10},${70 + rng() * 20 | 0})`
    ctx.beginPath()
    ctx.ellipse(sx, sy, 2 + rng() * 3, 1.5, 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawLavaTile(ctx: CanvasRenderingContext2D, rng: () => number, t: number) {
  const pulse = Math.sin(t * 1.5 + rng() * 10) * 0.1 + 0.9
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 22)
  g.addColorStop(0, `rgb(${230 * pulse | 0},${80 * pulse | 0},${20 * pulse | 0})`)
  g.addColorStop(0.5, `rgb(${200 * pulse | 0},${60 * pulse | 0},${10 * pulse | 0})`)
  g.addColorStop(1, `rgb(${150 * pulse | 0},${30 * pulse | 0},${5 * pulse | 0})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  ctx.shadowColor = `rgba(255,150,50,0.4)`
  ctx.shadowBlur = 6
  for (let i = 0; i < 3; i++) {
    const ly = (i * 10 + Math.sin(t * 2 + i * 2 + rng() * 10) * 4 + 5)
    const bright = 0.3 + Math.sin(t * 1.5 + i * 1.5 + rng() * 8) * 0.15
    ctx.fillStyle = `rgba(255,200,80,${bright})`
    ctx.beginPath()
    ctx.moveTo(2, ly)
    for (let x = 2; x <= 30; x += 2) {
      const yy = ly + Math.sin(x * 0.4 + t * 3 + i * 2) * 2
      ctx.lineTo(x, yy)
    }
    ctx.lineTo(30, ly + 2)
    for (let x = 30; x >= 2; x -= 2) {
      const yy = ly + Math.sin(x * 0.4 + t * 3 + i * 2) * 2 + 2
      ctx.lineTo(x, yy)
    }
    ctx.closePath()
    ctx.fill()
  }
  ctx.shadowBlur = 0
}

function drawSnowTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 220 + rng() * 35
  const g = ctx.createLinearGradient(0, 0, 0, 32)
  g.addColorStop(0, `rgb(${base + 10},${base + 10},${base + 20})`)
  g.addColorStop(0.5, `rgb(${base},${base},${base + 10})`)
  g.addColorStop(1, `rgb(${base - 15},${base - 15},${base - 5})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 32, 32)
  for (let i = 0; i < 6; i++) {
    const sx = rng() * 28, sy = rng() * 28
    ctx.fillStyle = `rgb(${235 + rng() * 20 | 0},${235 + rng() * 20 | 0},${250 + rng() * 5 | 0})`
    ctx.beginPath()
    ctx.arc(sx, sy, 1 + rng() * 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgba(255,255,255,0.5)`
    ctx.beginPath()
    ctx.arc(sx + 0.5, sy + 0.5, 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = `rgba(200,220,255,0.12)`
  for (let i = 0; i < 3; i++) {
    const sx = rng() * 26, sy = rng() * 26
    ctx.beginPath()
    ctx.ellipse(sx, sy, 2 + rng() * 2, 1, 0.2, 0, Math.PI * 2)
    ctx.fill()
  }
}

export const ProceduralTiles = {
  generateTile(ctx: CanvasRenderingContext2D, tileType: number, seed: number, time = 0) {
    const rng = mulberry32(seed)
    switch (tileType) {
      case 0: drawGrassTile(ctx, rng); break
      case 1: drawForestTile(ctx, rng); break
      case 2: drawWaterTile(ctx, rng, time / 1000); break
      case 3: drawStoneTile(ctx, rng); break
      case 4: drawSandTile(ctx, rng); break
      case 5: drawLavaTile(ctx, rng, time / 1000); break
      case 6: drawSnowTile(ctx, rng); break
      default: drawGrassTile(ctx, rng); break
    }
  }
}

function drawEye(ctx: CanvasRenderingContext2D, sx: number, sy: number, open: number, color = '#1e293b') {
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 3.5 * open, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(sx, sy, 2, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#0f172a'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 1, 1.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.ellipse(sx + 0.8, sy - 0.8, 0.8, 0.8, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawBrow(ctx: CanvasRenderingContext2D, sx: number, sy: number, angle: number) {
  ctx.strokeStyle = '#1e293b'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(sx - 3, sy + angle * 1.5)
  ctx.lineTo(sx + 3, sy - angle * 1.5)
  ctx.stroke()
}

function drawMouth(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number) {
  ctx.strokeStyle = '#4a2c1a'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(sx, sy + 1, w, 0.1, Math.PI - 0.1)
  ctx.stroke()
}

function drawNose(ctx: CanvasRenderingContext2D, sx: number, sy: number) {
  ctx.fillStyle = '#e8b87a'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 1.2, 1.8, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawEar(ctx: CanvasRenderingContext2D, sx: number, sy: number, skin: string) {
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.ellipse(sx, sy, 2, 3.5, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawCape(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string, wave: number, t: number) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - w / 2, sy)
  for (let i = 0; i <= 8; i++) {
    const px = sx - w / 2 + (w * i) / 8
    const wx = Math.sin(t * 2.5 + i * 0.8) * wave
    ctx.lineTo(px, sy + (h * i) / 8 + wx)
  }
  for (let i = 8; i >= 0; i--) {
    const px = sx - w / 2 + (w * i) / 8
    const wx = Math.sin(t * 2.5 + i * 0.8) * wave
    ctx.lineTo(px, sy + (h * i) / 8 + wx + h * 0.3)
  }
  ctx.closePath()
  ctx.fill()
}

function drawBeard(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - w / 2, sy)
  for (let i = 0; i <= 6; i++) {
    const px = sx - w / 2 + (w * i) / 6
    const py = sy + h * 0.3 + Math.sin(i * 0.8) * h * 0.2
    ctx.lineTo(px, py)
  }
  ctx.lineTo(sx, sy + h)
  ctx.closePath()
  ctx.fill()
}

function drawRobeGlow(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, glow: number) {
  ctx.globalAlpha = glow
  ctx.fillStyle = '#60a5fa'
  ctx.beginPath()
  ctx.ellipse(sx, sy + h * 0.5, w * 0.4, h * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#93c5fd'
  ctx.beginPath()
  ctx.ellipse(sx - w * 0.15, sy + h * 0.4, w * 0.15, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#bfdbfe'
  ctx.beginPath()
  ctx.ellipse(sx + w * 0.15, sy + h * 0.6, w * 0.1, h * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

function drawBoot(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + w, sy)
  ctx.lineTo(sx + w + 1, sy + h)
  ctx.lineTo(sx - 1, sy + h)
  ctx.closePath()
  ctx.fill()
}

function drawGoblinEar(ctx: CanvasRenderingContext2D, sx: number, sy: number, flip: number) {
  ctx.fillStyle = '#16a34a'
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + flip * 5, sy - 3)
  ctx.lineTo(sx + flip * 4, sy + 3)
  ctx.closePath()
  ctx.fill()
}

function drawSpike(ctx: CanvasRenderingContext2D, sx: number, sy: number, h: number, flip: number) {
  ctx.fillStyle = '#dc2626'
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(sx + flip * 3, sy - h)
  ctx.lineTo(sx + flip * 5, sy)
  ctx.closePath()
  ctx.fill()
}

function drawLegs(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string, wc: number) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - w / 2, sy + wc * -1)
  ctx.quadraticCurveTo(sx - w / 2, sy + h + wc * -1, sx + w / 2, sy + h + wc * -1)
  ctx.quadraticCurveTo(sx + w / 2, sy + wc * -1, sx - w / 2, sy + wc * -1)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(sx + w + 2, sy + wc)
  ctx.quadraticCurveTo(sx + w + 2, sy + h + wc, sx + w + w / 2 + 2, sy + h + wc)
  ctx.quadraticCurveTo(sx + w + w / 2 + 2, sy + wc, sx + w + 2, sy + wc)
  ctx.fill()
}

function drawArm(ctx: CanvasRenderingContext2D, sx: number, sy: number, len: number, angle: number, color: string, w: number = 3) {
  ctx.strokeStyle = color
  ctx.lineWidth = w
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.quadraticCurveTo(sx + Math.cos(angle) * len * 0.5, sy + Math.sin(angle) * len * 0.5 - 2, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len)
  ctx.stroke()
}

function drawBodyTorso(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - w / 2, sy)
  ctx.quadraticCurveTo(sx - w / 2 - 2, sy + h * 0.3, sx - w / 2 + 1, sy + h * 0.6)
  ctx.quadraticCurveTo(sx, sy + h, sx + w / 2 - 1, sy + h * 0.6)
  ctx.quadraticCurveTo(sx + w / 2 + 2, sy + h * 0.3, sx + w / 2, sy)
  ctx.closePath()
  ctx.fill()
}

function drawHatCone(ctx: CanvasRenderingContext2D, sx: number, sy: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - w / 2, sy)
  ctx.quadraticCurveTo(sx - w / 4, sy - h * 0.7, sx, sy - h)
  ctx.quadraticCurveTo(sx + w / 4, sy - h * 0.7, sx + w / 2, sy)
  ctx.closePath()
  ctx.fill()
}

function drawHelmet(ctx: CanvasRenderingContext2D, sx: number, sy: number, color: string, highlight: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(sx - 6, sy)
  ctx.quadraticCurveTo(sx, sy - 8, sx + 6, sy)
  ctx.quadraticCurveTo(sx, sy - 5, sx - 6, sy)
  ctx.fill()
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.moveTo(sx - 5, sy - 1)
  ctx.quadraticCurveTo(sx, sy - 7, sx + 5, sy - 1)
  ctx.quadraticCurveTo(sx, sy - 4, sx - 5, sy - 1)
  ctx.fill()
  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.moveTo(sx - 3, sy - 8)
  ctx.quadraticCurveTo(sx, sy - 10, sx + 3, sy - 8)
  ctx.quadraticCurveTo(sx, sy - 9, sx - 3, sy - 8)
  ctx.fill()
}

function drawEyeGlow(ctx: CanvasRenderingContext2D, sx: number, sy: number, color: string, size: number, blink: number) {
  ctx.fillStyle = '#f8fafc'
  ctx.beginPath()
  ctx.ellipse(sx, sy, 3 * size * blink, 3 * size, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = color
  ctx.shadowBlur = 6 * size
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.ellipse(sx, sy, 1.5 * size, 2 * size, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0
}

export function drawEntitySprite(
  ctx: CanvasRenderingContext2D,
  type: string,
  name: string,
  x: number,
  y: number,
  time: number,
  bob: number
) {
  ctx.save()
  ctx.translate(x, y)

  const t = time / 1000
  const bobOffset = bob !== 0 ? Math.sin(t * 3 + x) * bob : 0
  const walkPhase = Math.sin(t * 6)
  const walkCycle = walkPhase * 1.5
  const blinkCycle = Math.sin(t * 4.7) > 0.95 ? 0 : 1

  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, 15, 13, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bobOffset)

  if (type === 'player') {
    const wc = walkCycle
    const blink = blinkCycle
    const capeWave = 2.5

    ctx.shadowColor = 'rgba(91,33,182,0.3)'
    ctx.shadowBlur = 6
    drawCape(ctx, 0, -3, 24, 16, '#5b21b6', capeWave, t + x * 0.01)
    ctx.shadowBlur = 0

    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 3

    drawLegs(ctx, 0, 5, 6, 8, '#1e0a3c', wc)
    drawBoot(ctx, -10, 12 + wc * -1, 8, 4, '#1e0a3c')
    drawBoot(ctx, 2, 12 + wc, 8, 4, '#1e0a3c')

    const skirtGrad = ctx.createLinearGradient(0, 7, 0, 14)
    skirtGrad.addColorStop(0, '#6d28d9')
    skirtGrad.addColorStop(1, '#4c1d95')
    ctx.fillStyle = skirtGrad
    ctx.beginPath()
    ctx.moveTo(-9, 6 + wc * -1)
    for (let i = 0; i <= 8; i++) {
      const px = -9 + (18 * i) / 8
      const wx = Math.sin(t * 3 + i * 1.2) * 1.5
      ctx.lineTo(px, 13 + wx)
    }
    ctx.closePath()
    ctx.fill()

    const armorGrad = ctx.createLinearGradient(-8, -3, 8, 7)
    armorGrad.addColorStop(0, '#8b5cf6')
    armorGrad.addColorStop(0.4, '#7c3aed')
    armorGrad.addColorStop(0.7, '#6d28d9')
    armorGrad.addColorStop(1, '#5b21b6')
    ctx.fillStyle = armorGrad
    ctx.beginPath()
    ctx.moveTo(-8, -3)
    ctx.quadraticCurveTo(-10, 2, -8, 7)
    ctx.quadraticCurveTo(0, 9, 8, 7)
    ctx.quadraticCurveTo(10, 2, 8, -3)
    ctx.closePath()
    ctx.fill()

    ctx.shadowBlur = 0

    const beltGrad = ctx.createLinearGradient(-5, 6, 5, 7.5)
    beltGrad.addColorStop(0, '#f59e0b')
    beltGrad.addColorStop(0.5, '#fbbf24')
    beltGrad.addColorStop(1, '#d97706')
    ctx.fillStyle = beltGrad
    ctx.beginPath()
    ctx.moveTo(-5, 6)
    ctx.quadraticCurveTo(0, 7.5, 5, 6)
    ctx.quadraticCurveTo(4, 7, 0, 7.5)
    ctx.quadraticCurveTo(-4, 7, -5, 6)
    ctx.fill()

    drawArm(ctx, -9, -1, 6, -0.2, '#a855f7')
    drawArm(ctx, 9, -1, 6, 0.2, '#a855f7')

    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.ellipse(-10, 2, 1.5, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(10, 2, 1.5, 2, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowColor = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur = 4
    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.ellipse(-8, 7, 2, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(8, 7, 2, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    const skinGrad = ctx.createRadialGradient(0, -14, 0, 0, -12, 9)
    skinGrad.addColorStop(0, '#fef3c7')
    skinGrad.addColorStop(0.5, '#fde68a')
    skinGrad.addColorStop(1, '#fcd34d')
    ctx.fillStyle = skinGrad
    ctx.beginPath()
    ctx.ellipse(0, -12, 7.5, 8.5, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowBlur = 0

    const hairGrad = ctx.createLinearGradient(-7, -19, 7, -10)
    hairGrad.addColorStop(0, '#3b1f8e')
    hairGrad.addColorStop(0.5, '#2d1b69')
    hairGrad.addColorStop(1, '#1e0a3c')
    ctx.fillStyle = hairGrad
    ctx.beginPath()
    ctx.moveTo(-7, -12)
    ctx.quadraticCurveTo(-10, -17, -5, -20)
    ctx.quadraticCurveTo(0, -22, 5, -20)
    ctx.quadraticCurveTo(10, -17, 7, -12)
    ctx.quadraticCurveTo(5, -16, 0, -17)
    ctx.quadraticCurveTo(-5, -16, -7, -12)
    ctx.fill()

    drawEar(ctx, -8, -11, '#fde68a')
    drawEar(ctx, 8, -11, '#fde68a')

    drawEye(ctx, -3.5, -13, blink)
    drawEye(ctx, 3.5, -13, blink)
    drawBrow(ctx, -3.5, -15.5, -0.5)
    drawBrow(ctx, 3.5, -15.5, 0.5)
    drawNose(ctx, 0, -11)
    drawMouth(ctx, 0, -8.5, 2.5)

    ctx.fillStyle = '#c084fc'
    ctx.beginPath()
    ctx.arc(-1, -10, 1, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(-9, -2, 1.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(7, -2, 1.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowColor = 'rgba(168,85,247,0.4)'
    ctx.shadowBlur = 5
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(11, -2)
    ctx.lineTo(16, -10)
    ctx.lineTo(18, -8)
    ctx.lineTo(13, 0)
    ctx.closePath()
    const swordGrad = ctx.createLinearGradient(11, -2, 18, -8)
    swordGrad.addColorStop(0, '#e2e8f0')
    swordGrad.addColorStop(0.5, '#f8fafc')
    swordGrad.addColorStop(1, '#94a3b8')
    ctx.fillStyle = swordGrad
    ctx.fill()

    ctx.shadowBlur = 0
    ctx.fillStyle = '#94a3b8'
    ctx.beginPath()
    ctx.moveTo(13, -12)
    ctx.quadraticCurveTo(14, -9, 13, -6)
    ctx.quadraticCurveTo(12.5, -9, 13, -12)
    ctx.fill()

    ctx.shadowColor = 'rgba(251,191,36,0.5)'
    ctx.shadowBlur = 6
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(13, -13, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(13, -13, 1.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.fillStyle = '#6d28d9'
    ctx.beginPath()
    ctx.moveTo(12, -6)
    ctx.quadraticCurveTo(14, -5, 16, -6)
    ctx.quadraticCurveTo(14, -4.5, 12, -6)
    ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(11.5, -1.5, 0.8, 0, Math.PI * 2)
    ctx.fill()

    ctx.shadowColor = 'rgba(71,85,105,0.4)'
    ctx.shadowBlur = 4
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-15, -2)
    ctx.lineTo(-15, 4)
    ctx.lineTo(-13, 7)
    ctx.stroke()

    ctx.shadowBlur = 0
    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.moveTo(-16, -3)
    ctx.lineTo(-12, -5)
    ctx.lineTo(-11, -2)
    ctx.lineTo(-15, 0)
    ctx.closePath()
    ctx.fill()

    const shieldGrad = ctx.createRadialGradient(-13.5, -1.5, 0.5, -13.5, -1.5, 2)
    shieldGrad.addColorStop(0, '#fef3c7')
    shieldGrad.addColorStop(0.5, '#fbbf24')
    shieldGrad.addColorStop(1, '#d97706')
    ctx.fillStyle = shieldGrad
    ctx.beginPath()
    ctx.arc(-13.5, -1.5, 1.8, 0, Math.PI * 2)
    ctx.fill()

  } else if (type === 'npc') {
    const wc = walkCycle
    const blink = blinkCycle

    const npcConfig: Record<string, {
      torso: string; pants: string; hat: string; hat2: string;
      accent: string; shoes: string; beard?: string; hair?: string
    }> = {
      Merchant: { torso: '#22c55e', pants: '#166534', hat: '#fbbf24', hat2: '#b45309', accent: '#0f766e', shoes: '#78350f' },
      Guard: { torso: '#3b82f6', pants: '#1e3a8a', hat: '#94a3b8', hat2: '#475569', accent: '#ef4444', shoes: '#1e293b' },
      Elder: { torso: '#6b7280', pants: '#374151', hat: '#8B5E3C', hat2: '#6b4226', accent: '#9ca3af', shoes: '#1f2937', beard: '#f8fafc', hair: '#9ca3af' },
      Blacksmith: { torso: '#f97316', pants: '#431407', hat: '#92400e', hat2: '#78350f', accent: '#64748b', shoes: '#292524' },
      Farmer: { torso: '#8B6914', pants: '#4a2c0a', hat: '#a3e635', hat2: '#65a30d', accent: '#eab308', shoes: '#44403c' },
    }
    const c = npcConfig[name] || npcConfig.Merchant

    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 3

    drawLegs(ctx, 0, 5, 6, 8, c.pants, wc)
    drawBoot(ctx, -9, 12 + wc * -1, 8, 3, c.shoes)
    drawBoot(ctx, 0, 12 + wc, 8, 3, c.shoes)

    const torsoGrad = ctx.createLinearGradient(-8, -2, 8, 7)
    torsoGrad.addColorStop(0, c.torso)
    torsoGrad.addColorStop(0.6, c.torso)
    torsoGrad.addColorStop(1, c.pants)
    ctx.fillStyle = torsoGrad
    ctx.beginPath()
    ctx.moveTo(-8, -2)
    ctx.quadraticCurveTo(-10, 2, -9, 7)
    ctx.quadraticCurveTo(0, 9, 9, 7)
    ctx.quadraticCurveTo(10, 2, 8, -2)
    ctx.closePath()
    ctx.fill()

    if (name === 'Guard') {
      ctx.fillStyle = '#1e3a8a'
      ctx.beginPath()
      ctx.moveTo(-9, -2)
      ctx.quadraticCurveTo(0, 0, 9, -2)
      ctx.quadraticCurveTo(0, -1, -9, -2)
      ctx.fill()
    }

    ctx.fillStyle = c.accent
    ctx.beginPath()
    ctx.moveTo(-2, 1)
    ctx.quadraticCurveTo(0, 5, 2, 1)
    ctx.quadraticCurveTo(0, 3, -2, 1)
    ctx.fill()

    ctx.shadowBlur = 0

    const npcSkinGrad = ctx.createRadialGradient(0, -12, 0, 0, -10, 7.5)
    npcSkinGrad.addColorStop(0, '#fef3c7')
    npcSkinGrad.addColorStop(1, '#fde68a')
    ctx.fillStyle = npcSkinGrad
    ctx.beginPath()
    ctx.ellipse(0, -10, 6.5, 7.5, 0, 0, Math.PI * 2)
    ctx.fill()

    drawEye(ctx, -3, -11, blink)
    drawEye(ctx, 3, -11, blink)
    drawBrow(ctx, -3, -13.5, -0.3)
    drawBrow(ctx, 3, -13.5, 0.3)
    drawNose(ctx, 0, -9)
    drawMouth(ctx, 0, -7, 2)

    if (name === 'Elder' && c.beard) {
      drawBeard(ctx, 0, -6, 8, 7, c.beard)
    }
    if (name === 'Merchant') {
      drawBeard(ctx, 0, -6, 5, 3, '#8B6914')
    }

    if (name === 'Guard') {
      drawHelmet(ctx, 0, -18, '#475569', '#94a3b8')
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.moveTo(-1, -21)
      ctx.quadraticCurveTo(0, -17, 1, -21)
      ctx.quadraticCurveTo(0, -18, -1, -21)
      ctx.fill()
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.ellipse(-6, -15.5, 2, 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(6, -15.5, 2, 0.6, 0, 0, Math.PI * 2)
      ctx.fill()
    } else if (name === 'Merchant') {
      drawHatCone(ctx, 0, -12, 16, 8, c.hat2)
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.ellipse(0, -9, 9, 2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(0, -17, 3, 0, Math.PI * 2)
      ctx.fill()
    } else if (name === 'Elder') {
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.moveTo(-8, -15)
      ctx.quadraticCurveTo(0, -16, 8, -15)
      ctx.quadraticCurveTo(7, -11, 6, -9)
      ctx.quadraticCurveTo(0, -11, -6, -9)
      ctx.quadraticCurveTo(-7, -11, -8, -15)
      ctx.fill()
      ctx.fillStyle = c.hat2
      ctx.beginPath()
      ctx.moveTo(-6, -19)
      ctx.quadraticCurveTo(0, -20, 6, -19)
      ctx.quadraticCurveTo(0, -18, -6, -19)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-4, -21)
      ctx.quadraticCurveTo(0, -22, 4, -21)
      ctx.quadraticCurveTo(0, -20, -4, -21)
      ctx.fill()
    } else if (name === 'Blacksmith') {
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.moveTo(-7, -16)
      ctx.quadraticCurveTo(0, -17, 7, -16)
      ctx.quadraticCurveTo(0, -15, -7, -16)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-5, -19)
      ctx.quadraticCurveTo(0, -21, 5, -19)
      ctx.quadraticCurveTo(0, -18, -5, -19)
      ctx.fill()
      ctx.fillStyle = c.hat2
      ctx.beginPath()
      ctx.moveTo(-5, -20)
      ctx.quadraticCurveTo(0, -21, 5, -20)
      ctx.quadraticCurveTo(0, -19, -5, -20)
      ctx.fill()
      ctx.fillStyle = '#1e1b1b'
      ctx.beginPath()
      ctx.arc(5, -10, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(5, -10, 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#64748b'
      ctx.beginPath()
      ctx.moveTo(9, -1)
      ctx.quadraticCurveTo(11, 4, 10, 8)
      ctx.quadraticCurveTo(13, 4, 9, -1)
      ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath()
      ctx.arc(10.5, -1, 1.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f97316'
      ctx.beginPath()
      ctx.moveTo(9, 8)
      ctx.quadraticCurveTo(11, 10, 13, 8)
      ctx.quadraticCurveTo(11, 11, 9, 8)
      ctx.fill()
      ctx.fillStyle = '#292524'
      ctx.beginPath()
      ctx.moveTo(8, 0)
      ctx.quadraticCurveTo(10, 4, 9, 7)
      ctx.quadraticCurveTo(8, 4, 8, 0)
      ctx.fill()
    } else if (name === 'Farmer') {
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.ellipse(0, -17, 7, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = c.hat2
      ctx.beginPath()
      ctx.moveTo(-5, -23)
      ctx.quadraticCurveTo(0, -25, 5, -23)
      ctx.quadraticCurveTo(0, -19, -5, -23)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-3, -24)
      ctx.quadraticCurveTo(0, -25, 3, -24)
      ctx.quadraticCurveTo(0, -23, -3, -24)
      ctx.fill()
      ctx.fillStyle = '#65a30d'
      ctx.beginPath()
      ctx.moveTo(-13, 1)
      ctx.quadraticCurveTo(-11, 5, -9, 9)
      ctx.quadraticCurveTo(-13, 5, -13, 1)
      ctx.fill()
      ctx.fillStyle = '#4d7c0f'
      ctx.beginPath()
      ctx.moveTo(-14, 0)
      ctx.quadraticCurveTo(-11, 1, -8, 0)
      ctx.quadraticCurveTo(-11, 2, -14, 0)
      ctx.fill()
    }

    if (name === 'Guard') {
      ctx.shadowColor = 'rgba(148,163,184,0.3)'
      ctx.shadowBlur = 3
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(-15, -1)
      ctx.lineTo(-15, 8)
      ctx.stroke()
      ctx.fillStyle = '#cbd5e1'
      ctx.beginPath()
      ctx.moveTo(-17, -3)
      ctx.lineTo(-13, -3)
      ctx.lineTo(-13, -1)
      ctx.lineTo(-17, -1)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#cbd5e1'
      ctx.beginPath()
      ctx.moveTo(-13, 7)
      ctx.quadraticCurveTo(-15, 9, -17, 7)
      ctx.quadraticCurveTo(-15, 10, -13, 7)
      ctx.fill()
      ctx.shadowBlur = 0
    } else if (name === 'Elder') {
      ctx.fillStyle = '#8B5E3C'
      ctx.beginPath()
      ctx.moveTo(-1, -2)
      ctx.quadraticCurveTo(0, 8, 1, -2)
      ctx.quadraticCurveTo(0, 3, -1, -2)
      ctx.fill()
      ctx.fillStyle = '#6b4226'
      ctx.beginPath()
      ctx.moveTo(-2, -3)
      ctx.quadraticCurveTo(0, -1, 2, -3)
      ctx.quadraticCurveTo(0, -2, -2, -3)
      ctx.fill()
      ctx.shadowColor = 'rgba(239,68,68,0.5)'
      ctx.shadowBlur = 6
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(0, -5, 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(0, -5, 0.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.arc(0, -5, 0.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
    } else if (name === 'Merchant') {
      ctx.fillStyle = '#78350f'
      ctx.beginPath()
      ctx.moveTo(-3, 2)
      ctx.quadraticCurveTo(0, 5, 3, 2)
      ctx.quadraticCurveTo(0, 3, -3, 2)
      ctx.fill()
      ctx.fillStyle = '#0f766e'
      ctx.beginPath()
      ctx.moveTo(-4, 2)
      ctx.quadraticCurveTo(0, 3, 4, 2)
      ctx.quadraticCurveTo(0, 2.5, -4, 2)
      ctx.fill()
    }

  } else if (type === 'enemy') {
    const ec: Record<string, { skin: string; torso: string; eye: string; size: number }> = {
      Bandit: { skin: '#8B6914', torso: '#6B4914', eye: '#f8fafc', size: 1 },
      Skeleton: { skin: '#e2e8f0', torso: '#cbd5e1', eye: '#ef4444', size: 1 },
      Mage: { skin: '#3b82f6', torso: '#1d4ed8', eye: '#fbbf24', size: 1 },
      Goblin: { skin: '#22c55e', torso: '#16a34a', eye: '#ef4444', size: 1 },
      Boss: { skin: '#ef4444', torso: '#b91c1c', eye: '#fbbf24', size: 1.5 },
    }
    const e = ec[name] || ec.Bandit
    const s = e.size
    const wc = walkCycle * 1.5
    const blink = blinkCycle

    ctx.translate(0, -(s - 1) * 8)

    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(0, 15 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2)
    ctx.fill()

    if (name === 'Bandit') {
      const by = Math.sin(t * 2.3) * 0.8

      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(ctx, 0, 4 * s, 6 * s, 8 * s, '#6B4914', wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 6 * s, 8 * s, '#6B4914', wc)
      drawBoot(ctx, -9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#78350f')
      drawBoot(ctx, 0, 10 * s + wc + by, 8 * s, 3 * s, '#78350f')

      const torsoGrad = ctx.createLinearGradient(-9 * s, -2 * s, 9 * s, 6 * s)
      torsoGrad.addColorStop(0, '#6B4914')
      torsoGrad.addColorStop(0.5, '#5a3a0a')
      torsoGrad.addColorStop(1, '#4a2a0a')
      ctx.fillStyle = torsoGrad
      ctx.beginPath()
      ctx.moveTo(-9 * s, -2 * s)
      ctx.quadraticCurveTo(-11 * s, 2 * s, -9 * s, 6 * s)
      ctx.quadraticCurveTo(0, 8 * s, 9 * s, 6 * s)
      ctx.quadraticCurveTo(11 * s, 2 * s, 9 * s, -2 * s)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#5a3a0a'
      ctx.beginPath()
      ctx.moveTo(-10 * s, -3 * s)
      ctx.quadraticCurveTo(0, -2 * s, 10 * s, -3 * s)
      ctx.quadraticCurveTo(0, -4 * s, -10 * s, -3 * s)
      ctx.fill()

      ctx.shadowBlur = 0

      const banditSkinGrad = ctx.createRadialGradient(0, -12 * s, 0, 0, -10 * s, 7 * s)
      banditSkinGrad.addColorStop(0, '#a0782a')
      banditSkinGrad.addColorStop(1, '#8B6914')
      ctx.fillStyle = banditSkinGrad
      ctx.beginPath()
      ctx.ellipse(0, -10 * s + by, 6.5 * s, 7.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11 * s + by, 3 * s * blink, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11 * s + by, 3 * s * blink, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11 * s + by, 1.5 * s, 2 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11 * s + by, 1.5 * s, 2 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1e1b1b'
      ctx.beginPath()
      ctx.arc(4 * s, -12 * s + by, 2 * s, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#4a2c1a'
      ctx.lineWidth = 1.5 * s
      ctx.beginPath()
      ctx.arc(0, -7 * s + by, 2 * s, 0.2, Math.PI - 0.2)
      ctx.stroke()

      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(-12 * s, -1 * s)
      ctx.quadraticCurveTo(-10 * s, 1 * s, -8 * s, -1 * s)
      ctx.quadraticCurveTo(-10 * s, 0, -12 * s, -1 * s)
      ctx.fill()
      ctx.fillStyle = '#94a3b8'
      ctx.beginPath()
      ctx.arc(-10 * s, 0, 1.2 * s, 0, Math.PI * 2)
      ctx.fill()

    } else if (name === 'Skeleton') {
      const by = Math.sin(t * 2.5) * 1

      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(ctx, 0, 4 * s, 6 * s, 8 * s, '#cbd5e1', wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 6 * s, 8 * s, '#cbd5e1', wc)
      drawBoot(ctx, -9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#94a3b8')
      drawBoot(ctx, 0, 10 * s + wc + by, 8 * s, 3 * s, '#94a3b8')

      ctx.fillStyle = '#e2e8f0'
      ctx.beginPath()
      ctx.moveTo(-9 * s, -3 * s)
      ctx.quadraticCurveTo(-10 * s, 2 * s, -9 * s, 6 * s)
      ctx.quadraticCurveTo(0, 8 * s, 9 * s, 6 * s)
      ctx.quadraticCurveTo(10 * s, 2 * s, 9 * s, -3 * s)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0

      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 1 * s
      ctx.beginPath()
      ctx.moveTo(-5 * s, 0)
      ctx.lineTo(-5 * s, 5 * s)
      ctx.moveTo(5 * s, 0)
      ctx.lineTo(5 * s, 5 * s)
      ctx.stroke()

      ctx.fillStyle = '#94a3b8'
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.ellipse(-7 * s + i * 4.5 * s, 1 * s, 1 * s, 0.6 * s, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      const skullGrad = ctx.createRadialGradient(0, -12 * s, 0, 0, -10 * s, 7 * s)
      skullGrad.addColorStop(0, '#f8fafc')
      skullGrad.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = skullGrad
      ctx.beginPath()
      ctx.ellipse(0, -10 * s + by, 6 * s, 7 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.ellipse(0, -14 * s + by, 4 * s, 1 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11 * s + by, 2.5 * s * blink, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11 * s + by, 2.5 * s * blink, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = 'rgba(239,68,68,0.6)'
      ctx.shadowBlur = 6 * s
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11.5 * s + by, 0.5 * s, 0.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11.5 * s + by, 0.5 * s, 0.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 1 * s
      ctx.beginPath()
      ctx.arc(0, -8 * s + by, 1.5 * s, 0.1, Math.PI - 0.1)
      ctx.stroke()

      ctx.fillStyle = '#cbd5e1'
      ctx.beginPath()
      ctx.moveTo(-10 * s, -1 * s)
      ctx.quadraticCurveTo(-8 * s, 3 * s, -7 * s, 6 * s)
      ctx.quadraticCurveTo(-9 * s, 3 * s, -10 * s, -1 * s)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(7 * s, -1 * s)
      ctx.quadraticCurveTo(9 * s, 3 * s, 10 * s, 6 * s)
      ctx.quadraticCurveTo(8 * s, 3 * s, 7 * s, -1 * s)
      ctx.fill()

    } else if (name === 'Mage') {
      const by = Math.sin(t * 2.3) * 0.8

      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(ctx, 0, 4 * s, 6 * s, 8 * s, '#1d4ed8', wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 6 * s, 8 * s, '#1d4ed8', wc)
      drawBoot(ctx, -9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#0f3a8a')
      drawBoot(ctx, 0, 10 * s + wc + by, 8 * s, 3 * s, '#0f3a8a')

      const robeGrad = ctx.createLinearGradient(-9 * s, -3 * s, 9 * s, 6 * s)
      robeGrad.addColorStop(0, '#2563eb')
      robeGrad.addColorStop(0.4, '#1d4ed8')
      robeGrad.addColorStop(0.7, '#1e40af')
      robeGrad.addColorStop(1, '#1e3a8a')
      ctx.fillStyle = robeGrad
      ctx.beginPath()
      ctx.moveTo(-9 * s, -3 * s)
      ctx.quadraticCurveTo(-10 * s, 2 * s, -10 * s, 6 * s)
      ctx.quadraticCurveTo(0, 8 * s, 10 * s, 6 * s)
      ctx.quadraticCurveTo(10 * s, 2 * s, 9 * s, -3 * s)
      ctx.closePath()
      ctx.fill()

      ctx.shadowBlur = 0

      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(-7 * s, 1 * s)
      ctx.quadraticCurveTo(0, 5 * s, 7 * s, 1 * s)
      ctx.quadraticCurveTo(0, 3 * s, -7 * s, 1 * s)
      ctx.fill()

      drawRobeGlow(ctx, 0, 2 * s, 14 * s, 4 * s, 0.25 + Math.sin(t * 3) * 0.15)

      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(0, -10 * s + by, 6 * s, 7 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      drawEye(ctx, -2.5 * s, -11 * s + by, blink, '#3b82f6')
      drawEye(ctx, 2.5 * s, -11 * s + by, blink, '#3b82f6')
      drawBrow(ctx, -2.5 * s, -13.5 * s + by, -0.5 * s)
      drawBrow(ctx, 2.5 * s, -13.5 * s + by, 0.5 * s)
      drawNose(ctx, 0, -9 * s + by)
      drawMouth(ctx, 0, -7 * s + by, 1.5 * s)

      const hatGrad = ctx.createLinearGradient(-7 * s, -16 * s, 7 * s, -10 * s)
      hatGrad.addColorStop(0, '#1e40af')
      hatGrad.addColorStop(0.5, '#1d4ed8')
      hatGrad.addColorStop(1, '#2563eb')
      ctx.fillStyle = hatGrad
      ctx.beginPath()
      ctx.moveTo(-7 * s, -16 * s + by)
      ctx.quadraticCurveTo(0, -22 * s, 7 * s, -16 * s + by)
      ctx.quadraticCurveTo(0, -18 * s, -7 * s, -16 * s + by)
      ctx.fill()
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(-5 * s, -18 * s + by)
      ctx.quadraticCurveTo(0, -23 * s, 5 * s, -18 * s + by)
      ctx.quadraticCurveTo(0, -20 * s, -5 * s, -18 * s + by)
      ctx.fill()

      ctx.shadowColor = 'rgba(96,165,250,0.5)'
      ctx.shadowBlur = 6 * s
      ctx.fillStyle = '#60a5fa'
      ctx.beginPath()
      ctx.arc(0, -20 * s + by, 2 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#93c5fd'
      ctx.beginPath()
      ctx.arc(0, -20 * s + by, 1 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      const orbY = Math.sin(t * 2.8) * 3 * s
      const orbGlow = ctx.createRadialGradient(12 * s, -2 * s + orbY, 0, 12 * s, -2 * s + orbY, 6 * s)
      orbGlow.addColorStop(0, 'rgba(147,197,253,0.8)')
      orbGlow.addColorStop(0.3, 'rgba(96,165,250,0.4)')
      orbGlow.addColorStop(1, 'rgba(96,165,250,0)')
      ctx.fillStyle = orbGlow
      ctx.beginPath()
      ctx.arc(12 * s, -2 * s + orbY, 6 * s, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = 'rgba(147,197,253,0.6)'
      ctx.shadowBlur = 8 * s
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(12 * s, -2 * s + orbY, 3.5 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#93c5fd'
      ctx.beginPath()
      ctx.arc(12 * s, -2 * s + orbY, 2 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#bfdbfe'
      ctx.beginPath()
      ctx.arc(12 * s, -3 * s + orbY, 1 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

    } else if (name === 'Goblin') {
      const by = Math.sin(t * 2.7) * 1.2

      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(ctx, 0, 4 * s, 6 * s, 8 * s, '#16a34a', wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 6 * s, 8 * s, '#16a34a', wc)
      drawBoot(ctx, -9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#14532d')
      drawBoot(ctx, 0, 10 * s + wc + by, 8 * s, 3 * s, '#14532d')

      const gobTorso = ctx.createLinearGradient(-8 * s, -2 * s, 8 * s, 6 * s)
      gobTorso.addColorStop(0, '#16a34a')
      gobTorso.addColorStop(1, '#15803d')
      ctx.fillStyle = gobTorso
      ctx.beginPath()
      ctx.moveTo(-8 * s, -2 * s)
      ctx.quadraticCurveTo(-9 * s, 2 * s, -8 * s, 6 * s)
      ctx.quadraticCurveTo(0, 8 * s, 8 * s, 6 * s)
      ctx.quadraticCurveTo(9 * s, 2 * s, 8 * s, -2 * s)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#15803d'
      ctx.beginPath()
      ctx.moveTo(-9 * s, -3 * s)
      ctx.quadraticCurveTo(0, -2 * s, 9 * s, -3 * s)
      ctx.quadraticCurveTo(0, -4 * s, -9 * s, -3 * s)
      ctx.fill()

      ctx.shadowBlur = 0

      const gobSkin = ctx.createRadialGradient(0, -12 * s, 0, 0, -10 * s, 7 * s)
      gobSkin.addColorStop(0, '#4ade80')
      gobSkin.addColorStop(1, '#22c55e')
      ctx.fillStyle = gobSkin
      ctx.beginPath()
      ctx.ellipse(0, -10 * s + by, 6 * s, 6.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      drawGoblinEar(ctx, -6 * s, -10 * s + by, -1)
      drawGoblinEar(ctx, 6 * s, -10 * s + by, 1)

      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11.5 * s + by, 2.8 * s * blink, 2.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11.5 * s + by, 2.8 * s * blink, 2.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11.5 * s + by, 1.5 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11.5 * s + by, 1.5 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.ellipse(0, -8.5 * s + by, 2.5 * s, 2.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#14532d'
      ctx.beginPath()
      ctx.arc(0, -8.5 * s + by, 1.2 * s, 0, Math.PI)
      ctx.fill()

      ctx.strokeStyle = '#14532d'
      ctx.lineWidth = 1.5 * s
      ctx.beginPath()
      ctx.arc(0, -7 * s + by, 2 * s, 0.2, Math.PI - 0.2)
      ctx.stroke()

      ctx.fillStyle = '#15803d'
      ctx.beginPath()
      ctx.moveTo(-7 * s, -14 * s + by)
      ctx.quadraticCurveTo(0, -16 * s, 7 * s, -14 * s + by)
      ctx.quadraticCurveTo(0, -13 * s, -7 * s, -14 * s + by)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-8 * s, -13 * s + by)
      ctx.quadraticCurveTo(0, -14.5 * s, 8 * s, -13 * s + by)
      ctx.quadraticCurveTo(0, -12.5 * s, -8 * s, -13 * s + by)
      ctx.fill()

      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.moveTo(-14 * s, -1 * s)
      ctx.quadraticCurveTo(-12 * s, 2 * s, -10 * s, -1 * s)
      ctx.quadraticCurveTo(-12 * s, 0, -14 * s, -1 * s)
      ctx.fill()
      ctx.strokeStyle = '#450a0a'
      ctx.lineWidth = 1.5 * s
      ctx.beginPath()
      ctx.moveTo(-12 * s, -1 * s)
      ctx.lineTo(-12 * s, 5 * s)
      ctx.stroke()
      ctx.fillStyle = '#b91c1c'
      ctx.beginPath()
      ctx.moveTo(-14 * s, -2 * s)
      ctx.lineTo(-10 * s, -2 * s)
      ctx.lineTo(-11 * s, 0)
      ctx.lineTo(-13 * s, 0)
      ctx.closePath()
      ctx.fill()

    } else if (name === 'Boss') {
      const by = 0

      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 5

      drawLegs(ctx, 0, 4 * s, 8 * s, 10 * s, '#7f1d1d', wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 8 * s, 10 * s, '#7f1d1d', wc)
      drawBoot(ctx, -11 * s, 12 * s + wc * -1 + by, 10 * s, 5 * s, '#450a0a')
      drawBoot(ctx, 0, 12 * s + wc + by, 10 * s, 5 * s, '#450a0a')

      const bossTorso = ctx.createLinearGradient(-11 * s, -4 * s, 11 * s, 7 * s)
      bossTorso.addColorStop(0, '#dc2626')
      bossTorso.addColorStop(0.3, '#b91c1c')
      bossTorso.addColorStop(0.6, '#991b1b')
      bossTorso.addColorStop(1, '#7f1d1d')
      ctx.fillStyle = bossTorso
      ctx.beginPath()
      ctx.moveTo(-11 * s, -4 * s)
      ctx.quadraticCurveTo(-13 * s, 2 * s, -11 * s, 7 * s)
      ctx.quadraticCurveTo(0, 9 * s, 11 * s, 7 * s)
      ctx.quadraticCurveTo(13 * s, 2 * s, 11 * s, -4 * s)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#991b1b'
      ctx.beginPath()
      ctx.moveTo(-12 * s, -5 * s)
      ctx.quadraticCurveTo(0, -4 * s, 12 * s, -5 * s)
      ctx.quadraticCurveTo(0, -6 * s, -12 * s, -5 * s)
      ctx.fill()

      ctx.shadowBlur = 0

      ctx.fillStyle = '#dc2626'
      ctx.beginPath()
      ctx.ellipse(-5 * s, 0, 2 * s, 1.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(5 * s, 0, 2 * s, 1.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      for (let side = -1; side <= 1; side += 2) {
        drawSpike(ctx, 5 * s * side, -4 * s, 4 * s, side)
        drawSpike(ctx, 8 * s * side, -2 * s, 3 * s, side)
        drawSpike(ctx, -10 * s * side, 1 * s, 3 * s, side)
        drawSpike(ctx, -8 * s * side, 3 * s, 3.5 * s, side)
      }

      const bossSkin = ctx.createRadialGradient(0, -14 * s, 0, 0, -12 * s, 9 * s)
      bossSkin.addColorStop(0, '#fca5a5')
      bossSkin.addColorStop(0.6, '#ef4444')
      bossSkin.addColorStop(1, '#dc2626')
      ctx.fillStyle = bossSkin
      ctx.beginPath()
      ctx.ellipse(0, -12 * s + by, 8 * s, 9 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(-3.5 * s, -13.5 * s + by, 3.5 * s * blink, 3.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(3.5 * s, -13.5 * s + by, 3.5 * s * blink, 3.5 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowColor = 'rgba(251,191,36,0.6)'
      ctx.shadowBlur = 8 * s
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.ellipse(-3.5 * s, -13.5 * s + by, 2.5 * s, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(3.5 * s, -13.5 * s + by, 2.5 * s, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      ctx.fillStyle = '#0f172a'
      ctx.beginPath()
      ctx.ellipse(-3.5 * s, -13.5 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(3.5 * s, -13.5 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(-3 * s, -14.5 * s + by, 0.6 * s, 0.6 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(4 * s, -14.5 * s + by, 0.6 * s, 0.6 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#1e293b'
      drawBrow(ctx, -3.5 * s, -16 * s + by, -1 * s)
      drawBrow(ctx, 3.5 * s, -16 * s + by, 1 * s)

      ctx.fillStyle = '#b91c1c'
      ctx.beginPath()
      ctx.ellipse(0, -9 * s + by, 2.5 * s, 2 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#450a0a'
      ctx.lineWidth = 2 * s
      ctx.beginPath()
      ctx.arc(0, -8 * s + by, 3 * s, 0.1, Math.PI - 0.1)
      ctx.stroke()

      const crownBob = Math.sin(t * 2) * 1.5
      const crownGrad = ctx.createLinearGradient(-5 * s, -22 * s, 5 * s, -16 * s)
      crownGrad.addColorStop(0, '#fbbf24')
      crownGrad.addColorStop(0.5, '#f59e0b')
      crownGrad.addColorStop(1, '#d97706')
      ctx.fillStyle = crownGrad
      ctx.beginPath()
      ctx.moveTo(-5 * s, -20 * s + crownBob + by)
      ctx.quadraticCurveTo(0, -21 * s, 5 * s, -20 * s + crownBob + by)
      ctx.quadraticCurveTo(0, -19 * s, -5 * s, -20 * s + crownBob + by)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-7 * s, -19 * s + crownBob + by)
      ctx.quadraticCurveTo(0, -18 * s, 7 * s, -19 * s + crownBob + by)
      ctx.quadraticCurveTo(0, -20 * s, -7 * s, -19 * s + crownBob + by)
      ctx.fill()

      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.moveTo(-4 * s, -22 * s + crownBob + by)
      ctx.quadraticCurveTo(-3 * s, -19 * s, -1.5 * s, -22 * s + crownBob + by)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(1.5 * s, -22 * s + crownBob + by)
      ctx.quadraticCurveTo(3 * s, -19 * s, 4 * s, -22 * s + crownBob + by)
      ctx.closePath()
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-1 * s, -21 * s + crownBob + by)
      ctx.quadraticCurveTo(0, -19 * s, 1 * s, -21 * s + crownBob + by)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(-3 * s, -21 * s + crownBob + by, 1 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(3 * s, -21 * s + crownBob + by, 1 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(0, -20 * s + crownBob + by, 1 * s, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#450a0a'
      ctx.beginPath()
      ctx.moveTo(-12 * s, 1 * s)
      ctx.quadraticCurveTo(-10.5 * s, 6 * s, -9 * s, 11 * s)
      ctx.quadraticCurveTo(-11 * s, 6 * s, -12 * s, 1 * s)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(9 * s, 1 * s)
      ctx.quadraticCurveTo(10.5 * s, 6 * s, 12 * s, 11 * s)
      ctx.quadraticCurveTo(11 * s, 6 * s, 9 * s, 1 * s)
      ctx.fill()

      ctx.fillStyle = '#7f1d1d'
      ctx.beginPath()
      ctx.moveTo(-13 * s, 0)
      ctx.quadraticCurveTo(-10.5 * s, 1.5 * s, -8 * s, 0)
      ctx.quadraticCurveTo(-10.5 * s, 0.5 * s, -13 * s, 0)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(8 * s, 0)
      ctx.quadraticCurveTo(10.5 * s, 1.5 * s, 13 * s, 0)
      ctx.quadraticCurveTo(10.5 * s, 0.5 * s, 8 * s, 0)
      ctx.fill()

      ctx.fillStyle = '#b91c1c'
      ctx.beginPath()
      ctx.moveTo(-13 * s, 10 * s)
      ctx.quadraticCurveTo(-10.5 * s, 12 * s, -8 * s, 10 * s)
      ctx.quadraticCurveTo(-10.5 * s, 11 * s, -13 * s, 10 * s)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(8 * s, 10 * s)
      ctx.quadraticCurveTo(10.5 * s, 12 * s, 13 * s, 10 * s)
      ctx.quadraticCurveTo(10.5 * s, 11 * s, 8 * s, 10 * s)
      ctx.fill()

    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(ctx, 0, 4 * s, 6 * s, 8 * s, e.torso, wc * -1)
      drawLegs(ctx, 2 * s, 4 * s, 6 * s, 8 * s, e.torso, wc)
      drawBoot(ctx, -9 * s, 10 * s + wc * -1, 8 * s, 3 * s, '#2d1b0e')
      drawBoot(ctx, 0, 10 * s + wc, 8 * s, 3 * s, '#2d1b0e')
      drawBodyTorso(ctx, 0, -3 * s, 18 * s, 9 * s, e.torso)

      ctx.shadowBlur = 0

      ctx.fillStyle = e.skin
      ctx.beginPath()
      ctx.ellipse(0, -10 * s, 6 * s, 7 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      drawEye(ctx, -2.5 * s, -11 * s, blink, '#1e293b')
      drawEye(ctx, 2.5 * s, -11 * s, blink, '#1e293b')
      drawBrow(ctx, -2.5 * s, -13.5 * s, -0.3 * s)
      drawBrow(ctx, 2.5 * s, -13.5 * s, 0.3 * s)
      drawNose(ctx, 0, -9 * s)
      drawMouth(ctx, 0, -7 * s, 1.5 * s)

      ctx.fillStyle = '#450a0a'
      ctx.beginPath()
      ctx.moveTo(-3 * s, -2 * s)
      ctx.quadraticCurveTo(0, 0, 3 * s, -2 * s)
      ctx.quadraticCurveTo(0, -1 * s, -3 * s, -2 * s)
      ctx.fill()
    }
  }

  ctx.restore()
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  weather: string = 'clear'
) {
  const t = time / 1000
  const hour = ((t * 0.02) % 24)
  const overcast = weather === 'rain' || weather === 'storm' || weather === 'snow'

  let skyTop: string, skyBottom: string, sunColor: string, horizonColor: string
  if (hour > 5 && hour < 7.5) {
    const f = (hour - 5) / 2.5
    const r1 = Math.round(10 + f * 25), g1 = Math.round(10 + f * 55), b1 = Math.round(40 + f * 85)
    const r2 = Math.round(60 + f * 40), g2 = Math.round(120 - f * 10), b2 = Math.round(200 - f * 20)
    skyTop = `rgb(${r1},${g1},${b1})`
    skyBottom = `rgb(${r2},${g2},${b2})`
    horizonColor = `rgba(255,200,100,${overcast ? 0.1 : 0.4})`
    sunColor = overcast ? '#94a3b8' : '#fbbf24'
  } else if (hour > 7.5 && hour < 18) {
    const dayFactor = overcast ? 0.6 : 1
    skyTop = `rgb(${Math.round(30 * dayFactor)},${Math.round(58 * dayFactor)},${Math.round(138 * dayFactor)})`
    skyBottom = `rgb(${Math.round(96 * dayFactor)},${Math.round(165 * dayFactor)},${Math.round(250 * dayFactor)})`
    horizonColor = `rgba(255,255,255,${overcast ? 0 : 0.15})`
    sunColor = overcast ? '#94a3b8' : '#fef3c7'
  } else if (hour >= 18 && hour < 20) {
    const f = (hour - 18) / 2
    skyTop = `rgb(${(30 + f * 60) | 0},${(58 - f * 20) | 0},${(138 - f * 80) | 0})`
    skyBottom = `rgb(${(96 + f * 80) | 0},${(165 - f * 40) | 0},${(250 - f * 100) | 0})`
    horizonColor = `rgba(255,150,50,${overcast ? 0.1 : 0.3})`
    sunColor = overcast ? '#64748b' : '#f59e0b'
  } else {
    skyTop = '#0c0c1e'
    skyBottom = '#1a1a3e'
    horizonColor = 'rgba(100,100,200,0.05)'
    sunColor = '#e2e8f0'
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, skyTop)
  grad.addColorStop(0.6, skyBottom)
  grad.addColorStop(1, '#0a0a1a')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  if (hour > 5 && hour < 20) {
    const sunY = h * 0.15 + Math.sin((hour - 6) / 14 * Math.PI) * h * 0.3
    const sunX = w * ((hour - 6) / 14)

    if (!overcast) {
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 80)
      sunGlow.addColorStop(0, 'rgba(255,220,100,0.5)')
      sunGlow.addColorStop(0.4, 'rgba(255,200,80,0.2)')
      sunGlow.addColorStop(1, 'rgba(255,200,80,0)')
      ctx.fillStyle = sunGlow
      ctx.beginPath()
      ctx.arc(sunX, sunY, 80, 0, Math.PI * 2)
      ctx.fill()
    }

    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20)
    sunGrad.addColorStop(0, sunColor)
    sunGrad.addColorStop(0.5, '#fbbf24')
    sunGrad.addColorStop(1, '#f59e0b')
    ctx.fillStyle = sunGrad
    ctx.beginPath()
    ctx.arc(sunX, sunY, overcast ? 10 : 20, 0, Math.PI * 2)
    ctx.fill()

    if (!overcast) {
      ctx.fillStyle = '#fde68a'
      ctx.beginPath()
      ctx.arc(sunX - 2, sunY - 2, 12, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    const moonX = w * 0.7, moonY = h * 0.12

    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40)
    moonGlow.addColorStop(0, 'rgba(200,210,255,0.2)')
    moonGlow.addColorStop(1, 'rgba(200,210,255,0)')
    ctx.fillStyle = moonGlow
    ctx.beginPath()
    ctx.arc(moonX, moonY, 40, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#e2e8f0'
    ctx.beginPath()
    ctx.arc(moonX, moonY, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#0c0c1e'
    ctx.beginPath()
    ctx.arc(moonX + 5, moonY - 3, 12, 0, Math.PI * 2)
    ctx.fill()

    if (hour < 5 || hour > 20) {
      for (let i = 0; i < 80; i++) {
        const sx = (i * 137.5 + 50) % w
        const sy = (i * 97.3 + 30) % (h * 0.5)
        const brightness = 0.3 + Math.sin(t * 0.5 + i * 1.7) * 0.2
        ctx.fillStyle = `rgba(255,255,255,${brightness})`
        ctx.beginPath()
        ctx.arc(sx, sy, 0.5 + Math.sin(i) * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  for (let layer = 0; layer < 5; layer++) {
    const layerAlpha = overcast ? 0.25 + layer * 0.12 : 0.1 + layer * 0.08
    const layerScale = 1 + layer * 0.5
    const color = overcast
      ? `rgba(120,130,140,${layerAlpha})`
      : `rgba(255,255,255,${layerAlpha})`
    ctx.fillStyle = color
    for (let i = 0; i < 4 + layer * 2; i++) {
      const cx = ((i * 180 + layer * 130 + t * (0.05 + layer * 0.04) * 30) % (w + 200)) - 100
      const cy = 25 + layer * 20 + Math.sin(i * 1.5 + t * 0.2 * (0.1 + layer * 0.06)) * 12
      const cw = 35 * layerScale + Math.sin(i + t * 0.15) * 8
      const ch = 10 * layerScale
      ctx.beginPath()
      ctx.ellipse(cx, cy, cw, ch, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const mountainColors = ['#0f172a', '#1e293b', '#334155']
  for (let plane = 0; plane < 3; plane++) {
    const pFactor = 0.05 + plane * 0.1
    const offsetY = h * 0.4 + plane * 40
    ctx.fillStyle = mountainColors[plane]
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 6) {
      const height =
        Math.sin((x) * 0.002 + plane * 7) * 70 +
        Math.sin((x) * 0.006 + plane * 4) * 35 +
        Math.sin((x) * 0.015 + plane * 2) * 15 +
        60
      ctx.lineTo(x, offsetY - height)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  }

  for (let i = 0; i < 5; i++) {
    const tx = ((i * 180) % (w + 100)) - 50
    const ty = h * 0.45 + Math.sin(i * 2.5) * 30
    ctx.fillStyle = '#1a3a2a'
    ctx.beginPath()
    ctx.moveTo(tx, ty)
    ctx.quadraticCurveTo(tx, ty + 20 + Math.sin(i) * 5, tx + 2, ty + 20 + Math.sin(i) * 5)
    ctx.quadraticCurveTo(tx + 2, ty, tx, ty)
    ctx.fill()
    ctx.fillStyle = '#2d5a27'
    ctx.beginPath()
    ctx.arc(tx + 2, ty, 12 + Math.sin(i * 1.3) * 4, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(tx - 2, ty - 3, 8 + Math.sin(i * 1.7) * 3, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(tx + 6, ty - 4, 9 + Math.sin(i * 1.1) * 3, Math.PI, Math.PI * 2)
    ctx.fill()
  }
}

export function drawFogOfWar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  radius: number
) {
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.95)'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'destination-out'
  const grad = ctx.createRadialGradient(px, py, 0, px, py, radius)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(0.6, 'rgba(0,0,0,0.8)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(px, py, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawLightning(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  time: number
) {
  const t = time / 1000
  const pulse = Math.sin(t * 2) * 0.15 + 0.85
  ctx.save()
  const innerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  innerGrad.addColorStop(0, color)
  innerGrad.addColorStop(0.3, `${color}80`)
  innerGrad.addColorStop(0.6, `${color}30`)
  innerGrad.addColorStop(1, `${color}00`)
  ctx.fillStyle = innerGrad
  ctx.globalAlpha = pulse * 0.6
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  const outerGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.4)
  outerGrad.addColorStop(0, `${color}40`)
  outerGrad.addColorStop(0.5, `${color}15`)
  outerGrad.addColorStop(1, `${color}00`)
  ctx.fillStyle = outerGrad
  ctx.globalAlpha = pulse * 0.3
  ctx.beginPath()
  ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  lightX: number,
  lightY: number
) {
  const dx = x - lightX
  const dy = y - lightY
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const sx = (dx / dist) * 4
  const sy = (dy / dist) * 4
  const alpha = Math.max(0.1, Math.min(0.4, 1 - dist / 300))
  ctx.fillStyle = `rgba(0,0,0,${alpha})`
  ctx.beginPath()
  ctx.ellipse(x + sx, y + sy + h * 0.3, w * 0.4, h * 0.15, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function drawWeather(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  type: 'clear' | 'rain' | 'snow' | 'storm'
) {
  if (type === 'clear') return
  const t = time / 1000
  ctx.save()

  if (type === 'rain' || type === 'storm') {
    const speed = type === 'storm' ? 2.5 : 1.5
    for (let i = 0; i < 200; i++) {
      const px = (i * 37.7 + t * 120 * speed + (type === 'storm' ? Math.sin(i) * 30 : 0)) % (w + 20) - 10
      const py = (i * 53.3 + t * 250 * speed) % (h + 40) - 20
      const length = 8 + Math.sin(i * 3.7 + t * 2) * 4
      ctx.strokeStyle = `rgba(150,180,220,${0.2 + Math.sin(i * 5.1 + t * 3) * 0.1})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(px, py)
      ctx.lineTo(px - (type === 'storm' ? 3 : 0.5), py + length)
      ctx.stroke()
    }
  }

  if (type === 'snow') {
    for (let i = 0; i < 100; i++) {
      const sway = Math.sin(t * 0.8 + i * 1.3) * 8
      const px = (i * 41.1 + t * 40 + sway) % (w + 30) - 15
      const py = (i * 29.7 + t * 80 + Math.sin(i * 2.3) * 5) % (h + 30) - 15
      const size = 1.5 + Math.sin(i * 4.7 + t) * 0.8
      ctx.fillStyle = `rgba(220,230,255,${0.4 + Math.sin(i * 3.1 + t * 0.5) * 0.15})`
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (type === 'storm') {
    const flash = Math.sin(t * 1.7) > 0.98 ? 0.3 : 0
    if (flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${flash})`
      ctx.fillRect(0, 0, w, h)
    }
    for (let i = 0; i < 3; i++) {
      const lx = (i * 200 + 50) % w
      const ly = (i * 80 + Math.sin(t * 3 + i) * 40) % h
      const flashAlpha = Math.sin(t * 2.3 + i * 4.1) > 0.97 ? 0.6 : 0
      if (flashAlpha > 0) {
        ctx.strokeStyle = `rgba(200,210,255,${flashAlpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(lx, 0)
        let cx = lx
        for (let y = 0; y <= ly; y += 10) {
          cx += Math.sin(y * 0.3 + t * 5 + i) * 8
          ctx.lineTo(cx, y)
        }
        ctx.stroke()
      }
    }
  }

  ctx.restore()
}

export function applyPostProcess(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  effects: { bloom?: number; vignette?: number; damage?: number }
) {
  const t = time / 1000
  ctx.save()

  if (effects.bloom && effects.bloom > 0) {
    const imageData = ctx.getImageData(0, 0, w, h)
    const data = imageData.data
    const blurred = new Uint8ClampedArray(data.length)
    const radius = Math.max(1, Math.round(effects.bloom * 4))
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let r = 0, g = 0, b = 0, count = 0
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const idx = (ny * w + nx) * 4
              r += data[idx]
              g += data[idx + 1]
              b += data[idx + 2]
              count++
            }
          }
        }
        const idx = (y * w + x) * 4
        blurred[idx] = r / count
        blurred[idx + 1] = g / count
        blurred[idx + 2] = b / count
        blurred[idx + 3] = data[idx + 3]
      }
    }
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = w
    tempCanvas.height = h
    const tempCtx = tempCanvas.getContext('2d')!
    const tempImageData = new ImageData(blurred, w, h)
    tempCtx.putImageData(tempImageData, 0, 0)
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = effects.bloom * 0.4
    ctx.drawImage(tempCanvas, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  if (effects.vignette && effects.vignette > 0) {
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.7)
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vigGrad.addColorStop(1, `rgba(0,0,0,${effects.vignette})`)
    ctx.fillStyle = vigGrad
    ctx.fillRect(0, 0, w, h)
  }

  if (effects.damage && effects.damage > 0) {
    const damageAlpha = Math.sin(t * 6) * 0.2 + 0.3
    ctx.fillStyle = `rgba(255,0,0,${damageAlpha * effects.damage})`
    ctx.fillRect(0, 0, w, h)
  }

  ctx.restore()
}

export function drawLighting(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lights: { x: number; y: number; radius: number; color: string; intensity: number }[],
  ambientLevel: number
) {
  ctx.save()

  ctx.fillStyle = `rgba(0,0,0,${1 - ambientLevel})`
  ctx.fillRect(0, 0, w, h)

  if (lights.length > 0) {
    ctx.globalCompositeOperation = 'lighter'

    for (const light of lights) {
      const grad = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.radius)
      const alpha = (1 - ambientLevel) * light.intensity
      grad.addColorStop(0, light.color)
      grad.addColorStop(0.3, `${light.color}${Math.round(alpha * 180).toString(16).padStart(2, '0')}`)
      grad.addColorStop(0.7, `${light.color}${Math.round(alpha * 60).toString(16).padStart(2, '0')}`)
      grad.addColorStop(1, `${light.color}00`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.globalCompositeOperation = 'source-over'
  }

  ctx.restore()
}
