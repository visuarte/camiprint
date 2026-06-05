'use client';

import { useEffect, useRef, useState } from 'react';

const MODEL_SRC = '/models/camiseta-camiart.glb';
const FALLBACK_LOGO_SRC = '/textures/camiart-logo.png';
const THREE_LOADER_SRC = '/three-loader.js';
const THREE_LOADER_ID = 'camiart-three-loader';

type PlacementZone = 'chest-large' | 'back-large' | 'chest-small-left';
type ShirtColorId = 'white' | 'red' | 'black';

type UploadedDesign = {
  id: string;
  name: string;
  source: string;
};

type DecalDraft = {
  mesh: any;
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
  'chest-large': [0, 1.05, 5.8],
  'back-large': [0, 1.05, -5.8],
  'chest-small-left': [0, 1.05, 5.8],
};

const zoneRay: Record<PlacementZone, [number, number]> = {
  'chest-large': [0, 0.15],
  'back-large': [0, 0.1],
  'chest-small-left': [-0.34, 0.12],
};

const zoneProjectionNormal: Record<PlacementZone, [number, number, number]> = {
  'chest-large': [0, 0, 1],
  'back-large': [0, 0, -1],
  'chest-small-left': [0, 0, 1],
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
  if (material.normalMap) material.normalMap.dispose();
  if (material.roughnessMap) material.roughnessMap.dispose();
  if (material.metalnessMap) material.metalnessMap.dispose();
  if (material.alphaMap) material.alphaMap.dispose();
  material.dispose();
};

