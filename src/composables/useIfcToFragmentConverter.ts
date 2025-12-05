import * as OBC from "@thatopen/components";
import Stats from "stats.js";

export interface IfcToFragmentConverterOptions {
  container: HTMLElement;
  ifcPath?: string;
  workerUrl?: string;
}

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
  
  const stats = new Stats();
  stats.showPanel(2);
  
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
    
    fragments.list.onItemSet.add(({value: model}) => {
      model.useCamera(world.camera.three);
      world.scene.three.add(model.object);
      fragments.core.update(true);
    });
    
    // Initialize stats
    stats.dom.style.left = "0px";
    stats.dom.style.zIndex = "unset";
    if (world.renderer) {
      world.renderer.onBeforeUpdate.add(() => stats.begin());
      world.renderer.onAfterUpdate.add(() => stats.end());
    }
  };
  
  const loadIfc = async (path: string | File = ifcPath) => {
    let buffer: Uint8Array;
    let fileName: string;
    
    if (typeof path === 'string') {
      // Load from URL
      const file = await fetch(path);
      const data = await file.arrayBuffer();
      buffer = new Uint8Array(data);
      fileName = 'example';
    } else {
      // Load from File object (local file system)
      const data = await path.arrayBuffer();
      buffer = new Uint8Array(data);
      fileName = path.name;
    }
    
    await ifcLoader.load(buffer, false, fileName, {
      processData: {
        progressCallback: (progress: number) => {
          console.log(progress);
        }
      }
    });
  };
  
  const downloadFragment = async () => {
    const [model] = fragments.list.values();
    if (!model) return;
    const fragsBuffer = await model.getBuffer(false);
    const file = new File([fragsBuffer], 'fragments.frag');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  
  const getStats = () => stats;
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
    stats.dom.remove();
  };
  
  // Global error handler for worker errors
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
    handleWorkerError
  };
}