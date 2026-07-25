import * as THREE from 'three'

export function initScene(canvas: HTMLCanvasElement): {
  scene: THREE.Scene
  camera: THREE.OrthographicCamera
  renderer: THREE.WebGLRenderer
  ambientLight: THREE.AmbientLight
  directionalLight: THREE.DirectionalLight
  ground: THREE.Mesh
} {
  const scene = new THREE.Scene()

  const camera = new THREE.OrthographicCamera(
    -30 / 2, 30 / 2, 30 / 2, -30 / 2, 0.1, 100
  )
  camera.position.set(0, 20, 0)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor(0x0f172a)

  const ambientLight = new THREE.AmbientLight(0x404060, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffeedd, 1)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.left = -50
  directionalLight.shadow.camera.right = 50
  directionalLight.shadow.camera.top = 50
  directionalLight.shadow.camera.bottom = -50
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 50
  scene.add(directionalLight)

  const groundGeometry = new THREE.PlaneGeometry(100, 100)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x5a7a5a,
    roughness: 0.8,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  function handleResize(): void {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const aspect = width / height
    const frustumSize = 30
    camera.left = (-frustumSize * aspect) / 2
    camera.right = (frustumSize * aspect) / 2
    camera.top = frustumSize / 2
    camera.bottom = -frustumSize / 2
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  return {
    scene,
    camera,
    renderer,
    ambientLight,
    directionalLight,
    ground,
  }
}

export function updateCamera(
  camera: THREE.OrthographicCamera,
  width: number,
  height: number
): void {
  const aspect = width / height
  const frustumSize = 30
  camera.left = (-frustumSize * aspect) / 2
  camera.right = (frustumSize * aspect) / 2
  camera.top = frustumSize / 2
  camera.bottom = -frustumSize / 2
  camera.updateProjectionMatrix()
}
