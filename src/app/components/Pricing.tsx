import Link from 'next/link';

interface PricingTier {
  id: string;
  quantity: string;
  pricePerUnit: string;
  savings: number;
  isPopular: boolean;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: 'tier-10',
    quantity: '10+ camisetas',
    pricePerUnit: '12.9 €',
    savings: 8,
    isPopular: false,
    features: ['Impresión 1 color', 'Plazo: 10 días', 'Shipping incluido'],
  },
  {
    id: 'tier-25',
    quantity: '25+ camisetas',
    pricePerUnit: '10.9 €',
    savings: 18,
    isPopular: true,
    features: ['Impresión 2 colores', 'Plazo: 7-10 días', 'Shipping + Tracking', 'Diseño gratuito'],
  },
  {
    id: 'tier-50',
    quantity: '50+ camisetas',
    pricePerUnit: '8.9 €',
    savings: 30,
    isPopular: false,
    features: ['Impresión multicolor', 'Plazo: 5-7 días', 'Shipping prioritario', 'Diseño + Muestras gratis'],
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
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            Ofertas por cantidad
          </h2>
          <p className="mx-auto max-w-2xl text-base text-cami-300 md:text-lg">
            Cuantas más camisetas, mayor descuento. Precios competitivos para tu negocio.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {pricingTiers.map((tier) => (
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
                <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">{tier.quantity}</h3>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-accent-300 md:text-5xl">{tier.pricePerUnit}</span>
                  <span className="block text-sm text-cami-300">por unidad</span>
                </div>

                <div className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold text-cami-100">
                  ↓ Ahorra {tier.savings}%
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-cami-200">
                      <span className="mt-0.5 font-bold text-accent-300">✓</span>
                      <span className="text-sm md:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`#contacto?quantity=${tier.id}`}
                  className={`block w-full rounded-lg border px-4 py-3 text-center font-semibold transition-all hover:brightness-110 ${
                    tier.isPopular
                      ? 'border-white/25 bg-metal-button text-cami-100 shadow-glow'
                      : 'border-white/15 bg-white/10 text-cami-100 shadow-metal'
                  }`}
                >
                  Solicitar Cotización
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="mx-auto max-w-3xl text-xs text-cami-300 md:text-sm">
            💡 <strong>Precios orientativos.</strong> La cotización final dependerá del diseño, técnica de impresión, tejido seleccionado y especificaciones del pedido. Contacta con nuestro equipo para una propuesta personalizada.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;