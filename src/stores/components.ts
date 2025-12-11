import { defineStore } from 'pinia'
import { ref } from 'vue'
import type * as OBC from "@thatopen/components"

export const useComponentsStore = defineStore('components', () => {
  const components = ref<OBC.Components | null>(null)
  
  const setComponents = (newComponents: OBC.Components) => {
    components.value = newComponents
  }
  
  const clearComponents = () => {
    components.value = null
  }
  
  return {
    components,
    setComponents,
    clearComponents
  }
})