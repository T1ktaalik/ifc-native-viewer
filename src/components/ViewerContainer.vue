<template>
  <div
    ref="viewerContainer"
    class="viewer-container"
    style="background-color: #ffffff"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { useModelsStore } from "../stores/models";

const modelsStore = useModelsStore();

const viewerContainer = ref<HTMLElement | null>(null);
let modelLoadedListener: any = null;

const createTreeForModel = async (modelName: string) => {
  // Check if the model still exists in the store
  const modelExists = modelsStore.loadedModels.some(model => model.name === modelName);
  if (!modelExists) {
    console.log('Model no longer exists, skipping tree creation:', modelName);
    return;
  }
  
  if (!modelsStore.components) {
    console.warn('Components not available for tree creation');
    return;
  }
  
  // Check if we already have a tree for this model
  const existingTree = modelsStore.getRawTreeForModel(modelName);
  if (existingTree) {
    console.log('Tree already exists for model:', modelName);
    return; // Tree already exists
  }
  
  // Check if components are available
  if (!modelsStore.components) {
    console.error('Components are null when trying to create tree');
    return;
  }
  
  // Get the fragments manager to access loaded models
  const fragments = modelsStore.components.get(OBC.FragmentsManager);
  
  // Get the actual model object from fragments
  const fragmentModel = fragments.list.get(modelName);
  if (!fragmentModel) {
    console.error('Model not found in fragments list:', modelName);
    return;
  }
  
  console.log('Model found for tree creation:', modelName, fragmentModel);
  
  try {
    console.log('Creating tree for model:', modelName);
    // Create spatial tree for this specific model
    // Ensure all required objects are available before creating tree
    if (!BUIC || !BUIC.tables || !BUIC.tables.spatialTree) {
      console.error('BUIC tables or spatialTree function not available');
      return;
    }
    const [tree] = BUIC.tables.spatialTree({
      components: modelsStore.components as any,
      //models: [fragmentModel] // Pass the actual model object
      models: [] // Follow the instruction
    });
    tree.preserveStructureOnFilter = true;
   
    
    // Double-check that the model still exists before storing the tree
    const modelStillExists = modelsStore.loadedModels.some(model => model.name === modelName);
    if (!modelStillExists) {
      console.log('Model no longer exists, discarding tree:', modelName);
      return;
    }
    
    console.log('Tree created for model:', modelName, tree);
    // Store in Pinia
    modelsStore.addModelTree(modelName, tree);
    console.log('Tree created and stored for model:', modelName);
    
    // Verify that the tree was stored correctly
    const storedTree = modelsStore.getRawTreeForModel(modelName);
    console.log('Stored tree verification:', storedTree);
  } catch (error) {
    console.error('Error creating tree for model:', modelName, error);
  }
};

const addModelToList = (name: string) => {
  modelsStore.addModel(name);
};

onMounted(async () => {
  // Add a small delay to ensure the DOM element is properly mounted
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (!viewerContainer.value) {
    console.error('Нет элемента-контейнера!');
    return;
  }

  try {
    await modelsStore.initializeConverter(viewerContainer.value);

    // Add global error listener
    const converter1 = modelsStore.getConverter();
    if (converter1) {
      window.addEventListener('error', converter1.handleWorkerError);
    }

    // Get the components instance for the tree
    const converter2 = modelsStore.getConverter();
    if (converter2) {
      modelsStore.setComponents(converter2.getComponents());
    }

    // Listen for model loaded events
    modelLoadedListener = (event: any) => {
      const { model } = event.detail;
      addModelToList(model.name);
      // Create tree for the loaded model
      console.log('Creating tree for loaded model:', model.uuid, model.name);
      // Add a small delay to ensure components are properly set
      setTimeout(() => {
        // Make sure components are available and model still exists
        if (modelsStore.components) {
          createTreeForModel(model.name);
        } else {
          console.warn('Components not available for tree creation, retrying in 100ms');
          // Retry after a short delay to allow components to be set
          setTimeout(() => {
            // Check again if model still exists before creating tree
            const modelStillExists = modelsStore.loadedModels.some(m => m.name === model.name);
            if (modelStillExists && modelsStore.components) {
              createTreeForModel(model.name);
            } else if (!modelStillExists) {
              console.log('Model no longer exists, skipping tree creation:', model.name);
            } else {
              console.error('Components still not available for tree creation after delay');
            }
          }, 100);
        }
      }, 50);
    };
    const converter3 = modelsStore.getConverter();
    if (converter3) {
      converter3.modelLoadedEvent.addEventListener('modelLoaded', modelLoadedListener);
    }
    
    // Initialize BUI Manager
    BUI.Manager.init();
  } catch (error) {
    console.error('Error initializing viewer container:', error);
  }
});

// Clean up the event listener and dispose of resources
onUnmounted(() => {
  const converter = modelsStore.getConverter();
  if (converter && modelLoadedListener) {
    converter.modelLoadedEvent.removeEventListener('modelLoaded', modelLoadedListener);
  }
  
  // Clear all models from the store
  // This ensures that any UI components that depend on the models
  // are updated before the component is destroyed
  const models = [...modelsStore.loadedModels];
  models.forEach(model => {
    // Remove each model to trigger UI updates
    modelsStore.removeModel(model.name);
  });
  
  modelsStore.clearComponents();
});

// Expose converter methods for parent components
defineExpose({
  getConverter: () => modelsStore.getConverter(),
  getHasFragments: () => {
    const converter = modelsStore.getConverter();
    return converter ? converter.getHasFragments() : false;
  }
});
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.viewer-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}
</style>