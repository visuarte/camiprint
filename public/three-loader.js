(async () => {
  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js');
    const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/controls/OrbitControls.js');
    const { DecalGeometry } = await import('https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/geometries/DecalGeometry.js');
    
    window.THREE = THREE;
    window.GLTFLoader = GLTFLoader;
    window.OrbitControls = OrbitControls;
    window.DecalGeometry = DecalGeometry;
    window.THREE_READY = true;
  } catch (err) {
    console.error('Failed to load Three.js modules:', err);
    window.THREE_ERROR = err;
  }
})();
