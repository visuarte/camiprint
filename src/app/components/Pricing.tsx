import Link from 'next/link';
import { ReactNode } from 'react';

interface PricingTier {
  id: string;
  quantity: string;
  quantityMin: number;
  pricePerUnit: number;
  currency: string;
  savings: number;
  isPopular: boolean;
  features: string[];
}

const pricingTiers: PricingTier[] = [
  {
    id: 'tier-10',
    quantity: '10+ camisetas',
    quantityMin: 10,
    pricePerUnit: 12.9,
    currency: '€',
    savings: 8,
    isPopular: false,
    features: ['Impresión 1 color', 'Plazo: 10 días', 'Shipping incluido'],
  },
  {
    id: 'tier-25',
    quantity: '25+ camisetas',
    quantityMin: 25,
    pricePerUnit: 10.9,
    currency: '€',
    savings: 18,
    isPopular: true,
    features: ['Impresión 2 colores', 'Plazo: 7-10 días', 'Shipping + Tracking', 'Diseño gratuito'],
  },
  {
    id: 'tier-50',
    quantity: '50+ camisetas',
    quantityMin: 50,
    pricePerUnit: 8.9,
    currency: '€',
    savings: 30,
    isPopular: false,
    features: ['Impresión multicolor', 'Plazo: 5-7 días', 'Shipping prioritario', 'Diseño + Muestras gratis'],
  },
];

const Pricing = (): ReactNode => {
  return (
    <section
      id="ofertas"
      className="scroll-mt-20 py-16 md:py-24 px-4 md:px-6 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ofertas por cantidad
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Cuantas más camisetas, mayor descuento. Precios competitivos para tu negocio.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Tier 1: 10+ camisetas */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all transform hover:scale-105 bg-white shadow-lg hover:shadow-xl"
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                10+ camisetas
              </h3>
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold text-blue-600">
                  12.9
                </span>
                <span className="text-xl text-gray-600 ml-1">€</span>
                <span className="text-sm text-gray-500 block">por unidad</span>
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                ↓ Ahorra 8%
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Impresión 1 color</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Plazo: 10 días</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Shipping incluido</span>
                </li>
              </ul>
              <Link
                href="#contacto?quantity=tier-10"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Solicitar Cotización
              </Link>
            </div>
          </div>

          {/* Tier 2: 25+ camisetas - POPULAR */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all transform hover:scale-105 md:scale-105 ring-2 ring-blue-500 shadow-2xl bg-white"
          >
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
              ⭐ Más Popular
            </div>
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                25+ camisetas
              </h3>
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold text-blue-600">
                  10.9
                </span>
                <span className="text-xl text-gray-600 ml-1">€</span>
                <span className="text-sm text-gray-500 block">por unidad</span>
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                ↓ Ahorra 18%
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Impresión 2 colores</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Plazo: 7-10 días</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Shipping + Tracking</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Diseño gratuito</span>
                </li>
              </ul>
              <Link
                href="#contacto?quantity=tier-25"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
              >
                Solicitar Cotización
              </Link>
            </div>
          </div>

          {/* Tier 3: 50+ camisetas */}
          <div
            className="relative rounded-2xl overflow-hidden transition-all transform hover:scale-105 bg-white shadow-lg hover:shadow-xl"
          >
            <div className="p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                50+ camisetas
              </h3>
              <div className="mb-4">
                <span className="text-4xl md:text-5xl font-bold text-blue-600">
                  8.9
                </span>
                <span className="text-xl text-gray-600 ml-1">€</span>
                <span className="text-sm text-gray-500 block">por unidad</span>
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                ↓ Ahorra 30%
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Impresión multicolor</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Plazo: 5-7 días</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Shipping prioritario</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span className="text-sm md:text-base">Diseño + Muestras gratis</span>
                </li>
              </ul>
              <Link
                href="#contacto?quantity=tier-50"
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Solicitar Cotización
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 md:mt-16 text-center">
          <p className="text-xs md:text-sm text-gray-500 max-w-3xl mx-auto">
            💡 <strong>Precios orientativos.</strong> La cotización final dependerá del diseño, técnica de impresión, tejido seleccionado y especificaciones del pedido. Contacta con nuestro equipo para una propuesta personalizada.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;