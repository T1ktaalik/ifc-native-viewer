<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex space-x-4">
      <router-link 
        to="/" 
        class="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
        active-class="bg-gray-900"
      >
       Демонстрация
      </router-link>

      <router-link 
        to="/ifc-to-frag-converter" 
        class="px-3 py-2 rounded hover:bg-gray-700 transition-colors"
        active-class="bg-gray-900"
      >
        Загрузить и посмотреть
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Navigation component for routing between different views
</script>

<style scoped>
.router-link-active {
  background-color: #4B5563;
}
</style>