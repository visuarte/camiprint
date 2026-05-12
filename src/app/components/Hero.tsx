'use client';

import { useState } from 'react';

const Hero = () => {
  const [units, setUnits] = useState(1);

  const handleDecrease = () => setUnits((prev) => Math.max(1, prev - 1));
  const handleIncrease = () => setUnits((prev) => prev + 1);

  // Placeholder handler: quedara conectado al puente API en siguientes iteraciones.
  const handleRequestQuote = () => {
    return units;
  };

  return (
    <section id="inicio" className="scroll-mt-20 bg-cami-hero bg-cami-noise px-4 pb-10 pt-12 md:px-6 md:pb-14 md:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
            Camisetas personalizadas para tu negocio.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-cami-200">
            Plataforma sencilla de usar para impresion de ropa de alta calidad a pedido. Crea tu mercancia sin esfuerzo.
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

          <a
            href="#contacto"
            onClick={handleRequestQuote}
            className="mt-5 inline-flex w-full max-w-md items-center justify-center rounded-xl border border-white/35 bg-metal-button px-6 py-3 text-xl font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110"
          >
            Recibir propuesta en minutos
          </a>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-[430px] lg:col-span-2 lg:h-[460px] lg:max-w-[520px]">
          <div className="absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-b from-white/10 to-white/0 shadow-glow backdrop-blur-sm" />
          <div className="absolute inset-6 flex items-center justify-center rounded-2xl border border-white/10 bg-cami-900/70">
            <div className="text-center">
              <div className="mx-auto h-44 w-44 rounded-full border border-white/20 bg-gradient-to-br from-cami-700 to-cami-900 shadow-glow md:h-56 md:w-56" />
              <p className="mt-5 text-sm text-cami-300">Placeholder 3D camiseta (.glb / .gltf)</p>
            </div>
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
