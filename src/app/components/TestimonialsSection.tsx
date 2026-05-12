import { testimonials } from '../data/testimonials';

const TestimonialsSection = () => {
  return (
    <section id="testimonios" data-reveal data-reveal-delay="90" className="scroll-mt-20 bg-gradient-to-b from-cami-900 to-cami-950 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <h2 className="text-3xl font-bold text-white md:text-4xl lg:text-5xl">Lo que dicen nuestros clientes</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-cami-300 md:text-lg">
            Casos reales de empresas que confiaron en Camiprint para su ropa laboral y campanas de marca.
          </p>
          <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cami-100">
            4.9/5 en satisfaccion con mas de 1200 pedidos entregados
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="group rounded-2xl border border-white/12 bg-gradient-to-b from-cami-800 to-cami-900 p-6 shadow-glow transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex items-center gap-1 text-sm text-accent-400" aria-label="Rating 5 de 5">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              <p className="line-clamp-5 text-sm leading-relaxed text-cami-200 md:text-base">{item.testimonialText}</p>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-base font-semibold text-white">{item.customerName}</p>
                <p className="text-sm text-cami-300">{item.role}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-accent-400">{item.companyName}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
