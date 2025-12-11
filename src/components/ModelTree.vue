<template>
  <div class="model-tree-container">
    <h4 v-if="modelsStore.activeModelId && modelsStore.loadedModels.find((m: any) => m.id === modelsStore.activeModelId)">
      Model Structure: {{ modelsStore.loadedModels.find((m: any) => m.id === modelsStore.activeModelId)?.name }}
    </h4>
    <div v-if="modelsStore.activeModelId && modelsStore.loadedModels.find((m: any) => m.id === modelsStore.activeModelId)" ref="treeContainer" class="tree-container"></div>
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
let isDisplayingTree = false; // Flag to prevent multiple simultaneous tree displays
let currentDisplayedModelId: string | null = null; // Track currently displayed model

// Function to display an existing tree for a model
const displayTree = (modelId: string) => {
  // Prevent multiple simultaneous tree displays
  if (isDisplayingTree) {
    console.log('Tree display already in progress, skipping:', modelId);
    return;
  }
  
  // If this tree is already displayed, no need to re-display
  if (currentDisplayedModelId === modelId) {
    console.log('Tree already displayed for model:', modelId);
    return;
  }
  
  isDisplayingTree = true;
  
  try {
    if (!treeContainer.value) {
      isDisplayingTree = false;
      return;
    }
    
    // Clear previous tree if exists
    if (treeContainer.value.firstChild) {
      console.log('Clearing previous tree for model:', currentDisplayedModelId);
      // Remove all child nodes
      while (treeContainer.value.firstChild) {
        treeContainer.value.removeChild(treeContainer.value.firstChild);
      }
    }
    
    // Get the existing tree for this model
    const existingTree = modelsStore.getRawTreeForModel(modelId);
    console.log('Model ID:', modelId);
    console.log('Existing tree:', existingTree);
    console.log('Loaded models:', modelsStore.loadedModels);
    const model = modelsStore.loadedModels.find((m: any) => m.id === modelId);
    console.log('Found model:', model);
    if (model) {
      console.log('Model tree:', model.tree);
    }
    if (existingTree) {
      console.log('Displaying existing tree for model:', modelId);
      // Instead of cloning, we'll append the original tree element
      // But first, we need to remove it from any existing parent
      try {
        console.log('Attempting to remove tree from parent:', existingTree.parentNode);
        // Check if the tree is already in the container
        if (treeContainer.value.contains(existingTree)) {
          console.log('Tree is already in container, no need to append');
          return;
        }
        
        // Remove from existing parent if it has one
        if (existingTree.parentNode) {
          existingTree.parentNode.removeChild(existingTree);
        }
        console.log('Attempting to append tree to container:', treeContainer.value);
        // Add existing tree
        treeContainer.value.appendChild(existingTree);
        console.log('Tree successfully appended to container');
      } catch (error) {
        console.error('Error appending tree to container:', error);
        // Fallback: Show error message
        treeContainer.value.innerHTML = '<p>Error displaying tree: ' + (error instanceof Error ? error.message : String(error)) + '</p>';
      }
      console.log('Tree appended to container for model:', modelId);
    } else {
      console.warn('No tree found for model:', modelId);
      // Show a message to the user
      treeContainer.value.innerHTML = '<p>Tree data not available for this model</p>';
    }
    
    // Update the currently displayed model ID
    currentDisplayedModelId = modelId;
  } catch (error) {
    console.error('Error displaying tree:', error);
  } finally {
    // Reset the flag when done
    isDisplayingTree = false;
  }
};

onMounted(() => {
  watch(() => modelsStore.activeModelId, (newModelId) => {
    console.log('Active model ID changed:', newModelId);
    if (treeContainer.value && newModelId) {
      // Get the active model
      const activeModel = modelsStore.loadedModels.find((model: any) => model.id === newModelId);
      console.log('Active model found:', activeModel);
      if (!activeModel) return;
      
      // Display existing tree
      console.log('Displaying tree for model (from active model ID watcher):', newModelId);
      displayTree(newModelId);
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
      const activeModel = newModels.find((model: any) => model.id === modelsStore.activeModelId);
      if (activeModel && activeModel.tree) {
        console.log('Displaying tree for active model (from loaded models watcher):', activeModel.id);
        displayTree(activeModel.id);
      }
    }
  }, { immediate: true, deep: true });
  // Watch for changes in the active model's tree
  watch(() => {
    const activeModel = modelsStore.loadedModels.find((model: any) => model.id === modelsStore.activeModelId);
    return activeModel ? activeModel.tree : null;
  }, (newTree) => {
    if (newTree && modelsStore.activeModelId && treeContainer.value) {
      console.log('Active model tree updated, displaying tree for model (from tree watcher):', modelsStore.activeModelId);
      displayTree(modelsStore.activeModelId);
    }
  }, { immediate: true });
  
  // Watch for when there's no active model to clear the display
  watch(() => modelsStore.activeModelId, (newModelId) => {
    if (!newModelId && treeContainer.value) {
      // Clear the tree container when there's no active model
      while (treeContainer.value.firstChild) {
        treeContainer.value.removeChild(treeContainer.value.firstChild);
      }
      currentDisplayedModelId = null;
    }
  });
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
