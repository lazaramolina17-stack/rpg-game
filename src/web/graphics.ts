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
  ctx.fillStyle = '#3a7d32'
  ctx.fillRect(0, 0, 32, 32)

  const baseGreen = 50 + rng() * 40 | 0
  ctx.fillStyle = `rgb(${40 + rng() * 30 | 0},${baseGreen},${30 + rng() * 30 | 0})`
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(rng() * 28 | 0, rng() * 28 | 0, 2 + rng() * 3 | 0, 1)
  }

  for (let i = 0; i < 4; i++) {
    const gx = rng() * 28 | 0, gy = rng() * 28 | 0
    ctx.fillStyle = `rgb(${80 + rng() * 60 | 0},${130 + rng() * 40 | 0},${40 + rng() * 40 | 0})`
    ctx.fillRect(gx, gy, 2, 4 + rng() * 4 | 0)
    ctx.fillRect(gx + 1, gy, 1, 2)
  }

  for (let i = 0; i < 2; i++) {
    const fx = 6 + rng() * 20 | 0, fy = 6 + rng() * 20 | 0
    ctx.fillStyle = `rgb(${200 + rng() * 55 | 0},${100 + rng() * 60 | 0},${120 + rng() * 60 | 0})`
    ctx.fillRect(fx, fy, 2, 2)
    ctx.fillRect(fx + 2, fy - 1, 1, 1)
    ctx.fillRect(fx - 1, fy + 1, 1, 1)
  }
}

function drawForestTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  ctx.fillStyle = '#1a3a17'
  ctx.fillRect(0, 0, 32, 32)

  ctx.fillStyle = `rgb(${15 + rng() * 20 | 0},${30 + rng() * 30 | 0},${15 + rng() * 15 | 0})`
  for (let i = 0; i < 16; i++) {
    ctx.fillRect(rng() * 30 | 0, rng() * 30 | 0, 1 + rng() * 2 | 0, 1)
  }

  for (let i = 0; i < 3; i++) {
    const lx = 4 + rng() * 24 | 0, ly = 2 + rng() * 20 | 0
    ctx.fillStyle = `rgb(${20 + rng() * 30 | 0},${60 + rng() * 30 | 0},${10 + rng() * 20 | 0})`
    ctx.beginPath()
    ctx.arc(lx, ly, 6 + rng() * 3 | 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `rgb(${30 + rng() * 30 | 0},${80 + rng() * 30 | 0},${15 + rng() * 20 | 0})`
    ctx.beginPath()
    ctx.arc(lx + 3, ly - 2, 4 + rng() * 2 | 0, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 2; i++) {
    const mx = 8 + rng() * 16 | 0, my = 8 + rng() * 16 | 0
    ctx.fillStyle = `rgb(${180 + rng() * 40 | 0},${120 + rng() * 40 | 0},${80 + rng() * 30 | 0})`
    ctx.fillRect(mx, my, 3, 2)
    ctx.fillRect(mx + 1, my - 1, 1, 1)
    ctx.fillStyle = `rgb(${220 + rng() * 35 | 0},${80 + rng() * 40 | 0},${60 + rng() * 40 | 0})`
    ctx.fillRect(mx, my - 1, 1, 1)
  }
}

function drawWaterTile(ctx: CanvasRenderingContext2D, rng: () => number, t: number) {
  const wave = Math.sin(t * 2 + rng() * 10) * 0.15 + 0.85
  ctx.fillStyle = `rgb(${30 * wave | 0},${100 * wave | 0},${220 * wave | 0})`
  ctx.fillRect(0, 0, 32, 32)

  for (let i = 0; i < 4; i++) {
    const wy = (i * 8 + Math.sin(t * 1.5 + i * 1.5 + rng() * 10) * 3 + 4) | 0
    ctx.fillStyle = `rgba(255,255,255,${0.08 + Math.sin(t * 2 + i * 2 + rng()) * 0.04})`
    ctx.fillRect(2, wy, 28, 1)
  }

  for (let i = 0; i < 3; i++) {
    const rx = 4 + rng() * 20 | 0, ry = 4 + rng() * 20 | 0
    ctx.fillStyle = `rgba(100,180,255,${0.15 + Math.sin(t * 1.2 + rx) * 0.08})`
    ctx.fillRect(rx, ry, 4 + rng() * 4 | 0, 2)
  }

  ctx.fillStyle = `rgba(200,230,255,${0.06 + Math.sin(t * 0.8 + rng() * 20) * 0.03})`
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(4 + rng() * 24 | 0, 2 + rng() * 24 | 0, 3, 1)
  }
}

function drawStoneTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 100 + rng() * 40 | 0
  ctx.fillStyle = `rgb(${base},${base + 10},${base + 20})`
  ctx.fillRect(0, 0, 32, 32)

  ctx.fillStyle = `rgb(${base - 20},${base - 10},${base})`
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(4 + i * 10 + (rng() * 4 | 0), 6 + i * 8 + (rng() * 4 | 0), 6 + rng() * 4 | 0, 2 + rng() * 2 | 0)
  }

  const crackLen = 2 + rng() * 3 | 0
  ctx.strokeStyle = `rgb(${base - 30},${base - 25},${base - 20})`
  ctx.lineWidth = 1
  for (let i = 0; i < 4; i++) {
    const cx = 4 + rng() * 20 | 0, cy = 4 + rng() * 20 | 0
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    for (let j = 0; j < crackLen; j++) {
      ctx.lineTo(cx + (rng() * 6 - 3 | 0), cy + 2 + j * 3)
    }
    ctx.stroke()
  }

  ctx.fillStyle = `rgb(${base + 15},${base + 20},${base + 25})`
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(rng() * 28 | 0, rng() * 28 | 0, 1, 1)
  }
}

function drawSandTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 160 + rng() * 40 | 0
  ctx.fillStyle = `rgb(${base + 20},${base},${60 + rng() * 30 | 0})`
  ctx.fillRect(0, 0, 32, 32)

  ctx.fillStyle = `rgb(${base + 10},${base - 10},${50 + rng() * 20 | 0})`
  for (let i = 0; i < 20; i++) {
    const sx = rng() * 30 | 0, sy = rng() * 30 | 0
    ctx.fillRect(sx, sy, 1 + rng() * 2 | 0, 1)
  }

  ctx.fillStyle = `rgb(${base},${base - 20},${40 + rng() * 15 | 0})`
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(rng() * 30 | 0, rng() * 30 | 0, 1, 1)
  }

  ctx.fillStyle = `rgb(${base + 30},${base + 10},${70 + rng() * 20 | 0})`
  for (let i = 0; i < 3; i++) {
    const sx = rng() * 26 | 0, sy = rng() * 26 | 0
    ctx.fillRect(sx, sy, 2 + rng() * 4 | 0, 1)
    ctx.fillRect(sx, sy + 1, 1 + rng() * 2 | 0, 1)
  }
}

function drawLavaTile(ctx: CanvasRenderingContext2D, rng: () => number, t: number) {
  const pulse = Math.sin(t * 1.5 + rng() * 10) * 0.1 + 0.9
  ctx.fillStyle = `rgb(${200 * pulse | 0},${60 * pulse | 0},${10 * pulse | 0})`
  ctx.fillRect(0, 0, 32, 32)

  for (let i = 0; i < 3; i++) {
    const ly = (i * 10 + Math.sin(t * 2 + i * 2 + rng() * 10) * 4 + 5) | 0
    const bright = 0.3 + Math.sin(t * 1.5 + i * 1.5 + rng() * 8) * 0.15
    ctx.fillStyle = `rgba(255,200,50,${bright})`
    ctx.fillRect(2, ly, 28, 2)
  }

  for (let i = 0; i < 4; i++) {
    const sx = 3 + rng() * 24 | 0, sy = 3 + rng() * 24 | 0
    const glow = 0.2 + Math.sin(t * 0.8 + sx + sy) * 0.1
    ctx.fillStyle = `rgba(255,150,50,${glow})`
    ctx.fillRect(sx, sy, 2, 2)
  }

  ctx.fillStyle = `rgba(255,120,30,${0.1 + Math.sin(t * 1.2 + rng() * 15) * 0.05})`
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(3 + rng() * 26 | 0, 3 + rng() * 26 | 0, 3, 1)
  }
}

