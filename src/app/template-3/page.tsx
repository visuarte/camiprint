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

const rebuildDecal = (runtime: RuntimeState, point: any, normal: any, sizeValue: number, opacityValue: number) => {
  const { THREE, DecalGeometry, scene, targetMesh, logoTexture } = runtime;
  if (!targetMesh || !logoTexture) return;

  if (runtime.decalMesh) {
    scene.remove(runtime.decalMesh);
    runtime.decalMesh.geometry.dispose();
    disposeMaterial(runtime.decalMesh.material);
  }

  const projectorDirection = normal.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), projectorDirection);
  const orientation = new THREE.Euler().setFromQuaternion(quaternion);
  const size = new THREE.Vector3(sizeValue, sizeValue, sizeValue);
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
  });

  runtime.decalMesh = new THREE.Mesh(geometry, material);
  scene.add(runtime.decalMesh);
  runtime.decalState = { point: point.clone(), normal: normal.clone() };
};

const Template3Page = () => {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<RuntimeState | null>(null);
  const draggingRef = useRef(false);
  const decalScaleRef = useRef(0.34);
  const decalOpacityRef = useRef(0.95);
  const [decalScale, setDecalScale] = useState(0.34);
  const [decalOpacity, setDecalOpacity] = useState(0.95);
  const [status, setStatus] = useState('Cargando Three.js...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    decalScaleRef.current = decalScale;
    const runtime = runtimeRef.current;
    if (runtime?.decalState) {
      rebuildDecal(runtime, runtime.decalState.point, runtime.decalState.normal, decalScaleRef.current, decalOpacityRef.current);
    }
  }, [decalScale]);

  useEffect(() => {
    decalOpacityRef.current = decalOpacity;
    const runtime = runtimeRef.current;
    if (runtime?.decalMesh?.material) {
      runtime.decalMesh.material.opacity = decalOpacityRef.current;
      runtime.decalMesh.material.needsUpdate = true;
    }
  }, [decalOpacity]);

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
      const hits = runtime.raycaster.intersectObject(runtime.targetMesh, true);
      if (!hits.length) return;

      const hit = hits[0];
      const worldNormal = hit.face?.normal
        ? hit.face.normal.clone().transformDirection(hit.object.matrixWorld).normalize()
        : runtime.camera.getWorldDirection(new runtime.THREE.Vector3()).negate();

      rebuildDecal(runtime, hit.point, worldNormal, decalScaleRef.current, decalOpacityRef.current);
      if (shouldDrag) {
        draggingRef.current = true;
      }
    };

    const initialize = async () => {
      const threeUrl = 'https://cdn.jsdelivr.net/npm/three@0.178.0/build/three.module.js';
      const gltfUrl = 'https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/loaders/GLTFLoader.js';
      const orbitUrl = 'https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/controls/OrbitControls.js';
      const decalUrl = 'https://cdn.jsdelivr.net/npm/three@0.178.0/examples/jsm/geometries/DecalGeometry.js';
      
      const [THREE, { GLTFLoader }, { OrbitControls }, { DecalGeometry }] = await Promise.all([
        import(/* webpackIgnore: true */ threeUrl),
        import(/* webpackIgnore: true */ gltfUrl),
        import(/* webpackIgnore: true */ orbitUrl),
        import(/* webpackIgnore: true */ decalUrl),
      ]);

      if (cancelled) return;

      const host = canvasHostRef.current;
      if (!host) return;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0c0e11);
      scene.fog = new THREE.Fog(0x0c0e11, 7, 14);

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 1.3, 4.3);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x0c0e11, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      host.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 2.9;
      controls.maxDistance = 6.5;
      controls.maxPolarAngle = Math.PI * 0.72;
      controls.minPolarAngle = Math.PI * 0.18;
      controls.target.set(0, 1.18, 0);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;

      const ambient = new THREE.AmbientLight(0xffffff, 1.6);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(3, 5, 4);
      keyLight.castShadow = true;
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
          child.castShadow = true;
          child.receiveShadow = true;
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
        const centerRay = new THREE.Vector2(0, 0);
        runtime.raycaster.setFromCamera(centerRay, camera);
        const centerHits = shirtMesh ? runtime.raycaster.intersectObject(shirtMesh, true) : [];
        if (centerHits.length) {
          return centerHits[0].point.clone();
        }

        const fallbackBox = new THREE.Box3().setFromObject(modelRoot);
        return fallbackBox.getCenter(new THREE.Vector3()).add(new THREE.Vector3(0, 0.25, 0.42));
      })();

      const initialNormal = camera.getWorldDirection(new THREE.Vector3()).negate();
      rebuildDecal(runtime, initialPoint, initialNormal, decalScaleRef.current, decalOpacityRef.current);

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
            Arrastra el logo sobre el pecho, ajusta su tamaño y simula un estampado frontal real con Three.js.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Ahora el logo ya no flota como una tarjeta: vive sobre la prenda como un decal editable.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#11141a] p-4">
            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Tamaño del estampado
              <input
                type="range"
                min="0.18"
                max="0.65"
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

            <p className="text-[0.72rem] leading-6 text-white/60">
              {status}
            </p>
            <p className="text-[0.72rem] leading-6 text-white/60">
              Arrastra sobre la camiseta para recolocar el logo como si lo estuvieras serigrafiando.
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
