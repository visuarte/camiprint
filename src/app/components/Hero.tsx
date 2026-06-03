'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { brandConfig } from '@/config/brand';

const Hero = () => {
  const [units, setUnits] = useState(1);
  const [modelReady, setModelReady] = useState(false);
  const trustSignals = ['Entrega garantizada en plazo', 'Diseño técnico incluido', 'Desde 10 unidades'];

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
    <section id="inicio" data-reveal data-reveal-delay="0" className="scroll-mt-20 px-4 pb-14 pt-24 md:px-6 md:pb-20 md:pt-32">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            Aceptando pedidos — propuestas en menos de 24h
          </div>
          <span className="section-eyebrow" data-v2="microcopy">Producción textil para empresas</span>

          <h1 data-v2="headline" className="mt-6 max-w-3xl font-display text-5xl font-bold leading-none text-white md:text-6xl lg:text-[4.85rem]">
            Camisetas personalizadas para tu empresa. Desde 10 uds.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-cami-200 md:text-xl">
            Fabricamos camisetas corporativas, polos con logo y uniformes personalizados con <strong className="text-white">calidad premium garantizada</strong>, diseño incluido y envío a toda España.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-cami-200">
            <span className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 font-semibold">Presupuesto en 24h</span>
            <span className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 font-semibold">Series cortas y grandes tiradas</span>
            <span className="rounded-full border border-white/14 bg-white/[0.06] px-4 py-2 font-semibold">Soporte de arte final incluido</span>
          </div>

          <div data-landing-shell="surface" className="mt-8 inline-flex items-center overflow-hidden rounded-2xl shadow-glow backdrop-blur-sm">
            <input
              value={units}
              onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))}
              type="number"
              min={1}
              className="h-14 w-20 border-r border-white/12 bg-transparent text-center text-2xl font-semibold text-white outline-none"
              aria-label="Cantidad de camisetas"
            />
            <div className="flex flex-col">
              <button
                type="button"
                onClick={handleIncrease}
                className="h-7 w-12 border-b border-white/12 text-white/90 transition-colors hover:bg-white/10"
                aria-label="Incrementar cantidad"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleDecrease}
                className="h-7 w-12 text-white/90 transition-colors hover:bg-white/10"
                aria-label="Reducir cantidad"
              >
                -
              </button>
            </div>
          </div>

          <div className="mt-8 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <a
              href="#contacto"
              onClick={handleRequestQuote}
              className="inline-flex w-full items-center justify-center rounded-full border border-accent-300/35 bg-metal-button px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-cami-100 shadow-metal transition-all hover:-translate-y-0.5 hover:brightness-110"
            >
              Solicitar Cotización · Recibir propuesta en minutos →
            </a>
            <a
              href="#ofertas"
              className="inline-flex w-full items-center justify-center rounded-full border border-white/18 bg-white/[0.06] px-7 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-cami-100 shadow-glow transition-all hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              Ver precios por volumen
            </a>
          </div>
          <p className="mt-2 text-xs text-cami-400">Sin registro · Propuesta en &lt; 24h · Cancela cuando quieras</p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {trustSignals.map((signal) => (
              <span
                key={signal}
                className="inline-flex items-center rounded-full border border-white/14 bg-white/[0.05] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-cami-200"
              >
                {signal}
              </span>
            ))}
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 text-sm text-cami-200 sm:grid-cols-3">
            <p data-landing-shell="surface" className="rounded-2xl px-4 py-3 shadow-glow"><span className="block font-display text-2xl text-white">1200+</span> pedidos entregados</p>
            <p data-landing-shell="surface" className="rounded-2xl px-4 py-3 shadow-glow"><span className="block font-display text-2xl text-white">4,9★</span> valoración media</p>
            <p data-landing-shell="surface" className="col-span-2 rounded-2xl px-4 py-3 shadow-glow sm:col-span-1"><span className="block font-display text-2xl text-white">&lt;24h</span> primera propuesta</p>
          </div>
        </div>

        <div className="relative mx-auto h-[400px] w-full max-w-[430px] lg:col-span-2 lg:h-[520px] lg:max-w-[520px]">
          <div className="absolute inset-0 rounded-[2rem] border border-white/12 bg-gradient-to-b from-white/10 via-white/[0.03] to-transparent shadow-glow backdrop-blur-sm" />
          <div className="absolute inset-4 rounded-[1.75rem] border border-accent-300/10" aria-hidden="true" />
          <div
            className={`absolute inset-6 flex items-center justify-center rounded-[1.5rem] border border-white/10 bg-cami-900/70 transition-all duration-700 ease-out ${
              modelReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <model-viewer
              src={brandConfig.assets.heroModelSrc}
              alt={brandConfig.copy.heroModelAlt}
              auto-rotate
              auto-rotate-delay="0"
              rotation-per-second="18deg"
              camera-orbit="20deg 78deg 115%"
              field-of-view="32deg"
              shadow-intensity="1"
              exposure="0.9"
              className="h-full w-full rounded-[1.5rem] bg-transparent pointer-events-none select-none"
              style={{ ['--poster-color' as string]: 'transparent' }}
            />
          </div>

          <div className="absolute -left-3 top-14 rounded-2xl border border-white/10 bg-cami-950/90 px-4 py-3 shadow-glow backdrop-blur-sm" aria-hidden="true">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-cami-300">Aprobacion media</p>
            <p className="mt-1 font-display text-2xl text-white">24h</p>
          </div>
          <div className="absolute -bottom-3 right-4 rounded-2xl border border-accent-300/15 bg-cami-900/90 px-4 py-3 shadow-metal backdrop-blur-sm" aria-hidden="true">
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-cami-300">Pedidos desde</p>
            <p className="mt-1 font-display text-2xl text-white">10 uds</p>
          </div>
          <span className="absolute left-8 top-16 h-28 w-28 rounded-full border border-white/20 opacity-40" aria-hidden="true" />
          <span className="absolute bottom-20 right-10 h-24 w-24 rounded-full border border-accent-400/40 opacity-50" aria-hidden="true" />
          <span className="absolute left-1/3 top-8 h-px w-28 rotate-12 bg-white/30" aria-hidden="true" />
          <span className="absolute bottom-14 left-10 h-px w-32 -rotate-12 bg-white/30" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