function drawSnowTile(ctx: CanvasRenderingContext2D, rng: () => number) {
  const base = 220 + rng() * 35 | 0
  ctx.fillStyle = `rgb(${base},${base},${base + 10})`
  ctx.fillRect(0, 0, 32, 32)

  ctx.fillStyle = `rgb(${base - 10},${base - 10},${base})`
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(rng() * 28 | 0, rng() * 28 | 0, 1 + rng() * 3 | 0, 1)
  }

  for (let i = 0; i < 5; i++) {
    const sx = rng() * 28 | 0, sy = rng() * 28 | 0
    ctx.fillStyle = `rgb(${230 + rng() * 25 | 0},${230 + rng() * 25 | 0},${250 + rng() * 5 | 0})`
    ctx.fillRect(sx, sy, 2, 2)
    ctx.fillStyle = `rgba(255,255,255,0.4)`
    ctx.fillRect(sx + 1, sy + 1, 1, 1)
  }

  ctx.fillStyle = `rgba(200,220,255,0.15)`
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(rng() * 28 | 0, rng() * 28 | 0, 2 + rng() * 3 | 0, 1)
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

  const t = time / 1000
  const bobOffset = bob !== 0 ? Math.sin(t * 3 + x) * bob : 0
  const walkPhase = Math.sin(t * 6)
  const walkCycle = walkPhase * 1.5
  const blinkCycle = Math.sin(t * 4.7) > 0.95 ? 0 : 1
  const idleBob = Math.sin(t * 2.3) * 0.5

  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.beginPath()
  ctx.ellipse(0, 15, 13, 5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bobOffset)

  function drawEye(sx: number, sy: number, open: number, color = '#1e293b') {
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

  function drawArmorPlate(sx: number, sy: number, w: number, h: number, color: string, highlight: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(sx + w, sy)
    ctx.lineTo(sx + w - 2, sy + h)
    ctx.lineTo(sx + 2, sy + h)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = highlight
    ctx.beginPath()
    ctx.moveTo(sx + 2, sy + 2)
    ctx.lineTo(sx + w - 4, sy + 2)
    ctx.lineTo(sx + w - 4, sy + h - 2)
    ctx.lineTo(sx + 2, sy + h - 2)
    ctx.closePath()
    ctx.fill()
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

  function drawSkirt(sx: number, sy: number, w: number, h: number, color: string, wave: number) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(sx - w / 2, sy)
    for (let i = 0; i <= 6; i++) {
      const px = sx - w / 2 + (w * i) / 6
      const wx = Math.sin(t * 3 + i * 1.2) * wave
      ctx.lineTo(px, sy + h + wx)
    }
    ctx.closePath()
    ctx.fill()
  }

  function drawHair(sx: number, sy: number, w: number, h: number, color: string) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(sx, sy - h * 0.3, w / 2 + 1, h * 0.7, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(sx - w / 2, sy - h * 0.7, w, h * 0.5)
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

  if (type === 'player') {
    const wc = walkCycle
    const capeWave = Math.sin(t * 2.5 + x * 0.01) * 2.5
    const blink = blinkCycle

    drawCape(0, -3, 24, 16, '#5b21b6', capeWave)

    ctx.fillStyle = '#1e0a3c'
    ctx.fillRect(-10, 8 + wc * -1, 8, 5)
    ctx.fillRect(2, 8 + wc, 8, 5)

    drawBoot(-10, 12 + wc * -1, 8, 4, '#1e0a3c')
    drawBoot(2, 12 + wc, 8, 4, '#1e0a3c')

    ctx.fillStyle = '#4c1d95'
    ctx.fillRect(-9, 6 + wc * -1, 18, 4)
    drawSkirt(0, 7, 18, 7, '#4c1d95', 1.5)

    drawArmorPlate(-8, -3, 16, 10, '#7c3aed', '#a855f7')

    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-5, 6, 10, 1.5)

    ctx.fillStyle = '#a855f7'
    ctx.fillRect(-10, -1, 3, 8)
    ctx.fillRect(7, -1, 3, 8)

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(-10, 2, 3, 2)
    ctx.fillRect(7, 2, 3, 2)

    ctx.fillStyle = '#f8fafc'
    ctx.beginPath()
    ctx.ellipse(-8, 7, 2, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(8, 7, 2, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.ellipse(0, -12, 7.5, 8.5, 0, 0, Math.PI * 2)
    ctx.fill()

    drawHair(0, -12, 15, 7, '#2d1b69')
    ctx.fillStyle = '#2d1b69'
    ctx.fillRect(-4, -20, 8, 3)
    ctx.fillRect(-7, -18, 14, 3)

    drawEar(-8, -11, '#fde68a')
    drawEar(8, -11, '#fde68a')

    drawEye(-3.5, -13, blink)
    drawEye(3.5, -13, blink)
    drawBrow(-3.5, -15.5, -0.5)
    drawBrow(3.5, -15.5, 0.5)
    drawNose(0, -11)
    drawMouth(0, -8.5, 2.5)

    ctx.fillStyle = '#c084fc'
    ctx.fillRect(-1, -10, 2, 2)

    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-9, -2, 2, 2)
    ctx.fillRect(7, -2, 2, 2)

    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(11, -2)
    ctx.lineTo(16, -10)
    ctx.lineTo(18, -8)
    ctx.lineTo(13, 0)
    ctx.closePath()
    ctx.fillStyle = '#e2e8f0'
    ctx.fill()

    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(13, -12, 1.5, 6)

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(13, -13, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(13, -13, 1.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#6d28d9'
    ctx.fillRect(12, -6, 4, 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(11, -2, 1.5, 1)

    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(-15, -2)
    ctx.lineTo(-15, 4)
    ctx.lineTo(-13, 7)
    ctx.stroke()

    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.moveTo(-16, -3)
    ctx.lineTo(-12, -5)
    ctx.lineTo(-11, -2)
    ctx.lineTo(-15, 0)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(-13.5, -1.5, 1.5, 0, Math.PI * 2)
    ctx.fill()

  } else if (type === 'npc') {
    const wc = walkCycle
    const blink = blinkCycle
    const skin = '#fde68a'

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

    ctx.fillStyle = c.pants
    ctx.fillRect(-8, 5 + wc * -1, 7, 8)
    ctx.fillRect(1, 5 + wc, 7, 8)

    ctx.fillStyle = c.shoes
    ctx.fillRect(-9, 12 + wc * -1, 8, 3)
    ctx.fillRect(0, 12 + wc, 8, 3)

    ctx.fillStyle = c.torso
    ctx.beginPath()
    ctx.moveTo(-8, -2)
    ctx.lineTo(8, -2)
    ctx.lineTo(9, 7)
    ctx.lineTo(-9, 7)
    ctx.closePath()
    ctx.fill()

    if (name === 'Guard') {
      ctx.fillStyle = '#1e3a8a'
      ctx.fillRect(-9, -2, 18, 2)
    }

    ctx.fillStyle = c.accent
    ctx.fillRect(-2, 1, 4, 4)

    ctx.fillStyle = skin
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
      ctx.fillRect(-6, -18, 12, 3)
      ctx.fillRect(-5, -19, 10, 2)
      ctx.fillRect(-8, -16, 16, 2)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(-1, -21, 2, 4)
      ctx.fillRect(-8, -16, 4, 1)
      ctx.fillRect(4, -16, 4, 1)
    } else if (name === 'Merchant') {
      ctx.fillStyle = c.hat2
      ctx.beginPath()
      ctx.moveTo(-6, -16)
      ctx.lineTo(6, -16)
      ctx.lineTo(8, -8)
      ctx.lineTo(-8, -8)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.moveTo(-9, -9)
      ctx.lineTo(9, -9)
      ctx.lineTo(7, -12)
      ctx.lineTo(-7, -12)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.arc(0, -17, 3, 0, Math.PI * 2)
      ctx.fill()
    } else if (name === 'Elder') {
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.moveTo(-8, -15)
      ctx.lineTo(8, -15)
      ctx.lineTo(6, -9)
      ctx.lineTo(-6, -9)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = c.hat2
      ctx.fillRect(-6, -19, 12, 5)
      ctx.fillRect(-4, -21, 8, 3)
    } else if (name === 'Blacksmith') {
      ctx.fillStyle = c.hat
      ctx.fillRect(-7, -16, 14, 3)
      ctx.fillRect(-5, -19, 10, 4)
      ctx.fillStyle = c.hat2
      ctx.fillRect(-5, -20, 10, 2)
      ctx.fillStyle = '#1e1b1b'
      ctx.beginPath()
      ctx.arc(5, -10, 2.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#f8fafc'
      ctx.beginPath()
      ctx.arc(5, -10, 1, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#64748b'
      ctx.fillRect(9, -1, 4, 9)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(10, -2, 2, 2)
      ctx.fillStyle = '#f97316'
      ctx.fillRect(9, 8, 4, 3)
      ctx.fillStyle = '#292524'
      ctx.fillRect(8, 0, 2, 7)
    } else if (name === 'Farmer') {
      ctx.fillStyle = c.hat
      ctx.beginPath()
      ctx.ellipse(0, -17, 7, 2.5, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = c.hat2
      ctx.fillRect(-5, -23, 10, 6)
      ctx.fillRect(-3, -24, 6, 2)
      ctx.fillStyle = '#65a30d'
      ctx.fillRect(-13, 1, 4, 8)
      ctx.fillStyle = '#4d7c0f'
      ctx.fillRect(-14, 0, 6, 2)
    }

    if (name === 'Guard') {
      ctx.strokeStyle = '#94a3b8'
      ctx.lineWidth = 2.5
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
      ctx.lineTo(-17, 7)
      ctx.lineTo(-16, 10)
      ctx.lineTo(-14, 10)
      ctx.closePath()
      ctx.fill()
    } else if (name === 'Elder') {
      ctx.fillStyle = '#8B5E3C'
      ctx.fillRect(-1, -2, 2, 10)
      ctx.fillStyle = '#6b4226'
      ctx.fillRect(-2, -3, 4, 2)
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
    } else if (name === 'Merchant') {
      ctx.fillStyle = '#78350f'
      ctx.fillRect(-3, 2, 6, 3)
      ctx.fillStyle = '#0f766e'
      ctx.fillRect(-4, 2, 8, 1)
    }

    ctx.fillStyle = c.pants
    ctx.fillRect(-6, 12 + wc * -1, 4, 4)
    ctx.fillRect(2, 12 + wc, 4, 4)

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
    const idle = Math.sin(t * 2.3) * 1.5 * s
    const blink = blinkCycle

    ctx.translate(0, -(s - 1) * 8)

    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(0, 15 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2)
    ctx.fill()

    if (name === 'Bandit') {
      const by = Math.sin(t * 2.3) * 0.8

      ctx.fillStyle = '#6B4914'
      ctx.fillRect(-8 * s, 4 * s + wc * -1 + by, 7 * s, 8 * s)
      ctx.fillRect(1 * s, 4 * s + wc + by, 7 * s, 8 * s)

      ctx.fillStyle = '#78350f'
      ctx.fillRect(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s)
      ctx.fillRect(0 * s, 10 * s + wc + by, 8 * s, 3 * s)

      ctx.fillStyle = e.torso
      ctx.fillRect(-9 * s, -2 * s, 18 * s, 8 * s)

      ctx.fillStyle = '#5a3a0a'
      ctx.fillRect(-10 * s, -3 * s, 20 * s, 2 * s)

      ctx.fillStyle = '#8B6914'
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
      ctx.fillRect(-12 * s, -1 * s, 4 * s, 3 * s)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-11 * s, -1 * s, 2 * s, 2 * s)

      ctx.fillStyle = '#6B4914'
      ctx.fillRect(-6 * s, 12 * s + wc * -1 + by, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 12 * s + wc + by, 4 * s, 4 * s)

    } else if (name === 'Skeleton') {
      const by = Math.sin(t * 2.5) * 1

      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(-8 * s, 4 * s + wc * -1 + by, 7 * s, 8 * s)
      ctx.fillRect(1 * s, 4 * s + wc + by, 7 * s, 8 * s)

      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s)
      ctx.fillRect(0 * s, 10 * s + wc + by, 8 * s, 3 * s)

      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(-9 * s, -3 * s, 18 * s, 9 * s)

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
        ctx.fillRect(-7 * s + i * 4.5 * s, 1 * s, 2 * s, 1 * s)
      }

      ctx.fillStyle = '#f1f5f9'
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

      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.ellipse(-2.5 * s, -11 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(2.5 * s, -11 * s + by, 1.2 * s, 1.8 * s, 0, 0, Math.PI * 2)
      ctx.fill()

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
      ctx.fillRect(-9 * s - 1 * s, -1 * s, 3 * s, 7 * s)
      ctx.fillRect(6 * s + 1 * s, -1 * s, 3 * s, 7 * s)

      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(-6 * s, 12 * s + wc * -1 + by, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 12 * s + wc + by, 4 * s, 4 * s)

    } else if (name === 'Mage') {
      const by = Math.sin(t * 2.3) * 0.8

      ctx.fillStyle = '#1d4ed8'
      ctx.fillRect(-8 * s, 4 * s + wc * -1 + by, 7 * s, 8 * s)
      ctx.fillRect(1 * s, 4 * s + wc + by, 7 * s, 8 * s)

      ctx.fillStyle = '#0f3a8a'
      ctx.fillRect(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s)
      ctx.fillRect(0 * s, 10 * s + wc + by, 8 * s, 3 * s)

      ctx.fillStyle = '#1d4ed8'
      ctx.beginPath()
      ctx.moveTo(-9 * s, -3 * s)
      ctx.lineTo(9 * s, -3 * s)
      ctx.lineTo(10 * s, 6 * s)
      ctx.lineTo(-10 * s, 6 * s)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(-7 * s, 1 * s, 14 * s, 4 * s)

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

      ctx.fillStyle = '#1d4ed8'
      ctx.beginPath()
      ctx.moveTo(-7 * s, -16 * s + by)
      ctx.lineTo(7 * s, -16 * s + by)
      ctx.lineTo(6 * s, -10 * s + by)
      ctx.lineTo(-6 * s, -10 * s + by)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.moveTo(-5 * s, -18 * s + by)
      ctx.lineTo(5 * s, -18 * s + by)
      ctx.lineTo(3 * s, -16 * s + by)
      ctx.lineTo(-3 * s, -16 * s + by)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = '#60a5fa'
      ctx.beginPath()
      ctx.arc(0, -20 * s + by, 2 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#93c5fd'
      ctx.beginPath()
      ctx.arc(0, -20 * s + by, 1 * s, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#3b82f6'
      const orbY = Math.sin(t * 2.8) * 3 * s
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
      ctx.globalAlpha = 0.2 + Math.sin(t * 4) * 0.1
      ctx.fillStyle = '#93c5fd'
      ctx.beginPath()
      ctx.arc(12 * s, -2 * s + orbY, 5 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      ctx.fillStyle = '#1d4ed8'
      ctx.fillRect(-6 * s, 12 * s + wc * -1 + by, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 12 * s + wc + by, 4 * s, 4 * s)

    } else if (name === 'Goblin') {
      const by = Math.sin(t * 2.7) * 1.2

      ctx.fillStyle = '#16a34a'
      ctx.fillRect(-8 * s, 4 * s + wc * -1 + by, 7 * s, 8 * s)
      ctx.fillRect(1 * s, 4 * s + wc + by, 7 * s, 8 * s)

      ctx.fillStyle = '#14532d'
      ctx.fillRect(-9 * s, 10 * s + wc * -1 + by, 8 * s, 3 * s)
      ctx.fillRect(0 * s, 10 * s + wc + by, 8 * s, 3 * s)

      ctx.fillStyle = '#16a34a'
      ctx.fillRect(-8 * s, -2 * s, 16 * s, 8 * s)

      ctx.fillStyle = '#15803d'
      ctx.fillRect(-9 * s, -3 * s, 18 * s, 2 * s)

      ctx.fillStyle = '#22c55e'
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
      ctx.fillRect(-7 * s, -14 * s + by, 14 * s, 2.5 * s)
      ctx.fillRect(-8 * s, -13 * s + by, 16 * s, 1.5 * s)

      ctx.fillStyle = '#dc2626'
      ctx.fillRect(-14 * s, -1 * s, 4 * s, 4 * s)
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

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(-6 * s, 12 * s + wc * -1 + by, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 12 * s + wc + by, 4 * s, 4 * s)

    } else if (name === 'Boss') {
      const by = 0

      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(-10 * s, 4 * s + wc * -1 + by, 9 * s, 10 * s)
      ctx.fillRect(1 * s, 4 * s + wc + by, 9 * s, 10 * s)

      ctx.fillStyle = '#450a0a'
      ctx.fillRect(-11 * s, 12 * s + wc * -1 + by, 10 * s, 5 * s)
      ctx.fillRect(0 * s, 12 * s + wc + by, 10 * s, 5 * s)

      ctx.fillStyle = '#b91c1c'
      ctx.fillRect(-11 * s, -4 * s, 22 * s, 11 * s)

      ctx.fillStyle = '#991b1b'
      ctx.fillRect(-12 * s, -5 * s, 24 * s, 2 * s)

      ctx.fillStyle = '#dc2626'
      ctx.fillRect(-7 * s, -1 * s, 4 * s, 3 * s)
      ctx.fillRect(3 * s, -1 * s, 4 * s, 3 * s)

      for (let side = -1; side <= 1; side += 2) {
        drawSpike(5 * s * side, -4 * s, 4 * s, side)
        drawSpike(8 * s * side, -2 * s, 3 * s, side)
        drawSpike(-10 * s * side, 1 * s, 3 * s, side)
        drawSpike(-8 * s * side, 3 * s, 3.5 * s, side)
      }

      ctx.fillStyle = '#fca5a5'
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
      ctx.fillStyle = '#fbbf24'
      ctx.beginPath()
      ctx.ellipse(-3.5 * s, -13.5 * s + by, 2.5 * s, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(3.5 * s, -13.5 * s + by, 2.5 * s, 3 * s, 0, 0, Math.PI * 2)
      ctx.fill()
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

      ctx.fillStyle = '#fbbf24'
      const crownBob = Math.sin(t * 2) * 1.5
      ctx.fillRect(-5 * s, -20 * s + crownBob + by, 10 * s, 4 * s)
      ctx.fillRect(-7 * s, -19 * s + crownBob + by, 14 * s, 2 * s)
      ctx.fillRect(-4 * s, -22 * s + crownBob + by, 2.5 * s, 3 * s)
      ctx.fillRect(1.5 * s, -22 * s + crownBob + by, 2.5 * s, 3 * s)
      ctx.fillRect(-1 * s, -21 * s + crownBob + by, 2 * s, 2 * s)

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
      ctx.fillRect(-12 * s, 1 * s, 3 * s, 10 * s)
      ctx.fillRect(9 * s, 1 * s, 3 * s, 10 * s)

      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(-13 * s, 0, 5 * s, 2 * s)
      ctx.fillRect(8 * s, 0, 5 * s, 2 * s)

      ctx.fillStyle = '#b91c1c'
      ctx.fillRect(-13 * s, 10 * s, 5 * s, 3 * s)
      ctx.fillRect(8 * s, 10 * s, 5 * s, 3 * s)

      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(-9 * s, 14 * s + wc * -1 + by, 7 * s, 5 * s)
      ctx.fillRect(2 * s, 14 * s + wc + by, 7 * s, 5 * s)

    } else {
      ctx.fillStyle = e.torso
      ctx.fillRect(-8 * s, 4 * s + wc * -1, 7 * s, 8 * s)
      ctx.fillRect(1 * s, 4 * s + wc, 7 * s, 8 * s)

      ctx.fillStyle = '#2d1b0e'
      ctx.fillRect(-9 * s, 10 * s + wc * -1, 8 * s, 3 * s)
      ctx.fillRect(0 * s, 10 * s + wc, 8 * s, 3 * s)

      ctx.fillStyle = e.torso
      ctx.fillRect(-9 * s, -3 * s, 18 * s, 9 * s)

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
      ctx.fillRect(-3 * s, -2 * s, 6 * s, 2 * s)

      ctx.fillStyle = e.skin
      ctx.fillRect(-6 * s, 12 * s + wc * -1, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 12 * s + wc, 4 * s, 4 * s)
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
    ctx.fillStyle = 'rgba(255,220,100,0.4)'
    ctx.beginPath()
    ctx.arc(sunX, sunY, 40, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fde68a'
    ctx.beginPath()
    ctx.arc(sunX - 2, sunY - 2, 12, 0, Math.PI * 2)
    ctx.fill()
  } else {
    const moonX = w * 0.7, moonY = h * 0.12
    ctx.fillStyle = 'rgba(200,210,255,0.15)'
    ctx.beginPath()
    ctx.arc(moonX, moonY, 30, 0, Math.PI * 2)
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
    ctx.fillRect(tx, ty, 4, 20 + Math.sin(i) * 5)
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
  ctx.beginPath()
  const r = radius
  ctx.arc(px, py, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalCompositeOperation = 'destination-out'
  const grad = ctx.createRadialGradient(px, py, r * 0.7, px, py, r)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(px, py, r, 0, Math.PI * 2)
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

  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius)
  grad.addColorStop(0, color)
  grad.addColorStop(0.3, `${color}80`)
  grad.addColorStop(0.6, `${color}30`)
  grad.addColorStop(1, `${color}00`)
  ctx.fillStyle = grad
  ctx.globalAlpha = pulse * 0.6
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.globalAlpha = pulse * 0.3
  ctx.beginPath()
  ctx.arc(x, y, radius * 1.4, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}
