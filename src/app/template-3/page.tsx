'use client';

import { useEffect, useRef, useState } from 'react';
import { ensureThreeModules } from '@/lib/three-modules';

// ─── Detección de entorno (cliente) ────────────────────────────────────
// Nota: se inicializa como 'server' porque SSR no tiene window.
// El useEffect en el componente la corrige al montar en cliente.
function detectEnv(): { label: string; css: string; isLocal: boolean } {
  if (typeof window === 'undefined') return { label: '☁️ Server', css: 'border-sky-500/40 text-sky-300', isLocal: false };
  const local = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('.local');
  return {
    label: local ? '🖥️ Local' : '☁️ Server',
    css: local ? 'border-lime-500/40 text-lime-300' : 'border-sky-500/40 text-sky-300',
    isLocal: local,
  };
}

const MODEL_SRC = '/models/camiseta-camiart.glb';
const FALLBACK_LOGO_SRC = '/textures/camiart-logo.png';

type PlacementZone = 'chest-large' | 'back-large' | 'chest-small-left';
type ShirtColorId = 'white' | 'red' | 'black';

type UploadedDesign = {
  id: string;
  name: string;
  source: string;
};

type DecalDraft = {
  mesh: any;
  shadowMesh?: any;
  point: any;
  normal: any;
  texture: any;
  designName: string;
  zone: PlacementZone;
};

type FixedDesign = {
  id: string;
  name: string;
  zone: PlacementZone;
};

type RuntimeState = {
  THREE: any;
  DecalGeometry: any;
  scene: any;
  camera: any;
  renderer: any;
  controls: any;
  raycaster: any;
  mouse: any;
  targetMesh: any;
  allMeshes: any[];
  modelRoot: any;
  draft: DecalDraft | null;
  fixedDecals: DecalDraft[];
};

const zoneLabels: Record<PlacementZone, string> = {
  'chest-large': 'Pecho grande',
  'back-large': 'Espalda grande',
  'chest-small-left': 'Pecho pequeño izquierdo',
};

const zoneCamera: Record<PlacementZone, [number, number, number]> = {
  'chest-large': [0, 1.05, -5.8],
  'back-large': [0, 1.05, 5.8],
  'chest-small-left': [0, 1.05, -5.8],
};

const zoneRay: Record<PlacementZone, [number, number]> = {
  'chest-large': [0, 0.15],
  'back-large': [0, 0.0],
  'chest-small-left': [-0.34, 0.12],
};

const zoneProjectionNormal: Record<PlacementZone, [number, number, number]> = {
  'chest-large': [0, 0, -1],
  'back-large': [0, 0, 1],
  'chest-small-left': [0, 0, -1],
};

/** Proporción del decal respecto al ancho de la zona (0-1) */
const zoneProportion: Record<PlacementZone, number> = {
  'chest-large': 0.28,
  'back-large': 0.28,
  'chest-small-left': 0.18,
};

/** Rango del slider de tamaño por zona [min, max] */
const zoneSizeRange: Record<PlacementZone, [number, number]> = {
  'chest-large': [0.08, 0.60],
  'back-large': [0.08, 0.60],
  'chest-small-left': [0.06, 0.42],
};

const shirtColors: Array<{ id: ShirtColorId; label: string; hex: string; border: string }> = [
  { id: 'white', label: 'Blanco', hex: '#ffffff', border: 'border-white/70' },
  { id: 'red', label: 'Rojo', hex: '#c81f25', border: 'border-red-300/70' },
  { id: 'black', label: 'Negro', hex: '#0b0b0d', border: 'border-white/25' },
];

const disposeMaterial = (material: any) => {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((item) => disposeMaterial(item));
    return;
  }

  if (material.map) material.map.dispose();
  if (material.alphaMap) material.alphaMap.dispose();
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  if (material.envMap) material.envMap.dispose();
  material.dispose();
};

const disposeDecal = (runtime: RuntimeState, decal: DecalDraft | null) => {
  if (!decal) return;
  runtime.scene.remove(decal.mesh);
  decal.mesh.geometry.dispose();
  disposeMaterial(decal.mesh.material);
  // Limpiar sombra si existe
  if (decal.shadowMesh) {
    runtime.scene.remove(decal.shadowMesh);
    decal.shadowMesh.geometry.dispose();
    decal.shadowMesh.material.dispose();
  }
};

/** Genera una textura de máscara circular con bordes súper suaves (feathering).
 *  Transición gradual: 70% sólido → 30% fundido para integración natural con la tela. */
