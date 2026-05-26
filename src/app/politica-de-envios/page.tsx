import { brandConfig } from '@/config/brand';

export const metadata = {
  title: 'Política de Envíos — Camiart',
  description: 'Información sobre plazos y condiciones de envío para pedidos de camisetas y merchandising.',
  alternates: { canonical: `${brandConfig.siteUrl}/politica-de-envios` },
};

export default function Shipping() {
  return (
    <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
      <h1 className="text-3xl font-bold text-white">Política de Envíos</h1>
      <p className="mt-4">Plazos de envío estimados y condiciones. Sustituir por la política oficial antes de publicar.</p>
    </section>
  );
}
