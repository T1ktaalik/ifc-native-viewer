import * as OBC from "@thatopen/components";
import { usePerformanceMonitor } from "./usePerformanceMonitor";

/**
 * Configuration options for the IFC to Fragment converter
 */
export interface IfcToFragmentConverterOptions {
  /** The HTML element where the 3D viewer will be rendered */
  container: HTMLElement;
  /** Optional URL to an IFC file to load by default */
  ifcPath?: string;
  /** Optional URL to the worker script for fragment processing */
  workerUrl?: string;
}

/**
 * A composable function that provides IFC to Fragment conversion functionality.
 *
 * This function initializes a 3D viewer using @thatopen/components library and provides
 * methods to load IFC files, convert them to fragment format, and manage the 3D scene.
 *
 * @param options - Configuration options for the converter
 * @param options.container - The HTML element where the 3D viewer will be rendered
 * @param options.ifcPath - Optional URL to an IFC file to load by default
 * @param options.workerUrl - Optional URL to the worker script for fragment processing
 *
 * @returns An object containing methods to control the IFC to fragment conversion process:
 * - initialize: Initializes the 3D viewer and components
 * - loadIfc: Loads an IFC file from a URL or File object
 * - downloadFragment: Downloads the converted fragment as a .frag file
 * - getStats: Returns the performance statistics objects
 * - getComponents: Returns the components manager instance
 * - getWorld: Returns the world instance
 * - getFragments: Returns the fragments manager instance
 * - getHasFragments: Returns whether any fragments are currently loaded
 * - dispose: Cleans up resources and event listeners
 * - handleWorkerError: Handles worker-related errors
 * - modelLoadedEvent: Event target for model loaded events
 */
export function useIfcToFragmentConverter(options: IfcToFragmentConverterOptions) {
  const { container, ifcPath = "https://thatopen.github.io/engine_components/resources/ifc/school_str.ifc", workerUrl = "/resources/worker.mjs" } = options;
  
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >();
  
  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = null;
  
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.OrthoPerspectiveCamera(components);
  
  const fragments = components.get(OBC.FragmentsManager);
  const ifcLoader = components.get(OBC.IfcLoader);
  
  const performanceMonitor = usePerformanceMonitor(container);
  
  const initialize = async () => {
    await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);
    components.init();
    components.get(OBC.Grids).create(world);
    
    ifcLoader.onIfcImporterInitialized.add((importer) => {
      console.log(importer.classes);
    });
    
    await ifcLoader.setup({
      autoSetWasm: false,
      wasm: {
        path: "https://unpkg.com/web-ifc@0.0.72/",
        absolute: true,
      }
    });
    
    fragments.init(workerUrl);
    
    world.camera.controls.addEventListener('rest', () => {
      fragments.core.update(true);
    });
    
    // Add monitor for fragment loading progress
    fragments.list.onItemSet.add(({key, value: model}) => {
      console.log(`Fragment loaded: ${key}`);
    });
    
    // Add model loaded event emitter
    fragments.list.onItemSet.add(({key, value: model}) => {
      console.log('Model added to fragments list with key:', key);
      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      fragments.core.update(true);
      
      // Emit model loaded event
      const event = new CustomEvent('modelLoaded', {
        detail: {
          model: {
            uuid: key,
            name: key || 'Unnamed Model'
          }
        }
      });
      modelLoadedEvent.dispatchEvent(event);
    });
    
    // Initialize stats panels
    // Remove borders from all canvas elements
    const removeCanvasBorders = () => {
      setTimeout(() => {
        const canvases = container.querySelectorAll('canvas');
        canvases.forEach(canvas => {
          (canvas as HTMLElement).style.border = "none";
        });
      }, 100);
    };
    
    removeCanvasBorders();
    performanceMonitor.initialize();
    
    if (world.renderer) {
      world.renderer.onBeforeUpdate.add(() => {
        performanceMonitor.begin();
      });
      world.renderer.onAfterUpdate.add(() => {
        performanceMonitor.end();
      });
    }
    
    // Add monitor for fragment loading errors
    // fragments.list.onError.add((error) => {
    //   console.error("Fragment loading error:", error);
    // });
  };
  
  // Store the last loaded file name for use in download
  let lastLoadedFileName = 'example';
  
  const loadIfc = async (path: string | File = ifcPath) => {
    let buffer: Uint8Array;
    
    if (typeof path === 'string') {
      // Load from URL
      const file = await fetch(path);
      const data = await file.arrayBuffer();
      buffer = new Uint8Array(data);
      // Extract filename from URL
      const url = new URL(path);
      const pathname = url.pathname;
      lastLoadedFileName = pathname.split('/').pop()?.replace('.ifc', '') || 'example';
    } else {
      // Load from File object (local file system)
      const data = await path.arrayBuffer();
      buffer = new Uint8Array(data);
      lastLoadedFileName = path.name.replace('.ifc', '');
    }
    
    await ifcLoader.load(buffer, true, lastLoadedFileName, {
      processData: {
        progressCallback: (progress: number) => {
          console.log(`IFC processing progress: ${progress}%`);
        },
        
      }
    });
  };
  
  const downloadFragment = async () => {
    const [model] = fragments.list.values();
    if (!model) return;
    const fragsBuffer = await model.getBuffer(false);
    const fileName = `${lastLoadedFileName}.frag`;
    const file = new File([fragsBuffer], fileName);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const getStats = () => performanceMonitor.getStats();
  const getComponents = () => components;
  const getWorld = () => world;
  const getFragments = () => fragments;
  const getHasFragments = () => fragments.list.size > 0;
  
  // Cleanup function
  const dispose = () => {
    // Remove event listeners
    window.removeEventListener('error', handleWorkerError);
    
    // Dispose components
    components.dispose();
    
    // Dispose stats
    performanceMonitor.dispose();
  };
  
  // Global error handler for worker errors
  // Create an event emitter for model loaded events
  const modelLoadedEvent = new EventTarget();
  
  
  const handleWorkerError = (event: ErrorEvent) => {
    console.error("Worker error caught:", event);
    if (event.message && event.message.includes("incorrect header check")) {
      console.error("This is the 'incorrect header check' error we're trying to fix");
    }
  };
  
  return {
    initialize,
    loadIfc,
    downloadFragment,
    getStats,
    getComponents,
    getWorld,
    getFragments,
    getHasFragments,
    dispose,
    handleWorkerError,
    modelLoadedEvent
  };
}