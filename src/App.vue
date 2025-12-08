<script setup lang="ts">
import Navigation from './components/Navigation.vue'
import { useSettingsStore } from './stores/settings'
import { computed } from 'vue'

const settingsStore = useSettingsStore()

const appClass = computed(() => ({
  'dark': settingsStore.isDarkMode,
  'bg-gray-900': settingsStore.isDarkMode,
  'bg-white': !settingsStore.isDarkMode,
  'text-white': settingsStore.isDarkMode,
  'text-gray-900': !settingsStore.isDarkMode
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
