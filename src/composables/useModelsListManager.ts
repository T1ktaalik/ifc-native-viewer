import { watch, nextTick } from 'vue';
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { useModelsStore } from '../stores/models';

/**
 * Configuration options for the models list manager
 */
export interface ModelsListManagerOptions {
  /** Reference to the models list wrapper element */
  modelsListWrapper: { value: HTMLElement | null };
}

/**
 * A composable function that provides models list management functionality.
 *
 * This function manages the creation and updating of models lists for loaded models.
 *
 * @param options - Configuration options for the models list manager
 * @param options.modelsListWrapper - Reference to the models list wrapper element
 *
 * @returns An object containing methods to control the models list management:
 * - createModelsList: Creates a models list for loaded models
 * - updateModelsListWrapper: Updates the models list wrapper with the models list
 * - checkAndCreateModelsList: Checks if models list creation conditions are met
 * - initializeModelsListCreation: Initializes models list creation
 * - cleanup: Cleans up watchers
 */
export function useModelsListManager(options: ModelsListManagerOptions) {
  const modelsStore = useModelsStore();
  
  const createModelsList = async () => {
    // Check if we already have a models list
    const existingModelsList = modelsStore.getSingleModelsList();
    if (existingModelsList) {
      // Update the models list wrapper with existing models list
      updateModelsListWrapper(existingModelsList);
      return;
    }
    
    if (!modelsStore.components) {
      return;
    }
    
    try {
      // Create models list
      if (!BUIC || !BUIC.tables || !BUIC.tables.modelsList) {
        return;
      }
      
      // Get the components manager
      const components: any = modelsStore.components;
      
      // Create the models list component with download action enabled
      const [modelsList] = BUIC.tables.modelsList({
        components,
        metaDataTags: ["schema"],
        actions: { download: true },
      });
      
      // Store in Pinia as single models list
      modelsStore.setSingleModelsList(modelsList);
      
      // Update the models list wrapper
      updateModelsListWrapper(modelsList);
    } catch (error) {
      console.error('Error creating models list:', error);
    }
  };
  
  // Function to update models list wrapper with the models list
  const updateModelsListWrapper = (modelsList: any) => {
    if (!options.modelsListWrapper.value) {
      return;
    }
    
    try {
      // Only append if not already in the correct parent
      if (modelsList.parentNode !== options.modelsListWrapper.value) {
        // Remove from existing parent if it has one
        if (modelsList.parentNode) {
          try {
            modelsList.parentNode.removeChild(modelsList);
          } catch (e) {
            // Ignore errors when removing from parent
          }
        }
        // Add models list directly to the wrapper
        options.modelsListWrapper.value.appendChild(modelsList);
      }
    } catch (error) {
      console.error('Error updating models list wrapper:', error);
    }
  };
  
  // Function to check if we should create models list
  const checkAndCreateModelsList = () => {
    if (modelsStore.loadedModels.length > 0 && modelsStore.components) {
      createModelsList();
    }
  };
  
  // Watch for changes in loaded models to display models lists
  const stopLoadedModelsWatch = watch(
    () => modelsStore.loadedModels,
    async (newModels) => {
      if (newModels.length > 0) {
        // Wait for next tick to ensure DOM is updated
        await nextTick();
        // Create or update models list
        createModelsList();
      }
    },
    { deep: true }
  );
  
  // Also watch for changes in the single models list
  const stopSingleModelsListWatch = watch(
    () => modelsStore.singleModelsList,
    (newModelsList) => {
      if (newModelsList && options.modelsListWrapper.value) {
        updateModelsListWrapper(newModelsList);
      }
    }
  );
  
  // Watch for changes in components
  const stopComponentsWatch = watch(
    () => modelsStore.components,
    (newComponents) => {
      if (newComponents && modelsStore.loadedModels.length > 0) {
        // If we have components and loaded models, create the models list
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          createModelsList();
        }, 100);
      }
    }
  );
  
  // Watch for both components and models to be ready
  const stopComponentsModelsWatch = watch(
    [() => modelsStore.components, () => modelsStore.loadedModels],
    ([components, models]) => {
      if (components && models.length > 0) {
        setTimeout(() => {
          createModelsList();
        }, 50);
      }
    }
  );
  
  // Watch for changes in fragments models
  const stopFragmentsWatch = watch(
    () => {
      if (modelsStore.components) {
        const fragments = modelsStore.components.get(OBC.FragmentsManager);
        return fragments ? fragments.list.size : 0;
      }
      return 0;
    },
    (newCount, oldCount) => {
      if (newCount > 0 && newCount !== oldCount) {
        setTimeout(() => {
          createModelsList();
        }, 100);
      }
    }
  );
  
  // Initialize models list creation on mount
  const initializeModelsListCreation = () => {
    // If there are already loaded models when component mounts, create models list
    if (modelsStore.loadedModels.length > 0) {
      nextTick(() => {
        createModelsList();
      });
    }
    
    // Also try to create models list after a delay to handle timing issues
    setTimeout(() => {
      checkAndCreateModelsList();
    }, 500);
    
    // And again after a longer delay
    setTimeout(() => {
      checkAndCreateModelsList();
    }, 1000);
  };
  
  // Cleanup function to stop all watchers
  const cleanup = () => {
    stopLoadedModelsWatch();
    stopSingleModelsListWatch();
    stopComponentsWatch();
    stopComponentsModelsWatch();
    stopFragmentsWatch();
  };
  
  return {
    createModelsList,
    updateModelsListWrapper,
    checkAndCreateModelsList,
    initializeModelsListCreation,
    cleanup
  };
}