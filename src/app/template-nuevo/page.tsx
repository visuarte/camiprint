'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Montserrat, Manrope } from 'next/font/google';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import Footer from '@/components/Footer';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600'] });

const categories = [
  { name: 'Camisetas', href: '/catalog', img: '/portfolio/real-1.jpg', desc: 'DTF, vinilo y sublimación' },
  { name: 'Polos', href: '/catalog', img: '/portfolio/real-2.jpg', desc: 'Bordado computarizado' },
  { name: 'Sudaderas', href: '/catalog', img: '/portfolio/real-3.jpg', desc: 'Personalización completa' },
  { name: 'Uniformes', href: '/catalog', img: '/portfolio/real-4.jpg', desc: 'Corporativos y eventos' },
];

const features = [
  { title: 'Sin mínimo', desc: 'Desde 10 unidades. Sin abusos.' },
  { title: 'Presupuesto en 24h', desc: 'Te respondemos en un día.' },
  { title: 'DTF propio', desc: 'Estampación de alta calidad.' },
  { title: 'Envío 3-7 días', desc: 'A toda España peninsular.' },
];

export default function LightLanding() {
  const [heroImg, setHeroImg] = useState(1);

  useEffect(() => {
    document.title = 'CAMIART | Camisetas personalizadas para tu negocio';
    const interval = setInterval(() => setHeroImg(p => p >= 6 ? 1 : p + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className={`${manrope.className} min-h-screen bg-white text-[#1a1a1a]`}>
      <AppHeader variant="light" />

      {/* HERO - product images, minimal text */}
      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
          <div>
            <span className={`${inter.className} inline-block rounded-full bg-[#ff4f00]/10 px-4 py-1.5 text-xs font-bold text-[#ff4f00] uppercase tracking-wider mb-4`}>
              Desde 10 unidades
            </span>
            <h1 className={`${montserrat.className} text-4xl font-black leading-[1.05] md:text-6xl`}>
              Camisetas personalizadas<br />
              <span className="text-[#ff4f00]">sin mínimos</span>
            </h1>
            <p className="mt-4 text-lg text-gray-500">
              DTF, bordado o vinilo. Presupuesto gratis en 24h.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className={`${inter.className} bg-[#ff4f00] px-8 py-3 text-sm font-bold text-white hover:bg-[#e64500] transition-colors`}>
                VER CATÁLOGO
              </Link>
              <Link href="/#presupuesto" className={`${inter.className} border border-gray-300 px-8 py-3 text-sm font-bold text-gray-700 hover:border-[#ff4f00] hover:text-[#ff4f00] transition-colors`}>
                PRESUPUESTO GRATIS
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-[#ff4f00]/10 blur-3xl" />
            <Image
              src={`/portfolio/real-${heroImg}.jpg`}
              alt="Camiseta personalizada"
              width={600} height={600}
              className="relative z-10 w-full rounded-2xl border border-gray-200 object-cover shadow-lg"
              priority
            />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {[1,2,3,4,5,6].map(i => (
                <button key={i} onClick={() => setHeroImg(i)}
                  className={`h-2 rounded-full transition-all ${i === heroImg ? 'w-6 bg-[#ff4f00]' : 'w-2 bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - row de iconos */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-10 md:grid-cols-4 md:px-10">
          {features.map(f => (
            <div key={f.title} className="text-center">
              <p className={`${montserrat.className} text-lg font-bold text-[#ff4f00]`}>{f.title}</p>
              <p className="mt-1 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES - image grid like Roly */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <h2 className={`${montserrat.className} text-3xl font-black text-center md:text-4xl`}>Nuestros productos</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map(cat => (
            <Link key={cat.name} href={cat.href} className="group">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
                <Image src={cat.img} alt={cat.name} width={300} height={400}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className={`${montserrat.className} mt-3 text-lg font-bold`}>{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS - simple 3 steps */}
      <section id="como-funciona" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className={`${montserrat.className} text-3xl font-black text-center md:text-4xl`}>Cómo funciona</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { n: '01', t: 'Diseñas', d: 'Nos dices qué quieres. Si no tienes diseño, te lo hacemos gratis.' },
              { n: '02', t: 'Aprobamos', d: 'Te enviamos la prueba virtual. Hasta 3 cambios sin coste.' },
              { n: '03', t: 'Recibes', d: 'Producimos y enviamos a toda España en 3-7 días.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <span className={`${montserrat.className} text-5xl font-black text-[#ff4f00]/20`}>{s.n}</span>
                <h3 className={`${montserrat.className} mt-2 text-xl font-bold`}>{s.t}</h3>
                <p className="mt-2 text-gray-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-10">
        <h2 className={`${montserrat.className} text-center text-3xl font-black md:text-4xl`}>Lo que dicen nuestros clientes</h2>
        <p className="mt-3 text-center text-gray-500">Empresas que confían en CAMIART para sus uniformes y ropa corporativa.</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: 'Marina Gómez', company: 'Brasa Norte', text: 'Pedimos uniformes para todo el equipo —120 camisetas con 3 tallas distintas— y la calidad superó nuestras expectativas. El proceso fue rápido y sin sorpresas.' },
            { name: 'Javier Ruiz', company: 'Nexo Logistics', text: 'Necesitábamos 200 camisetas para una campaña corporativa con plazo de 8 días. CAMIART entregó a tiempo, con acabado excelente y soporte constante.' },
            { name: 'Carlos Mendoza', company: 'Grupo Vértice', text: 'Llevamos 3 pedidos con ellos para distintos departamentos. El precio por volumen es muy competitivo y la atención personalizada marca la diferencia.' },
            { name: 'Sofía Ramos', company: 'TasteLab', text: 'Necesitaba camisetas para un evento en 10 días. Validación del diseño en 2 horas, entrega en 9 días. Exactamente lo que necesitaba.' },
            { name: 'Andrés Villar', company: 'Constructora Ibérica', text: 'Pedimos polos técnicos con bordado para todo el personal de obra. La calidad es muy buena para el precio y el proceso de aprobación fue muy cómodo.' },
            { name: 'Lucía Herrera', company: 'Studio 88', text: 'La propuesta llegó en minutos, ajustes de diseño rápidos y el resultado final fue impecable para nuestro lanzamiento. Repetiremos sin duda.' },
          ].map(t => (
            <div key={t.name} className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-gray-600 italic">"{t.text}"</p>
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className={`${inter.className} text-sm font-bold text-[#ff4f00]`}>{t.name}</p>
                <p className="text-xs text-gray-400">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICE REQUEST - direct CTA */}
      <section id="presupuesto" className="mx-auto max-w-3xl px-5 py-24 text-center md:px-10">
        <h2 className={`${montserrat.className} text-3xl font-black md:text-4xl`}>¿Cuánto cuesta tu pedido?</h2>
        <p className="mt-4 text-lg text-gray-500">Te enviamos presupuesto gratis en 24h. Sin compromiso.</p>
        <Link href="/#presupuesto" className={`${inter.className} mt-8 inline-block bg-[#ff4f00] px-10 py-4 text-sm font-bold text-white hover:bg-[#e64500] transition-colors`}>
          PEDIR PRESUPUESTO GRATIS
        </Link>
        <p className="mt-3 text-sm text-gray-400">Respondemos en menos de 24h laborables.</p>
      </section>

      <Footer variant="light" />
    </main>
  );
}
