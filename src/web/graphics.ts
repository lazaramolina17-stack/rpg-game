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
    const r = 180 + rng() * 75 | 0
    const gr = 80 + rng() * 60 | 0
    const b = 80 + rng() * 80 | 0
    grad.addColorStop(0, `rgb(${r},${gr},${b})`)
    grad.addColorStop(1, `rgba(${r},${gr},${b},0)`)
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
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 4

  const t = time / 1000
  const bobOffset = bob !== 0 ? Math.sin(t * 3 + x) * bob : 0
  const walkPhase = Math.sin(t * 6)
  const walkCycle = walkPhase * 1.5
  const blinkCycle = Math.sin(t * 4.7) > 0.95 ? 0 : 1
  const idleBob = Math.sin(t * 2.3) * 0.5

  ctx.shadowBlur = 0
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, 15, 13, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bobOffset)

  function drawEye(sx: number, sy: number, open: number, color = '#1e293b') {
    ctx.shadowBlur = 0
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

  function drawBrow(sx: number, sy: number, angle: number) {
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(sx - 3, sy + angle * 1.5)
    ctx.lineTo(sx + 3, sy - angle * 1.5)
    ctx.stroke()
  }

  function drawMouth(sx: number, sy: number, w: number) {
    ctx.strokeStyle = '#4a2c1a'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.arc(sx, sy + 1, w, 0.1, Math.PI - 0.1)
    ctx.stroke()
  }

  function drawNose(sx: number, sy: number) {
    ctx.fillStyle = '#e8b87a'
    ctx.beginPath()
    ctx.ellipse(sx, sy, 1.2, 1.8, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawEar(sx: number, sy: number, skin: string) {
    ctx.fillStyle = skin
    ctx.beginPath()
    ctx.ellipse(sx, sy, 2, 3.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawCape(sx: number, sy: number, w: number, h: number, color: string, wave: number) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx - w / 2, sy)
    for (let i = 0; i <= 8; i++) {
      const px = sx - w / 2 + (w * i) / 8
      const wx = Math.sin(t * 2.5 + i * 0.8 + x * 0.01) * wave
      const py2 = sy + (h * i) / 8 + wx
      ctx.lineTo(px, py2)
    }
    for (let i = 8; i >= 0; i--) {
      const px = sx - w / 2 + (w * i) / 8
      const wx = Math.sin(t * 2.5 + i * 0.8 + x * 0.01) * wave
      const py2 = sy + (h * i) / 8 + wx + h * 0.3
      ctx.lineTo(px, py2)
    }
    ctx.closePath()
    ctx.fill()
  }

  function drawBeard(sx: number, sy: number, w: number, h: number, color: string) {
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

  function drawRobeGlow(sx: number, sy: number, w: number, h: number, glow: number) {
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

  function drawBoot(sx: number, sy: number, w: number, h: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + w, sy)
    ctx.lineTo(sx + w + 1, sy + h)
    ctx.lineTo(sx - 1, sy + h)
    ctx.closePath()
    ctx.fill()
  }

  function drawGoblinEar(sx: number, sy: number, flip: number) {
    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + flip * 5, sy - 3)
    ctx.lineTo(sx + flip * 4, sy + 3)
    ctx.closePath()
    ctx.fill()
  }

  function drawSpike(sx: number, sy: number, h: number, flip: number) {
    ctx.fillStyle = '#dc2626'
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + flip * 3, sy - h)
    ctx.lineTo(sx + flip * 5, sy)
    ctx.closePath()
    ctx.fill()
  }

  function drawLegs(sx: number, sy: number, w: number, h: number, color: string, wc: number) {
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

  function drawArm(sx: number, sy: number, len: number, angle: number, color: string, w: number = 3) {
    ctx.strokeStyle = color
    ctx.lineWidth = w
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.quadraticCurveTo(sx + Math.cos(angle) * len * 0.5, sy + Math.sin(angle) * len * 0.5 - 2, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len)
    ctx.stroke()
  }

  function drawBodyTorso(sx: number, sy: number, w: number, h: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx - w / 2, sy)
    ctx.quadraticCurveTo(sx - w / 2 - 2, sy + h * 0.3, sx - w / 2 + 1, sy + h * 0.6)
    ctx.quadraticCurveTo(sx, sy + h, sx + w / 2 - 1, sy + h * 0.6)
    ctx.quadraticCurveTo(sx + w / 2 + 2, sy + h * 0.3, sx + w / 2, sy)
    ctx.closePath()
    ctx.fill()
  }

  function drawHatCone(sx: number, sy: number, w: number, h: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx - w / 2, sy)
    ctx.quadraticCurveTo(sx - w / 4, sy - h * 0.7, sx, sy - h)
    ctx.quadraticCurveTo(sx + w / 4, sy - h * 0.7, sx + w / 2, sy)
    ctx.closePath()
    ctx.fill()
  }

  if (type === 'player') {
    const wc = walkCycle
    const capeWave = Math.sin(t * 2.5 + x * 0.01) * 2.5
    const blink = blinkCycle

    ctx.shadowColor = 'rgba(91,33,182,0.3)'
    ctx.shadowBlur = 6
    drawCape(0, -3, 24, 16, '#5b21b6', capeWave)
    ctx.shadowBlur = 0

    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 3

    const legColor = '#1e0a3c'
    ctx.fillStyle = legColor
    ctx.beginPath()
    ctx.moveTo(-7, 8 + wc * -1)
    ctx.quadraticCurveTo(-6, 15 + wc * -1, -3, 15 + wc * -1)
    ctx.quadraticCurveTo(0, 15 + wc * -1, 1, 8 + wc * -1)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(5, 8 + wc)
    ctx.quadraticCurveTo(6, 15 + wc, 9, 15 + wc)
    ctx.quadraticCurveTo(12, 15 + wc, 13, 8 + wc)
    ctx.closePath()
    ctx.fill()

    drawBoot(-10, 12 + wc * -1, 8, 4, '#1e0a3c')
    drawBoot(2, 12 + wc, 8, 4, '#1e0a3c')

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

    const armColor = '#a855f7'
    ctx.strokeStyle = armColor
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-9, -1)
    ctx.quadraticCurveTo(-13, 2, -12, 7)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(9, -1)
    ctx.quadraticCurveTo(13, 2, 12, 7)
    ctx.stroke()
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

    drawEar(-8, -11, '#fde68a')
    drawEar(8, -11, '#fde68a')

    drawEye(-3.5, -13, blink)
    drawEye(3.5, -13, blink)
    drawBrow(-3.5, -15.5, -0.5)
    drawBrow(3.5, -15.5, 0.5)
    drawNose(0, -11)
    drawMouth(0, -8.5, 2.5)

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

    drawLegs(0, 5, 6, 8, c.pants, wc)

    drawBoot(-9, 12 + wc * -1, 8, 3, c.shoes)
    drawBoot(0, 12 + wc, 8, 3, c.shoes)

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

    drawEye(-3, -11, blink)
    drawEye(3, -11, blink)
    drawBrow(-3, -13.5, -0.3)
    drawBrow(3, -13.5, 0.3)
    drawNose(0, -9)
    drawMouth(0, -7, 2)

    if (name === 'Elder' && c.beard) {
      drawBeard(0, -6, 8, 7, c.beard)
    }
    if (name === 'Merchant') {
      drawBeard(0, -6, 5, 3, '#8B6914')
    }
    if (name === 'Guard') {
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(-6, -18)
      ctx.quadraticCurveTo(0, -19, 6, -18)
      ctx.quadraticCurveTo(0, -17, -6, -18)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-5, -19)
      ctx.quadraticCurveTo(0, -20, 5, -19)
      ctx.quadraticCurveTo(0, -18, -5, -19)
      ctx.fill()
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(-8, -16)
      ctx.quadraticCurveTo(0, -15, 8, -16)
      ctx.quadraticCurveTo(0, -17, -8, -16)
      ctx.fill()
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
      drawHatCone(0, -12, 16, 8, c.hat2)
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

    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(0, 15 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2)
    ctx.fill()

    if (name === 'Bandit') {
      const by = Math.sin(t * 2.3) * 0.8

      ctx.shadowColor = 'rgba(0,0,0,0.2)'
      ctx.shadowBlur = 3

      drawLegs(0, 4 * s, 6 * s, 8 * s, '#6B4914', wc * -1)
      drawLegs(2 * s, 4 * s, 6 * s, 8 * s, '#6B4914', wc)

      drawBoot(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#78350f')
      drawBoot(0, 10 * s + wc + by, 8 * s, 3 * s, '#78350f')

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

      drawLegs(0, 4 * s, 6 * s, 8 * s, '#cbd5e1', wc * -1)
      drawLegs(2 * s, 4 * s, 6 * s, 8 * s, '#cbd5e1', wc)

      drawBoot(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#94a3b8')
      drawBoot(0, 10 * s + wc + by, 8 * s, 3 * s, '#94a3b8')

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

      drawLegs(0, 4 * s, 6 * s, 8 * s, '#1d4ed8', wc * -1)
      drawLegs(2 * s, 4 * s, 6 * s, 8 * s, '#1d4ed8', wc)

      drawBoot(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#0f3a8a')
      drawBoot(0, 10 * s + wc + by, 8 * s, 3 * s, '#0f3a8a')

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

      drawRobeGlow(0, 2 * s, 14 * s, 4 * s, 0.25 + Math.sin(t * 3) * 0.15)

      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.ellipse(0, -10 * s + by, 6 * s, 7 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      drawEye(-2.5 * s, -11 * s + by, blink, '#3b82f6')
      drawEye(2.5 * s, -11 * s + by, blink, '#3b82f6')
      drawBrow(-2.5 * s, -13.5 * s + by, -0.5 * s)
      drawBrow(2.5 * s, -13.5 * s + by, 0.5 * s)
      drawNose(0, -9 * s + by)
      drawMouth(0, -7 * s + by, 1.5 * s)

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

      drawLegs(0, 4 * s, 6 * s, 8 * s, '#16a34a', wc * -1)
      drawLegs(2 * s, 4 * s, 6 * s, 8 * s, '#16a34a', wc)

      drawBoot(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s, '#14532d')
      drawBoot(0, 10 * s + wc + by, 8 * s, 3 * s, '#14532d')

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

      drawGoblinEar(-6 * s, -10 * s + by, -1)
      drawGoblinEar(6 * s, -10 * s + by, 1)

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

      drawLegs(0, 4 * s, 8 * s, 10 * s, '#7f1d1d', wc * -1)
      drawLegs(2 * s, 4 * s, 8 * s, 10 * s, '#7f1d1d', wc)

      drawBoot(-11 * s, 12 * s + wc * -1 + by, 10 * s, 5 * s, '#450a0a')
      drawBoot(0, 12 * s + wc + by, 10 * s, 5 * s, '#450a0a')

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
        drawSpike(5 * s * side, -4 * s, 4 * s, side)
        drawSpike(8 * s * side, -2 * s, 3 * s, side)
        drawSpike(-10 * s * side, 1 * s, 3 * s, side)
        drawSpike(-8 * s * side, 3 * s, 3.5 * s, side)
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
      drawBrow(-3.5 * s, -16 * s + by, -1 * s)
      drawBrow(3.5 * s, -16 * s + by, 1 * s)

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

      drawLegs(0, 4 * s, 6 * s, 8 * s, e.torso, wc * -1)
      drawLegs(2 * s, 4 * s, 6 * s, 8 * s, e.torso, wc)

      drawBoot(-9 * s, 10 * s + wc * -1, 8 * s, 3 * s, '#2d1b0e')
      drawBoot(0, 10 * s + wc, 8 * s, 3 * s, '#2d1b0e')

      drawBodyTorso(0, -3 * s, 18 * s, 9 * s, e.torso)

      ctx.shadowBlur = 0

      ctx.fillStyle = e.skin
      ctx.beginPath()
      ctx.ellipse(0, -10 * s, 6 * s, 7 * s, 0, 0, Math.PI * 2)
      ctx.fill()

      drawEye(-2.5 * s, -11 * s, blink, '#1e293b')
      drawEye(2.5 * s, -11 * s, blink, '#1e293b')
      drawBrow(-2.5 * s, -13.5 * s, -0.3 * s)
      drawBrow(2.5 * s, -13.5 * s, 0.3 * s)
      drawNose(0, -9 * s)
      drawMouth(0, -7 * s, 1.5 * s)

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
  cameraX: number,
  cameraY: number,
  time: number
) {
  const t = time / 1000

  const hour = ((t * 0.02) % 24)
  let skyTop: string, skyBottom: string
  if (hour > 6 && hour < 18) {
    skyTop = '#1e3a8a'
    skyBottom = '#60a5fa'
  } else if (hour >= 18 && hour < 20) {
    const f = (hour - 18) / 2
    skyTop = `rgb(${(30 + f * 80) | 0},${(58 - f * 20) | 0},${(138 - f * 60) | 0})`
    skyBottom = `rgb(${(96 + f * 100) | 0},${(165 - f * 30) | 0},${(250 - f * 80) | 0})`
  } else {
    skyTop = '#0c0c1e'
    skyBottom = '#1a1a3e'
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, skyTop)
  grad.addColorStop(1, skyBottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  if (hour > 6 && hour < 20) {
    const sunY = h * 0.15 + Math.sin((hour - 6) / 14 * Math.PI) * h * 0.3
    const sunX = w * ((hour - 6) / 14)

    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60)
    sunGlow.addColorStop(0, 'rgba(255,220,100,0.6)')
    sunGlow.addColorStop(0.4, 'rgba(255,200,80,0.3)')
    sunGlow.addColorStop(1, 'rgba(255,200,80,0)')
    ctx.fillStyle = sunGlow
    ctx.beginPath()
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2)
    ctx.fill()

    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 20)
    sunGrad.addColorStop(0, '#fef3c7')
    sunGrad.addColorStop(0.5, '#fbbf24')
    sunGrad.addColorStop(1, '#f59e0b')
    ctx.fillStyle = sunGrad
    ctx.beginPath()
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.arc(sunX - 2, sunY - 2, 12, 0, Math.PI * 2)
    ctx.fill()
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
    ctx.fillStyle = '#94a3b8'
    ctx.beginPath()
    ctx.arc(moonX + 5, moonY - 3, 12, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let layer = 0; layer < 3; layer++) {
    const layerSpeed = 0.1 + layer * 0.08
    const layerAlpha = 0.15 + layer * 0.1
    const layerScale = 1 + layer * 0.6
    ctx.fillStyle = `rgba(255,255,255,${layerAlpha})`
    for (let i = 0; i < 4 + layer * 2; i++) {
      const cx = ((i * 200 + layer * 150 + t * layerSpeed * 30) % (w + 200)) - 100
      const cy = 30 + layer * 25 + Math.sin(i * 1.5 + t * 0.3 * layerSpeed) * 15
      const cw = 40 * layerScale + Math.sin(i + t * 0.2) * 10
      const ch = 12 * layerScale
      ctx.beginPath()
      ctx.ellipse(cx + cameraX * layerSpeed * -0.05, cy, cw, ch, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  for (let plane = 0; plane < 2; plane++) {
    const pFactor = 0.1 + plane * 0.15
    const offsetX = cameraX * pFactor * 0.1
    const offsetY = h * 0.5 + plane * 60
    ctx.fillStyle = plane === 0 ? '#1e293b' : '#334155'
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 8) {
      const height = Math.sin((x + offsetX) * 0.003 + plane * 5) * 60
        + Math.sin((x + offsetX) * 0.008 + plane * 3) * 30
        + 80
      ctx.lineTo(x, offsetY - height)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
  }

  for (let i = 0; i < 5; i++) {
    const tx = ((i * 180 + cameraX * 0.05) % (w + 100)) - 50
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