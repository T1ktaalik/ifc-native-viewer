<template>
  <nav class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div class="text-xl font-bold">IFC Native Viewer</div>
    <button
      @click="settingsStore.toggleDarkMode()"
      class="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
    >
      {{ settingsStore.isDarkMode ? 'Light Mode' : 'Dark Mode' }}
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
</script>

<style scoped>
nav {
  min-height: 50px;
}

.router-link-active {
  background-color: #4B5563;
}
</style>