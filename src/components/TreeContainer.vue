<template>
  <div class="tree-container-wrapper">
    <ModelTree :components="components" />
  </div>
</template>

<script setup lang="ts">
import ModelTree from './ModelTree.vue';

defineProps<{
  components: any; // OBC Components instance
}>();
</script>

<style scoped>
.tree-container-wrapper {
  height: 100%;
  width: 100%;
}
</style>