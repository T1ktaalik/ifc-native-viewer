<template>
  <div class="model-tree-container">
    <div v-if="modelsStore.loadedModels.length > 0" class="trees-container">
      <div class="model-tree-item">
        <div class="tree-wrapper" id="tree-wrapper"></div>
      </div>
    </div>
    <div v-else class="no-model">
      <p>No models loaded</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, nextTick } from 'vue';
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();

const createTree = async () => {
  // Check if we already have a tree
  const existingTree = modelsStore.getSingleTree();
  if (existingTree) {
    return; // Tree already exists
  }
  
  if (!modelsStore.components) {
    console.warn('Components not available for tree creation');
    return;
  }
  
  // Check if components are available
  if (!modelsStore.components) {
    console.error('Components are null when trying to create tree');
    return;
  }
  
  try {
    // Create spatial tree
    // Ensure all required objects are available before creating tree
    if (!BUIC || !BUIC.tables || !BUIC.tables.spatialTree) {
      console.error('BUIC tables or spatialTree function not available');
      return;
    }
    const [tree] = BUIC.tables.spatialTree({
      components: modelsStore.components as any,
      models: [] // Follow the instruction
    });
    tree.preserveStructureOnFilter = true;
   
    // Store in Pinia as single tree
    modelsStore.setSingleTree(tree);
  } catch (error) {
    console.error('Error creating tree:', error);
  }
};

// Watch for changes in loaded models to display trees
watch(
  () => modelsStore.loadedModels,
  (newModels) => {
    // Check if we need to create a tree
    const existingTree = modelsStore.getSingleTree();
    if (!existingTree && newModels.length > 0) {
      // Create tree
      createTree();
      
      // Update tree wrapper
      nextTick(() => {
        updateTreeWrappers();
      });
    }
    // If no new trees were created, the existing @thatopen/ui-obc tree components
    // should handle their own updates automatically
  },
  { deep: true }
);

// Function to update tree wrappers with existing trees
const updateTreeWrappers = () => {
  try {
    // Get the tree wrapper by ID
    const treeWrapper = document.getElementById('tree-wrapper');
    if (!treeWrapper) {
      console.warn('No tree wrapper found');
      return;
    }
    
    // Get the existing tree
    const existingTree = modelsStore.getSingleTree();
    
    if (existingTree) {
      // Only append if not already in the correct parent
      if (existingTree.parentNode !== treeWrapper) {
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
        } catch (error) {
          console.error('Error appending tree to wrapper:', error);
        }
      }
      // The @thatopen/ui-obc tree component should handle its own updates
      // We don't need to manually update it every time
    } else {
      console.warn('No tree found');
    }
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

.tree-wrapper {
  width: 100%;
  min-height: 200px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: white;
}
</style>
