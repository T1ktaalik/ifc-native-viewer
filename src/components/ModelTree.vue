<template>
  <div class="model-tree-container">
    <div v-if="modelsStore.loadedModels.length > 0" class="trees-container">
      <div v-for="model in modelsStore.loadedModels" :key="model.name" class="model-tree-item">
        <h5>{{ model.name }}</h5>
        <div class="tree-wrapper" :id="'tree-wrapper-' + model.name"></div>
      </div>
    </div>
    <div v-else class="no-model">
      <p>No models loaded</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue';
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();

// Watch for changes in loaded models to display trees
watch(
  () => modelsStore.loadedModels,
  (newModels) => {
    console.log('Loaded models changed:', newModels);
    
    // Use nextTick to ensure DOM is updated before displaying trees
    nextTick(() => {
      console.log('Next tick executed, updating tree wrappers');
      updateTreeWrappers();
    });
  },
  { deep: true }
);

// Function to update tree wrappers with existing trees
const updateTreeWrappers = () => {
  try {
    modelsStore.loadedModels.forEach(model => {
      if (model.name) {
        // Get the tree wrapper by ID
        const treeWrapper = document.getElementById('tree-wrapper-' + model.name);
        if (!treeWrapper) {
          console.warn('No tree wrapper found for model:', model.name);
          return;
        }
        
        // Clear previous content
        while (treeWrapper.firstChild) {
          treeWrapper.removeChild(treeWrapper.firstChild);
        }
        
        // Get the existing tree for this model
        const existingTree = modelsStore.getRawTreeForModel(model.name);
        console.log('Model name:', model.name);
        console.log('Existing tree:', existingTree);
        
        if (existingTree) {
          console.log('Displaying existing tree for model:', model.name);
          try {
            // Remove from existing parent if it has one
            if (existingTree.parentNode) {
              try {
                existingTree.parentNode.removeChild(existingTree);
              } catch (e) {
                // Ignore errors when removing from parent
              }
            }
            // Add existing tree directly to the wrapper
            treeWrapper.appendChild(existingTree);
            console.log('Tree successfully appended to wrapper for model:', model.name);
          } catch (error) {
            console.error('Error appending tree to wrapper:', error);
          }
        } else {
          console.warn('No tree found for model:', model.name);
        }
      }
    });
  } catch (error) {
    console.error('Error updating tree wrappers:', error);
  }
};
</script>

<style scoped>
.model-tree-container {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.model-tree-item {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  background-color: #f8f9fa;
  margin-bottom: 1rem;
}

.model-tree-item h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #343a40;
}

.tree-wrapper {
  width: 100%;
  min-height: 200px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}
</style>
