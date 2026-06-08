import { brandConfig } from '@/config/brand';

export const metadata = {
  title: 'Aviso Legal — CamiArt',
  description: `Aviso legal de ${brandConfig.displayName} conforme a la LSSI (Ley 34/2002).`,
  alternates: { canonical: `${brandConfig.siteUrl}/aviso-legal` },
};

export default function AvisoLegal() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Aviso Legal</h1>
      <p className="mt-4 text-cami-300">Última actualización: 8 de junio de 2026</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">1. Identificación del titular</h2>
        <p className="mt-2 text-sm text-cami-300">
          En cumplimiento con el deber de información recogido en la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-cami-300">
          <li><strong>Denominación social:</strong> {brandConfig.companyExample}</li>
          <li><strong>Domicilio social:</strong> Alicante, España</li>
          <li><strong>Correo electrónico:</strong> {brandConfig.supportEmail}</li>
          <li><strong>Teléfono:</strong> {brandConfig.phoneDisplay}</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">2. Objeto</h2>
        <p className="mt-2 text-sm text-cami-300">
          El presente Aviso Legal regula el uso y acceso al sitio web {brandConfig.siteUrl}. La navegación por el sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">3. Propiedad intelectual</h2>
        <p className="mt-2 text-sm text-cami-300">
          Todos los contenidos del sitio web (textos, imágenes, logotipos, archivos, etc.) son propiedad de {brandConfig.displayName} o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">4. Exclusión de responsabilidad</h2>
        <p className="mt-2 text-sm text-cami-300">
          No nos hacemos responsables de los daños o perjuicios derivados del uso del sitio web, ni de la presencia de virus u otros elementos dañinos. El usuario se compromete a hacer un uso adecuado del sitio web.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">5. Legislación aplicable</h2>
        <p className="mt-2 text-sm text-cami-300">
          Este Aviso Legal se rige por la legislación española. Para cualquier controversia derivada del uso del sitio web, las partes se someten a los juzgados y tribunales de Alicante, España.
        </p>
      </section>
    </main>
  );
}