const disposeDecal = (runtime: RuntimeState, decal: DecalDraft | null) => {
  if (!decal) return;
  runtime.scene.remove(decal.mesh);
  decal.mesh.geometry.dispose();
  disposeMaterial(decal.mesh.material);
};

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
) => {
  const { THREE, DecalGeometry, targetMesh } = runtime;
  const projectorDirection = normal.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), projectorDirection);
  const orientation = new THREE.Euler().setFromQuaternion(quaternion);
  const size = new THREE.Vector3(sizeValue, sizeValue, 2.0);
  const decalMap = createDecalMap(texture, isFlipped);

  const geometry = new DecalGeometry(targetMesh, point, orientation, size);
  const material = new THREE.MeshPhongMaterial({
    map: decalMap,
    transparent: true,
    opacity: opacityValue,
    depthTest: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    side: THREE.DoubleSide,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(point);
  runtime.scene.add(mesh);

  return {
    mesh,
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
  const selectedZoneRef = useRef<PlacementZone>('chest-large');
  const isReviewModeRef = useRef(false);
  const [decalScale, setDecalScale] = useState(0.62);
  const [decalOpacity, setDecalOpacity] = useState(0.95);
  const [status, setStatus] = useState('Cargando Three.js...');
  const [isReady, setIsReady] = useState(false);
  const [selectedZone, setSelectedZone] = useState<PlacementZone>('chest-large');
  const [shirtColor, setShirtColor] = useState<ShirtColorId>('white');
  const [uploadedDesign, setUploadedDesign] = useState<UploadedDesign | null>(null);
  const [fixedDesigns, setFixedDesigns] = useState<FixedDesign[]>([]);
  const [isReviewMode, setIsReviewMode] = useState(false);

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
    if (!runtime?.targetMesh) return null;

    const [x, y] = zoneRay[zone];
    runtime.raycaster.setFromCamera(new runtime.THREE.Vector2(x, y), runtime.camera);
    const hits = runtime.raycaster.intersectObject(runtime.targetMesh, true);
    if (!hits.length) return null;

    const hit = hits[0];
    const normal = new runtime.THREE.Vector3(...zoneProjectionNormal[zone]);

    return { point: hit.point, normal };
  };

  const rebuildDraft = (point?: any, normal?: any) => {
    const runtime = runtimeRef.current;
    const texture = currentTextureRef.current;
    if (!runtime?.targetMesh || !texture) return;

    const placement = point && normal ? { point, normal } : getPlacementFromZone(selectedZoneRef.current);
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
    );
    setStatus(`Borrador colocado en ${zoneLabels[selectedZoneRef.current]}`);
  };

  const selectZone = (zone: PlacementZone) => {
    selectedZoneRef.current = zone;
    setSelectedZone(zone);
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

  const selectShirtColor = (colorId: ShirtColorId) => {
    const color = shirtColors.find((item) => item.id === colorId);
    if (!color) return;

    setShirtColor(colorId);
    applyShirtColor(runtimeRef.current, color.hex);
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
    let cancelled = false;
    const disposers: Array<() => void> = [];

    const placeDraftAtPointer = (runtime: RuntimeState, event: PointerEvent, shouldDrag = false) => {
      if (isReviewModeRef.current || !runtime.draft) return;

      const host = canvasHostRef.current;
      if (!host || !runtime.targetMesh) return;

      const rect = host.getBoundingClientRect();
      runtime.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      runtime.mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      runtime.raycaster.setFromCamera(runtime.mouse, runtime.camera);

      const hits = runtime.raycaster.intersectObject(runtime.targetMesh, true);
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

      rebuildDraft(hit.point, fixedProjectionNormal);
      setStatus(`Borrador movido en ${zoneLabels[selectedZoneRef.current]}`);
      if (shouldDrag) {
        draggingRef.current = true;
      }
    };

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if ((window as any).THREE_READY) {
          resolve();
          return;
        }

        if ((window as any).THREE_ERROR) {
          reject((window as any).THREE_ERROR);
          return;
        }

        const existingScript = document.getElementById(THREE_LOADER_ID);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.id = THREE_LOADER_ID;
        script.src = src;
        script.type = 'module';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initialize = async () => {
      await loadScript(THREE_LOADER_SRC);

      let attempts = 0;
      while (!((window as any).THREE_READY) && attempts < 100) {
        if ((window as any).THREE_ERROR) {
          throw (window as any).THREE_ERROR;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      const THREE = (window as any).THREE;
      const GLTFLoader = (window as any).GLTFLoader;
      const OrbitControls = (window as any).OrbitControls;
      const DecalGeometry = (window as any).DecalGeometry;

      if (!THREE || !GLTFLoader || !OrbitControls || !DecalGeometry) {
        throw new Error('Three.js modules failed to load');
      }

      if (cancelled) return;

      const host = canvasHostRef.current;
      if (!host) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c0e11);
      scene.fog = new THREE.Fog(0x0c0e11, 8, 15);

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

      scene.add(new THREE.AmbientLight(0xffffff, 1.55));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(3, 5, 4);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xff8a3d, 1.05);
      fillLight.position.set(-4, 2, 2);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x9ec7ff, 0.8);
      rimLight.position.set(0, 3, -4);
      scene.add(rimLight);

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
      modelRoot.traverse((child: any) => {
        if (!child.isMesh) return;
        child.frustumCulled = false;

        if (Array.isArray(child.material)) {
          child.material.forEach((material: any) => {
            if (material?.map) material.map.colorSpace = THREE.SRGBColorSpace;
          });
        } else if (child.material?.map) {
          child.material.map.colorSpace = THREE.SRGBColorSpace;
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
      modelRoot.traverse((child: any) => {
        if (!child.isMesh || !child.geometry) return;
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
        modelRoot,
        draft: null,
        fixedDecals: [],
      };

      runtimeRef.current = runtime;
      applyShirtColor(runtime, shirtColors.find((color) => color.id === shirtColor)?.hex ?? '#ffffff');
      currentTextureRef.current = fallbackTexture;
      currentDesignNameRef.current = 'Logo CamiArt';
      setUploadedDesign({
        id: 'fallback-logo',
        name: 'Logo CamiArt',
        source: FALLBACK_LOGO_SRC,
      });
      setIsReady(true);
      setStatus('Selecciona un área, sube una imagen y fija el diseño.');

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
              Tamaño
              <input
                type="range"
                min="0.18"
                max="1.15"
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

          {!isReady && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-[#0c0e11]/80 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-orange-300">Cargando modelo 3D...</p>
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
