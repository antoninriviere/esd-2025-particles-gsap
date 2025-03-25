import * as THREE from 'three'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2)
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


// Particles
const particlesCount = 5000
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i += 3) {
  // position x
  positions[i] = (Math.random() - 0.5) * 5
  // position y
  positions[i + 1] = (Math.random() - 0.5) * 5
  // position z
  positions[i + 2] = (Math.random() - 0.5) * 5
}

function getRandomPointOnSphere(radius) {
    var vector = new THREE.Vector3()
    var phi = Math.random() * 2 * Math.PI
    var theta = Math.random() * Math.PI

    vector.x = radius * Math.sin(theta) * Math.cos(phi)
    vector.y = radius * Math.sin(theta) * Math.sin(phi)
    vector.z = radius * Math.cos(theta)

    return vector
}

const spherePositions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount * 3; i += 3) {
  const randomPoint = getRandomPointOnSphere(1)
  spherePositions[i] = randomPoint.x
  spherePositions[i + 1] = randomPoint.y
  spherePositions[i + 2] = randomPoint.z
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.01,
  color: '#1113DB',
  sizeAttenuation: true,
  transparent: true,
  depthWrite: true
})

const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/3.png')
particlesMaterial.map = particleTexture
particlesMaterial.alphaMap = particleTexture

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// Animation
const particlesInfos = []
for (let i = 0; i < particlesCount; i++) {
  const particleIndex = i * 3
  const particle = {
    randomPos: {
      x: positions[particleIndex],
      y: positions[particleIndex + 1],
      z: positions[particleIndex + 2]
    },
    currentPos: {
      x: positions[particleIndex],
      y: positions[particleIndex + 1],
      z: positions[particleIndex + 2]
    },
    spherePos: {
      x: spherePositions[particleIndex],
      y: spherePositions[particleIndex + 1],
      z: spherePositions[particleIndex + 2],
    }
  }
  particlesInfos.push(particle)
}

const timeline = gsap.timeline({
  onUpdate: () => {
    for (let i = 0; i < particlesInfos.length; i++) {
      const particleIndex = i * 3
      particlesGeometry.attributes.position.array[particleIndex] = particlesInfos[i].currentPos.x
      particlesGeometry.attributes.position.array[particleIndex + 1] = particlesInfos[i].currentPos.y
      particlesGeometry.attributes.position.array[particleIndex + 2] = particlesInfos[i].currentPos.z
    }
  }
})

for (let i = 0; i < particlesInfos.length; i++) {
  const particleIndex = i * 3
  timeline.to(particlesInfos[i].currentPos, {
    x: particlesInfos[i].spherePos.x,
    y: particlesInfos[i].spherePos.y,
    z: particlesInfos[i].spherePos.z,
    duration: 1,
    ease: 'power3.out'
  }, 0)
}

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)
renderer.setClearColor(0xffffff)
renderer.render(scene, camera)

// Events

// Resize
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)
})

// Animation
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    particles.rotation.y += 0.01
    particlesGeometry.attributes.position.needsUpdate = true

    // Update controls
    controls.update()

    // Render normal scene
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


// SCROLL
timeline.pause()
// On calcule la height scrollable : maxHeight = la hauteur (clientHeight) de scroll-container moins la hauteur de la window
// on ajoute un event listener sur le scroll, et on récup la valeur const scroll = window.scrollY
// on calcule un progress progress = scroll / maxHeight
// on modifie le progress de la timeline avec timeline.progress(progress)
/**
 * Scroll
 */
let maxHeight = document.querySelector('.scroll-container').clientHeight - window.innerHeight
window.addEventListener('scroll', (event) => {
    const scroll = window.scrollY
    const progress = scroll / maxHeight
    timeline.progress(progress)
})