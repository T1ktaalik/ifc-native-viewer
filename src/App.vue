<script setup lang="ts">
import Navigation from './components/Navigation.vue'

import { computed } from 'vue'



const appClass = computed(() => ({
  'bg-white': true,
  'text-gray-900': true
}))
</script>

<template>
  <div class="flex flex-col h-screen" :class="appClass">
    <Navigation />
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.router-view {
  height: 100%;
}
</style>
