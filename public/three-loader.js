/**
 * three-loader.js — Cargador universal de Three.js
 * 
 * Detecta automáticamente el entorno (local / server) y elige la mejor fuente:
 * - LOCAL (hostname === 'localhost' || '127.0.0.1'): usa CDN con CSP relajado
 * - SERVER (Vercel/producción): usa CDN (CSP estricto configurado aparte)
 * - FALLBACK: si CDN falla, reintenta con mirror alternativo
 */

const CDN_PRIMARY = 'https://cdn.jsdelivr.net/npm/three@0.178.0';
const CDN_MIRROR = 'https://unpkg.com/three@0.178.0';

const isLocal = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('.local') ||
  window.location.protocol === 'file:'
);

async function loadFromCDN(baseUrl) {
  const THREE = await import(`${baseUrl}/build/three.module.js`);
  const { GLTFLoader } = await import(`${baseUrl}/examples/jsm/loaders/GLTFLoader.js`);
  const { OrbitControls } = await import(`${baseUrl}/examples/jsm/controls/OrbitControls.js`);
  const { DecalGeometry } = await import(`${baseUrl}/examples/jsm/geometries/DecalGeometry.js');
  
  window.THREE = THREE;
  window.GLTFLoader = GLTFLoader;
  window.OrbitControls = OrbitControls;
  window.DecalGeometry = DecalGeometry;
  window.THREE_READY = true;
  
  return { THREE, GLTFLoader, OrbitControls, DecalGeometry };
}

(async () => {
  try {
    // 1º intento: CDN primaria
    window.CAMIART_ENV = isLocal ? 'local' : 'server';
    console.log(`[three-loader] Entorno detectado: ${isLocal ? '🖥️ LOCAL' : '☁️ SERVER'} — cargando desde CDN primaria...`);
    
    await loadFromCDN(CDN_PRIMARY);
    console.log(`[three-loader] ✅ Three.js v0.178.0 cargado (${window.CAMIART_ENV})`);
  } catch (err) {
    console.warn('[three-loader] ⚠️ CDN primaria falló, intentando mirror...', err);
    
    try {
      // 2º intento: mirror CDN
      await loadFromCDN(CDN_MIRROR);
      console.log(`[three-loader] ✅ Three.js v0.178.0 cargado desde mirror (${window.CAMIART_ENV})`);
    } catch (err2) {
      console.error('[three-loader] ❌ Todas las fuentes CDN fallaron:', err2);
      window.THREE_ERROR = new Error(
        `No se pudo cargar Three.js desde CDN. ` +
        `Entorno: ${window.CAMIART_ENV}. ` +
        `Si estás en local, asegúrate de que el CSP en next.config.ts incluya cdn.jsdelivr.net. ` +
        `Error: ${err2.message}`
      );
    }
  }
})();
