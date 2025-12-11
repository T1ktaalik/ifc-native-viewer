import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { useIfcToFragmentConverter } from '../composables/useIfcToFragmentConverter'
import { useModelsStore } from './models'
import { useComponentsStore } from './components'

// Define the type for our converter
type IfcConverter = ReturnType<typeof useIfcToFragmentConverter> | null

interface ConverterStore {
  isLoading: Ref<boolean>
  hasFragments: Ref<boolean>
  converter: Ref<IfcConverter>
  theConverterContainer: Ref<HTMLElement | null>
  setIsLoading: (loading: boolean) => void
  setHasFragments: (has: boolean) => void
  setConverter: (newConverter: IfcConverter) => void
  setContainer: (container: HTMLElement | null) => void
  initializeConverter: (container: HTMLElement) => Promise<void>
  resetModel: () => Promise<void>
  downloadFragment: () => Promise<void>
}

export const useConverterStore = defineStore('converter', (): ConverterStore => {
  const isLoading = ref(false)
  const hasFragments = ref(false)
  const converter = ref<IfcConverter>(null)
  const theConverterContainer = ref<HTMLElement | null>(null)
  
  const setIsLoading = (loading: boolean) => {
    isLoading.value = loading
  }
  
  const setHasFragments = (has: boolean) => {
    hasFragments.value = has
  }
  
  const setConverter = (newConverter: IfcConverter) => {
    converter.value = newConverter
  }
  
  const setContainer = (container: HTMLElement | null) => {
    theConverterContainer.value = container
  }
  
  const initializeConverter = async (container: HTMLElement) => {
    // Dispose of existing converter if it exists
    if (converter.value) {
      converter.value.dispose()
    }
    
    // Create new converter
    converter.value = useIfcToFragmentConverter({
      container: container
    })
    
    // Set container reference
    theConverterContainer.value = container
    
    // Initialize the converter
    await converter.value.initialize()
    
    // Set components in store
    const componentsStore = useComponentsStore()
    componentsStore.setComponents(converter.value.getComponents())
  }
  
  const resetModel = async () => {
    if (!converter.value) return
    
    // Dispose of the current converter
    converter.value.dispose()
    
    // Reset state
    hasFragments.value = false
    isLoading.value = false
    
    // Reset models store
    const modelsStore = useModelsStore()
    modelsStore.resetModels()
    
    // Clear components store
    const componentsStore = useComponentsStore()
    componentsStore.clearComponents()
    
    // Reinitialize the converter
    if (theConverterContainer.value) {
      converter.value = useIfcToFragmentConverter({
        container: theConverterContainer.value
      })
      await converter.value.initialize()
      // Set the new components in the store
      componentsStore.setComponents(converter.value.getComponents())
    }
  }
  
  const downloadFragment = async () => {
    if (!converter.value) return
    await converter.value.downloadFragment()
  }
  
  return {
    isLoading,
    hasFragments,
    converter,
    theConverterContainer,
    setIsLoading,
    setHasFragments,
    setConverter,
    setContainer,
    initializeConverter,
    resetModel,
    downloadFragment
  }
})