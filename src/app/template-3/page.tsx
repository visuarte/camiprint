'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const MODEL_SRC = '/models/camiseta-camiart.glb';
const LOGO_SRC = '/textures/camiart-logo.png';

const buildFabricTexture = async (modelViewer: any) => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 2048;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo crear el contexto 2D para la textura.');
  }

  // Base casi negra para simular la camiseta del mockup.
  ctx.fillStyle = '#0f1012';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const logo = new Image();
  logo.src = LOGO_SRC;

  await new Promise<void>((resolve, reject) => {
    logo.onload = () => resolve();
    logo.onerror = () => reject(new Error('No se pudo cargar el logo para la textura.'));
  });

  const targetWidth = canvas.width * 0.42;
  const scale = targetWidth / logo.width;
  const targetHeight = logo.height * scale;
  const x = (canvas.width - targetWidth) / 2;
  const y = canvas.height * 0.26;

  ctx.drawImage(logo, x, y, targetWidth, targetHeight);

  return modelViewer.createTexture(canvas.toDataURL('image/png'));
};

const Template3Page = () => {
  const modelRef = useRef<any>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [decalPosition, setDecalPosition] = useState({ x: 50, y: 39 });
  const [decalScale, setDecalScale] = useState(0.42);
  const [decalOpacity, setDecalOpacity] = useState(0.92);
  const dragStateRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (!modelViewer) {
      return;
    }

    const applyTexture = async () => {
      try {
        const model = modelViewer.model;
        if (!model?.materials?.length) {
          return;
        }

        const texture = await buildFabricTexture(modelViewer);

        for (const material of model.materials) {
          const pbr = material.pbrMetallicRoughness;
          if (!pbr) {
            continue;
          }

          pbr.setBaseColorFactor([1, 1, 1, 1]);
          pbr.setBaseColorTexture(texture);
          pbr.setMetallicFactor(0.08);
          pbr.setRoughnessFactor(0.92);
        }
      } catch (error) {
        console.error('No se pudo mapear la textura del mockup:', error);
      }
    };

    const onLoad = () => {
      void applyTexture();
    };

    modelViewer.addEventListener('load', onLoad);

    if (modelViewer.loaded) {
      void applyTexture();
    }

    return () => {
      modelViewer.removeEventListener('load', onLoad);
    };
  }, []);

  const updateDecalFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100;

    setDecalPosition({
      x: Math.min(80, Math.max(20, nextX)),
      y: Math.min(62, Math.max(18, nextY)),
    });
  };

  const handleDecalPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    dragStateRef.current = {
      offsetX: event.clientX - rect.left - (decalPosition.x / 100) * rect.width,
      offsetY: event.clientY - rect.top - (decalPosition.y / 100) * rect.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDecalPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) {
      return;
    }

    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const nextX = ((event.clientX - rect.left - dragStateRef.current.offsetX) / rect.width) * 100;
    const nextY = ((event.clientY - rect.top - dragStateRef.current.offsetY) / rect.height) * 100;

    setDecalPosition({
      x: Math.min(82, Math.max(18, nextX)),
      y: Math.min(68, Math.max(16, nextY)),
    });
  };

  const handleDecalPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = null;
    if ('releasePointerCapture' in event.currentTarget) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // noop
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0e11] px-4 py-10 text-white md:px-8">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-orange-400/20 bg-gradient-to-b from-orange-500/10 to-transparent p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Template 3 · Prueba de mapeo</p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Editor de estampado sobre camiseta 3D</h1>
          <p className="mt-4 text-sm leading-7 text-orange-100/85 md:text-base">
            Arrastra el logo sobre el pecho y ajusta su tamaño para simular una serigrafia o estampado frontal.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Esto es un editor visual rapido: no tapa la prenda, pero te deja previsualizar el logo donde iria estampado.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-[#11141a] p-4">
            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Tamaño del logo
              <input
                type="range"
                min="0.22"
                max="0.7"
                step="0.01"
                value={decalScale}
                onChange={(event) => setDecalScale(Number(event.target.value))}
                className="mt-3 w-full accent-orange-400"
              />
            </label>

            <label className="text-xs uppercase tracking-[0.16em] text-orange-200">
              Opacidad del estampado
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
              Tip: toca y arrastra el logo en la vista para colocarlo justo en el pecho.
            </p>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6"
          onPointerMove={handleDecalPointerMove}
          onPointerUp={handleDecalPointerUp}
          onPointerLeave={handleDecalPointerUp}
        >
          <model-viewer
            ref={modelRef}
            src={MODEL_SRC}
            alt="Modelo 3D de camiseta CamiArt"
            camera-controls
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="24deg"
            camera-orbit="0deg 75deg 115%"
            field-of-view="30deg"
            exposure="1"
            shadow-intensity="1"
            className="h-[520px] w-full rounded-2xl bg-transparent"
            style={{ ['--poster-color' as string]: 'transparent' }}
          />

          <button
            type="button"
            aria-label="Logo arrastrable sobre la camiseta"
            title="Arrastra para recolocar el estampado"
            onPointerDown={handleDecalPointerDown}
            className="absolute z-20 cursor-grab active:cursor-grabbing"
            style={{
              left: `${decalPosition.x}%`,
              top: `${decalPosition.y}%`,
              width: `${decalScale * 42}%`,
              opacity: decalOpacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src="/textures/camiart-logo.png"
              alt="Logo CamiArt para estampado sobre la camiseta"
              className="w-full select-none rounded-xl bg-transparent drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
              draggable={false}
            />
          </button>

          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-white/10 bg-[#0c0e11]/72 px-4 py-3 text-xs text-white/75 backdrop-blur-md md:inset-x-6">
            <span className="text-orange-300">Editor activo:</span> el logo queda posicionado como estampado sobre el pecho y se puede mover sin interferir con la prenda.
          </div>
        </div>
      </section>
    </main>
  );
};

export default Template3Page;