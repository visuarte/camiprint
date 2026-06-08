/**
 * three-modules.ts — Cargador de Three.js desde npm (bundled por webpack).
 * Sin dependencia CDN para evitar CSP issues y mejorar velocidad.
 */

let cache: any = null;

export type ThreeModules = {
  THREE: any;
  GLTFLoader: any;
  OrbitControls: any;
  DecalGeometry: any;
};

/** Carga Three.js desde npm. Rápido y sin CSP issues. */
export async function ensureThreeModules(): Promise<ThreeModules> {
  if (cache) return cache;

  console.log('[three] Cargando desde npm...');
  try {
    const THREE = await import('three');
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    const { DecalGeometry } = await import('three/examples/jsm/geometries/DecalGeometry.js');

    cache = { THREE, GLTFLoader, OrbitControls, DecalGeometry };
    console.log('[three] ✅ Cargado desde npm');
    return cache;
  } catch (err) {
    console.error('[three] ❌ Falló carga desde npm');
    throw new Error(
      `No se pudo cargar Three.js. Verifica: npm install three@0.178.0. Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
