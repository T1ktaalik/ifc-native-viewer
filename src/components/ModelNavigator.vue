<template>
  <div class="model-navigator-container">
    <div class="content-section">
      <div class="models-content">
        <div class="models-list-container">
          <h4>Model List</h4>
          <div class="models-list-wrapper" ref="modelsListWrapper"></div>
        </div>
        
        <div class="tree-container">
          <h4>Model Tree</h4>
          <div class="tree-wrapper" ref="treeWrapper"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTreeManager } from '../composables/useTreeManager';
import { useModelsListManager } from '../composables/useModelsListManager';
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();
const treeWrapper = ref<HTMLElement | null>(null);
const modelsListWrapper = ref<HTMLElement | null>(null);

// Use the tree manager composable
const treeManager = useTreeManager({ treeWrapper });

// Use the models list manager composable
const modelsListManager = useModelsListManager({ modelsListWrapper });

onMounted(() => {
  // Update tree manager with the actual tree wrapper element
  treeManager.initializeTreeCreation();
  
  // Update models list manager with the actual models list wrapper element
  modelsListManager.initializeModelsListCreation();
});

onUnmounted(() => {
  treeManager.cleanup();
  modelsListManager.cleanup();
});
</script>

<style scoped>
.model-navigator-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  overflow: hidden;
}

.content-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

.models-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.models-list-container, .tree-container {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
}

.models-list-container h4, .tree-container h4 {
  margin: 0 0 0.5rem 0;
  color: #343a40;
  font-size: 1rem;
}

.models-list-wrapper, .tree-wrapper {
  width: 100%;
  min-height: 200px;
  background-color: white;
}

.no-model {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-style: italic;
}
</style>