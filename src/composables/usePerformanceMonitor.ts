import Stats from "stats.js";

/**
 * A composable function that provides performance monitoring functionality.
 * 
 * This function creates and manages performance statistics monitors
 * using the stats.js library.
 * 
 * @param container - The HTML element where the stats panels will be rendered
 * 
 * @returns An object containing methods to control the performance monitors:
 * - initialize: Initializes the stats panels and adds them to the DOM
 * - begin: Begins performance monitoring for the current frame
 * - end: Ends performance monitoring for the current frame
 * - dispose: Cleans up resources and removes stats panels from the DOM
 * - getStats: Returns the stats instances
 */
export function usePerformanceMonitor(container: HTMLElement) {
  // Create three separate stats instances for three monitors
  const stats1 = new Stats();
  const stats2 = new Stats();
  const stats3 = new Stats();
  
  stats1.showPanel(0); // FPS
  stats2.showPanel(1); // MS
  stats3.showPanel(2); // MB
  
  const setupStats = (stats: Stats, rightOffset: string) => {
    stats.dom.style.position = "absolute";
    stats.dom.style.right = "unset";
    stats.dom.style.bottom = "10px";
    stats.dom.style.left = rightOffset;
    stats.dom.style.top = "unset";
    stats.dom.style.zIndex = "1000";
    stats.dom.style.background = "rgba(255, 255, 255, 0.9)";
    stats.dom.style.padding = "5px";
    container.appendChild(stats.dom);
  };
  
  /**
   * Initializes the stats panels and adds them to the DOM
   */
  const initialize = () => {
    setupStats(stats1, "10px");
    setupStats(stats2, "90px");
    setupStats(stats3, "170px");
  };
  
  /**
   * Begins performance monitoring for the current frame
   */
  const begin = () => {
    stats1.begin();
    stats2.begin();
    stats3.begin();
  };
  
  /**
   * Ends performance monitoring for the current frame
   */
  const end = () => {
    stats1.end();
    stats2.end();
    stats3.end();
  };
  
  /**
   * Cleans up resources and removes stats panels from the DOM
   */
  const dispose = () => {
    stats1.dom.remove();
    stats2.dom.remove();
    stats3.dom.remove();
  };
  
  /**
   * Returns the stats instances
   * @returns Object containing the three stats instances
   */
  const getStats = () => ({ stats1, stats2, stats3 });
  
  return {
    initialize,
    begin,
    end,
    dispose,
    getStats
  };
}