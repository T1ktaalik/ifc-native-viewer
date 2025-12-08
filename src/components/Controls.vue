<template>
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isLoading: boolean
  hasFragments: boolean
  onFileSelected: (event: Event) => void
  selectAndLoadFileAndConvert: () => void
  downloadFragment: () => void
  resetModel: () => void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

defineExpose({
  fileInput
})
</script>

<style scoped>
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

.controls .download-btn {
  background-color: #28a745;
}

.controls .reset-btn {
  background-color: #dc3545;
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
</style>