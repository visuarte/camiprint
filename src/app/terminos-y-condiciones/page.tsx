import { brandConfig } from '@/config/brand';

export const metadata = {
  title: 'Términos y Condiciones — Camiart',
  description: 'Términos y condiciones de uso y contratación de Camiart.',
  alternates: { canonical: `${brandConfig.siteUrl}/terminos-y-condiciones` },
};

export default function Terms() {
  return (
    <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
      <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
      <p className="mt-4">Texto legal básico de términos y condiciones. Sustituir por la versión oficial cuando esté disponible.</p>
    </section>
  );
}
