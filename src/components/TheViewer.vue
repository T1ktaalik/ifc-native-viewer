<template>
  <div class="ifc-to-frag-converter-container">
    <div
      ref="viewerContainerRef"
      class="viewer-wrapper"
    ></div>
    <Controls
      :is-loading="isLoading"
      :has-fragments="hasFragments"
      :on-file-selected="onFileSelected"
      :select-and-load-file-and-convert="selectAndLoadFileAndConvert"
      :reset-model="resetModel"
      ref="controlsRef"
    />
    <ModelNavigator
      class="model-navigator"
    />
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Controls from "./Controls.vue";
import ModelNavigator from "./ModelNavigator.vue";
import { useModelsStore } from "../stores/models";
import { useSceneManager } from "../composables/useSceneManager";
import * as OBC from "@thatopen/components";

const modelsStore = useModelsStore();
const viewerContainerRef = ref<HTMLElement | null>(null);
const controlsRef = ref<InstanceType<typeof Controls> | null>(null);
const selectedFile = ref<File | null>(null);

// Scene manager
let sceneManager: ReturnType<typeof useSceneManager> | null = null;
let components: OBC.Components | null = null;
let fragments: OBC.FragmentsManager | null = null;
let ifcLoader: OBC.IfcLoader | null = null;

const isLoading = ref(false);
const hasFragments = ref(false);

onMounted(async () => {
  if (!viewerContainerRef.value) {
    console.error('Viewer container not found!');
    return;
  }

  try {
    // Initialize scene manager
    sceneManager = useSceneManager({ container: viewerContainerRef.value });
    await sceneManager.initialize();
    
    // Get components
    components = sceneManager.getComponents();
    fragments = sceneManager.getFragments();
    ifcLoader = components.get(OBC.IfcLoader);
    
    // Set components in models store
    modelsStore.setComponents(components);
    
    // Setup IFC loader
    await ifcLoader.setup({
      autoSetWasm: false,
      wasm: {
        path: "https://unpkg.com/web-ifc@0.0.72/",
        absolute: true,
      }
    });
    
    // Initialize fragments with worker
    fragments.init("/resources/worker.mjs");
    
    // Add model loaded event handler
    fragments.list.onItemSet.add(({key, value: model}) => {
      console.log('Model added to fragments list with key:', key);
      const world = sceneManager?.getWorld();
      if (world) {
        model.useCamera(world.camera.three);
        world.scene.three.add(model.object);
        fragments?.core.update(true);
      }
      
      // Add model to models store
      modelsStore.addLoadedModel(model);
      
      // Update hasFragments state
      hasFragments.value = (fragments && fragments.list.size > 0) || false;
    });
  } catch (error) {
    console.error('Error initializing viewer:', error);
  }
});

onUnmounted(() => {
  if (sceneManager) {
    sceneManager.dispose();
  }
});

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] as File;
  } else {
    selectedFile.value = null;
  }
};

const selectAndLoadFileAndConvert = async () => {
  if (controlsRef.value?.fileInput) {
    // Set up a one-time event listener to handle the file selection and conversion
    const fileInput = controlsRef.value.fileInput;
    const handleFileSelection = async (event: Event) => {
      onFileSelected(event);
      // Remove the event listener to prevent multiple triggers
      fileInput?.removeEventListener('change', handleFileSelection);
      // Load the file immediately after selection
      await loadIfcFromFile();
    };
    
    // Add the event listener
    fileInput.addEventListener('change', handleFileSelection, { once: true });
    fileInput.click();
  }
};

const loadIfcFromFile = async () => {
  if (!ifcLoader || !selectedFile.value) return;
  
  isLoading.value = true;
  try {
    // Load IFC file
    const buffer = new Uint8Array(await selectedFile.value.arrayBuffer());
    const fileName = selectedFile.value.name.replace('.ifc', '');
    await ifcLoader.load(buffer, true, fileName);
  } catch (error) {
    console.error('Error loading IFC from file:', error);
  } finally {
    isLoading.value = false;
  }
};

const resetModel = async () => {
  // Clear all fragments
  if (fragments) {
    fragments.list.clear();
  }
  // Clear loaded models in store
  modelsStore.clearLoadedModels();
  hasFragments.value = false;
};
</script>

<style scoped>
.ifc-to-frag-converter-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.viewer-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #ffffff;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.controls .info {
  color: #6c757d;
  font-size: 12px;
}

.controls .download-btn {
  background-color: #28a745;
}

.load-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.load-url-btn {
  background-color: #6c757d;
}

.reset-btn {
  background-color: #dc3545;
}

/* Model navigator styles */
.model-navigator {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 350px;
  max-height: calc(100% - 20px);
  z-index: 100;
}
</style>