function createFeatherMask(THREE: any, size: number): any {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0.0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.55, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.72, 'rgba(255,255,255,0.92)');
  gradient.addColorStop(0.85, 'rgba(255,255,255,0.50)');
  gradient.addColorStop(0.95, 'rgba(255,255,255,0.15)');
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/** Genera un mapa de normales procedural de tela (lienzo/canvas).
 *  Crea micro-arrugas aleatorias para simular textil real. */
function createFabricNormalMap(THREE: any, size: number): any {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Ruido base
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor((i / 4) / size);
    // Ruido Perlin simplificado con ondas
    const n1 = Math.sin(x * 0.15) * Math.cos(y * 0.12) * 20;
    const n2 = Math.sin(x * 0.3 + y * 0.25) * Math.cos(y * 0.2 - x * 0.18) * 12;
    const n3 = Math.random() * 8;
    const val = 128 + n1 + n2 + n3;
    data[i] = val;     // R → normal X
    data[i + 1] = val; // G → normal Y
    data[i + 2] = 255; // B → normal Z
    data[i + 3] = 255; // A
  }
  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

/** Genera un environment map simple (gradiente circular) para reflejos suaves. */
function createSoftEnvMap(THREE: any): any {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - cx) / cx, dy = (y - cy) / cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;
      const brightness = Math.max(0, 1 - dist * 0.7) * 255;
      data[i] = brightness;
      data[i + 1] = brightness * 0.9;
      data[i + 2] = brightness * 0.8;
      data[i + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size);
  texture.needsUpdate = true;
  return texture;
}

const createDecalMap = (sourceTexture: any, isFlipped: boolean) => {
  const texture = sourceTexture.clone();
  texture.needsUpdate = true;

  if (isFlipped) {
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }

  return texture;
};

const createDecal = (
  runtime: RuntimeState,
  texture: any,
  designName: string,
  zone: PlacementZone,
  point: any,
  normal: any,
  sizeValue: number,
  opacityValue: number,
  isFlipped: boolean,
  rotationDeg?: number,
  customTarget?: any,
) => {
  const { THREE, DecalGeometry } = runtime;
  const targetMesh = customTarget || runtime.targetMesh;
  if (!targetMesh) throw new Error('No target mesh for decal');

  const projDir = normal.clone().normalize();
  const up = new THREE.Vector3(0, 0, 1);
  const q = new THREE.Quaternion().setFromUnitVectors(up, projDir);
  const orientation = new THREE.Euler().setFromQuaternion(q);

  // Aplicar rotación adicional sobre el eje de proyección
  if (rotationDeg) {
    const rotRad = THREE.MathUtils.degToRad(rotationDeg);
    const rotQ = new THREE.Quaternion().setFromAxisAngle(projDir, rotRad);
    q.multiply(rotQ);
    orientation.setFromQuaternion(q);
  }

  const size = new THREE.Vector3(sizeValue, sizeValue, 2.0);
  const decalMap = createDecalMap(texture, isFlipped);

  const geometry = new DecalGeometry(targetMesh, point, orientation, size);

  // Máscara de feathering para bordes suaves
  const featherMask = createFeatherMask(THREE, 512);

  const material = new THREE.MeshStandardMaterial({
    map: decalMap,
    alphaMap: featherMask,
    transparent: true,
    opacity: opacityValue,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
    roughness: 0.65,
    metalness: 0.0,
    envMap: createSoftEnvMap(THREE),
    envMapIntensity: 0.35,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(point);
  runtime.scene.add(mesh);

  // ─── Sombra del decal (decal oscuro ligeramente desplazado) ─────
  let shadowMesh: any = null;
  try {
    const shadowSize = new THREE.Vector3(sizeValue * 1.04, sizeValue * 1.04, 2.0);
    const shadowGeo = new DecalGeometry(targetMesh, point, orientation, shadowSize);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: opacityValue * 0.12,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3,
      side: THREE.DoubleSide,
    });
    shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    const shadowOffset = projDir.clone().multiplyScalar(-0.001);
    shadowMesh.position.copy(point.clone().add(shadowOffset));
    runtime.scene.add(shadowMesh);
  } catch (e) {
    // sombra opcional — no crítica
  }

  return {
    mesh,
    shadowMesh,
    point: point.clone(),
    normal: normal.clone(),
    texture,
    designName,
    zone,
  };
};

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });
};

const applyShirtColor = (runtime: RuntimeState | null, colorHex: string) => {
  if (!runtime?.targetMesh) return;

  const applyMaterialColor = (material: any) => {
    if (!material?.color) return;
    material.color.set(colorHex);
    material.needsUpdate = true;
  };

  if (Array.isArray(runtime.targetMesh.material)) {
    runtime.targetMesh.material.forEach((material: any) => applyMaterialColor(material));
  } else {
    applyMaterialColor(runtime.targetMesh.material);
  }
};

