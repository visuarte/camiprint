'use client';

import { useEffect, useRef, useState } from 'react';

const THREE_CDN = 'https://cdn.jsdelivr.net/npm/three@0.178.0';
const MODEL_SRC = '/models/camiseta-camiart.glb';
const LOGO_SRC = '/textures/camiart-logo.png';

type RuntimeState = {
  THREE: any;
  DecalGeometry: any;
  scene: any;
  camera: any;
  renderer: any;
  controls: any;
  raycaster: any;
  mouse: any;
  logoTexture: any;
  targetMesh: any;
  modelRoot: any;
  decalMesh: any;
  decalState: { point: any; normal: any } | null;
};

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

const rebuildDecal = (runtime: RuntimeState, point: any, normal: any, sizeValue: number, opacityValue: number, isFlipped = false) => {
  const { THREE, DecalGeometry, scene, targetMesh, logoTexture } = runtime;
  if (!targetMesh || !logoTexture) return;

  if (runtime.decalMesh) {
    scene.remove(runtime.decalMesh);
    runtime.decalMesh.geometry.dispose();
    disposeMaterial(runtime.decalMesh.material);
  }

  // Scale up the decal size for better visibility
  const scaleFactor = 1.0;
  const projectorDirection = normal.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), projectorDirection);
  const orientation = new THREE.Euler().setFromQuaternion(quaternion);
  const size = new THREE.Vector3(sizeValue * scaleFactor, sizeValue * scaleFactor, 2.0);
  
  const geometry = new DecalGeometry(targetMesh, point, orientation, size);
  const material = new THREE.MeshPhongMaterial({
    map: logoTexture,
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

  // Flip image horizontally if needed
  if (isFlipped && material.map) {
    material.map.repeat.x = -1;
    material.map.offset.x = 1;
  }

  runtime.decalMesh = new THREE.Mesh(geometry, material);
  runtime.decalMesh.position.copy(point);
  scene.add(runtime.decalMesh);
  runtime.decalState = { point: point.clone(), normal: normal.clone() };
};

const Template3Page = () => {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);
  const cameraRef = useRef<any>(null);
  const shirtMeshRef = useRef<any>(null);
  const draggingRef = useRef(false);
  const decalScaleRef = useRef(0.65);
  const decalOpacityRef = useRef(0.95);
  const isFlippedRef = useRef(false);
  const [decalScale, setDecalScale] = useState(0.65);
  const [decalOpacity, setDecalOpacity] = useState(0.95);
  const [status, setStatus] = useState('Cargando Three.js...');
  const [isReady, setIsReady] = useState(false);
  const [selectedZone, setSelectedZone] = useState<'chest-large' | 'back-large' | 'chest-small-left' | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    decalScaleRef.current = decalScale;
    const runtime = runtimeRef.current;
    if (runtime?.decalState && runtime?.THREE) {
      rebuildDecal(runtime, runtime.decalState.point, runtime.decalState.normal, decalScale, decalOpacityRef.current, isFlippedRef.current);
    }
  }, [decalScale]);

  useEffect(() => {
    decalOpacityRef.current = decalOpacity;
    const runtime = runtimeRef.current;
    if (runtime?.decalState && runtime?.THREE) {
      rebuildDecal(runtime, runtime.decalState.point, runtime.decalState.normal, decalScaleRef.current, decalOpacity, isFlippedRef.current);
    }
  }, [decalOpacity]);

  useEffect(() => {
    isFlippedRef.current = isFlipped;
    const runtime = runtimeRef.current;
    if (runtime?.decalState && runtime?.THREE) {
      rebuildDecal(runtime, runtime.decalState.point, runtime.decalState.normal, decalScaleRef.current, decalOpacityRef.current, isFlipped);
    }
  }, [isFlipped]);

  const placeOnZone = (zone: 'chest-large' | 'back-large' | 'chest-small-left') => {
    const runtime = runtimeRef.current;
    const camera = cameraRef.current;
    const shirtMesh = shirtMeshRef.current;

    if (!runtime || !camera || !shirtMesh) return;

    const THREE = runtime.THREE;
    let rayPosition: any;
    let descriptionText: string;
    let cameraPos = [0, 1.1, 5.2];

    if (zone === 'chest-large') {
      rayPosition = new THREE.Vector2(0, 0.15);
      descriptionText = 'Pecho grande';
      cameraPos = [0, 1.1, 5.2];
    } else if (zone === 'back-large') {
      rayPosition = new THREE.Vector2(0, 0.1);
      descriptionText = 'Espalda grande';
      cameraPos = [0, 1.1, -5.2];
    } else if (zone === 'chest-small-left') {
      rayPosition = new THREE.Vector2(-0.35, 0.1);
      descriptionText = 'Pecho pequeño izquierdo';
      cameraPos = [0, 1.1, 5.2];
    }

    camera.position.set(...cameraPos);

    runtime.raycaster.setFromCamera(rayPosition, camera);
    const hits = runtime.raycaster.intersectObject(shirtMesh, true);

    if (hits.length) {
      const hit = hits[0];
      let normal = camera.getWorldDirection(new THREE.Vector3()).negate();

      if (hit.face && hit.face.normal) {
        normal = hit.face.normal.clone();
        if (hit.object.parent) {
          normal.transformDirection(hit.object.matrixWorld).normalize();
        } else {
          normal.normalize();
        }
      }

      rebuildDecal(runtime, hit.point, normal, decalScaleRef.current, decalOpacityRef.current, isFlippedRef.current);
      setStatus(descriptionText);
      setSelectedZone(zone);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const disposers: Array<() => void> = [];

    const placeDecalAtPointer = (runtime: RuntimeState, event: PointerEvent, shouldDrag = false) => {
      const host = canvasHostRef.current;
      if (!host || !runtime.targetMesh) return;

      const rect = host.getBoundingClientRect();
      runtime.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      runtime.mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      runtime.raycaster.setFromCamera(runtime.mouse, runtime.camera);
      
      // Raycast against all children to find intersection
      const hits = runtime.raycaster.intersectObject(runtime.targetMesh, true);
      if (!hits.length) {
        console.warn('No mesh hit');
        return;
      }

      const hit = hits[0];
      
      // Ensure we have a valid normal
      let worldNormal;
      if (hit.face && hit.face.normal) {
        worldNormal = hit.face.normal.clone();
        // Transform to world space
        if (hit.object.parent) {
          worldNormal.transformDirection(hit.object.matrixWorld).normalize();
        } else {
          worldNormal.normalize();
        }
      } else {
        // Fallback: use camera direction
        worldNormal = runtime.camera.getWorldDirection(new runtime.THREE.Vector3()).negate();
      }

      // Place/update decal
      rebuildDecal(runtime, hit.point, worldNormal, decalScaleRef.current, decalOpacityRef.current, isFlippedRef.current);
      if (shouldDrag) {
        draggingRef.current = true;
      }
    };

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'module';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const initialize = async () => {
      // Load Three.js modules via helper script (exposes to window)
      await loadScript('/three-loader.js');

      // Wait for Three.js to be ready
      let attempts = 0;
      while (!((window as any).THREE_READY) && attempts < 100) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        attempts++;
      }

      // Access from global scope
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
      scene.fog = new THREE.Fog(0x0c0e11, 7, 14);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.set(0, 1.1, 5.2);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x0c0e11, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = false;
      host.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 3.5;
      controls.maxDistance = 8.0;
      controls.maxPolarAngle = Math.PI * 0.75;
      controls.minPolarAngle = Math.PI * 0.15;
      controls.target.set(0, 1.0, 0);
      controls.autoRotate = false;

      const ambient = new THREE.AmbientLight(0xffffff, 1.6);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(3, 5, 4);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xff8a3d, 1.2);
      fillLight.position.set(-4, 2, 2);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x9ec7ff, 0.7);
      rimLight.position.set(0, 3, -4);
      scene.add(rimLight);

      const logoTexture = await new Promise<any>((resolve, reject) => {
        const loader = new THREE.TextureLoader();
        loader.load(
          LOGO_SRC,
          (texture: any) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            resolve(texture);
          },
          undefined,
          () => reject(new Error('No se pudo cargar el logo.')),
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
        if (child.isMesh) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material: any) => {
              if (material?.map) material.map.colorSpace = THREE.SRGBColorSpace;
            });
          } else if (child.material?.map) {
            child.material.map.colorSpace = THREE.SRGBColorSpace;
          }
        }
      });

      const box = new THREE.Box3().setFromObject(modelRoot);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 3.3 / Math.max(size.y, 0.001);
      modelRoot.scale.setScalar(scale);
      modelRoot.position.sub(center.multiplyScalar(scale));
      modelRoot.position.y -= 0.18;
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

      shirtMeshRef.current = shirtMesh;

      const runtime: RuntimeState = {
        THREE,
        DecalGeometry,
        scene,
        camera,
        renderer,
        controls,
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        logoTexture,
        targetMesh: shirtMesh,
        modelRoot,
        decalMesh: null,
        decalState: null,
      };

      runtimeRef.current = runtime;
      setIsReady(true);
      setStatus('Logo listo para estampado');

      const initialPoint = (() => {
        const centerRay = new THREE.Vector2(0, 0.15);
        runtime.raycaster.setFromCamera(centerRay, camera);
        const centerHits = shirtMesh ? runtime.raycaster.intersectObject(shirtMesh, true) : [];
        if (centerHits.length) {
          return centerHits[0].point.clone();
        }

        const fallbackBox = new THREE.Box3().setFromObject(modelRoot);
        return fallbackBox.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 0.25, 0.42));
      })();

      let initialNormal = camera.getWorldDirection(new THREE.Vector3()).negate();
      if (shirtMesh) {
        const centerRay = new THREE.Vector2(0, 0.15);
        runtime.raycaster.setFromCamera(centerRay, camera);
        const centerHits = runtime.raycaster.intersectObject(shirtMesh, true);
        if (centerHits.length && centerHits[0].face) {
          initialNormal = centerHits[0].face.normal.clone().transformDirection(centerHits[0].object.matrixWorld).normalize();
        }
      }

      rebuildDecal(runtime, initialPoint, initialNormal, decalScaleRef.current, decalOpacityRef.current, isFlippedRef.current);

      const updateSize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const onPointerDown = (event: PointerEvent) => {
        if (!runtimeRef.current) return;
        placeDecalAtPointer(runtime, event, true);
        try {
          renderer.domElement.setPointerCapture(event.pointerId);
        } catch {
          // noop
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        if (!draggingRef.current || !runtimeRef.current) return;
        placeDecalAtPointer(runtime, event);
      };

      const onPointerUp = (event: PointerEvent) => {
        draggingRef.current = false;
        try {
          renderer.domElement.releasePointerCapture(event.pointerId);
        } catch {
          // noop
        }
      };

      const onWheel = () => {
        controls.autoRotate = false;
      };

      const onContextLost = (event: Event) => {
        event.preventDefault();
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointerleave', onPointerUp);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
      renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
      window.addEventListener('resize', updateSize);
      updateSize();

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
        renderer.domElement.removeEventListener('wheel', onWheel);
        renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
        window.removeEventListener('resize', updateSize);
        controls.dispose();
        logoTexture.dispose();
        scene.traverse((object: any) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            disposeMaterial(object.material);
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
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
    <main className="min-h-screen bg-[#0c0e11] px-4 py-10 text-white md:px-8">
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-orange-400/20 bg-gradient-to-b from-orange-500/10 to-transparent p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Template 3 · Editor 3D</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Serigrafía 3D sobre camiseta</h1>
          <p className="mt-4 text-sm leading-7 text-orange-100/85 md:text-base">
            Selecciona la zona, luego ajusta tamaño y posición. El logo se coloca automático en el área elegida.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-[#11141a] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-orange-200">Selecciona zona</p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  placeOnZone('chest-large');
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  selectedZone === 'chest-large'
                    ? 'bg-orange-500 text-white'
                    : 'border border-orange-400/30 bg-transparent text-orange-300 hover:bg-orange-500/10'
                }`}
              >
                Pecho Grande
              </button>
              <button
                onClick={() => {
                  placeOnZone('back-large');
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  selectedZone === 'back-large'
                    ? 'bg-orange-500 text-white'
                    : 'border border-orange-400/30 bg-transparent text-orange-300 hover:bg-orange-500/10'
                }`}
              >
                Espalda Grande
              </button>
              <button
                onClick={() => {
                  placeOnZone('chest-small-left');
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  selectedZone === 'chest-small-left'
                    ? 'bg-orange-500 text-white'
                    : 'border border-orange-400/30 bg-transparent text-orange-300 hover:bg-orange-500/10'
                }`}
              >
                Pecho Pequeño Izquierdo
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#11141a] p-4">
            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Tamaño del estampado
              <input
                type="range"
                min="0.18"
                max="0.95"
                step="0.01"
                value={decalScale}
                onChange={(event) => setDecalScale(Number(event.target.value))}
                className="mt-3 w-full accent-orange-400"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Opacidad del logo
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

            <label className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-orange-200">
              <input
                type="checkbox"
                checked={isFlipped}
                onChange={(e) => setIsFlipped(e.target.checked)}
                className="h-4 w-4 accent-orange-400"
              />
              Invertir imagen
            </label>

            <p className="text-[0.72rem] leading-6 text-white/60">
              {status}
            </p>
            <p className="text-[0.72rem] leading-6 text-white/60">
              Arrastra sobre la camiseta para ajustar la posición fina del logo.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
          <div ref={canvasHostRef} className="h-[520px] w-full rounded-2xl bg-transparent" />

          {!isReady && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl bg-[#0c0e11]/80 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-orange-300">Cargando modelo 3D...</p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/10 bg-[#0c0e11]/72 px-4 py-3 text-xs text-white/75 backdrop-blur-md md:inset-x-6">
            <span className="text-orange-300">Tip:</span> mueve el logo con el dedo o el ratón sobre el pecho y usa el slider para ajustar tamaño.
          </div>
        </div>
      </section>
    </main>
  );
};

export default Template3Page;
