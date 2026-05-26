import { testimonials } from '../data/testimonials';
import { brandConfig } from '@/config/brand';

const avatarColors = [
  'bg-indigo-600',
  'bg-emerald-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
];

const clientLogos = [
  { name: 'Brasa Norte', initials: 'BN' },
  { name: 'Nexo Logistics', initials: 'NL' },
  { name: 'Studio 88', initials: 'S8' },
  { name: 'Grupo Vértice', initials: 'GV' },
  { name: 'TasteLab', initials: 'TL' },
  { name: 'Ibérica Constructora', initials: 'IC' },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonios" data-reveal data-reveal-delay="90" className="scroll-mt-20 bg-gradient-to-b from-cami-900 to-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <span className="section-eyebrow">Clientes reales, resultados reales</span>
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Lo que dicen nuestros clientes</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-cami-300 md:text-lg">
            {brandConfig.copy.testimonialsIntro}
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cami-100">
            <span className="text-yellow-400">★★★★★</span> 4,9/5 — más de 1.200 pedidos entregados
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, idx) => {
            const initials = item.customerName
              .split(' ')
              .slice(0, 2)
              .map((n: string) => n[0])
              .join('');
            return (
              <article
                key={item.id}
                className="group rounded-2xl border border-white/12 bg-gradient-to-b from-cami-800 to-cami-900 p-6 shadow-glow transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-yellow-400" aria-label="Valoración 5 de 5">
                    <span>★★★★★</span>
                  </div>
                  <span className="rounded-full border border-green-400/30 bg-green-400/10 px-2 py-0.5 text-xs font-semibold text-green-300">
                    ✓ Verificado
                  </span>
                </div>

                <p className="line-clamp-5 text-sm leading-relaxed text-cami-200 md:text-base">&ldquo;{item.testimonialText}&rdquo;</p>

                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarColors[idx % avatarColors.length]}`}
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.customerName}</p>
                    <p className="text-xs text-cami-300">{item.role} · <span className="text-accent-400">{item.companyName}</span></p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Client logos band */}
        <div className="mt-14 border-t border-white/10 pt-10">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-cami-400">
            Confían en nosotros
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {clientLogos.map((logo) => (
              <div
                key={logo.name}
                title={logo.name}
                className="flex h-12 w-28 items-center justify-center rounded-lg border border-white/12 bg-white/5 text-sm font-bold tracking-wide text-cami-300 transition-all hover:border-white/25 hover:bg-white/10 hover:text-white"
              >
                {logo.initials} <span className="sr-only">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
