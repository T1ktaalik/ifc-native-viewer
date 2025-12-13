import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as OBC from '@thatopen/components'
import { useIfcLoader } from '../composables/useIfcLoader'


interface ModelTree {
  rawTree: any // The actual tree component from @thatopen/ui-obc
}

interface Model {
  id: string
  name: string
  tree: ModelTree | null
}

// Add a flag to track if we're currently resetting
let isResetting = false;

export const useModelsStore = defineStore('models', () => {
  const loadedModels = ref<Model[]>([])
  
  // Components state
  const components = ref<OBC.Components | null>(null)
  
  // Converter state variables
  const converter = ref<ReturnType<typeof useIfcLoader> | null>(null)
  const theConverterContainer = ref<HTMLElement | null>(null)
  const hasFragments = ref(false)
  const isLoading = ref(false)
  
  const addModel = (id: string, name: string) => {
    // Don't add models during reset
    if (isResetting) {
      console.log('Skipping model addition during reset:', id, name);
      return;
    }
    loadedModels.value.push({ id, name, tree: null })
    console.log('Model added to store:', id, name);
  }
  
  const addModelTree = (modelId: string, rawTree: any) => {
    // Don't add trees during reset
    if (isResetting) {
      console.log('Skipping tree addition during reset:', modelId);
      return;
    }
    
    const model = loadedModels.value.find(m => m.id === modelId)
    if (model) {
      model.tree = { rawTree }
      console.log('Tree added to store for model:', modelId, model.tree);
    } else {
      console.error('Model not found when trying to add tree:', modelId);
    }
  }
  
  const removeModel = (modelId: string) => {
    // Don't remove models during reset
    if (isResetting) {
      console.log('Skipping model removal during reset:', modelId);
      return;
    }
    
    const index = loadedModels.value.findIndex(model => model.id === modelId)
    if (index !== -1) {
      // Get the model before removing it
      const model = loadedModels.value[index];
      
      // Clean up the tree if it exists
      if (model && model.tree && model.tree.rawTree) {
        try {
          // Remove the tree from its parent container if it has one
          if (model.tree.rawTree.parentNode) {
            model.tree.rawTree.parentNode.removeChild(model.tree.rawTree);
          }
        } catch (e) {
          // Ignore errors when cleaning up the tree
        }
      }
      
      loadedModels.value.splice(index, 1)
    }
  }
  

  
  const getRawTreeForModel = (modelId: string) => {
    // Don't return trees during reset
    if (isResetting) {
      console.log('Skipping tree retrieval during reset:', modelId);
      return null;
    }
    
    const model = loadedModels.value.find(model => model.id === modelId)
    console.log('Getting raw tree for model:', modelId);
    console.log('Found model:', model);
    if (model && model.tree) {
      console.log('Returning raw tree:', model.tree.rawTree);
      return model.tree.rawTree;
    }
    console.log('No tree found for model:', modelId);
    // Log all models and their trees for debugging
    console.log('All models and their trees:', loadedModels.value.map(m => ({ id: m.id, hasTree: !!m.tree })));
    return null;
  }
  
  // Converter functions
  const initializeConverter = async (container: HTMLElement) => {
    theConverterContainer.value = container
    converter.value = useIfcLoader({
      container: container
    })
    
    await converter.value.initialize()
    
    // Set the components in the store
    setComponents(converter.value.getComponents())
  }
  
  const resetModel = async () => {
    if (!converter.value) {
      console.log('Converter not initialized')
      return
    }
    
    // Set the resetting flag to prevent other operations
    isResetting = true;
    
    try {
      console.log('Resetting model...')
      
      // Clear models first to prevent any UI updates during cleanup
      loadedModels.value = []
      
      // Clear components store
      clearComponents()
      
      // Dispose of the current converter
      converter.value.dispose()
      
      // Add a longer delay to ensure all cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Reset state
      hasFragments.value = false
      isLoading.value = false
      
      // Reinitialize the converter
      if (theConverterContainer.value) {
        converter.value = useIfcLoader({
          container: theConverterContainer.value
        })
        await converter.value.initialize()
        // Set the new components in the store
        setComponents(converter.value.getComponents())
      }
      
      console.log('Model reset completed')
    } catch (error) {
      console.error('Error resetting model:', error)
    } finally {
      // Always reset the flag
      isResetting = false;
    }
  }
  
  const downloadFragment = async () => {
    if (!converter.value) return
    await converter.value.downloadFragment()
  }
  
  const getHasFragments = () => {
    return converter.value ? converter.value.getHasFragments() : false
  }
  
  const getConverter = () => {
    return converter.value
  }
  
  const dispose = () => {
    if (converter.value) {
      converter.value.dispose()
    }
  }
  
  // Components functions
  const setComponents = (newComponents: OBC.Components) => {
    components.value = newComponents
  }
  
  const clearComponents = () => {
    components.value = null
  }
  
  return {
    loadedModels,
    addModel,
    addModelTree,
    removeModel,
   
    getRawTreeForModel,
    
    // Converter functions
    initializeConverter,
    resetModel,
    downloadFragment,
    getHasFragments,
    getConverter,
    dispose,
    
    // Components functions
    components,
    setComponents,
    clearComponents
  }
})