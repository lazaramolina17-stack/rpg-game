import * as THREE from 'three'

export function createTileMesh(tileType: number, _seed: number): THREE.Mesh {
  const colorMap: Record<number, number> = {
    0: 0x4a8c3a, 1: 0x1e4a1a, 2: 0x2563eb, 3: 0x8a9aad, 4: 0xc4a265,
  }
  const color = colorMap[tileType] ?? 0x4a8c3a
  const geo = new THREE.BoxGeometry(1, 0.15, 1)
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.receiveShadow = true
  return mesh
}

export function createPlayerModel(): THREE.Group {
  const g = new THREE.Group()
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.6 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), bodyMat)
  body.position.y = 0.5
  body.castShadow = true
  g.add(body)
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), headMat)
  head.position.y = 0.95
  head.castShadow = true
  g.add(head)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.6 })
  const armGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.35, 6)
  const leftArm = new THREE.Mesh(armGeo, armMat)
  leftArm.position.set(-0.35, 0.7, 0)
  leftArm.rotation.z = 0.15
  g.add(leftArm)
  const rightArm = new THREE.Mesh(armGeo, armMat)
  rightArm.position.set(0.35, 0.7, 0)
  rightArm.rotation.z = -0.15
  g.add(rightArm)
  const handMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
  const handGeo = new THREE.SphereGeometry(0.07, 6, 6)
  const leftHand = new THREE.Mesh(handGeo, handMat)
  leftHand.position.set(-0.35, 0.5, 0)
  g.add(leftHand)
  const rightHand = new THREE.Mesh(handGeo, handMat)
  rightHand.position.set(0.35, 0.5, 0)
  g.add(rightHand)
  const swordMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5, roughness: 0.3 })
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.02), swordMat)
  sword.position.set(0.35, 0.7, 0)
  sword.rotation.z = -0.3
  g.add(sword)
  return g
}

export function createEnemyModel(name: string): THREE.Group {
  const g = new THREE.Group()
  const color = name.includes('Boss') ? 0xdc2626 : name.includes('Skeleton') ? 0xe2e8f0 : name.includes('Mage') ? 0x3b82f6 : name.includes('Goblin') ? 0x22c55e : 0x8B6914
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), bodyMat)
  body.position.y = 0.5
  body.castShadow = true
  g.add(body)
  const headMat = new THREE.MeshStandardMaterial({ color: name.includes('Skeleton') ? 0xf8fafc : 0xfca5a5, roughness: 0.5 })
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), headMat)
  head.position.y = 0.95
  head.castShadow = true
  g.add(head)
  const armMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.3, 5)
  const leftArm = new THREE.Mesh(armGeo, armMat)
  leftArm.position.set(-0.34, 0.65, 0)
  leftArm.rotation.z = 0.2
  g.add(leftArm)
  const rightArm = new THREE.Mesh(armGeo, armMat)
  rightArm.position.set(0.34, 0.65, 0)
  rightArm.rotation.z = -0.2
  g.add(rightArm)
  const handMat = new THREE.MeshStandardMaterial({ color: name.includes('Skeleton') ? 0xf8fafc : 0xfca5a5, roughness: 0.5 })
  const handGeo = new THREE.SphereGeometry(0.06, 4, 4)
  const leftHand = new THREE.Mesh(handGeo, handMat)
  leftHand.position.set(-0.34, 0.47, 0)
  g.add(leftHand)
  const rightHand = new THREE.Mesh(handGeo, handMat)
  rightHand.position.set(0.34, 0.47, 0)
  g.add(rightHand)
  return g
}

export function createNPCModel(name: string): THREE.Group {
  const g = new THREE.Group()
  const colorMap: Record<string, number> = {
    Merchant: 0x22c55e, Guard: 0x3b82f6, Elder: 0x6b7280, Blacksmith: 0xf97316, Farmer: 0x8B6914,
  }
  const color = colorMap[name] ?? 0x22c55e
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.3), bodyMat)
  body.position.y = 0.5
  body.castShadow = true
  g.add(body)
  const headMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), headMat)
  head.position.y = 0.95
  head.castShadow = true
  g.add(head)
  const armMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.7 })
  const armGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.3, 5)
  const leftArm = new THREE.Mesh(armGeo, armMat)
  leftArm.position.set(-0.34, 0.65, 0)
  leftArm.rotation.z = 0.2
  g.add(leftArm)
  const rightArm = new THREE.Mesh(armGeo, armMat)
  rightArm.position.set(0.34, 0.65, 0)
  rightArm.rotation.z = -0.2
  g.add(rightArm)
  const handMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 })
  const handGeo = new THREE.SphereGeometry(0.06, 4, 4)
  const leftHand = new THREE.Mesh(handGeo, handMat)
  leftHand.position.set(-0.34, 0.47, 0)
  g.add(leftHand)
  const rightHand = new THREE.Mesh(handGeo, handMat)
  rightHand.position.set(0.34, 0.47, 0)
  g.add(rightHand)
  return g
}

export function createItemModel(_itemType?: string): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.3 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), mat)
  mesh.castShadow = true
  return mesh
}

export function createProjectileModel(): THREE.Mesh {
  const mat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xf97316, emissiveIntensity: 0.5 })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mat)
  return mesh
}
