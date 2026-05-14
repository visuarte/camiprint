'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const Hero = () => {
  const [units, setUnits] = useState(1);
  const [modelReady, setModelReady] = useState(false);
  const trustSignals = ['Entrega estimada 7-10 dias', 'Diseño tecnico incluido', 'Produccion para empresas'];

  const handleDecrease = () => setUnits((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setUnits((prev) => prev + 1);

  // Placeholder handler: quedara conectado al puente API en siguientes iteraciones.
  const handleRequestQuote = () => {
    return units;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setModelReady(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="inicio" data-reveal data-reveal-delay="0" className="scroll-mt-20 bg-cami-hero px-4 pb-10 pt-12 md:px-6 md:pb-14 md:pt-20">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
            Tu marca, puesta en cada camiseta.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-cami-200">
            Produccion personalizada, calidad profesional y entrega agil.
          </p>

          <div className="mt-7 inline-flex items-center overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-glow backdrop-blur-sm">
            <input
              value={units}
              onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))}
              type="number"
              min={1}
              className="h-12 w-16 border-r border-white/15 bg-transparent text-center text-2xl font-medium text-white outline-none"
              aria-label="Cantidad de camisetas"
            />
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleIncrease}
                className="h-6 w-10 border-b border-white/15 text-white/90 transition-colors hover:bg-white/10"
                aria-label="Incrementar cantidad"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleDecrease}
                className="h-6 w-10 text-white/90 transition-colors hover:bg-white/10"
                aria-label="Reducir cantidad"
              >
                -
              </button>
            </div>
          </div>

          <div className="mt-5 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              onClick={handleRequestQuote}
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/35 bg-metal-button px-6 py-3 text-lg font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110"
            >
              Recibir propuesta en minutos
            </a>
            <a
              href="#ofertas"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-cami-100 shadow-glow transition-all hover:brightness-110"
            >
              Ver ofertas por volumen
            </a>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {trustSignals.map((signal) => (
              <span
                key={signal}
                className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cami-200"
              >
                {signal}
              </span>
            ))}
          </div>

          <div className="mt-5 grid max-w-lg grid-cols-2 gap-3 text-sm text-cami-200 sm:grid-cols-3">
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2"><span className="font-bold text-white">1200+</span> pedidos entregados</p>
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2"><span className="font-bold text-white">4.9/5</span> valoracion media</p>
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2 sm:col-span-1 col-span-2"><span className="font-bold text-white">72h</span> primera propuesta</p>
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-[430px] lg:col-span-2 lg:h-[460px] lg:max-w-[520px]">
          <div className="absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/0 shadow-glow backdrop-blur-sm" />
          <div
            className={`absolute inset-6 flex items-center justify-center rounded-2xl border border-white/10 bg-cami-900/70 transition-all duration-700 ease-out ${
              modelReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <model-viewer
              src="/models/camiseta-camiprint.glb"
              alt="Modelo 3D de camiseta Camiprint"
              auto-rotate
              auto-rotate-delay="0"
              rotation-per-second="18deg"
              camera-orbit="20deg 78deg 115%"
              field-of-view="32deg"
              shadow-intensity="1"
              exposure="0.9"
              className="h-full w-full rounded-2xl bg-transparent pointer-events-none select-none"
              style={{ ['--poster-color' as string]: 'transparent' }}
            />
          </div>

          <span className="absolute left-8 top-16 h-28 w-28 rounded-full border border-white/20 opacity-50" aria-hidden="true" />
          <span className="absolute bottom-20 right-10 h-24 w-24 rounded-full border border-accent-400/40 opacity-60" aria-hidden="true" />
          <span className="absolute left-1/3 top-8 h-px w-28 rotate-12 bg-white/35" aria-hidden="true" />
          <span className="absolute bottom-14 left-10 h-px w-32 -rotate-12 bg-white/35" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
