<template>
  <div class="ifc-to-frag-converter-container">
    <div ref="theConverterContainer" class="viewer-container"></div>
    <div class="controls">
      <div class="load-controls">
        <input
          type="file"
          ref="fileInput"
          accept=".ifc"
          @change="onFileSelected"
          class="file-input"
          style="display: none"
        />
        <button
          @click="selectAndLoadFileAndConvert"
          :disabled="isLoading"
          class="load-btn"
        >
          {{ isLoading ? 'Conversion in progress...' : 'Add Model' }}
        </button>
      </div>
      <button
        v-if="hasFragments"
        @click="downloadFragment"
        class="download-btn"
      >
        Download Fragments
      </button>
      <button
        v-if="hasFragments"
        @click="resetModel"
        class="reset-btn"
      >
        Reset Model
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useIfcToFragmentConverter } from "../composables/useIfcToFragmentConverter";
import * as BUI from "@thatopen/ui";

const theConverterContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
let converter: ReturnType<typeof useIfcToFragmentConverter> | null = null;
const isLoading = ref(false);
const hasFragments = ref(false);
const selectedFile = ref<File | null>(null);

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0] as File;
  } else {
    selectedFile.value = null;
  }
};

const selectAndLoadFileAndConvert = async () => {
  if (fileInput.value) {
    // Set up a one-time event listener to handle the file selection and conversion
    const handleFileSelection = async (event: Event) => {
      onFileSelected(event);
      // Remove the event listener to prevent multiple triggers
      fileInput.value?.removeEventListener('change', handleFileSelection);
      // Load the file immediately after selection
      await loadIfcFromFile();
    };
    
    // Add the event listener
    fileInput.value.addEventListener('change', handleFileSelection, { once: true });
    fileInput.value.click();
  }
};

const loadIfcFromFile = async () => {
  if (!converter || !selectedFile.value) return;
  
  isLoading.value = true;
  try {
    await converter.loadIfc(selectedFile.value);
    hasFragments.value = converter.getHasFragments();
  } catch (error) {
    console.error('Error loading IFC from file:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadIfcFromUrl = async () => {
  if (!converter) return;
  
  isLoading.value = true;
  try {
    await converter.loadIfc();
    hasFragments.value = converter.getHasFragments();
  } catch (error) {
    console.error('Error loading IFC from URL:', error);
  } finally {
    isLoading.value = false;
  }
};

const downloadFragment = async () => {
  if (!converter) return;
  await converter.downloadFragment();
};

const resetModel = async () => {
  if (!converter) return;
  
  // Dispose of the current converter
  converter.dispose();
  
  // Reset state
  hasFragments.value = false;
  isLoading.value = false;
  
  // Reinitialize the converter
  if (theConverterContainer.value) {
    converter = useIfcToFragmentConverter({
      container: theConverterContainer.value
    });
    await converter.initialize();
  }
};

onMounted(async () => {
  if (!theConverterContainer.value) {
    console.error('Нет элемента-контейнера!');
    return;
  }

  converter = useIfcToFragmentConverter({
    container: theConverterContainer.value
  });

  // Add global error listener
  window.addEventListener('error', converter.handleWorkerError);

  await converter.initialize();
  hasFragments.value = converter.getHasFragments();
  
  // Initialize BUI Manager
  BUI.Manager.init();
});

// Clean up the event listener and dispose of resources
onUnmounted(() => {
  if (converter) {
    converter.dispose();
  }
});
</script>

<style scoped>
.ifc-to-frag-converter-container {
  width: 100%;
  height: 100%;
  position: relative;
}

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
</style>