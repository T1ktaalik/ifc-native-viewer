<template>
  <div class="ifc-to-frag-converter-container">
    <div ref="theConverterContainer" class="viewer-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useIfcToFragmentConverter } from "../composables/useIfcToFragmentConverter";

const theConverterContainer = ref<HTMLElement | null>(null);
let converter: ReturnType<typeof useIfcToFragmentConverter> | null = null;

onMounted(async () => {
  if (!theConverterContainer.value) {
    console.error('Нет элемента-контейнера!');
    return;
  }

  converter = useIfcToFragmentConverter({
    container: theConverterContainer.value
  });

  // Add global error listener
  window.addEventListener('error', converter.handleWorkerError);

  await converter.initialize();
  converter.createUI();
});

// Clean up the event listener and dispose of resources
onUnmounted(() => {
  if (converter) {
    converter.dispose();
  }
});
</script>

<style scoped>
.ifc-to-frag-converter-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.viewer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>