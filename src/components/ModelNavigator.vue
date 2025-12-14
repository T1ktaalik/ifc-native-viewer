<template>
  <div class="model-navigator-container">
    <nav class="navbar">
      <h3 class="navbar-title">Models</h3>
      <ul class="model-list">
        <li
          v-for="model in modelsStore.loadedModels"
          :key="model.name"
          class="model-item"
          :class="{ active: model.name === selectedModel }"
          @click="selectModel(model.name)"
        >
          {{ model.name }}
        </li>
      </ul>
    </nav>
    
    <div class="tree-section">
      <div v-if="modelsStore.loadedModels.length > 0" class="tree-container">
        <div class="tree-wrapper" ref="treeWrapper"></div>
      </div>
      <div v-else class="no-model">
        <p>No models loaded</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import * as BUI from "@thatopen/ui";
import * as BUIC from "@thatopen/ui-obc";
import * as OBC from "@thatopen/components";
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();
const selectedModel = ref<string | null>(null);
const treeWrapper = ref<HTMLElement | null>(null);

const selectModel = (modelName: string) => {
  selectedModel.value = modelName;
  console.log('Model selected:', modelName);
  // Model selection logic can be added here if needed
};

const createTree = async () => {
  console.log('Attempting to create tree...');
  console.log('Components available:', !!modelsStore.components);
  console.log('Loaded models count:', modelsStore.loadedModels.length);
  
  // Check if we already have a tree
  const existingTree = modelsStore.getSingleTree();
  if (existingTree) {
    console.log('Using existing tree');
    // Update the tree wrapper with existing tree
    updateTreeWrapper(existingTree);
    return;
  }
  
  if (!modelsStore.components) {
    console.warn('Components not available for tree creation');
    return;
  }
  
  try {
    // Create spatial tree
    if (!BUIC || !BUIC.tables || !BUIC.tables.spatialTree) {
      console.error('BUIC tables or spatialTree function not available');
      return;
    }
    
    console.log('Creating new spatial tree...');
    // Get the fragments manager from components
    const fragments = modelsStore.components?.get(OBC.FragmentsManager);
    // Get all loaded models from fragments
    const models = fragments ? Array.from(fragments.list.values()) : [];
    console.log('Models for tree:', models.length);
    
    const [tree] = BUIC.tables.spatialTree({
      components: modelsStore.components as any,
      models: models
    });
    
    tree.preserveStructureOnFilter = true;
   
    // Store in Pinia as single tree
    modelsStore.setSingleTree(tree);
    
    // Update the tree wrapper
    updateTreeWrapper(tree);
    console.log('Tree created and added to wrapper');
  } catch (error) {
    console.error('Error creating tree:', error);
  }
};

// Function to update tree wrapper with the tree
const updateTreeWrapper = (tree: any) => {
  console.log('Updating tree wrapper...');
  console.log('Tree wrapper ref:', treeWrapper.value);
  
  if (!treeWrapper.value) {
    console.warn('No tree wrapper found');
    return;
  }
  
  try {
    console.log('Tree parent node:', tree.parentNode);
    console.log('Tree wrapper value:', treeWrapper.value);
    
    // Only append if not already in the correct parent
    if (tree.parentNode !== treeWrapper.value) {
      // Remove from existing parent if it has one
      if (tree.parentNode) {
        try {
          tree.parentNode.removeChild(tree);
        } catch (e) {
          // Ignore errors when removing from parent
        }
      }
      // Add tree directly to the wrapper
      treeWrapper.value.appendChild(tree);
      console.log('Tree appended to wrapper');
    } else {
      console.log('Tree already in correct parent');
    }
  } catch (error) {
    console.error('Error updating tree wrapper:', error);
  }
};

// Watch for changes in loaded models to display trees
watch(
  () => modelsStore.loadedModels,
  async (newModels) => {
    console.log('Loaded models changed:', newModels.length);
    if (newModels.length > 0) {
      // Wait for next tick to ensure DOM is updated
      await nextTick();
      // Create or update tree
      console.log('Creating tree after models changed');
      createTree();
    }
  },
  { deep: true }
);

// Also watch for changes in the single tree
watch(
  () => modelsStore.singleTree,
  (newTree) => {
    if (newTree && treeWrapper.value) {
      updateTreeWrapper(newTree);
    }
  }
);

// Function to check if we should create tree
const checkAndCreateTree = () => {
  console.log('Checking if we should create tree...');
  console.log('Loaded models:', modelsStore.loadedModels.length);
  console.log('Components available:', !!modelsStore.components);
  
  if (modelsStore.loadedModels.length > 0 && modelsStore.components) {
    console.log('Creating tree...');
    createTree();
  } else {
    console.log('Not ready to create tree yet');
  }
};
// Watch for changes in components
watch(
  () => modelsStore.components,
  (newComponents) => {
    console.log('Components changed:', !!newComponents);
    if (newComponents && modelsStore.loadedModels.length > 0) {
      console.log('Components and models available, creating tree');
      // If we have components and loaded models, create the tree
      // Add a small delay to ensure everything is properly initialized
      setTimeout(() => {
        createTree();
      }, 100);
    }
  }
);

// Watch for both components and models to be ready
watch(
  [() => modelsStore.components, () => modelsStore.loadedModels],
  ([components, models]) => {
    console.log('Components and models watch triggered');
    console.log('Components:', !!components);
    console.log('Models count:', models.length);
    
    if (components && models.length > 0) {
      console.log('Both components and models ready, creating tree');
      setTimeout(() => {
        createTree();
      }, 50);
    }
  }
);

// Watch for changes in fragments models
watch(
  () => {
    if (modelsStore.components) {
      const fragments = modelsStore.components.get(OBC.FragmentsManager);
      return fragments ? fragments.list.size : 0;
    }
    return 0;
  },
  (newCount, oldCount) => {
    console.log('Fragments count changed:', oldCount, '->', newCount);
    if (newCount > 0 && newCount !== oldCount) {
      console.log('Fragments changed, recreating tree');
      setTimeout(() => {
        createTree();
      }, 100);
    }
  }
);

onMounted(() => {
  // If there are already loaded models when component mounts, create tree
  if (modelsStore.loadedModels.length > 0) {
    nextTick(() => {
      createTree();
    });
  }
  
  // Also try to create tree after a delay to handle timing issues
  setTimeout(() => {
    checkAndCreateTree();
  }, 500);
  
  // And again after a longer delay
  setTimeout(() => {
    checkAndCreateTree();
  }, 1000);
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

.navbar {
  background-color: #ffffff;
  border-bottom: 1px solid #dee2e6;
  padding: 1rem;
  flex-shrink: 0;
}

.navbar-title {
  margin: 0 0 0.5rem 0;
  color: #343a40;
  font-size: 1.1rem;
}

.model-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.model-item {
  padding: 0.25rem 0.75rem;
  background-color: #e9ecef;
  border: 1px solid #ced4da;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.model-item:hover {
  background-color: #dee2e6;
}

.model-item.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  font-weight: 500;
}

.tree-section {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

.tree-container {
  background-color: #ffffff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  height: 100%;
}

.tree-wrapper {
  width: 100%;
  height: 100%;
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