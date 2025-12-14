import * as OBC from "@thatopen/components";

/**
 * Configuration options for the scene manager
 */
export interface SceneManagerOptions {
  /** The HTML element where the 3D viewer will be rendered */
  container: HTMLElement;
}

/**
 * A composable function that provides scene management functionality.
 *
 * This function initializes and manages the 3D scene using @thatopen/components library.
 *
 * @param options - Configuration options for the scene manager
 * @param options.container - The HTML element where the 3D viewer will be rendered
 *
 * @returns An object containing methods to control the 3D scene:
 * - initialize: Initializes the 3D scene and components
 * - getComponents: Returns the components manager instance
 * - getWorld: Returns the world instance
 * - getFragments: Returns the fragments manager instance
 * - dispose: Cleans up resources and event listeners
 */
export function useSceneManager(options: SceneManagerOptions) {
  const { container } = options;
  
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
  
  const initialize = async () => {
    await world.camera.controls.setLookAt(78, 20, -2.2, 26, -4, 25);
    components.init();
    components.get(OBC.Grids).create(world);
  };
  
  const getComponents = () => components;
  const getWorld = () => world;
  const getFragments = () => fragments;
  
  // Cleanup function
  const dispose = () => {
    components.dispose();
  };
  
  return {
    initialize,
    getComponents,
    getWorld,
    getFragments,
    dispose
  };
}