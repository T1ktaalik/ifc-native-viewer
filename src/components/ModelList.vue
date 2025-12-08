<template>
  <div class="model-list-container">
    <h3>Loaded Models</h3>
    <ul class="model-list">
      <li
        v-for="model in modelsStore.loadedModels"
        :key="model.id"
        class="model-item"
        :class="{ 'active': model.id === modelsStore.activeModelId }"
        @click="setActiveModel(model.id)"
      >
        {{ model.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useModelsStore } from '../stores/models';

interface Model {
  id: string;
  name: string;
}

const modelsStore = useModelsStore();

const setActiveModel = (modelId: string) => {
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
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.model-item:hover {
  background-color: #e9ecef;
}

.model-item.active {
  background-color: #007bff;
  color: #fff;
  border-color: #007bff;
}
</style>