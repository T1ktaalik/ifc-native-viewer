# Scene Management Architecture

## Overview

This document describes the scene management architecture for the IFC Native Viewer application. The scene management functionality has been extracted from the `useIfcLoader` composable into a separate `useSceneManager` composable to improve modularity and separation of concerns.

## Components

The scene management architecture consists of the following key components:

1. **useSceneManager** - A composable that manages the 3D scene and its components
2. **useIfcLoader** - A composable that handles IFC file loading and conversion (uses useSceneManager)
3. **Models Store** - A Pinia store that manages the application state and holds references to components

## Architecture Details

### useSceneManager

The `useSceneManager` composable is responsible for:

- Initializing the OBC.Components instance
- Creating and managing the 3D world (scene, camera, renderer)
- Managing fragments
- Providing lifecycle methods for scene management

Key methods:
- `initialize()` - Initializes the 3D scene and components
- `getComponents()` - Returns the components manager instance
- `getWorld()` - Returns the world instance
- `getFragments()` - Returns the fragments manager instance
- `dispose()` - Cleans up resources and event listeners

### useIfcLoader

The `useIfcLoader` composable now focuses solely on IFC file loading and conversion, delegating scene management to `useSceneManager`. It:

- Uses `useSceneManager` to handle 3D scene operations
- Manages IFC loading and conversion to fragments
- Provides performance monitoring
- Handles worker-related operations

### Models Store

The Pinia store manages the application state and maintains references to the components for use in other parts of the application (like the ModelNavigator).

## Benefits of the New Architecture

1. **Separation of Concerns**: Scene management is now separate from IFC loading logic
2. **Reusability**: The scene manager can be used independently of IFC loading
3. **Maintainability**: Changes to scene management logic are isolated to one composable
4. **Testability**: Each composable can be tested independently
5. **Flexibility**: The architecture allows for easier extension and modification

## Usage

To use the scene manager in a component:

```typescript
import { useSceneManager } from './useSceneManager'

const sceneManager = useSceneManager({ container: viewerContainer })
await sceneManager.initialize()

const components = sceneManager.getComponents()
const world = sceneManager.getWorld()
const fragments = sceneManager.getFragments()
```

To use the IFC loader with the scene manager:

```typescript
import { useIfcLoader } from './useIfcLoader'

const ifcLoader = useIfcLoader({ 
  container: viewerContainer,
  workerUrl: '/path/to/worker.mjs'
})

await ifcLoader.initialize()
```

## Lifecycle

1. **Initialization**: 
   - `useSceneManager` creates the OBC.Components instance and initializes the 3D world
   - `useIfcLoader` sets up IFC loading capabilities

2. **Usage**:
   - Components are accessed through the composables
   - IFC files are loaded and converted to fragments
   - Models are added to the scene

3. **Cleanup**:
   - `dispose()` methods are called to clean up resources
   - Event listeners are removed
   - Components are properly disposed of

## useTreeManager

The `useTreeManager` composable handles the creation and management of spatial trees for loaded models.

### API

```typescript
interface TreeManagerOptions {
  treeWrapper: { value: HTMLElement | null };
}

function useTreeManager(options: TreeManagerOptions): {
  createTree: () => Promise<void>;
  updateTreeWrapper: (tree: any) => void;
  checkAndCreateTree: () => void;
  initializeTreeCreation: () => void;
  cleanup: () => void;
}
```

### Usage

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useTreeManager } from '../composables/useTreeManager';

const treeWrapper = ref<HTMLElement | null>(null);
const treeManager = useTreeManager({ treeWrapper });

onMounted(() => {
  treeManager.initializeTreeCreation();
});

onUnmounted(() => {
  treeManager.cleanup();
});
</script>
```

## useModelsListManager

The `useModelsListManager` composable handles the creation and management of models lists for loaded models.

### API

```typescript
interface ModelsListManagerOptions {
  modelsListWrapper: { value: HTMLElement | null };
}

function useModelsListManager(options: ModelsListManagerOptions): {
  createModelsList: () => Promise<void>;
  updateModelsListWrapper: (modelsList: any) => void;
  checkAndCreateModelsList: () => void;
  initializeModelsListCreation: () => void;
  cleanup: () => void;
}
```

### Usage

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useModelsListManager } from '../composables/useModelsListManager';

const modelsListWrapper = ref<HTMLElement | null>(null);
const modelsListManager = useModelsListManager({ modelsListWrapper });

onMounted(() => {
  modelsListManager.initializeModelsListCreation();
});

onUnmounted(() => {
  modelsListManager.cleanup();
});
</script>
```

## Future Improvements

This architecture allows for future enhancements such as:
- Multiple scene support
- Advanced scene configuration options
- Plugin system for scene extensions
- Improved error handling and recovery