'use client';

import { useEffect, useRef } from 'react';
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
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">Camiseta 3D con imagen aplicada</h1>
          <p className="mt-4 text-sm leading-7 text-orange-100/85 md:text-base">
            Mapeo activo sobre el GLB anterior usando una textura compuesta estilo mockup: base negra + logo CamiArt.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/70">
            Si te convence, el siguiente paso es usar la foto exacta como textura final refinando UVs por zona frontal.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 md:p-6">
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

          <div className="pointer-events-none absolute left-1/2 top-6 z-20 w-[78%] max-w-[360px] -translate-x-1/2 rounded-[1.75rem] border border-orange-400/30 bg-[#0c0e11]/86 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:left-auto md:right-6 md:top-6 md:w-[320px] md:translate-x-0">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-orange-300">Imagen encima del 3D</p>
            <img
              src="/textures/camiart-logo.png"
              alt="Logo CamiArt superpuesto sobre el modelo 3D"
              className="mt-3 w-full rounded-2xl bg-white/5 p-4"
            />
            <p className="mt-2 text-xs leading-6 text-white/70">
              Esta capa queda por encima del modelo para que veas la imagen visible sobre la camiseta 3D.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Template3Page;