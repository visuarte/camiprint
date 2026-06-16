import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Guía de estampación y tallas — Cómo elegir la mejor técnica | ${brandConfig.displayName}`,
  description:
    'Aprende a elegir la técnica de estampación perfecta para tu ropa corporativa: DTF, serigrafía, bordado o vinilo. Guía completa de tallas y cuidados.',
  keywords: [
    'cómo elegir técnica de estampación', 'DTF vs serigrafía', 'bordado corporativo',
    'guía de tallas camisetas', 'estampación textil',
    'diferencia entre DTF y serigrafía', 'cuidado de ropa personalizada',
  ],
  alternates: { canonical: `${brandConfig.siteUrl}/guia-estampacion-y-tallas` },
  openGraph: {
    title: `Guía de estampación y tallas | ${brandConfig.displayName}`,
    description: 'Todo lo que necesitas saber para elegir la estampación perfecta para tu ropa corporativa.',
  },
};

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Guía completa de técnicas de estampación y tallas para ropa corporativa',
  description: 'Comparativa DTF vs serigrafía vs bordado vs vinilo. Guía de tallas y cuidados.',
  author: { '@type': 'Organization', name: brandConfig.displayName },
  datePublished: '2026-01-15',
  dateModified: new Date().toISOString().split('T')[0],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article className="mx-auto max-w-4xl px-5 py-16 md:px-10">
        <h1 className="text-4xl font-black text-gray-900">Guía completa de estampación y tallas</h1>
        <p className="mt-4 text-lg text-gray-500">
          Elegir la técnica de estampación adecuada marca la diferencia entre un uniforme que dura años y uno que se estropea en semanas. Te ayudamos a acertar.
        </p>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900">1. Técnicas de estampación</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-[#ff4f00]">DTF</h3>
              <p className="mt-2 text-sm text-gray-600">Ideal para diseños complejos, multicolor y fotografías. Sin límite de colores. Gran durabilidad y lavado. Perfecto para tiradas de 10 a 200 unidades.</p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li>✅ Hasta colores ilimitados</li>
                <li>✅ Sin coste de pantallas</li>
                <li>✅ Durabilidad: 50+ lavados</li>
                <li>⚠️ No recomendado para tejidos técnicos</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-[#ff4f00]">Serigrafía</h3>
              <p className="mt-2 text-sm text-gray-600">La opción clásica para grandes volúmenes. Colores sólidos y vibrantes. Cuanto mayor la tirada, menor el coste por unidad. Mínimo recomendado: 50 unidades.</p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li>✅ Mejor relación calidad-precio en volumen</li>
                <li>✅ Colores sólidos y duraderos</li>
                <li>⚠️ Coste inicial por pantalla</li>
                <li>⚠️ Límite de colores por diseño</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-[#ff4f00]">Bordado</h3>
              <p className="mt-2 text-sm text-gray-600">Acabado premium para polos, chaquetas y gorras. Transmite calidad y profesionalidad. Ideal para logos de empresa en prendas de alta gama.</p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li>✅ Acabado más profesional</li>
                <li>✅ Máxima durabilidad</li>
                <li>⚠️ Mayor coste por unidad</li>
                <li>⚠️ No apto para detalles muy pequeños</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-bold text-[#ff4f00]">Vinilo</h3>
              <p className="mt-2 text-sm text-gray-600">Solución económica para tiradas muy cortas o diseños simples. Ideal para nombres, números o logos de un solo color.</p>
              <ul className="mt-3 space-y-1 text-xs text-gray-500">
                <li>✅ Sin mínimo de unidades</li>
                <li>✅ Rápido de producir</li>
                <li>⚠️ Menor durabilidad que DTF</li>
                <li>⚠️ No recomendado para diseños complejos</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">2. Tabla comparativa rápida</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4">Técnica</th>
                  <th className="py-3 pr-4">Mínimo</th>
                  <th className="py-3 pr-4">Colores</th>
                  <th className="py-3 pr-4">Durabilidad</th>
                  <th className="py-3 pr-4">Coste/ud</th>
                  <th className="py-3 pr-4">Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">DTF</td><td className="py-3 pr-4">10 uds</td><td className="py-3 pr-4">Ilimitados</td><td className="py-3 pr-4">Alta</td><td className="py-3 pr-4">Medio</td><td className="py-3 pr-4">Diseños complejos</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">Serigrafía</td><td className="py-3 pr-4">50 uds</td><td className="py-3 pr-4">1-6</td><td className="py-3 pr-4">Muy alta</td><td className="py-3 pr-4">Bajo (volumen)</td><td className="py-3 pr-4">Grandes tiradas</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">Bordado</td><td className="py-3 pr-4">10 uds</td><td className="py-3 pr-4">1-12</td><td className="py-3 pr-4">Máxima</td><td className="py-3 pr-4">Alto</td><td className="py-3 pr-4">Polos, chaquetas</td></tr>
                <tr><td className="py-3 pr-4 font-medium">Vinilo</td><td className="py-3 pr-4">1 ud</td><td className="py-3 pr-4">1</td><td className="py-3 pr-4">Media</td><td className="py-3 pr-4">Bajo</td><td className="py-3 pr-4">Diseños simples</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">3. Guía de tallas</h2>
          <p className="mt-4 text-gray-600">Cada marca (Roly, Gildan, etc.) tiene sus propias medidas. Como referencia orientativa para camisetas unisex:</p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4">Talla</th>
                  <th className="py-3 pr-4">Pecho (cm)</th>
                  <th className="py-3 pr-4">Largo (cm)</th>
                  <th className="py-3 pr-4">Peso aprox.</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">XS</td><td className="py-3 pr-4">46-51</td><td className="py-3 pr-4">66</td><td className="py-3 pr-4">-50 kg</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">S</td><td className="py-3 pr-4">51-56</td><td className="py-3 pr-4">69</td><td className="py-3 pr-4">50-65 kg</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">M</td><td className="py-3 pr-4">56-61</td><td className="py-3 pr-4">72</td><td className="py-3 pr-4">65-80 kg</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">L</td><td className="py-3 pr-4">61-66</td><td className="py-3 pr-4">75</td><td className="py-3 pr-4">80-95 kg</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">XL</td><td className="py-3 pr-4">66-71</td><td className="py-3 pr-4">78</td><td className="py-3 pr-4">95-110 kg</td></tr>
                <tr className="border-b border-gray-100"><td className="py-3 pr-4 font-medium">2XL</td><td className="py-3 pr-4">71-76</td><td className="py-3 pr-4">81</td><td className="py-3 pr-4">110-125 kg</td></tr>
                <tr><td className="py-3 pr-4 font-medium">3XL</td><td className="py-3 pr-4">76-81</td><td className="py-3 pr-4">84</td><td className="py-3 pr-4">125-140 kg</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">Estas medidas son orientativas. Cada modelo puede variar ligeramente. Si tienes dudas, solicita una muestra antes de tu pedido.</p>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">4. Cuidados y durabilidad</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-bold text-gray-900">Lavado</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>✔ Lavar del revés</li>
                <li>✔ Agua fría o máxima 30°C</li>
                <li>✖ No usar lejía ni suavizante</li>
                <li>✖ No planchar directamente sobre el estampado</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="font-bold text-gray-900">Secado y planchado</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>✔ Secar al aire, a la sombra</li>
                <li>✖ Evitar secadora</li>
                <li>✔ Planchar del revés</li>
                <li>✖ No planchar sobre el estampado directamente</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-gray-50 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">¿Sigues con dudas?</h2>
          <p className="mt-2 text-gray-600">Te ayudamos a elegir la mejor técnica para tu proyecto. Presupuesto gratis en 24h.</p>
          <a href="/#presupuesto" className="mt-6 inline-block bg-[#ff4f00] px-10 py-4 text-sm font-bold text-white transition hover:bg-[#e64500]">
            PEDIR PRESUPUESTO GRATIS
          </a>
        </section>
      </article>
    </>
  );
}
