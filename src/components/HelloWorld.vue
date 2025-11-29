<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from "three"
import * as OBC from "@thatopen/components"

// Reactive refs for the viewer components
const containerRef = ref<HTMLElement | null>(null)
const components = ref<OBC.Components | null>(null)
const world = ref<OBC.World | null>(null)
const cube = ref<THREE.Mesh | null>(null)

// Initialize the 3D viewer
const initViewer = () => {
  if (!containerRef.value) return

  // Create the main components manager
  const comps = new OBC.Components()
  components.value = comps

  // Get the worlds manager
  const worlds = comps.get(OBC.Worlds)

  // Create a new world with specific components
  const newWorld = worlds.create<
    OBC.SimpleScene,
    OBC.SimpleCamera,
    OBC.SimpleRenderer
  >()

  world.value = newWorld

  // Initialize the world components
  newWorld.scene = new OBC.SimpleScene(comps)
  newWorld.renderer = new OBC.SimpleRenderer(comps, containerRef.value)
  newWorld.camera = new OBC.SimpleCamera(comps)

  // Initialize the components system
  comps.init()

  // Create a simple Three.js object
  const material = new THREE.MeshLambertMaterial({ color: "#6528D7" })
  const geometry = new THREE.BoxGeometry()
  const newCube = new THREE.Mesh(geometry, material)
  cube.value = newCube
  newWorld.scene.three.add(newCube)

  // Setup the scene
  newWorld.scene.setup()

  // Position the camera
  newWorld.camera.controls.setLookAt(3, 3, 3, 0, 0, 0)
}

// Rotate the cube (reactive animation)
const rotateCube = () => {
  if (cube.value) {
    cube.value.rotation.x += 0.01
    cube.value.rotation.y += 0.01
  }
}

// Animation frame for reactive updates
let animationFrameId: number
const animate = () => {
  rotateCube()
  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  initViewer()
  animate()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  // Clean up components
  if (components.value) {
    components.value.dispose()
  }
})
</script>

<template>
<div>
  <div ref="containerRef" style="width: 100%; height: 400px;"></div>
  <div class="controls">
    <p>3D Viewer with OBC and Vue Reactivity</p>
  </div>
</div>
</template>

<style scoped>
.controls {
  padding: 1rem;
  text-align: center;
}
</style>
