import { watch, nextTick, type WatchStopHandle } from 'vue';
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
 * Spatial tree component type
 */
type SpatialTree = HTMLElement & {
  preserveStructureOnFilter: boolean;
};

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
  const watchers: WatchStopHandle[] = [];
  
  /**
   * Creates a spatial tree for loaded models
   * @returns Promise that resolves when tree is created
   */
  const createTree = async (): Promise<void> => {
    try {
      // Check if we already have a tree
      const existingTree = modelsStore.getSingleTree();
      if (existingTree) {
        // Update the tree wrapper with existing tree
        updateTreeWrapper(existingTree);
        return;
      }
      
      if (!modelsStore.getComponents()) {
        console.warn('Components not available for tree creation');
        return;
      }
      
      // Create spatial tree
      if (!BUIC?.tables?.spatialTree) {
        console.warn('Spatial tree functionality not available');
        return;
      }
      
      // Get the fragments manager from components
      const components = modelsStore.getComponents();
      if (!components) {
        console.warn('Components not available');
        return;
      }
      
      const fragments = components.get(OBC.FragmentsManager);
      // Get all loaded models from fragments
      const models = fragments ? Array.from(fragments.list.values()) : [];
      
      if (models.length === 0) {
        console.warn('No models available for tree creation');
        return;
      }
      
      const [tree] = BUIC.tables.spatialTree({
        components: components as any,
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
  
  /**
   * Updates the tree wrapper with the tree element
   * @param tree - The tree element to update
   */
  const updateTreeWrapper = (tree: SpatialTree): void => {
    if (!options.treeWrapper.value) {
      console.warn('Tree wrapper not available');
      return;
    }
    
    try {
      // Only append if not already in the correct parent
      if (tree.parentElement !== options.treeWrapper.value) {
        // Remove from existing parent if it has one
        if (tree.parentElement) {
          try {
            tree.parentElement.removeChild(tree);
          } catch (e) {
            // Ignore errors when removing from parent
            console.warn('Could not remove tree from existing parent:', e);
          }
        }
        // Add tree directly to the wrapper
        options.treeWrapper.value.appendChild(tree);
      }
    } catch (error) {
      console.error('Error updating tree wrapper:', error);
    }
  };
  
  /**
   * Checks if tree creation conditions are met and creates tree if so
   */
  const checkAndCreateTree = (): void => {
    const components = modelsStore.getComponents();
    const loadedModels = modelsStore.loadedModels;
    
    if (loadedModels.length > 0 && components) {
      createTree();
    }
  };
  
  /**
   * Initializes tree creation by setting up watchers
   */
  const initializeTreeCreation = (): void => {
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
    watchers.push(stopLoadedModelsWatch);
    
    // Watch for changes in the single tree
    const stopSingleTreeWatch = watch(
      () => modelsStore.singleTree,
      (newTree) => {
        if (newTree && options.treeWrapper.value) {
          updateTreeWrapper(newTree);
        }
      }
    );
    watchers.push(stopSingleTreeWatch);
    
    // Watch for changes in components
    const stopComponentsWatch = watch(
      () => modelsStore.components,
      (newComponents) => {
        if (newComponents && modelsStore.loadedModels.length > 0) {
          // If we have components and loaded models, create the tree
          setTimeout(() => {
            createTree();
          }, 100);
        }
      }
    );
    watchers.push(stopComponentsWatch);
    
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
    watchers.push(stopComponentsModelsWatch);
    
    // Watch for changes in fragments models
    const stopFragmentsWatch = watch(
      () => modelsStore.fragmentsCount,
      (newCount, oldCount) => {
        if (newCount > 0 && newCount !== oldCount) {
          setTimeout(() => {
            createTree();
          }, 100);
        }
      }
    );
    watchers.push(stopFragmentsWatch);
    
    // If there are already loaded models when component mounts, create tree
    if (modelsStore.loadedModels.length > 0) {
      nextTick(() => {
        createTree();
      });
    }
  };
  
  /**
   * Cleans up watchers
   */
  const cleanup = (): void => {
    watchers.forEach(stop => stop());
    watchers.length = 0;
  };
  
  return {
    createTree,
    updateTreeWrapper,
    checkAndCreateTree,
    initializeTreeCreation,
    cleanup
  };
}