const Template3Page = () => {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);
  const currentTextureRef = useRef<any>(null);
  const currentDesignNameRef = useRef('Logo CamiArt');
  const draggingRef = useRef(false);
  const decalScaleRef = useRef(0.62);
  const decalOpacityRef = useRef(0.95);
  const decalRotationRef = useRef(0);
  const selectedZoneRef = useRef<PlacementZone>('chest-large');
  const isReviewModeRef = useRef(false);
  const [decalScale, setDecalScale] = useState(0.62);
  const [decalOpacity, setDecalOpacity] = useState(0.95);
  const [decalRotation, setDecalRotation] = useState(0);
  const [status, setStatus] = useState('Inicializando editor 3D...');
  const [isReady, setIsReady] = useState(false);
  const [selectedZone, setSelectedZone] = useState<PlacementZone>('chest-large');
  const [shirtColor, setShirtColor] = useState<ShirtColorId>('white');
  const [uploadedDesign, setUploadedDesign] = useState<UploadedDesign | null>(null);
  const [fixedDesigns, setFixedDesigns] = useState<FixedDesign[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showContour, setShowContour] = useState(false);
  // SSR siempre renderiza 'server'; cliente corrige en useEffect
  const [envInfo, setEnvInfo] = useState({ label: '☁️ Server', css: 'border-sky-500/40 text-sky-300', isLocal: false });
  const contourRef = useRef<any>(null);

  // Corregir detección de entorno en cliente (SSR → always 'server')
  useEffect(() => {
    setEnvInfo(detectEnv());
  }, []);

  const setControlsEnabled = (enabled: boolean) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.controls.enabled = enabled;
    runtime.controls.enableZoom = enabled;
    runtime.controls.autoRotate = enabled;
  };

  const focusZone = (zone: PlacementZone) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.camera.position.set(...zoneCamera[zone]);
    runtime.controls.target.set(0, 1.02, 0);
    runtime.controls.update();
  };

  const getPlacementFromZone = (zone: PlacementZone) => {
    const runtime = runtimeRef.current;
    if (!runtime?.modelRoot) return null;

    runtime.scene.updateMatrixWorld(true);

    const { THREE } = runtime;
    const box = new THREE.Box3().setFromObject(runtime.modelRoot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // 1. Calcular punto aproximado desde la caja de la zona
    const normalDir = new THREE.Vector3(...zoneProjectionNormal[zone]).normalize();
    let approxPoint: any;

    if (zone === 'back-large') {
      approxPoint = new THREE.Vector3(center.x, center.y + size.y * 0.04, box.max.z);
    } else if (zone === 'chest-small-left') {
      approxPoint = new THREE.Vector3(center.x - size.x * 0.20, center.y + size.y * 0.04, box.min.z);
      normalDir.set(-1, 0, 0);
    } else {
      approxPoint = new THREE.Vector3(center.x, center.y + size.y * 0.04, box.min.z);
    }

    // 2. Disparar rayo DESDE FUERA del modelo hacia la superficie
    //    Esto nos da el punto EXACTO sobre la malla y su normal real
    const rayOrigin = approxPoint.clone().add(normalDir.clone().multiplyScalar(3.0));
    const rayDir = normalDir.clone().negate();
    const raycaster = new THREE.Raycaster(rayOrigin, rayDir, 0, 6.0);
    const hits = raycaster.intersectObjects(runtime.scene.children, true);

    if (!hits.length) {
      // Fallback: usar punto aproximado y normal fija
      return { point: approxPoint, normal: normalDir, targetObject: runtime.targetMesh };
    }

    const hit = hits[0];
    const hitPoint = hit.point.clone();

    // Obtener normal real de la superficie en coordenadas del mundo
    let hitNormal = normalDir.clone();
    if (hit.face?.normal) {
      const worldNormal = hit.face.normal
        .clone()
        .transformDirection(hit.object.matrixWorld)
        .normalize();
      if (worldNormal.length() > 0.1) {
        hitNormal.copy(worldNormal);
      }
    }

    // Usar la malla específica que fue impactada como target del DecalGeometry
    const targetObject = hit.object;

    return { point: hitPoint, normal: hitNormal, targetObject };
  };

  const rebuildDraft = (point?: any, normal?: any, zoneWidth?: number, customTarget?: any) => {
    const runtime = runtimeRef.current;
    const texture = currentTextureRef.current;
    if (!runtime?.scene || !texture) return;

    const placement =
      point && normal
        ? { point, normal, targetObject: customTarget }
        : getPlacementFromZone(selectedZoneRef.current);

    if (!placement) {
      setStatus('No se encontró superficie de camiseta para esa zona.');
      return;
    }

    disposeDecal(runtime, runtime.draft);
    runtime.draft = createDecal(
      runtime,
      texture,
      currentDesignNameRef.current,
      selectedZoneRef.current,
      placement.point,
      placement.normal,
      decalScaleRef.current,
      decalOpacityRef.current,
      false,
      decalRotationRef.current,
      placement.targetObject,
    );
    setStatus(`Borrador colocado en ${zoneLabels[selectedZoneRef.current]}`);
  };

  const selectZone = (zone: PlacementZone) => {
    selectedZoneRef.current = zone;
    setSelectedZone(zone);

    // Calcular tamaño proporcional al ancho de la zona
    const runtime = runtimeRef.current;
    if (runtime?.modelRoot) {
      runtime.scene.updateMatrixWorld(true);
      const totalBox = new runtime.THREE.Box3().setFromObject(runtime.modelRoot);
      const totalSize = totalBox.getSize(new runtime.THREE.Vector3());
      const proposedSize = totalSize.x * zoneProportion[zone];
      // Ajustar al rango permitido
      const [minVal, maxVal] = zoneSizeRange[zone];
      const clampedSize = Math.max(minVal, Math.min(maxVal, proposedSize));
      decalScaleRef.current = clampedSize;
      setDecalScale(clampedSize);
    } else {
      const defaultSize = 0.40;
      decalScaleRef.current = defaultSize;
      setDecalScale(defaultSize);
    }

    decalRotationRef.current = 0;
    setDecalRotation(0);
    setIsReviewMode(false);
    isReviewModeRef.current = false;
    setControlsEnabled(false);
    focusZone(zone);
    rebuildDraft();
  };

  const handleImageUpload = async (file: File | undefined) => {
    const runtime = runtimeRef.current;
    if (!runtime || !file) return;

    const source = await readFileAsDataUrl(file);
    const texture = await new Promise<any>((resolve, reject) => {
      const loader = new runtime.THREE.TextureLoader();
      loader.load(
        source,
        (loadedTexture: any) => {
          loadedTexture.colorSpace = runtime.THREE.SRGBColorSpace;
          loadedTexture.anisotropy = runtime.renderer.capabilities.getMaxAnisotropy();
          loadedTexture.generateMipmaps = true;
          loadedTexture.minFilter = runtime.THREE.LinearMipmapLinearFilter;
          loadedTexture.magFilter = runtime.THREE.LinearFilter;
          resolve(loadedTexture);
        },
        undefined,
        () => reject(new Error('No se pudo cargar la imagen seleccionada.')),
      );
    });

    if (currentTextureRef.current && currentTextureRef.current !== texture) {
      currentTextureRef.current.dispose();
    }

    const design = {
      id: `${Date.now()}`,
      name: file.name,
      source,
    };
    currentTextureRef.current = texture;
    currentDesignNameRef.current = file.name;
    setUploadedDesign(design);
    setIsReviewMode(false);
    isReviewModeRef.current = false;
    setControlsEnabled(false);
    rebuildDraft();
  };

  const fixDraft = () => {
    const runtime = runtimeRef.current;
    if (!runtime?.draft) {
      setStatus('Selecciona una zona y una imagen antes de fijar el diseño.');
      return;
    }

    const fixedDraft = runtime.draft;
    runtime.fixedDecals.push(fixedDraft);
    runtime.draft = null;
    setFixedDesigns((current) => [
      ...current,
      {
        id: `${Date.now()}-${current.length}`,
        name: fixedDraft.designName,
        zone: fixedDraft.zone,
      },
    ]);
    setStatus(`${fixedDraft.designName} fijado en ${zoneLabels[fixedDraft.zone]}`);
    setIsReviewMode(true);
    isReviewModeRef.current = true;
    setControlsEnabled(true);
  };

  const clearDraft = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    disposeDecal(runtime, runtime.draft);
    runtime.draft = null;
    setStatus('Borrador eliminado. Puedes seleccionar otra zona o subir otra imagen.');
  };

  const clearAllDesigns = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    disposeDecal(runtime, runtime.draft);
    runtime.draft = null;
    runtime.fixedDecals.forEach((decal) => disposeDecal(runtime, decal));
    runtime.fixedDecals = [];
    setFixedDesigns([]);
    setIsReviewMode(false);
    isReviewModeRef.current = false;
    setControlsEnabled(false);
    focusZone(selectedZoneRef.current);
    setStatus('Diseños eliminados. Empieza de nuevo seleccionando zona e imagen.');
  };

  const toggleContour = () => {
    const runtime = runtimeRef.current;
    if (!runtime?.modelRoot) return;

    const next = !showContour;
    setShowContour(next);

    if (next) {
      // Crear malla de contorno (EdgesGeometry) para visualizar los pliegues
      const { THREE } = runtime;
      const contourGroup = new THREE.Group();
      contourGroup.name = 'contour-overlay';

      runtime.modelRoot.traverse((child: any) => {
        if (!child.isMesh || !child.geometry) return;
        const edges = new THREE.EdgesGeometry(child.geometry, 30);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0.35,
          depthTest: true,
        });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        wireframe.position.copy(child.position);
        wireframe.quaternion.copy(child.quaternion);
        wireframe.scale.copy(child.scale);
        contourGroup.add(wireframe);
      });

      runtime.scene.add(contourGroup);
      contourRef.current = contourGroup;
      setStatus('🔲 Contorno de malla activado — guía visual de pliegues.');
    } else {
      // Eliminar contorno
      if (contourRef.current) {
        const group = contourRef.current;
        runtime.scene.remove(group);
        group.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        contourRef.current = null;
      }
      setStatus('Contorno de malla desactivado.');
    }
  };

  const selectShirtColor = (colorId: ShirtColorId) => {
    const color = shirtColors.find((item) => item.id === colorId);
    if (!color) return;

    setShirtColor(colorId);
    applyShirtColor(runtimeRef.current, color.hex);
    // Reconstruir borrador si había uno activo
    if (!isReviewModeRef.current) {
      rebuildDraft();
    }
    setStatus(`Camiseta en color ${color.label.toLowerCase()}.`);
  };

  useEffect(() => {
    decalScaleRef.current = decalScale;
    if (!isReviewModeRef.current) {
      rebuildDraft();
    }
  }, [decalScale]);

  useEffect(() => {
    decalOpacityRef.current = decalOpacity;
    if (!isReviewModeRef.current) {
      rebuildDraft();
    }
  }, [decalOpacity]);

  useEffect(() => {
    decalRotationRef.current = decalRotation;
    if (!isReviewModeRef.current) {
      rebuildDraft();
    }
  }, [decalRotation]);

  useEffect(() => {
    let cancelled = false;
    const disposers: Array<() => void> = [];

    const placeDraftAtPointer = (runtime: RuntimeState, event: PointerEvent, shouldDrag = false) => {
      if (isReviewModeRef.current || !runtime.draft) return;

      const host = canvasHostRef.current;
      if (!host || !runtime.scene) return;

      const rect = host.getBoundingClientRect();
      runtime.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      runtime.mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      runtime.scene.updateMatrixWorld(true);
      runtime.raycaster.setFromCamera(runtime.mouse, runtime.camera);

      const hits = runtime.raycaster.intersectObjects(runtime.scene.children, true);
      if (!hits.length) return;

      const hit = hits[0];
      const cameraNormal = runtime.camera.getWorldDirection(new runtime.THREE.Vector3()).negate().normalize();
      const surfaceNormal = hit.face?.normal
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
        : cameraNormal;
      const fixedProjectionNormal = new runtime.THREE.Vector3(...zoneProjectionNormal[selectedZoneRef.current]);

      if (surfaceNormal.dot(cameraNormal) < 0.32) {
        setStatus(`Mantén el diseño dentro del área de ${zoneLabels[selectedZoneRef.current]}.`);
        return;
      }

      rebuildDraft(hit.point, fixedProjectionNormal, undefined, hit.object);
      setStatus(`Borrador movido en ${zoneLabels[selectedZoneRef.current]}`);
      if (shouldDrag) {
        draggingRef.current = true;
      }
    };

    const initialize = async () => {
      setStatus('Cargando Three.js...');
      const { THREE, GLTFLoader, OrbitControls, DecalGeometry } = await ensureThreeModules();

      if (cancelled) return;

      const host = canvasHostRef.current;
      if (!host) return;

      const scene = new THREE.Scene();
      // Fondo degradado suave en vez de color plano
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 2;
      bgCanvas.height = 256;
      const bgCtx = bgCanvas.getContext('2d')!;
      const bgGrad = bgCtx.createLinearGradient(0, 0, 0, 256);
      bgGrad.addColorStop(0, '#1a1d24');
      bgGrad.addColorStop(0.5, '#0c0e11');
      bgGrad.addColorStop(1, '#050608');
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, 2, 256);
      const bgTexture = new THREE.CanvasTexture(bgCanvas);
      scene.background = bgTexture;
      // Sin fog — el fondo degradado ya da profundidad

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(...zoneCamera['chest-large']);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x0c0e11, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      host.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 3.8;
      controls.maxDistance = 7.2;
      controls.maxPolarAngle = Math.PI * 0.78;
      controls.minPolarAngle = Math.PI * 0.18;
      controls.target.set(0, 1.02, 0);
      controls.enabled = false;
      controls.enableZoom = false;
      controls.autoRotate = false;

      scene.add(new THREE.AmbientLight(0xffffff, 1.25));

      // Luz principal — más suave y desde arriba (simula luz de estudio)
      const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.4);
      keyLight.position.set(2.5, 6, 3.5);
      scene.add(keyLight);

      // Luz de relleno cálida — simula rebote de superficie
      const fillLight = new THREE.DirectionalLight(0xffd599, 0.9);
      fillLight.position.set(-3.5, 1.5, 2.5);
      scene.add(fillLight);

      // Luz de contraste / rim — fría, desde atrás
      const rimLight = new THREE.DirectionalLight(0x88ccff, 0.7);
      rimLight.position.set(0.5, 2.5, -4);
      scene.add(rimLight);

      // Luz desde abajo para iluminar pliegues inferiores
      const bottomLight = new THREE.DirectionalLight(0xccd9ff, 0.3);
      bottomLight.position.set(0, -3, 0);
      scene.add(bottomLight);

      const fallbackTexture = await new Promise<any>((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
          FALLBACK_LOGO_SRC,
          (texture: any) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          },
          undefined,
          () => reject(new Error('No se pudo cargar el logo inicial.')),
        );
      });

      const gltf = await new Promise<any>((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(
          MODEL_SRC,
          resolve,
          undefined,
          () => reject(new Error('No se pudo cargar el modelo GLB.')),
        );
      });

      if (cancelled) return;

      const modelRoot = gltf.scene;
      const fabricNormalMap = createFabricNormalMap(THREE, 128);
      modelRoot.traverse((child: any) => {
        if (!child.isMesh) return;
        child.frustumCulled = false;

        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => {
            if (material?.map) material.map.colorSpace = THREE.SRGBColorSpace;
            if (material) {
              material.normalMap = fabricNormalMap;
              material.normalScale = new THREE.Vector2(0.15, 0.15);
              material.needsUpdate = true;
            }
          });
        } else if (child.material) {
          if (child.material.map) child.material.map.colorSpace = THREE.SRGBColorSpace;
          child.material.normalMap = fabricNormalMap;
          child.material.normalScale = new THREE.Vector2(0.15, 0.15);
          child.material.needsUpdate = true;
        }
      });

      const rawBox = new THREE.Box3().setFromObject(modelRoot);
      const rawSize = rawBox.getSize(new THREE.Vector3());
      const rawCenter = rawBox.getCenter(new THREE.Vector3());
      const scale = 3.15 / Math.max(rawSize.y, 0.001);
      modelRoot.scale.setScalar(scale);
      modelRoot.position.set(-rawCenter.x * scale, -rawCenter.y * scale + 1.02, -rawCenter.z * scale);
      modelRoot.rotation.y = Math.PI;
      scene.add(modelRoot);

      let shirtMesh: any = null;
      let biggestVolume = -Infinity;
      const allMeshes: any[] = [];
      modelRoot.traverse((child: any) => {
        if (!child.isMesh || !child.geometry) return;
        allMeshes.push(child);
        const childBox = new THREE.Box3().setFromObject(child);
        const childSize = childBox.getSize(new THREE.Vector3());
        const volume = childSize.x * childSize.y * childSize.z;
        if (volume > biggestVolume) {
          biggestVolume = volume;
          shirtMesh = child;
        }
      });

      const runtime: RuntimeState = {
        THREE,
        DecalGeometry,
        scene,
        camera,
        renderer,
        controls,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        targetMesh: shirtMesh,
        allMeshes,
        modelRoot,
        draft: null,
        fixedDecals: [],
      };

      runtimeRef.current = runtime;
      // Forzar actualización de matrices para que el raycaster funcione desde el primer frame
      scene.updateMatrixWorld(true);
      applyShirtColor(runtime, shirtColors.find((color) => color.id === shirtColor)?.hex ?? '#ffffff');
      currentTextureRef.current = fallbackTexture;
      currentDesignNameRef.current = 'Logo CamiArt';
      setUploadedDesign({
        id: 'fallback-logo',
        name: 'Logo CamiArt',
        source: FALLBACK_LOGO_SRC,
      });

      // ─── Colocar diseño por defecto en las 3 zonas automáticamente ───
      const defaultZones: PlacementZone[] = ['chest-large', 'back-large', 'chest-small-left'];
      const fixedDecalsList: FixedDesign[] = [];

      for (const zone of defaultZones) {
        const placement = getPlacementFromZone(zone);
        if (!placement) continue;

        const zoneSize = zoneProportion[zone];
        const totalBox = new THREE.Box3().setFromObject(modelRoot);
        const totalSz = totalBox.getSize(new THREE.Vector3());
        const proposedSize = totalSz.x * zoneSize;
        const [minVal, maxVal] = zoneSizeRange[zone];
        const clampedSize = Math.max(minVal, Math.min(maxVal, proposedSize));

        const decal = createDecal(
          runtime,
          fallbackTexture,
          'Logo CamiArt',
          zone,
          placement.point,
          placement.normal,
          clampedSize,
          0.95,
          false,
          0,
          placement.targetObject,
        );

        runtime.fixedDecals.push(decal);
        fixedDecalsList.push({ id: `default-${zone}`, name: 'Logo CamiArt', zone });
      }

      setFixedDesigns(fixedDecalsList);

      // Dejar el draft en Pecho grande (zona activa por defecto)
      selectedZoneRef.current = 'chest-large';
      setSelectedZone('chest-large');
      setIsReady(true);
      isReviewModeRef.current = true;
      setControlsEnabled(true);
      setStatus(`Diseño colocado en las 3 zonas. Selecciona una para ajustar.`);

      const updateSize = () => {
        const width = Math.max(host.clientWidth, 1);
        const height = Math.max(host.clientHeight, 1);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const onPointerDown = (event: PointerEvent) => {
        placeDraftAtPointer(runtime, event, true);
        try {
          renderer.domElement.setPointerCapture(event.pointerId);
        } catch {
          // noop
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!draggingRef.current) return;
        placeDraftAtPointer(runtime, event);
      };

      const onPointerUp = (event: PointerEvent) => {
        draggingRef.current = false;
        try {
          renderer.domElement.releasePointerCapture(event.pointerId);
        } catch {
          // noop
        }
      };

      const onContextLost = (event: Event) => {
        event.preventDefault();
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointerleave', onPointerUp);
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
      window.addEventListener('resize', updateSize);
      updateSize();
      focusZone('chest-large');

      const animate = () => {
        if (cancelled) return;
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };
      animate();

      disposers.push(() => {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointerleave', onPointerUp);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        window.removeEventListener('resize', updateSize);
        controls.dispose();
        // Limpiar contorno si existe
        if (contourRef.current) {
          const group = contourRef.current;
          scene.remove(group);
          group.traverse((obj: any) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          contourRef.current = null;
        }
        // Limpiar fondo degradado
        if (scene.background && typeof scene.background.dispose === 'function') {
          scene.background.dispose();
        }
        scene.traverse((object: any) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) disposeMaterial(object.material);
        });
        currentTextureRef.current?.dispose();
        renderer.dispose();
        renderer.domElement.parentElement?.removeChild(renderer.domElement);
      });
    };

    void initialize().catch((error) => {
      if (!cancelled) {
        setStatus(error instanceof Error ? error.message : 'No se pudo inicializar el editor 3D.');
        console.error(error);
      }
    });

    return () => {
      cancelled = true;
      draggingRef.current = false;
      disposers.forEach((dispose) => dispose());
      runtimeRef.current = null;
      setIsReady(false);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0c0e11] px-4 py-8 text-white md:px-8">
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-2xl border border-orange-400/20 bg-[#11141a] p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Template 3 · Editor 3D</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Serigrafía 3D sobre camiseta</h1>
          <p className="mt-4 text-sm leading-7 text-orange-100/85">
            Elige un área, carga una imagen, ajústala sobre la camiseta y fija cada diseño antes de revisar el resultado en 3D.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-[#0c0e11] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-orange-200">1. Color de camiseta</p>
            <div className="flex gap-3">
              {shirtColors.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  title={color.label}
                  onClick={() => selectShirtColor(color.id)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    shirtColor === color.id
                      ? 'scale-110 border-orange-400 ring-2 ring-orange-400/40'
                      : `${color.border} hover:scale-105`
                  }`}
                  style={{ backgroundColor: color.hex }}
                  aria-label={color.label}
                  aria-pressed={shirtColor === color.id}
                />
              ))}
              <span className="self-center text-xs text-white/50">
                {shirtColors.find((c) => c.id === shirtColor)?.label}
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-[#0c0e11] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-orange-200">2. Área de estampado</p>
            <div className="grid grid-cols-1 gap-2">
              {(['chest-large', 'back-large', 'chest-small-left'] as PlacementZone[]).map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() => selectZone(zone)}
                  className={`rounded-lg px-4 py-2 text-left text-xs font-semibold transition-all ${
                    selectedZone === zone && !isReviewMode
                      ? 'bg-orange-500 text-white'
                      : 'border border-orange-400/30 bg-transparent text-orange-300 hover:bg-orange-500/10'
                  }`}
                >
                  {zoneLabels[zone]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#0c0e11] p-4">
            <label className="grid gap-3 text-xs uppercase tracking-[0.16em] text-orange-200">
              3. Imagen
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => {
                  void handleImageUpload(event.target.files?.[0]);
                  event.currentTarget.value = '';
                }}
                className="block w-full text-xs text-white/75 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-orange-400"
              />
            </label>

            {uploadedDesign && (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                <div
                  aria-hidden="true"
                  className="h-12 w-12 rounded-lg bg-white bg-contain bg-center bg-no-repeat p-1"
                  style={{ backgroundImage: `url(${uploadedDesign.source})` }}
                />
                <p className="min-w-0 truncate text-xs text-white/70">{uploadedDesign.name}</p>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#0c0e11] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-orange-200">4. Ajuste y fijado</p>
            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Tamaño ({(decalScale * 100).toFixed(0)}% del ancho)
              <input
                type="range"
                min={zoneSizeRange[selectedZone][0]}
                max={zoneSizeRange[selectedZone][1]}
                step="0.01"
                value={decalScale}
                onChange={(event) => setDecalScale(Number(event.target.value))}
                className="mt-3 w-full accent-orange-400"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Opacidad
              <input
                type="range"
                min="0.35"
                max="1"
                step="0.01"
                value={decalOpacity}
                onChange={(event) => setDecalOpacity(Number(event.target.value))}
                className="mt-3 w-full accent-orange-400"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Rotación {decalRotation}°
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={decalRotation}
                onChange={(event) => setDecalRotation(Number(event.target.value))}
                className="mt-3 w-full accent-orange-400"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fixDraft}
                className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400"
              >
                Fijar diseño
              </button>
              <button
                type="button"
                onClick={clearDraft}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10"
              >
                Quitar borrador
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsReviewMode(true);
                isReviewModeRef.current = true;
                setControlsEnabled(fixedDesigns.length > 0);
              }}
              disabled={fixedDesigns.length === 0}
              className="rounded-lg border border-orange-400/40 px-4 py-2 text-xs font-semibold text-orange-200 transition enabled:hover:bg-orange-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ver en 3D
            </button>

            <div className="mt-2 border-t border-white/5 pt-3">
              <button
                type="button"
                onClick={toggleContour}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                  showContour
                    ? 'border-orange-400/60 bg-orange-500/15 text-orange-200'
                    : 'border-white/10 text-white/55 hover:border-white/20 hover:text-white/75'
                }`}
              >
                <span>{showContour ? '◉' : '○'}</span>
                Malla de contorno (pliegues)
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0c0e11] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.16em] text-orange-200">Diseños fijados</p>
              <button
                type="button"
                onClick={clearAllDesigns}
                className="text-xs font-semibold text-white/55 transition hover:text-white"
              >
                Limpiar
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {fixedDesigns.length === 0 ? (
                <p className="text-xs leading-6 text-white/50">Todavía no hay diseños fijados.</p>
              ) : (
                fixedDesigns.map((design) => (
                  <div key={design.id} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">
                    <span className="text-white">{design.name}</span> · {zoneLabels[design.zone]}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-3 md:p-4">
          <div ref={canvasHostRef} className="h-[620px] w-full overflow-hidden rounded-xl bg-[#0c0e11]" />

          {/* Badge de entorno — esquina superior izquierda */}
          {isReady && (
            <div
              className={`pointer-events-none absolute left-4 top-4 z-10 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm ${envInfo.css}`}
            >
              {envInfo.label}
            </div>
          )}

          {!isReady && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[#0c0e11]/80 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.18em] text-orange-300">Cargando modelo 3D...</p>
                <p className="mt-2 text-[10px] uppercase tracking-widest text-white/30">
                  Entorno: {envInfo.label} · Three.js v0.178
                </p>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-xl border border-white/10 bg-[#0c0e11]/78 px-4 py-3 text-xs text-white/75 backdrop-blur-md">
            <span className="text-orange-300">{isReviewMode ? 'Revisión 3D:' : 'Diseño:'}</span> {status}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Template3Page;
