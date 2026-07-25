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
  const walkCycle = type === 'player' || type === 'npc' || type === 'enemy' ? Math.sin(t * 6) : 0

  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(0, 14, 12, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.translate(0, bobOffset)

  if (type === 'player') {
    ctx.fillStyle = '#a855f7'
    ctx.fillRect(-8, -4 + walkCycle * 1.5, 16, 14)
    ctx.fillStyle = '#9333ea'
    ctx.fillRect(-12, -10 + walkCycle * 1.5, 24, 8)
    ctx.fillStyle = '#c084fc'
    ctx.fillRect(-10, -12 + walkCycle * 1.5, 8, 3)
    ctx.fillRect(2, -12 + walkCycle * 1.5, 8, 3)

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(-8, -8 + walkCycle * 1.5, 4, 4)
    ctx.fillRect(4, -8 + walkCycle * 1.5, 4, 4)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(-7, -7 + walkCycle * 1.5, 2, 2)
    ctx.fillRect(5, -7 + walkCycle * 1.5, 2, 2)

    ctx.fillStyle = '#fbbf24'
    ctx.fillRect(-2, -16 + walkCycle * 1.5, 4, 6)

    ctx.fillStyle = '#94a3b8'
    ctx.fillRect(-11, -6 + walkCycle * 1.5, 2, 10)
    ctx.fillStyle = '#cbd5e1'
    ctx.fillRect(-10, -6 + walkCycle * 1.5, 1, 8)

    ctx.fillStyle = '#4a4a6a'
    ctx.fillRect(9, -5 + walkCycle * 1.5, 3, 8)
    ctx.fillStyle = '#6a6a8a'
    ctx.fillRect(9, -6 + walkCycle * 1.5, 3, 2)

    const capeWave = Math.sin(t * 2) * 2
    ctx.fillStyle = '#7e22ce'
    ctx.fillRect(-7, -10 + walkCycle * 1.5 + capeWave, 14, 3)
    ctx.fillRect(-6, -7 + walkCycle * 1.5 + capeWave, 12, 2)

    ctx.fillStyle = '#a855f7'
    ctx.fillRect(-6, 10 + walkCycle * 1.5 * -1, 4, 4)
    ctx.fillRect(2, 10 + walkCycle * 1.5, 4, 4)

  } else if (type === 'npc') {
    const skinColors: Record<string, { body: string; torso: string; acc: string }> = {
      Merchant: { body: '#22c55e', torso: '#16a34a', acc: '#fbbf24' },
      Guard: { body: '#3b82f6', torso: '#2563ea', acc: '#94a3b8' },
      Elder: { body: '#9ca3af', torso: '#6b7280', acc: '#8B5E3C' },
      Blacksmith: { body: '#f97316', torso: '#ea580c', acc: '#64748b' },
      Farmer: { body: '#8B6914', torso: '#6B4914', acc: '#a3e635' },
    }
    const colors = skinColors[name] || { body: '#22c55e', torso: '#16a34a', acc: '#fbbf24' }

    ctx.fillStyle = colors.body
    ctx.fillRect(-8, -3 + walkCycle * 1.5, 16, 13)
    ctx.fillStyle = colors.torso
    ctx.fillRect(-10, -9 + walkCycle * 1.5, 20, 7)
    ctx.fillStyle = '#fde68a'
    ctx.fillRect(-8, -11 + walkCycle * 1.5, 16, 3)

    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(-7, -8 + walkCycle * 1.5, 4, 4)
    ctx.fillRect(3, -8 + walkCycle * 1.5, 4, 4)
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(-6, -7 + walkCycle * 1.5, 2, 2)
    ctx.fillRect(4, -7 + walkCycle * 1.5, 2, 2)

    if (name === 'Merchant') {
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(-4, -14 + walkCycle * 1.5, 8, 4)
      ctx.fillRect(-3, -15 + walkCycle * 1.5, 6, 2)
    } else if (name === 'Guard') {
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-14, -4 + walkCycle * 1.5, 3, 14)
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(-13, -4 + walkCycle * 1.5, 1, 12)
      ctx.fillStyle = '#475569'
      ctx.fillRect(-15, -5 + walkCycle * 1.5, 5, 2)
    } else if (name === 'Elder') {
      ctx.fillStyle = '#8B5E3C'
      ctx.fillRect(-2, -16 + walkCycle * 1.5, 4, 6)
      ctx.fillStyle = '#6B3E1C'
      ctx.fillRect(-1, -17 + walkCycle * 1.5, 2, 2)
    } else if (name === 'Blacksmith') {
      ctx.fillStyle = '#64748b'
      ctx.fillRect(10, -3 + walkCycle * 1.5, 4, 8)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(11, -4 + walkCycle * 1.5, 2, 2)
      ctx.fillStyle = '#8B6914'
      ctx.fillRect(10, 5 + walkCycle * 1.5, 4, 2)
    } else if (name === 'Farmer') {
      ctx.fillStyle = '#a3e635'
      ctx.fillRect(-12, -2 + walkCycle * 1.5, 3, 10)
      ctx.fillStyle = '#65a30d'
      ctx.fillRect(-13, -3 + walkCycle * 1.5, 5, 2)
    }

    ctx.fillStyle = colors.body
    ctx.fillRect(-6, 10 + walkCycle * 1.5 * -1, 4, 4)
    ctx.fillRect(2, 10 + walkCycle * 1.5, 4, 4)

  } else if (type === 'enemy') {
    const enemyColors: Record<string, { body: string; torso: string; eye: string; size: number }> = {
      Bandit: { body: '#8B6914', torso: '#6B4914', eye: '#f8fafc', size: 1 },
      Skeleton: { body: '#e2e8f0', torso: '#cbd5e1', eye: '#ef4444', size: 1 },
      Mage: { body: '#3b82f6', torso: '#1d4ed8', eye: '#fbbf24', size: 1 },
      Goblin: { body: '#22c55e', torso: '#16a34a', eye: '#ef4444', size: 1 },
      Boss: { body: '#ef4444', torso: '#b91c1c', eye: '#fbbf24', size: 1.4 },
    }
    const ec = enemyColors[name] || { body: '#8B6914', torso: '#6B4914', eye: '#f8fafc', size: 1 }
    const s = ec.size

    ctx.translate(0, -(s - 1) * 8)

    if (name === 'Skeleton') {
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(-8 * s, -4 * s + walkCycle * 1.5, 16 * s, 14 * s)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(-10 * s, -9 * s + walkCycle * 1.5, 20 * s, 6 * s)

      ctx.fillStyle = '#1e293b'
      ctx.fillRect(-8 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillRect(4 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(-7 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)
      ctx.fillRect(5 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)

      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(-1 * s, -3 * s + walkCycle * 1.5, 2 * s, 6 * s)

      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(-6 * s, 10 * s + walkCycle * 1.5 * -1, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 10 * s + walkCycle * 1.5, 4 * s, 4 * s)

    } else if (name === 'Mage') {
      ctx.fillStyle = '#1d4ed8'
      ctx.fillRect(-8 * s, -4 * s + walkCycle * 1.5, 16 * s, 14 * s)
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(-10 * s, -11 * s + walkCycle * 1.5, 20 * s, 9 * s)

      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(-7 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillRect(3 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(-6 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)
      ctx.fillRect(4 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)

      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(-1 * s, -14 * s + walkCycle * 1.5, 2 * s, 4 * s)

      ctx.fillStyle = '#60a5fa'
      const robeGlow = Math.sin(t * 3) * 0.2 + 0.8
      ctx.globalAlpha = robeGlow
      ctx.fillRect(-9 * s, 2 * s + walkCycle * 1.5, 18 * s, 6 * s)
      ctx.globalAlpha = 1

      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(-6 * s, 10 * s + walkCycle * 1.5 * -1, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 10 * s + walkCycle * 1.5, 4 * s, 4 * s)

    } else if (name === 'Goblin') {
      ctx.fillStyle = '#22c55e'
      ctx.fillRect(-8 * s, -4 * s + walkCycle * 1.5, 16 * s, 14 * s)
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(-10 * s, -9 * s + walkCycle * 1.5, 20 * s, 6 * s)

      ctx.fillStyle = '#fef08a'
      ctx.fillRect(-8 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillRect(4 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(-7 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)
      ctx.fillRect(5 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)

      ctx.fillStyle = '#dc2626'
      ctx.fillRect(-8 * s, -12 * s + walkCycle * 1.5, 16 * s, 3 * s)

      ctx.fillStyle = '#ef4444'
      ctx.fillRect(-14 * s, -2 * s + walkCycle * 1.5, 3 * s, 4 * s)

      ctx.fillStyle = '#22c55e'
      ctx.fillRect(-6 * s, 10 * s + walkCycle * 1.5 * -1, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 10 * s + walkCycle * 1.5, 4 * s, 4 * s)

    } else if (name === 'Boss') {
      ctx.fillStyle = '#b91c1c'
      ctx.fillRect(-10 * s, -5 * s + walkCycle * 1.5, 20 * s, 18 * s)
      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(-12 * s, -11 * s + walkCycle * 1.5, 24 * s, 8 * s)

      ctx.fillStyle = '#fca5a5'
      ctx.fillRect(-9 * s, -9 * s + walkCycle * 1.5, 6 * s, 4 * s)
      ctx.fillRect(3 * s, -9 * s + walkCycle * 1.5, 6 * s, 4 * s)
      ctx.fillStyle = '#fbbf24'
      ctx.fillRect(-8 * s, -8 * s + walkCycle * 1.5, 3 * s, 2 * s)
      ctx.fillRect(5 * s, -8 * s + walkCycle * 1.5, 3 * s, 2 * s)

      ctx.fillStyle = '#450a0a'
      ctx.fillRect(-1 * s, -4 * s + walkCycle * 1.5, 2 * s, 2 * s)

      ctx.fillStyle = '#fbbf24'
      const crownBob = Math.sin(t * 2) * 1
      ctx.fillRect(-4 * s, -15 * s + walkCycle * 1.5 + crownBob, 8 * s, 4 * s)
      ctx.fillRect(-6 * s, -14 * s + walkCycle * 1.5 + crownBob, 12 * s, 2 * s)
      ctx.fillRect(-3 * s, -16 * s + walkCycle * 1.5 + crownBob, 2 * s, 2 * s)
      ctx.fillRect(1 * s, -16 * s + walkCycle * 1.5 + crownBob, 2 * s, 2 * s)

      ctx.fillStyle = '#ef4444'
      ctx.fillRect(-8 * s, 12 * s + walkCycle * 1.5 * -1, 6 * s, 5 * s)
      ctx.fillRect(2 * s, 12 * s + walkCycle * 1.5, 6 * s, 5 * s)

    } else {
      ctx.fillStyle = ec.body
      ctx.fillRect(-8 * s, -4 * s + walkCycle * 1.5, 16 * s, 14 * s)
      ctx.fillStyle = ec.torso
      ctx.fillRect(-10 * s, -9 * s + walkCycle * 1.5, 20 * s, 6 * s)

      ctx.fillStyle = '#f8fafc'
      ctx.fillRect(-7 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillRect(3 * s, -8 * s + walkCycle * 1.5, 4 * s, 4 * s)
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(-6 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)
      ctx.fillRect(4 * s, -7 * s + walkCycle * 1.5, 2 * s, 2 * s)

      ctx.fillStyle = '#450a0a'
      ctx.fillRect(-3 * s, -2 * s + walkCycle * 1.5, 6 * s, 2 * s)

      ctx.fillStyle = ec.body
      ctx.fillRect(-6 * s, 10 * s + walkCycle * 1.5 * -1, 4 * s, 4 * s)
      ctx.fillRect(2 * s, 10 * s + walkCycle * 1.5, 4 * s, 4 * s)
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
