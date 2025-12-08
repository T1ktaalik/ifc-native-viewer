import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const isDarkMode = ref(false)
  const viewerSettings = ref({
    showGrid: true,
    showAxes: true,
    backgroundColor: '#ffffff'
  })

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  const updateViewerSettings = (settings: Partial<typeof viewerSettings.value>) => {
    viewerSettings.value = { ...viewerSettings.value, ...settings }
  }

  return {
    isDarkMode,
    viewerSettings,
    toggleDarkMode,
    updateViewerSettings
  }
})