<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <header class="bg-gray-800 text-white p-4 text-center flex-shrink-0">
      <h1 class="text-xl font-bold">IFC Native Viewer</h1>
    </header>
    <div ref="containerRef" class="flex-1 w-full h-full bg-gray-200"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import * as THREE from "three"
import Stats from "stats.js"
import * as BUI from '@thatopen/ui'
import * as OBC from '@thatopen/components'

const containerRef = ref<HTMLElement | null>(null)

console.log("TheFirstComponent");

// Global error handler for worker errors
const handleWorkerError = (event: ErrorEvent) => {
  console.error("Worker error caught:", event)
  if (event.message && event.message.includes("incorrect header check")) {
    console.error("This is the 'incorrect header check' error we're trying to fix")
  }
}

// Add global error listener
onMounted(() => {
  window.addEventListener('error', handleWorkerError)
})

// Clean up the event listener
onUnmounted(() => {
  window.removeEventListener('error', handleWorkerError)
})

onMounted(async () => {
  if (!containerRef.value) {
    console.error("Container reference is null");
    return;
  }

  console.log("TheFirstComponent mounted");
  const components = new OBC.Components()
  const worlds = components.get(OBC.Worlds)
  const world = worlds.create<OBC.SimpleScene, OBC.SimpleCamera, OBC.SimpleRenderer>()
  world.scene = new OBC.SimpleScene(components)
  world.renderer = new OBC.SimpleRenderer(components, containerRef.value)
  world.camera = new OBC.SimpleCamera(components)

  //adding the grig
  //grid below
  const grids = components.get(OBC.Grids)

  const grid = grids.create(world)
  // grid above

  // getting storeys
  //const storeys = await model!.getItemsOfCategories([/BUILDINGSTOREY/])


  components.init()

  world.scene.setup()
  world.scene.three.background = new THREE.Color('#f4f4f4')
 // world.scene.three.background = null

  const workerUrl = "/resources/worker.mjs"

  const fragments = components.get(OBC.FragmentsManager)

  try {
    fragments.init(workerUrl)
  } catch (error) {
    console.error("Error initializing fragments with worker:", workerUrl, error)
  }

  world.camera.controls.addEventListener('rest', () => {
   
    fragments.core.update(true)
  })

  world.onCameraChanged.add((camera) => {
     for (const  [, model] of fragments.list) {
      model.useCamera(camera.three)
    }
    fragments.core.update(true)
  })

  fragments.list.onItemSet.add(({value: model}) => {
    model.useCamera(world.camera.three)
    world.scene.three.add(model.object)
    fragments.core.update(true)
  })

  // Add fragment loading code here
  const fragPath = [
    "/resources/frags/small_test.frag"
  ]
  
  await Promise.all(
    fragPath.map(async (path) => {
      try {
        const modelId = path.split("/").pop()?.split(".").shift()
        if(!modelId) {
          console.error("Invalid model ID for path:", path)
          return null
        }
        console.log("Loading fragment:", path)
        const file = await fetch(path)
        if (!file.ok) {
          console.error("Failed to fetch fragment:", path, file.status, file.statusText)
          return null
        }
        const buffer = await file.arrayBuffer()
        console.log("Fragment loaded, buffer size:", buffer.byteLength)
        try {
          return fragments.core.load(buffer, { modelId})
        } catch (loadError) {
          console.error("Error loading fragment data:", path, loadError)
          return null
        }
      } catch (error) {
        console.error("Error loading fragment:", path, error)
        return null
      }
    })
  )
})
</script>
