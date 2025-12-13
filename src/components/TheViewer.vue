<template>
  <div class="ifc-to-frag-converter-container">
    <ViewerContainer 
      ref="viewerContainerRef"
      class="viewer-wrapper"
    />
    <Controls
      :is-loading="isLoading"
      :has-fragments="hasFragments"
      :on-file-selected="onFileSelected"
      :select-and-load-file-and-convert="selectAndLoadFileAndConvert"
      :download-fragment="downloadFragment"
      :reset-model="resetModel"
      ref="controlsRef"
    />
    <ModelList
      class="model-list-sidebar"
    />
    <ModelTree
      class="tree-container"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ViewerContainer from "./ViewerContainer.vue";
import ModelList from "./ModelList.vue";
import Controls from "./Controls.vue";
import ModelTree from "./ModelTree.vue";
import { useModelsStore } from "../stores/models";

const modelsStore = useModelsStore();
const viewerContainerRef = ref<InstanceType<typeof ViewerContainer> | null>(null);
const controlsRef = ref<InstanceType<typeof Controls> | null>(null);
const selectedFile = ref<File | null>(null);

const isLoading = ref(false);
const hasFragments = ref(false);

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
  if (!viewerContainerRef.value || !selectedFile.value) return;
  
  isLoading.value = true;
  try {
    const converter = viewerContainerRef.value.getConverter();
    if (converter) {
      await converter.loadIfc(selectedFile.value);
      hasFragments.value = converter.getHasFragments();
    }
  } catch (error) {
    console.error('Error loading IFC from file:', error);
  } finally {
    isLoading.value = false;
  }
};



const downloadFragment = async () => {
  if (!viewerContainerRef.value) return;
  
  const converter = viewerContainerRef.value.getConverter();
  if (converter) {
    await converter.downloadFragment();
  }
};

const resetModel = async () => {
  // Use the models store's resetModel function
  await modelsStore.resetModel();
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

/* Model list sidebar styles */
.model-list-sidebar {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 250px;
  max-height: calc(100% - 20px);
  z-index: 100;
}

/* Tree container styles */
.tree-container {
  position: absolute;
  top: 10px;
  right: 270px; /* Position next to model list */
  width: 300px;
  max-height: calc(100% - 20px);
  z-index: 100;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}
</style>