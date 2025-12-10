<template>
  <div class="model-tree-container">
    <h4 v-if="modelsStore.activeModel">Model Structure: {{ modelsStore.activeModel.name }}</h4>
    <div v-if="modelsStore.activeModel" ref="treeContainer" class="tree-container"></div>
    <div v-else class="no-model">
      <p>No model selected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useModelsStore } from '../stores/models';
import * as BUIC from "@thatopen/ui-obc";

const modelsStore = useModelsStore();
const treeContainer = ref<HTMLElement | null>(null);
let spatialTree: any = null;

// Pass components instance as a prop or get it from a composable
const props = defineProps<{
  components: any; // OBC Components instance
}>();

onMounted(() => {
  // Watch for changes in active model
  watch(() => modelsStore.activeModel, (newModel) => {
    if (treeContainer.value && props.components && newModel) {
      // Clear previous tree if exists
      if (treeContainer.value.firstChild) {
        treeContainer.value.innerHTML = '';
      }
      
      // Create spatial tree for this specific model
      const [tree] = BUIC.tables.spatialTree({
        components: props.components,
        models: [] // Will be populated by the component
      });
      
      spatialTree = tree;
      treeContainer.value.appendChild(tree);
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