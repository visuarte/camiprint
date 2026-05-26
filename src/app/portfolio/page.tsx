import { brandConfig } from '@/config/brand';

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

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <figure key={n} className="overflow-hidden rounded-2xl border border-white/8 bg-cami-900 p-2">
            <img src={`/portfolio/real-${n}.jpg`} alt={`Foto real de producción ${n}`} className="h-48 w-full object-cover" />
            <figcaption className="mt-2 text-sm text-cami-300">Producción real — control de calidad y acabado #{n}</figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-8 text-sm text-cami-400">Consejo: añade imágenes con dimensiones optimizadas (1200×800) y añade atributos `width` y `height` cuando estén disponibles.</p>
    </section>
  );
}
