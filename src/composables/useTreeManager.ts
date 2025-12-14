import { watch, nextTick } from 'vue';
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { useModelsStore } from '../stores/models';

/**
 * Configuration options for the tree manager
 */
export interface TreeManagerOptions {
  /** Reference to the tree wrapper element */
  treeWrapper: { value: HTMLElement | null };
}

/**
 * A composable function that provides tree management functionality.
 *
 * This function manages the creation and updating of spatial trees for loaded models.
 *
 * @param options - Configuration options for the tree manager
 * @param options.treeWrapper - Reference to the tree wrapper element
 *
 * @returns An object containing methods to control the tree management:
 * - createTree: Creates a spatial tree for loaded models
 * - updateTreeWrapper: Updates the tree wrapper with the tree
 * - checkAndCreateTree: Checks if tree creation conditions are met
 * - initializeTreeCreation: Initializes tree creation
 * - cleanup: Cleans up watchers
 */
export function useTreeManager(options: TreeManagerOptions) {
  const modelsStore = useModelsStore();
  
  const createTree = async () => {
    // Check if we already have a tree
    const existingTree = modelsStore.getSingleTree();
    if (existingTree) {
      // Update the tree wrapper with existing tree
      updateTreeWrapper(existingTree);
      return;
    }
    
    if (!modelsStore.components) {
      return;
    }
    
    try {
      // Create spatial tree
      if (!BUIC || !BUIC.tables || !BUIC.tables.spatialTree) {
        return;
      }
      
      // Get the fragments manager from components
      const fragments = modelsStore.components?.get(OBC.FragmentsManager);
      // Get all loaded models from fragments
      const models = fragments ? Array.from(fragments.list.values()) : [];
      
      const [tree] = BUIC.tables.spatialTree({
        components: modelsStore.components as any,
        models: models
      });
      
      tree.preserveStructureOnFilter = true;
     
      // Store in Pinia as single tree
      modelsStore.setSingleTree(tree);
      
      // Update the tree wrapper
      updateTreeWrapper(tree);
    } catch (error) {
      console.error('Error creating tree:', error);
    }
  };
  
  // Function to update tree wrapper with the tree
  const updateTreeWrapper = (tree: any) => {
    if (!options.treeWrapper.value) {
      return;
    }
    
    try {
      // Only append if not already in the correct parent
      if (tree.parentNode !== options.treeWrapper.value) {
        // Remove from existing parent if it has one
        if (tree.parentNode) {
          try {
            tree.parentNode.removeChild(tree);
          } catch (e) {
            // Ignore errors when removing from parent
          }
        }
        // Add tree directly to the wrapper
        options.treeWrapper.value.appendChild(tree);
      }
    } catch (error) {
      console.error('Error updating tree wrapper:', error);
    }
  };
  
  // Function to check if we should create tree
  const checkAndCreateTree = () => {
    if (modelsStore.loadedModels.length > 0 && modelsStore.components) {
      createTree();
    }
  };
  
  // Watch for changes in loaded models to display trees
  const stopLoadedModelsWatch = watch(
    () => modelsStore.loadedModels,
    async (newModels) => {
      if (newModels.length > 0) {
        // Wait for next tick to ensure DOM is updated
        await nextTick();
        // Create or update tree
        createTree();
      }
    },
    { deep: true }
  );
  
  // Also watch for changes in the single tree
  const stopSingleTreeWatch = watch(
    () => modelsStore.singleTree,
    (newTree) => {
      if (newTree && options.treeWrapper.value) {
        updateTreeWrapper(newTree);
      }
    }
  );
  
  // Watch for changes in components
  const stopComponentsWatch = watch(
    () => modelsStore.components,
    (newComponents) => {
      if (newComponents && modelsStore.loadedModels.length > 0) {
        // If we have components and loaded models, create the tree
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          createTree();
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
          createTree();
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
          createTree();
        }, 100);
      }
    }
  );
  
  // Initialize tree creation on mount
  const initializeTreeCreation = () => {
    // If there are already loaded models when component mounts, create tree
    if (modelsStore.loadedModels.length > 0) {
      nextTick(() => {
        createTree();
      });
    }
    
    // Also try to create tree after a delay to handle timing issues
    setTimeout(() => {
      checkAndCreateTree();
    }, 500);
    
    // And again after a longer delay
    setTimeout(() => {
      checkAndCreateTree();
    }, 1000);
  };
  
  // Cleanup function to stop all watchers
  const cleanup = () => {
    stopLoadedModelsWatch();
    stopSingleTreeWatch();
    stopComponentsWatch();
    stopComponentsModelsWatch();
    stopFragmentsWatch();
  };
  
  return {
    createTree,
    updateTreeWrapper,
    checkAndCreateTree,
    initializeTreeCreation,
    cleanup
  };
}