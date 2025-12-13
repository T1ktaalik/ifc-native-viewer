<template>
  <div class="model-tree-container">
    <h4 v-if="modelsStore.loadedModels.length > 0">
      Model Structures
    </h4>
    <div v-if="modelsStore.loadedModels.length > 0" class="trees-container">
      <div
        v-for="model in modelsStore.loadedModels"
        :key="model.id"
        class="model-tree-item"
      >
        <h5>{{ model.name }}</h5>
        <div class="tree-container" :id="'tree-container-' + model.id"></div>
      </div>
    </div>
    <div v-else class="no-model">
      <p>No models loaded</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();


// Function to display an existing tree for a model
const displayTree = (modelId: string) => {
  try {
    console.log('Attempting to display tree for model:', modelId);
    
    // Get the tree container by ID
    const treeContainer = document.getElementById('tree-container-' + modelId);
    if (!treeContainer) {
      console.warn('No tree container found for model:', modelId);
      return;
    }
    
    console.log('Tree container found for model:', modelId);
    
    // Clear previous tree if exists
    while (treeContainer.firstChild) {
      try {
        treeContainer.removeChild(treeContainer.firstChild);
      } catch (e) {
        // Ignore errors when removing child nodes
        break;
      }
    }
    
    // Get the existing tree for this model
    const existingTree = modelsStore.getRawTreeForModel(modelId);
    console.log('Model ID:', modelId);
    console.log('Existing tree:', existingTree);
    
    if (existingTree) {
      console.log('Displaying existing tree for model:', modelId);
      try {
        // Remove from existing parent if it has one
        if (existingTree.parentNode) {
          try {
            existingTree.parentNode.removeChild(existingTree);
          } catch (e) {
            // Ignore errors when removing from parent
          }
        }
        // Add existing tree
        treeContainer.appendChild(existingTree);
        console.log('Tree successfully appended to container for model:', modelId);
      } catch (error) {
        console.error('Error appending tree to container:', error);
        // Fallback: Show error message
        treeContainer.innerHTML = '<p>Error displaying tree: ' + (error instanceof Error ? error.message : String(error)) + '</p>';
      }
    } else {
      console.warn('No tree found for model:', modelId);
      // Show a message to the user
      treeContainer.innerHTML = '<p>Tree data not available for this model</p>';
    }
  } catch (error) {
    console.error('Error displaying tree for model:', modelId, error);
  }
};

// Watch for changes in loaded models to display trees
watch(
  () => modelsStore.loadedModels,
  (newModels) => {
    console.log('Loaded models changed:', newModels);
    
    // Use nextTick to ensure DOM is updated before displaying trees
    nextTick(() => {
      console.log('Next tick executed, displaying trees for models');
      newModels.forEach(model => {
        if (model.id) {
          console.log('Displaying tree for model:', model.id);
          displayTree(model.id);
        }
      });
    });
  },
  { immediate: true, deep: true }
);

// Watch for when there are no models to clear the display
watch(
  () => modelsStore.loadedModels.length,
  (newLength) => {
    if (newLength === 0) {
      // Clear all tree containers by finding them in the DOM
      const treeContainers = document.querySelectorAll('.tree-container');
      treeContainers.forEach(container => {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      });
    }
  }
);
</script>

<style scoped>
.model-tree-container {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.trees-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.model-tree-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  background-color: #f8f9fa;
}

.model-tree-item h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #343a40;
}

.tree-container {
  width: 100%;
  min-height: 200px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}
</style>
