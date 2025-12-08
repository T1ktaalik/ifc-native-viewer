import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

interface Model {
  id: string
  name: string
}

export const useModelsStore = defineStore('models', () => {
  const loadedModels = ref<Model[]>([])
  const activeModelId = ref<string | null>(null)

  const addModel = (id: string, name: string) => {
    loadedModels.value.push({ id, name })
    if (loadedModels.value.length === 1) {
      activeModelId.value = id
    }
  }

  const setActiveModel = (modelId: string) => {
    activeModelId.value = modelId
  }

  const removeModel = (modelId: string) => {
    const index = loadedModels.value.findIndex(model => model.id === modelId)
    if (index !== -1) {
      loadedModels.value.splice(index, 1)
      if (activeModelId.value === modelId) {
        activeModelId.value = loadedModels.value.length > 0 ? loadedModels.value[0]?.id ?? null : null
      }
    }
  }

  const resetModels = () => {
    loadedModels.value = []
    activeModelId.value = null
  }

  return {
    loadedModels,
    activeModelId,
    addModel,
    setActiveModel,
    removeModel,
    resetModels
  }
})