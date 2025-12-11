import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface ModelTree {
  rawTree: any // The actual tree component from @thatopen/ui-obc
}

interface Model {
  id: string
  name: string
  tree: ModelTree | null
}

export const useModelsStore = defineStore('models', () => {
  const loadedModels = ref<Model[]>([])
  const activeModelId = ref<string | null>(null)
  
  // Computed property to get the active model
  const activeModel = computed(() => {
    if (!activeModelId.value) return null
    return loadedModels.value.find(model => model.id === activeModelId.value)
  })
  
  // Computed property to get the active tree
  const activeTree = computed(() => {
    if (!activeModelId.value) return null
    const model = loadedModels.value.find(model => model.id === activeModelId.value)
    return model ? model.tree : null
  })

  const addModel = (id: string, name: string) => {
      loadedModels.value.push({ id, name, tree: null })
      console.log('Model added to store:', id, name);
      if (loadedModels.value.length === 1) {
        activeModelId.value = id
      }
    }
  
  const addModelTree = (modelId: string, rawTree: any) => {
    const model = loadedModels.value.find(m => m.id === modelId)
    if (model) {
      model.tree = { rawTree }
      console.log('Tree added to store for model:', modelId);
      
      // If this is the first tree or no active tree is set, set this as active
      if (!activeModelId.value) {
        activeModelId.value = modelId
      }
    }
  }

  const setActiveModel = (modelId: string) => {
    console.log('Setting active model:', modelId);
    activeModelId.value = modelId
  }
  
  const setActiveTree = (modelId: string) => {
    // Check if we have a model with this ID
    const modelExists = loadedModels.value.some(model => model.id === modelId)
    if (modelExists) {
      console.log('Setting active tree:', modelId);
      activeModelId.value = modelId
    }
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
  
  const getRawTreeForModel = (modelId: string) => {
    const model = loadedModels.value.find(model => model.id === modelId)
    return model && model.tree ? model.tree.rawTree : null
  }

  return {
    loadedModels,
    activeModelId,
    activeModel, // Expose the computed property
    activeTree, // Expose the active tree
    addModel,
    addModelTree,
    setActiveModel,
    setActiveTree,
    removeModel,
    resetModels,
    getRawTreeForModel
  }
})