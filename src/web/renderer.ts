import * as THREE from 'three'
import { ProceduralTiles } from './graphics.js'
import { initScene } from './three-scene.js'
import { createTileMesh, createPlayerModel, createEnemyModel, createNPCModel, createItemModel, createProjectileModel } from './three-models.js'
import { RACES, CLASSES, getModifier, DiceRoll } from './dnd.js'

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
  hp: number; maxHp: number; mana: number; maxMana: number
  inventory: ({ type: string; name: string; quantity: number } | null)[]
  quests: { name: string; objective: string; completed: boolean }[]
  allQuestsComplete: boolean; gold: number
  shopItems?: { name: string; price: string; description: string }[]
  showShop?: boolean
}

export interface DamageText {
  text: string; x: number; y: number; alpha: number
}

interface Particle3D {
  mesh: THREE.Mesh
  vx: number; vz: number; vy: number
  life: number; maxLife: number
}

export class Renderer {
  private overlayCtx: CanvasRenderingContext2D
  private scene: THREE.Scene
  private threeCamera: THREE.PerspectiveCamera
  private threeRenderer: THREE.WebGLRenderer
  private cameraState: Camera = { x: 0, y: 0, zoom: 1 }
  private entities: Entity[] = []
  private particles3D: Particle3D[] = []
  private projectileMeshes: THREE.Mesh[] = []
  private tileMeshMap: Map<string, THREE.Mesh> = new Map()
  private entityModelMap: Map<string, THREE.Group> = new Map()
  private screenFlash = 0
  private levelUpText = 0
  private levelUpY = 0
  private time = 0
  private fps = 0
  private frameCount = 0
  private lastFpsTime = 0
  private sharedParticleGeo: THREE.SphereGeometry
  hud: HUDData | null = null
  damageTexts: DamageText[] = []
  showVictory = false
  gameOver = false
  minimapVisible = false
  yaw = 0
  pitch = 0

  constructor(private canvas: HTMLCanvasElement) {
    const threeCanvas = document.createElement('canvas')
    threeCanvas.style.position = 'absolute'
    threeCanvas.style.top = '0'
    threeCanvas.style.left = '0'
    threeCanvas.style.width = '100%'
    threeCanvas.style.height = '100%'
    threeCanvas.style.display = 'block'

    const container = document.getElementById('game-container') || document.body
    if (container.style.position !== 'absolute' && container.style.position !== 'relative') {
      container.style.position = 'relative'
    }
    container.insertBefore(threeCanvas, canvas)

    this.canvas.style.position = 'absolute'
    this.canvas.style.top = '0'
    this.canvas.style.left = '0'
    this.canvas.style.pointerEvents = 'none'

    this.overlayCtx = canvas.getContext('2d')!

    const init = initScene(threeCanvas)
    this.scene = init.scene
    this.threeCamera = new THREE.PerspectiveCamera(70, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100)
    this.threeCamera.position.set(0, 1.5, 0)
    this.threeCamera.lookAt(0, 0, -1)
    this.threeRenderer = init.renderer
    init.ground.visible = false

    this.sharedParticleGeo = new THREE.SphereGeometry(0.08, 6, 6)

    this.resize()
    window.addEventListener('resize', () => this.resize())
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
    this.threeCamera.aspect = this.canvas.width / this.canvas.height
    this.threeCamera.updateProjectionMatrix()
  }

  getCtx() { return this.overlayCtx }

  setCamera(cam: Partial<Camera>) {
    Object.assign(this.cameraState, cam)
    this.updateThreeCamera()
  }

  getCamera() { return this.cameraState }

  setEntities(es: Entity[]) { this.entities = es }

  toggleMinimap(visible: boolean) { this.minimapVisible = visible }

  charCreationState: {
    phase: 'race' | 'class' | 'attributes' | 'confirm'
    raceIndex: number
    classIndex: number
    attrs: number[]
    attrIndex: number
    name: string
  } | null = null

  setCharCreationState(state: typeof Renderer.prototype.charCreationState) {
    this.charCreationState = state
  }

