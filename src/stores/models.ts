import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as OBC from "@thatopen/components";

export const useModelsStore = defineStore('models', () => {
  // UI Components state
  const tree = ref<any>(null)
  const modelsList = ref<any>(null)
  
  // Components and models state
  const components = ref<OBC.Components | null>(null)
  const loadedModels = ref<any[]>([])
  const singleTree = ref<any>(null)
  const singleModelsList = ref<any>(null)
  
  // Computed property for fragments list size
  const fragmentsCount = computed(() => {
    if (components.value) {
      const fragments = components.value.get(OBC.FragmentsManager);
      return fragments ? fragments.list.size : 0;
    }
    return 0;
  })
  
  // Tree functions
  const setTree = (newTree: any) => {
    tree.value = newTree
  }
  
  const getTree = () => {
    return tree.value
  }
  
  const clearTree = () => {
    tree.value = null
  }
  
  // Single tree functions
  const setSingleTree = (newTree: any) => {
    singleTree.value = newTree
  }
  
  const getSingleTree = () => {
    return singleTree.value
  }
  
  const clearSingleTree = () => {
    singleTree.value = null
  }
  
  // Models list functions
  const setModelsList = (newModelsList: any) => {
    modelsList.value = newModelsList
  }
  
  const getModelsList = () => {
    return modelsList.value
  }
  
  const clearModelsList = () => {
    modelsList.value = null
  }
  
  // Single models list functions
  const setSingleModelsList = (newModelsList: any) => {
    singleModelsList.value = newModelsList
  }
  
  const getSingleModelsList = () => {
    return singleModelsList.value
  }
  
  const clearSingleModelsList = () => {
    singleModelsList.value = null
  }
  
  // Components functions
  const setComponents = (newComponents: OBC.Components) => {
    components.value = newComponents
  }
  
  const getComponents = () => {
    return components.value
  }
  
  const clearComponents = () => {
    components.value = null
  }
  
  // Loaded models functions
  const setLoadedModels = (newModels: any[]) => {
    loadedModels.value = newModels
  }
  
  const addLoadedModel = (model: any) => {
    loadedModels.value.push(model)
  }
  
  const clearLoadedModels = () => {
    loadedModels.value = []
  }
  
  return {
    // Tree functions
    tree,
    setTree,
    getTree,
    clearTree,
    
    // Single tree functions
    singleTree,
    setSingleTree,
    getSingleTree,
    clearSingleTree,
    
    // Models list functions
    modelsList,
    setModelsList,
    getModelsList,
    clearModelsList,
    
    // Single models list functions
    singleModelsList,
    setSingleModelsList,
    getSingleModelsList,
    clearSingleModelsList,
    
    // Components functions
    components,
    setComponents,
    getComponents,
    clearComponents,
    
    // Loaded models functions
    loadedModels,
    setLoadedModels,
    addLoadedModel,
    clearLoadedModels,
    
    // Computed properties
    fragmentsCount
  }
})