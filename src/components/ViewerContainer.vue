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
import * as OBC from "@thatopen/components";
import { useModelsStore } from "../stores/models";

const modelsStore = useModelsStore();

const viewerContainer = ref<HTMLElement | null>(null);
let modelLoadedListener: any = null;

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
      console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');
      console.log('Creating tree for loaded model:', 'model uuid:', model.uuid, model.name);
      // Add a small delay to ensure components are properly set
      setTimeout(() => {
        // Make sure components are available and model still exists
        if (modelsStore.components) {
          // Tree creation is now handled by ModelTree.vue component
          console.log('Model loaded, tree creation will be handled by ModelTree.vue');
        } else {
          console.warn('Components not available for tree creation');
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