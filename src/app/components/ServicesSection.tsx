import React from 'react';
import { brandConfig } from '@/config/brand';

const services = [
  { title: 'Impresión DTF', href: '/impresion-dtf-sevilla', desc: 'Colores vivos y gran definición para tiradas pequeñas y medianas.' },
  { title: 'Camisetas personalizadas', href: '/camisetas-personalizadas-sevilla', desc: 'Desde 10 unidades, diseño técnico incluido y control de calidad.' },
  { title: 'Merchandising', href: '/merchandising-empresas', desc: 'Kits corporativos, bolsas, sudaderas y regalos personalizados.' },
];

export default function ServicesSection() {
  return (
    <section id="servicios" data-reveal data-reveal-delay="60" className="scroll-mt-20 bg-gradient-to-b from-cami-950 to-cami-900 px-4 py-12 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <span className="section-eyebrow">Nuestros servicios</span>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">Soluciones para empresas y eventos</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-cami-300 md:text-lg">Elige la técnica que mejor se adapte a tu proyecto o solicita asesoramiento técnico gratuito.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <a key={s.href} href={s.href} className="group rounded-2xl border border-white/10 bg-cami-900/40 p-6 transition-shadow hover:shadow-glow">
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-cami-300">{s.desc}</p>
              <div className="mt-4 text-sm font-semibold text-accent-300">Ver servicio →</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
