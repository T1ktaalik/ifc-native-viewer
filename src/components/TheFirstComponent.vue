<template>
  <div class="container">
    <header class="header">
      <h1>IFC Native Viewer</h1>
    </header>
    <div ref="containerRef" class="viewer-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import * as THREE from "three"
import Stats from "stats.js"
import * as BUI from '@thatopen/ui'
import * as OBC from '@thatopen/components'

const containerRef = ref<HTMLElement | null>(null)

console.log("TheFirstComponent");
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
  flex-shrink: 0;
}

.viewer-container {
  flex: 1;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}
</style>
