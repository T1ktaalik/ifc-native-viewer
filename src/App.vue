<script setup lang="ts">
import Navigation from './components/Navigation.vue'
</script>

<template>
  <div class="flex flex-col h-screen">
    <Navigation />
    <div class="flex-1 overflow-auto">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.router-view {
  height: 100%;
}
</style>
