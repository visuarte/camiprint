import type { Metadata } from 'next';
import Link from 'next/link';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: `Política de Cookies — ${brandConfig.displayName}`,
  description: 'Información sobre el uso de cookies en el sitio web de CamiPrint, conforme al RGPD y la LSSI.',
  robots: { index: true, follow: true },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="mb-3 text-xl font-semibold text-white">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-cami-300">{children}</div>
  </section>
);

export default function PoliticaDeCookiesPage() {
  const updated = '26 de mayo de 2026';

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="mb-8 inline-block text-sm text-cami-400 transition-colors hover:text-white">
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Política de Cookies
        </h1>
        <p className="mt-2 text-sm text-cami-400">
          Última actualización: {updated}
        </p>
      </div>

      <Section title="1. ¿Qué son las cookies?">
        <p>
          Una cookie es un pequeño fichero de texto que un sitio web almacena en tu navegador o dispositivo cuando lo visitas. Las cookies permiten que el sitio web recuerde tus acciones y preferencias durante un período de tiempo, para que no tengas que volver a introducir esa información cada vez que vuelvas al sitio o navegues de una página a otra.
        </p>
      </Section>

      <Section title="2. Responsable del tratamiento">
        <p>
          <strong className="text-white">Razón social:</strong> {brandConfig.displayName}<br />
          <strong className="text-white">Email de contacto:</strong>{' '}
          <a href={`mailto:privacy@CamiPrint.com`} className="text-cami-200 underline underline-offset-2 hover:text-white">
            privacy@CamiPrint.com
          </a><br />
          <strong className="text-white">Dirección:</strong> {brandConfig.postalAddress}
        </p>
      </Section>

      <Section title="3. Tipos de cookies que utilizamos">
        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Proveedor</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Duración</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Finalidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {/* Técnicas */}
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-white">admin_token</td>
                <td className="px-4 py-3">CamiPrint</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs text-blue-300">Técnica</span>
                </td>
                <td className="px-4 py-3">7 días</td>
                <td className="px-4 py-3">Autenticación del panel de administración. Solo se activa si accedes al área privada.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-white">__vercel_toolbar</td>
                <td className="px-4 py-3">Vercel</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs text-blue-300">Técnica</span>
                </td>
                <td className="px-4 py-3">Sesión</td>
                <td className="px-4 py-3">Herramienta de despliegue del proveedor de alojamiento. No recoge datos personales de los visitantes.</td>
              </tr>
              {/* Analítica */}
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-white">_va</td>
                <td className="px-4 py-3">Vercel Analytics</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-900/40 px-2 py-0.5 text-xs text-amber-300">Analítica</span>
                </td>
                <td className="px-4 py-3">1 año</td>
                <td className="px-4 py-3">Medición de visitas y rendimiento del sitio web de forma agregada y anonimizada. Los datos no se venden ni comparten con terceros.</td>
              </tr>
              {/* Pago */}
              <tr>
                <td className="px-4 py-3 font-mono text-xs text-white">__stripe_mid, __stripe_sid</td>
                <td className="px-4 py-3">Stripe</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-purple-900/40 px-2 py-0.5 text-xs text-purple-300">Necesaria (pago)</span>
                </td>
                <td className="px-4 py-3">1 año / sesión</td>
                <td className="px-4 py-3">Procesamiento seguro de pagos. Imprescindibles para completar una transacción. Stripe actúa como encargado del tratamiento conforme al RGPD.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="4. Base legal">
        <p>
          El uso de cookies <strong className="text-white">técnicas y necesarias</strong> se basa en el <strong className="text-white">interés legítimo</strong> del responsable y en el artículo 22.2 de la LSSI, que exime del consentimiento previo a las cookies estrictamente necesarias para la prestación del servicio solicitado.
        </p>
        <p>
          Las cookies de <strong className="text-white">analítica</strong> se instalan únicamente con tu <strong className="text-white">consentimiento previo</strong>, que puedes otorgar o revocar en cualquier momento a través del panel de preferencias de este sitio.
        </p>
      </Section>

      <Section title="5. Cookies de terceros">
        <p>
          Algunos de los servicios integrados en este sitio son prestados por terceros. A continuación se enumeran sus respectivas políticas de privacidad:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <strong className="text-white">Vercel (alojamiento y analítica):</strong>{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">
              vercel.com/legal/privacy-policy
            </a>
          </li>
          <li>
            <strong className="text-white">Stripe (pasarela de pago):</strong>{' '}
            <a href="https://stripe.com/es/privacy" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">
              stripe.com/es/privacy
            </a>
          </li>
          <li>
            <strong className="text-white">Resend (envío de correo transaccional):</strong>{' '}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">
              resend.com/legal/privacy-policy
            </a>
          </li>
        </ul>
      </Section>

      <Section title="6. Cómo gestionar o desactivar las cookies">
        <p>
          Puedes configurar tu navegador para que te avise de la recepción de cookies, o para que las rechace directamente. A continuación encontrarás los enlaces a las instrucciones de los navegadores más comunes:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">Google Chrome</a>
          </li>
          <li>
            <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">Mozilla Firefox</a>
          </li>
          <li>
            <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">Apple Safari</a>
          </li>
          <li>
            <a href="https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">Microsoft Edge</a>
          </li>
        </ul>
        <p>
          Ten en cuenta que deshabilitar determinadas cookies puede afectar al funcionamiento del sitio (p. ej., el proceso de pago requiere las cookies de Stripe).
        </p>
      </Section>

      <Section title="7. Transferencias internacionales">
        <p>
          Vercel, Inc. y Stripe, Inc. están establecidos en los Estados Unidos. Las transferencias de datos se realizan al amparo de las <strong className="text-white">Cláusulas Contractuales Tipo</strong> aprobadas por la Comisión Europea y, en el caso de Stripe, conforme al Marco de Privacidad de Datos UE-EE.UU. (DPF).
        </p>
      </Section>

      <Section title="8. Tus derechos">
        <p>
          Tienes derecho a acceder, rectificar, suprimir, limitar el tratamiento, oponerte y solicitar la portabilidad de tus datos relacionados con el uso de cookies. Puedes ejercer estos derechos escribiendo a{' '}
          <a href="mailto:privacy@CamiPrint.com" className="text-cami-200 underline underline-offset-2 hover:text-white">
            privacy@CamiPrint.com
          </a>{' '}
          adjuntando copia de tu DNI/NIE. También puedes presentar una reclamación ante la{' '}
          <a href="https://www.aepd.es" target="_blank" rel="noreferrer" className="text-cami-200 underline underline-offset-2 hover:text-white">
            Agencia Española de Protección de Datos (AEPD)
          </a>.
        </p>
      </Section>

      <Section title="9. Actualizaciones de esta política">
        <p>
          Nos reservamos el derecho de actualizar esta política cuando sea necesario, por ejemplo, ante cambios legislativos o en los servicios integrados. Cuando se produzcan cambios relevantes, lo notificaremos en el banner de cookies o mediante un aviso destacado en el sitio web.
        </p>
      </Section>

      {/* Back to top */}
      <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-cami-400">
        <Link href="/" className="transition-colors hover:text-white">← Volver al inicio</Link>
        <span className="mx-3">·</span>
        <Link href="/politica-privacidad" className="transition-colors hover:text-white">Política de Privacidad</Link>
        <span className="mx-3">·</span>
        <Link href="/terminos-y-condiciones" className="transition-colors hover:text-white">Términos y Condiciones</Link>
      </div>
    </main>
  );
}
