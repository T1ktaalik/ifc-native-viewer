<template>
  <div class="model-tree-container">
    <h4 v-if="modelsStore.activeModelId && modelsStore.loadedModels.find(m => m.id === modelsStore.activeModelId)">
      Model Structure: {{ modelsStore.loadedModels.find(m => m.id === modelsStore.activeModelId)?.name }}
    </h4>
    <div v-if="modelsStore.activeModelId && modelsStore.loadedModels.find(m => m.id === modelsStore.activeModelId)" ref="treeContainer" class="tree-container"></div>
    <div v-else class="no-model">
      <p>No model selected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useModelsStore } from '../stores/models';
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";

const modelsStore = useModelsStore();
const treeContainer = ref<HTMLElement | null>(null);

// Function to display an existing tree for a model
const displayTree = (modelId: string) => {
  if (!treeContainer.value) return;
  
  // Clear previous tree if exists
  if (treeContainer.value.firstChild) {
    console.log('Clearing previous tree for model:', modelId);
    treeContainer.value.innerHTML = '';
  }
  
  // Get the existing tree for this model
    const existingTree = modelsStore.getRawTreeForModel(modelId);
  if (existingTree) {
    console.log('Displaying existing tree for model:', modelId);
    // Add existing tree
    treeContainer.value.appendChild(existingTree);
    console.log('Tree appended to container for model:', modelId);
  } else {
    console.warn('No tree found for model:', modelId);
    // Show a message to the user
    treeContainer.value.innerHTML = '<p>Tree data not available for this model</p>';
  }
};

onMounted(() => {
  watch(() => modelsStore.activeModelId, (newModelId) => {
    console.log('Active model ID changed:', newModelId);
    if (treeContainer.value && newModelId) {
      // Get the active model
      const activeModel = modelsStore.loadedModels.find(model => model.id === newModelId);
      console.log('Active model found:', activeModel);
      if (!activeModel) return;
      
      // Display existing tree
      console.log('Displaying tree for model (from active model ID watcher):', newModelId);
      displayTree(newModelId);
      
      // Set this as the active tree in the store
      modelsStore.setActiveTree(newModelId);
    }
  }, { immediate: true });
  
  // Also watch for changes in loaded models to handle initial load
  watch(() => modelsStore.loadedModels, (newModels) => {
    console.log('Loaded models changed:', newModels);
    // If we have models and no active model is set, set the first one as active
    if (newModels.length > 0 && !modelsStore.activeModelId) {
      const firstModel = newModels[0];
      if (firstModel && firstModel.id) {
        console.log('Setting first model as active:', firstModel.id);
        modelsStore.setActiveModel(firstModel.id);
      }
    }
    // If we have an active model and it's in the list, display its tree
    else if (modelsStore.activeModelId && treeContainer.value) {
      const activeModel = newModels.find(model => model.id === modelsStore.activeModelId);
      if (activeModel && activeModel.tree) {
        console.log('Displaying tree for active model (from loaded models watcher):', activeModel.id);
        displayTree(activeModel.id);
      }
    }
  }, { immediate: true, deep: true });
  // Watch for changes in the active model's tree
  watch(() => {
    const activeModel = modelsStore.loadedModels.find(model => model.id === modelsStore.activeModelId);
    return activeModel ? activeModel.tree : null;
  }, (newTree) => {
    if (newTree && modelsStore.activeModelId && treeContainer.value) {
      console.log('Active model tree updated, displaying tree for model (from tree watcher):', modelsStore.activeModelId);
      displayTree(modelsStore.activeModelId);
    }
  }, { immediate: true });
});
</script>

<style scoped>
.model-tree-container {
  padding: 1rem;
  height: 100%;
}

.tree-container {
  width: 100%;
  height: calc(100% - 2rem);
}
</style>
