const pricingItems = [
  { label: '10+', sub: 'Ahorro X%' },
  { label: '25+', sub: 'Ahorro Y%' },
  { label: '50+', sub: 'Mejor precio' },
];

const trustItems = [
  { icon: '◷', label: 'Propuesta en minutos' },
  { icon: '⚚', label: 'Ropa laboral' },
  { icon: '◉', label: 'Campanas publicitarias' },
];

const PricingBand = () => {
  return (
    <section id="ofertas" className="relative z-20 -mt-8 scroll-mt-20 px-4 pb-8 md:-mt-10 md:px-6 md:pb-10">
      <div className="mx-auto max-w-6xl rounded-2xl border border-white/15 bg-cami-900/75 shadow-glow backdrop-blur-xl">
        <div className="grid grid-cols-3 gap-2 p-3 md:gap-3 md:p-4">
          {pricingItems.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-white/15 bg-gradient-to-b from-white/20 to-white/5 px-3 py-2 text-center shadow-metal"
            >
              <p className="text-3xl font-bold leading-none text-white md:text-4xl">{item.label}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-cami-300 md:text-sm">{item.sub}</p>
            </article>
          ))}
        </div>

        <div className="mx-3 border-t border-white/10 md:mx-4" />

        <div className="grid grid-cols-1 gap-3 p-4 text-cami-100 md:grid-cols-3 md:gap-4 md:p-5">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center justify-center gap-2 text-base md:text-xl">
              <span aria-hidden="true" className="text-cami-300">{item.icon}</span>
              <span className="font-medium text-cami-100">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingBand;
