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
  
  // Create three separate stats instances for three monitors
  const stats1 = new Stats();
  const stats2 = new Stats();
  const stats3 = new Stats();
  
  stats1.showPanel(0); // FPS
  stats2.showPanel(1); // MS
  stats3.showPanel(2); // MB
  
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
    
    // Initialize stats panels
    const setupStats = (stats: Stats, rightOffset: string) => {
      stats.dom.style.position = "absolute";
      stats.dom.style.right = rightOffset;
      stats.dom.style.bottom = "10px";
      stats.dom.style.left = "unset";
      stats.dom.style.top = "unset";
      stats.dom.style.zIndex = "1000";
      stats.dom.style.background = "rgba(255, 255, 255, 0.9)";
      stats.dom.style.padding = "5px";
      container.appendChild(stats.dom);
    };
    
    setupStats(stats1, "10px");
    setupStats(stats2, "90px");
    setupStats(stats3, "170px");
    
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
    
    if (world.renderer) {
      world.renderer.onBeforeUpdate.add(() => {
        stats1.begin();
        stats2.begin();
        stats3.begin();
      });
      world.renderer.onAfterUpdate.add(() => {
        stats1.end();
        stats2.end();
        stats3.end();
      });
    }
    
    // Add monitor for fragment loading progress
    fragments.list.onItemSet.add(({key, value: model}) => {
      console.log(`Fragment loaded: ${key}`);
    });
    
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
    
    await ifcLoader.load(buffer, false, lastLoadedFileName, {
      processData: {
        progressCallback: (progress: number) => {
          console.log(`IFC processing progress: ${progress}%`);
        }
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
  
  const getStats = () => ({ stats1, stats2, stats3 });
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
    stats1.dom.remove();
    stats2.dom.remove();
    stats3.dom.remove();
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