  drawCharacterCreation(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const state = this.charCreationState
    if (!state) return
    ctx.fillStyle = 'rgba(0,0,0,0.85)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('D&D Character Creation', w / 2, 60)
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '14px sans-serif'
    ctx.fillText('Welcome, adventurer! Create your hero.', w / 2, 90)
    if (state.phase === 'race') {
      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('Choose Your Race', w / 2, 140)
      for (let i = 0; i < RACES.length; i++) {
        const r = RACES[i]
        const y = 180 + i * 75
        ctx.fillStyle = i === state.raceIndex ? '#fbbf24' : '#94a3b8'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(r.name, 120, y)
        ctx.fillStyle = '#64748b'
        ctx.font = '12px sans-serif'
        ctx.fillText(r.description, 120, y + 18)
        const bonusParts = Object.entries(r.attributeBonuses).map(([k, v]) => `${k.slice(0, 3).toUpperCase()}+${v}`)
        ctx.fillStyle = '#34d399'
        ctx.font = '11px sans-serif'
        ctx.fillText(bonusParts.join('  '), 120, y + 36)
        ctx.fillStyle = '#475569'
        ctx.font = '10px sans-serif'
        ctx.fillText(r.traits.join(' | '), 120, y + 52)
        if (i === state.raceIndex) {
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(90, y - 8, 4, 60)
        }
      }
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText('↑↓ Navigate  [Space] Select', w / 2, h - 30)
    } else if (state.phase === 'class') {
      ctx.fillStyle = '#3b82f6'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('Choose Your Class', w / 2, 140)
      for (let i = 0; i < CLASSES.length; i++) {
        const c = CLASSES[i]
        const y = 180 + i * 65
        ctx.fillStyle = i === state.classIndex ? '#fbbf24' : '#94a3b8'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(c.name, 120, y)
        ctx.fillStyle = '#64748b'
        ctx.font = '12px sans-serif'
        ctx.fillText(c.description, 120, y + 18)
        ctx.fillStyle = '#f59e0b'
        ctx.font = '11px sans-serif'
        ctx.fillText(`HD: d${c.hitDie}  Primary: ${c.primaryAbility}  Saves: ${c.savingThrowProficiencies.join(', ')}`, 120, y + 36)
        if (i === state.classIndex) {
          ctx.fillStyle = '#3b82f6'
          ctx.fillRect(90, y - 8, 4, 50)
        }
      }
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText('↑↓ Navigate  [Space] Select', w / 2, h - 30)
    } else if (state.phase === 'attributes') {
      const attrNames = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('Assign Attributes', w / 2, 140)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText('Place each value: 15, 14, 13, 12, 10, 8', w / 2, 165)
      for (let i = 0; i < attrNames.length; i++) {
        const y = 200 + i * 48
        ctx.fillStyle = i === state.attrIndex ? '#fbbf24' : '#e2e8f0'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(attrNames[i], w / 2 - 20, y)
        ctx.textAlign = 'left'
        ctx.fillStyle = i < state.attrs.length ? '#34d399' : '#475569'
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText(i < state.attrs.length ? String(state.attrs[i]) : '--', w / 2 + 10, y)
        if (i === state.attrIndex) {
          ctx.fillStyle = '#fbbf24'
          ctx.fillRect(w / 2 - 30, y - 18, 4, 22)
        }
      }
      if (state.attrs.length < 6) {
        const remaining = [15, 14, 13, 12, 10, 8]
        for (const a of state.attrs) {
          const idx = remaining.indexOf(a)
          if (idx >= 0) remaining.splice(idx, 1)
        }
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Select value: [${remaining.join('] [')}]  [B]ack`, w / 2, h - 30)
      } else {
        ctx.fillStyle = '#94a3b8'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('[Space] Confirm  [B]ack', w / 2, h - 30)
      }
    } else if (state.phase === 'confirm') {
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 18px sans-serif'
      ctx.fillText('Confirm Character', w / 2, 140)
      const race = RACES[state.raceIndex]
      const cls = CLASSES[state.classIndex]
      const attrNames = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '16px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`${race.name} ${cls.name}`, w / 2, 180)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '13px sans-serif'
      ctx.fillText(`${cls.description}`, w / 2, 205)
      for (let i = 0; i < attrNames.length; i++) {
        const x = w / 2 - 150 + i * 60
        ctx.fillStyle = '#64748b'
        ctx.font = '11px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(attrNames[i], x, 245)
        ctx.fillStyle = '#34d399'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(String(state.attrs[i]), x, 268)
        ctx.fillStyle = '#475569'
        ctx.font = '10px sans-serif'
        ctx.fillText(`mod ${getModifier(state.attrs[i] as number >= 0 ? state.attrs[i] : 10)}`, x, 283)
      }
      ctx.fillStyle = '#a855f7'
      ctx.font = '13px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`HP: ${cls.hitDie} + CON  AC: ${10 + getModifier(state.attrs[1])}  Speed: ${race.speed}`, w / 2, 315)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.fillText('[Space] Begin Adventure!  [B]ack', w / 2, h - 30)
    }
  }

  addParticles(x: number, y: number, color: string, count = 8) {
    const wx = x / 32, wz = y / 32
    const colorObj = new THREE.Color(color)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = (30 + Math.random() * 60) / 32
      const mesh = new THREE.Mesh(this.sharedParticleGeo, new THREE.MeshBasicMaterial({ color: colorObj }))
      mesh.position.set(wx, 0.3, wz)
      this.scene.add(mesh)
      this.particles3D.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vz: Math.sin(angle) * speed,
        vy: 0.5 + Math.random() * 1.5,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 0.5 + Math.random() * 0.5,
      })
    }
  }

  flashScreen() { this.screenFlash = 0.15 }
  showLevelUp(x: number) { this.levelUpText = 2; this.levelUpY = x }

  render(time: number, dt: number) {
    this.time = time
    this.updateThreeCamera()
    this.updateTileMeshes()
    this.updateEntityMeshes(time)
    this.updateParticles3D(dt)
    this.updateProjectiles(time)

    this.threeRenderer.render(this.scene, this.threeCamera)

    const ctx = this.overlayCtx, w = this.canvas.width, h = this.canvas.height
    ctx.clearRect(0, 0, w, h)

    if (this.charCreationState) {
      this.drawCharacterCreation(ctx, w, h)
    } else {
      this.drawHpBars(ctx)
      this.drawHUD(ctx, w, h)
      this.drawDamageTexts(ctx)
      this.drawDiceRoll(ctx, w, h)

      if (this.screenFlash > 0) {
        ctx.fillStyle = `rgba(255,0,0,${this.screenFlash * 0.3})`
        ctx.fillRect(0, 0, w, h)
        this.screenFlash -= dt
      }
      if (this.levelUpText > 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 36px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('LEVEL UP!', w / 2, this.levelUpY)
        this.levelUpText -= dt
      }
      this.drawDebug(ctx)

      if (this.gameOver) this.drawGameOver(ctx, w, h)
      if (this.showVictory) this.drawVictory(ctx, w, h)
      if (this.minimapVisible) this.drawMinimap(ctx, w, h, this.cameraState)
    }

    this.drawCrosshair(ctx, w, h)

    this.frameCount++
    if (time - this.lastFpsTime >= 1000) { this.fps = this.frameCount; this.frameCount = 0; this.lastFpsTime = time }
  }

  private updateThreeCamera() {
    const cam = this.cameraState
    const worldX = cam.x / 32, worldZ = cam.y / 32
    this.threeCamera.position.set(worldX, 1.0, worldZ)
    const dir = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    )
    this.threeCamera.lookAt(this.threeCamera.position.clone().add(dir))
  }

  private updateTileMeshes() {
    const cam = this.cameraState, w = this.canvas.width, h = this.canvas.height
    const sx = Math.max(0, Math.floor((cam.x - w / 2) / TILE) - 1)
    const sy = Math.max(0, Math.floor((cam.y - h / 2) / TILE) - 1)
    const ex = Math.min(TILEMAP[0].length, Math.ceil((cam.x + w / 2) / TILE) + 1)
    const ey = Math.min(TILEMAP.length, Math.ceil((cam.y + h / 2) / TILE) + 1)

    const visibleKeys = new Set<string>()
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const key = `${x},${y}`
        visibleKeys.add(key)
        if (this.tileMeshMap.has(key)) continue
        const tile = TILEMAP[y]?.[x] ?? 0
        const mesh = createTileMesh(tile, x * 100 + y)
        mesh.position.set(x, 0.075, y)
        this.scene.add(mesh)
        this.tileMeshMap.set(key, mesh)
      }
    }
    for (const [key, mesh] of this.tileMeshMap) {
      if (!visibleKeys.has(key)) {
        this.scene.remove(mesh)
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
        this.tileMeshMap.delete(key)
      }
    }
  }

  private updateEntityMeshes(time: number) {
    const currentKeys = new Set<string>()
    const es = this.entities
    for (let i = 0; i < es.length; i++) {
      const e = es[i]
      const key = `${i}_${e.type}_${e.name}`
      currentKeys.add(key)
      let model = this.entityModelMap.get(key)
      if (!model) {
        if (e.type === 'player') model = createPlayerModel()
        else if (e.type === 'npc') model = createNPCModel(e.name)
        else if (e.type === 'enemy') model = createEnemyModel(e.name)
        else if (e.type === 'item') { const m = createItemModel(e.itemType); model = new THREE.Group(); model.add(m) }
        else { model = createEnemyModel(e.name) }
        this.entityModelMap.set(key, model)
        this.scene.add(model)
      }
      const wx = e.x / 32, wz = e.y / 32
      model.position.set(wx, 0, wz)
      const bob = (e.type === 'player' || e.type === 'npc' || e.type === 'enemy') ? Math.sin(time * 0.003 * 3 + e.x * 0.1) * 0.1 : 0
      model.position.y += bob
      if (e.type === 'player') {
        model.rotation.y = 0
      } else if (e.type === 'enemy') {
        model.rotation.y = 0
      }

      const alive = e.hp !== undefined ? e.hp > 0 : true
      model.visible = alive
      if (e.type === 'player') model.visible = false
    }
    for (const [key, model] of this.entityModelMap) {
      if (!currentKeys.has(key)) {
        this.scene.remove(model)
        model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose()
            ;(child.material as THREE.Material).dispose()
          }
        })
        this.entityModelMap.delete(key)
      }
    }
  }

  private updateParticles3D(dt: number) {
    for (let i = this.particles3D.length - 1; i >= 0; i--) {
      const p = this.particles3D[i]
      p.mesh.position.x += p.vx * dt
      p.mesh.position.z += p.vz * dt
      p.mesh.position.y += p.vy * dt
      p.vy -= 2.5 * dt
      p.life -= dt
      if (p.life <= 0) {
        this.scene.remove(p.mesh)
        p.mesh.geometry.dispose()
        p.mesh.material.dispose()
        this.particles3D.splice(i, 1)
      } else {
        const alpha = Math.max(0, p.life / p.maxLife)
        p.mesh.material.opacity = alpha
        p.mesh.material.transparent = true
        const s = 0.5 + alpha * 0.5
        p.mesh.scale.setScalar(s)
      }
    }
  }

  private updateProjectiles(time: number) {
    for (const m of this.projectileMeshes) {
      this.scene.remove(m)
      m.geometry.dispose()
      m.material.dispose()
    }
    this.projectileMeshes = []
  }

  getCenterTarget(): Entity | null {
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.threeCamera)
    const meshToKey = new Map<THREE.Object3D, string>()
    const targets: THREE.Object3D[] = []
    for (const [key, model] of this.entityModelMap) {
      model.traverse(child => {
        if (child instanceof THREE.Mesh) {
          targets.push(child)
          meshToKey.set(child, key)
        }
      })
    }
    const intersects = raycaster.intersectObjects(targets)
    if (intersects.length > 0) {
      const hit = intersects[0].object
      const key = meshToKey.get(hit)
      if (key) {
        const idx = parseInt(key.split('_')[0])
        if (idx >= 0 && idx < this.entities.length) {
          return this.entities[idx]
        }
      }
    }
    return null
  }

  private drawCrosshair(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const cx = w / 2, cy = h / 2
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx - 10, cy); ctx.lineTo(cx - 4, cy)
    ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 10, cy)
    ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy - 4)
    ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 10)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, 2, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.stroke()
  }

  private drawHpBars(ctx: CanvasRenderingContext2D) {
    const cam = this.cameraState
    ctx.save()
    ctx.translate(this.canvas.width / 2 - cam.x, this.canvas.height / 2 - cam.y)
    for (const e of this.entities) {
      if (e.hp !== undefined && e.maxHp !== undefined && e.maxHp > 0 && e.hp > 0) {
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

  private drawDiceRoll(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const lastRoll = this.hud?.lastDiceRoll
    if (!lastRoll) return
    const x = w / 2, y = h / 2 + 60
    ctx.fillStyle = 'rgba(15,23,42,0.9)'
    this.roundRect(ctx, x - 80, y - 18, 160, 36, 8)
    const typeLabel = lastRoll.type === 'advantage' ? ' Adv' : lastRoll.type === 'disadvantage' ? ' Dis' : ''
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`d20${typeLabel}: ${lastRoll.rolls.join(' + ')} = ${lastRoll.total}`, x, y + 4)
  }

  private drawDamageTexts(ctx: CanvasRenderingContext2D) {
    const cam = this.cameraState, w = this.canvas.width, h = this.canvas.height
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

    bar(`Lv${hud.level}`, hud.hp, hud.maxHp, py + 8, '#34d399')
    bar('MP', hud.mana, hud.maxMana, py + 26, '#3b82f6')
    bar('XP', hud.xp, hud.xpToNext, py + 44, '#a855f7')
    ctx.fillStyle = '#fbbf24'
    ctx.font = '11px sans-serif'; ctx.textAlign = 'left'
    ctx.fillText(`${hud.gold} gold`, px + 10, py + 72)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '10px monospace'
    ctx.fillText(`FPS:${this.fps} En:${this.entities.length}`, px + 10, py + 90)

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
      ctx.fillText('Quests', qx + 10, qy + 14)
      for (let i = 0; i < hud.quests.length; i++) {
        const q = hud.quests[i]
        ctx.fillStyle = q.completed ? '#34d399' : '#e2e8f0'
        ctx.font = '10px sans-serif'
        ctx.fillText(q.objective, qx + 10, qy + 32 + i * 18)
      }
    }

    if (hud.showShop && hud.shopItems) {
      const sx = w / 2 - 150, sy = h / 2 - 80
      ctx.fillStyle = 'rgba(15,23,42,0.95)'
      this.roundRect(ctx, sx, sy, 300, 160, 12)
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2
      this.roundRect(ctx, sx, sy, 300, 160, 12)
      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('Shop', w / 2, sy + 24)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'
      ctx.fillText(`${hud.gold} gold`, w / 2, sy + 40)
      for (let i = 0; i < hud.shopItems.length; i++) {
        const item = hud.shopItems[i]
        const iy = sy + 56 + i * 30
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '12px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(`${i + 1}. ${item.name}`, sx + 16, iy)
        ctx.fillStyle = '#fbbf24'
        ctx.font = '11px sans-serif'; ctx.textAlign = 'right'
        ctx.fillText(`${item.price}`, sx + 284, iy)
        ctx.fillStyle = '#64748b'
        ctx.font = '9px sans-serif'; ctx.textAlign = 'left'
        ctx.fillText(item.description, sx + 16, iy + 14)
      }
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText('[1-3] Buy  [ESC] Exit', w / 2, sy + 148)
    }
  }

  private drawGameOver(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.75)'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ef4444'
    ctx.font = 'bold 56px sans-serif'; ctx.textAlign = 'center'
    ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 20
    ctx.fillText('GAME OVER', w / 2, h / 2 - 30)
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
    ctx.fillText('YOU WIN!', w / 2, h / 2 - 20)
    ctx.shadowBlur = 0
    ctx.fillStyle = '#e2e8f0'
    ctx.font = '18px sans-serif'
    ctx.fillText('Todas las quests completadas!', w / 2, h / 2 + 30)
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
    ctx.fillText('[WASD] Mov  [Space] Atk  [E] Int  [M] Mapa  [1-4]', x, y - 2)
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
