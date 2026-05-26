import { brandConfig } from '@/config/brand';
import Image from 'next/image';

export const metadata = {
  title: 'Portfolio — Trabajos reales | Camiart',
  description: 'Portfolio de trabajos reales: fotos de producción, acabados y entregas reales para empresas.',
  alternates: { canonical: `${brandConfig.siteUrl}/portfolio` },
};

export default function Portfolio() {
  return (
    <section className="mx-auto max-w-6xl py-12 px-4 text-cami-200">
      <h1 className="text-3xl font-bold text-white">Portfolio — Trabajos reales</h1>
      <p className="mt-4">A continuación mostramos ejemplos reales de producción, acabados y envíos. Sustituye las imágenes por fotos reales antes de publicar.</p>

      <p className="mt-4 text-cami-300 max-w-2xl">Galería de trabajos reales: fotos de producción, acabados y entregas. Haz click en una imagen para verla en su tamaño real. Si necesitas más ejemplos por sector, solicita un presupuesto — respondemos en 24h.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <figure key={n} className="overflow-hidden rounded-2xl border border-white/8 bg-cami-900 p-2">
            <div className="relative h-48 w-full">
              <Image
                src={`/portfolio/real-${n}.jpg`}
                alt={`Foto real de producción ${n}`}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-2 text-sm text-cami-300">Producción real — control de calidad y acabado #{n}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <div className="text-left">
          <h2 className="text-lg font-semibold text-white">¿Te interesa un presupuesto?</h2>
          <p className="mt-1 text-sm text-cami-300">Envíanos tu idea y número de unidades, te damos precio en 24h.</p>
        </div>
        <div className="mt-2 sm:mt-0">
          <a
            href="#contacto"
            className="inline-flex items-center gap-3 rounded-full border border-accent-300/30 bg-metal-button px-5 py-2.5 text-sm font-semibold text-cami-100 shadow-metal transition-all hover:brightness-110"
          >
            Solicitar presupuesto
          </a>
        </div>
      </div>
    </section>
  );
}
