interface PricingTier {
  id: string;
  quantity: string;
  minUnits: number;
  defaultUnits: number;
  pricePerUnit: number;
  savings: number;
  isPopular: boolean;
  idealFor: string;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: 'tier-10',
    quantity: '10+ camisetas',
    minUnits: 10,
    defaultUnits: 10,
    pricePerUnit: 12.9,
    savings: 8,
    isPopular: false,
    idealFor: 'Equipos pequeños y prueba de servicio',
    features: ['Impresión 1 color', 'Plazo: 10 días', 'Envío incluido', 'Soporte de arte final'],
  },
  {
    id: 'tier-25',
    quantity: '25+ camisetas',
    minUnits: 25,
    defaultUnits: 25,
    pricePerUnit: 10.9,
    savings: 18,
    isPopular: true,
    idealFor: 'Empresas con equipo de 25-50 personas',
    features: ['Impresión 2 colores', 'Plazo: 7-10 días', 'Envío + Tracking', 'Diseño gratuito', 'Muestra digital incluida'],
  },
  {
    id: 'tier-50',
    quantity: '50+ camisetas',
    minUnits: 50,
    defaultUnits: 50,
    pricePerUnit: 8.9,
    savings: 30,
    isPopular: false,
    idealFor: 'Grandes empresas y eventos corporativos',
    features: ['Impresión multicolor', 'Plazo: 5-7 días', 'Envío prioritario', 'Diseño + Muestras gratis', 'Precio negociable +100 uds'],
  },
];

const Pricing = () => {
  return (
    <section
      id="ofertas"
      data-reveal
      data-reveal-delay="40"
      className="scroll-mt-20 bg-gradient-to-b from-cami-950 to-cami-900 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="section-eyebrow">Precios transparentes sin sorpresas</span>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Cuánto cuesta tu pedido
          </h2>
          <p className="mx-auto max-w-2xl text-base text-cami-300 md:text-lg">
            El precio baja cuanto mayor es la serie. Envío, arte final y gestión incluidos en todos los packs.
          </p>
          <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-3 text-sm text-cami-200 sm:grid-cols-3">
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2"><span className="font-bold text-white">+300 empresas</span> activas este año</p>
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2"><span className="font-bold text-white">98%</span> de entregas en plazo</p>
            <p className="rounded-lg border border-white/12 bg-cami-900/60 px-3 py-2"><span className="font-bold text-white">Garantía</span> de reimpresión si hay fallo</p>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {pricingTiers.map((tier) => {
            const total = (tier.defaultUnits * tier.pricePerUnit).toFixed(0);
            return (
            <article
              key={tier.id}
              className={`relative overflow-hidden rounded-2xl border transition-all hover:-translate-y-1 ${
                tier.isPopular
                  ? 'border-accent-400/55 bg-gradient-to-b from-cami-700 to-cami-800 shadow-glow'
                  : 'border-white/12 bg-gradient-to-b from-cami-800 to-cami-900 shadow-metal'
              }`}
            >
              {tier.isPopular && (
                <div className="absolute right-0 top-0 rounded-bl-lg border border-accent-300/40 bg-accent-400/20 px-4 py-1 text-sm font-semibold text-accent-200">
                  ⭐ Más Popular
                </div>
              )}

              <div className="p-6 md:p-8">
                <h3 className="mb-1 text-xl font-bold text-white md:text-2xl">{tier.quantity}</h3>
                <p className="mb-4 text-xs text-cami-400">{tier.idealFor}</p>

                <div className="mb-2">
                  <span className="text-4xl font-bold text-accent-300 md:text-5xl">{tier.pricePerUnit.toFixed(2).replace('.', ',')} €</span>
                  <span className="block text-sm text-cami-300">por unidad · IVA no incluido</span>
                </div>

                {/* Total estimado */}
                <div className="mb-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                  <span className="text-cami-300">Total {tier.defaultUnits} uds: </span>
                  <span className="font-bold text-white">{total} €</span>
                  <span className="ml-2 text-xs text-green-400">+ IVA</span>
                </div>

                <div className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-cami-100">
                  ↓ Ahorras {tier.savings}% vs precio unitario
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-cami-200">
                      <span className="mt-0.5 font-bold text-accent-300">✓</span>
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`#contacto?quantity=${tier.id}`}
                  className={`block w-full rounded-lg border px-4 py-3 text-center font-semibold transition-all hover:brightness-110 ${
                    tier.isPopular
                      ? 'border-white/25 bg-metal-button text-cami-100 shadow-glow'
                      : 'border-white/15 bg-white/10 text-cami-100 shadow-metal'
                  }`}
                >
                  Pedir presupuesto →
                </a>
              </div>
            </article>
            );
          })}
        </div>

        {/* Guarantee strip */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-white/5 px-6 py-5 text-center md:flex-row md:gap-10 md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🔒</span>
            <span className="text-sm text-cami-200"><strong className="text-white">Pago seguro</strong> — Stripe cifrado</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">✅</span>
            <span className="text-sm text-cami-200"><strong className="text-white">Garantía de reimpresión</strong> si hay error de producción</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📦</span>
            <span className="text-sm text-cami-200"><strong className="text-white">Envío incluido</strong> a toda España</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="mx-auto max-w-3xl text-xs text-cami-400">
            Precios orientativos. La propuesta final se ajusta al arte, la técnica de marcaje, el tejido y la urgencia real del pedido. Solicita tu presupuesto sin compromiso.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;