<template>
  <div class="model-list-container">
    <h3>Loaded Models</h3>
    <ul class="model-list">
      <li
        v-for="model in modelsStore.loadedModels"
        :key="model.id"
        class="model-item"
        :class="{ 'active': model.id === modelsStore.activeModelId }"
       @click="onModelSelect(model.id)"
      >
        {{ model.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useModelsStore } from '../stores/models';

const modelsStore = useModelsStore();

const onModelSelect = (modelId: string) => {
  console.log('Model selected from list:', modelId);
  modelsStore.setActiveModel(modelId);
};
</script>

<style scoped>
.model-list-container {
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.model-list-container h3 {
  margin-top: 0;
  color: #343a40;
}

.model-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.model-item {
  padding: 0.25rem 0;
  margin-bottom: 0;
  background-color: transparent;
  border: none;
  border-radius: 0;
  cursor: pointer;
  transition: none;
}

.model-item:hover {
  background-color: transparent;
}

.model-item.active {
  background-color: transparent;
  color: #ff8c00;
  border-color: transparent;
  font-weight: bold;
}
</style>