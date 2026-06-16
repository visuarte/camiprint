import type { Metadata } from 'next';
import Link from 'next/link';
import { brandConfig } from '@/config/brand';
import { PublicPhoneText } from '@/app/components/PublicContactClient';

export const metadata: Metadata = {
  title: `Política de Privacidad y Tratamiento de Datos — ${brandConfig.displayName}`,
  description:
    'Información sobre el tratamiento de datos personales de clientes conforme al Reglamento General de Protección de Datos (RGPD) y la LOPDGDD.',
  robots: { index: true, follow: true },
};

const Section = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) => (
  <section id={id} className="mb-10 scroll-mt-8">
    <h2 className="mb-3 text-xl font-semibold text-gray-900">{title}</h2>
    <div className="space-y-3 text-sm leading-relaxed text-cami-300">{children}</div>
  </section>
);

const Dl = ({ items }: { items: [string, React.ReactNode][] }) => (
  <dl className="divide-y divide-white/5 rounded-lg border border-white/10 text-sm">
    {items.map(([label, value]) => (
      <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-4">
        <dt className="w-44 shrink-0 font-semibold text-cami-200">{label}</dt>
        <dd className="text-cami-300">{value}</dd>
      </div>
    ))}
  </dl>
);

export default function PoliticaPrivacidadPage() {
  const updated = '26 de mayo de 2026';

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-cami-400 transition-colors hover:text-gray-900"
        >
          ← Volver al inicio
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl">
          Política de Privacidad y Tratamiento de Datos
        </h1>
        <p className="mt-2 text-sm text-cami-400">Última actualización: {updated}</p>
        <p className="mt-4 text-sm leading-relaxed text-cami-300">
          En <strong className="text-gray-900">{brandConfig.displayName}</strong> nos comprometemos a
          proteger la privacidad de nuestros clientes y a tratar sus datos personales de forma
          transparente, leal y conforme al{' '}
          <strong className="text-gray-900">
            Reglamento (UE) 2016/679 (RGPD)
          </strong>{' '}
          y la{' '}
          <strong className="text-gray-900">
            Ley Orgánica 3/2018 (LOPDGDD)
          </strong>
          .
        </p>
      </div>

      {/* Index */}
      <nav
        aria-label="Índice de la política"
        className="mb-10 rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cami-400">
          Contenido
        </p>
        <ol className="list-inside list-decimal space-y-1 text-cami-300">
          {[
            ['responsable', '1. Responsable del tratamiento'],
            ['datos-recogidos', '2. Datos personales que tratamos'],
            ['finalidades', '3. Finalidades y base legal'],
            ['destinatarios', '4. Destinatarios y encargados'],
            ['conservacion', '5. Plazos de conservación'],
            ['transferencias', '6. Transferencias internacionales'],
            ['derechos', '7. Tus derechos'],
            ['menores', '8. Menores de edad'],
            ['seguridad', '9. Medidas de seguridad'],
            ['cambios', '10. Cambios en esta política'],
          ].map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className="hover:text-gray-900">
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1 */}
      <Section id="responsable" title="1. Responsable del tratamiento">
        <Dl
          items={[
            ['Razón social', `${brandConfig.displayName}`],
            ['CIF / NIF', 'En proceso de obtención'],
            ['Domicilio social', brandConfig.postalAddress],
            [
              'Correo electrónico',
              <a
                key="email"
                href={`mailto:${brandConfig.privacyEmail}`}
                className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
              >
                {brandConfig.privacyEmail}
              </a>,
            ],
            ['Teléfono', <PublicPhoneText key="phone" />],
            ['Sitio web', brandConfig.siteUrl],
          ]}
        />
        <p className="mt-3">
          No estamos obligados a designar un Delegado de Protección de Datos (DPD) de forma
          obligatoria, si bien hemos designado un responsable interno de privacidad al que puedes
          dirigir cualquier consulta en la dirección indicada.
        </p>
      </Section>

      {/* 2 */}
      <Section id="datos-recogidos" title="2. Datos personales que tratamos">
        <p>Dependiendo de la relación que mantengas con nosotros, tratamos las siguientes categorías de datos:</p>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Categoría</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Datos concretos</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Identificación</td>
                <td className="px-4 py-3">Nombre completo, empresa, cargo</td>
                <td className="px-4 py-3">El propio interesado</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Contacto</td>
                <td className="px-4 py-3">Correo electrónico, teléfono</td>
                <td className="px-4 py-3">El propio interesado</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Pedido / cotización</td>
                <td className="px-4 py-3">Productos, cantidades, tallas, diseños, dirección de entrega</td>
                <td className="px-4 py-3">El propio interesado</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Pago</td>
                <td className="px-4 py-3">
                  Datos de tarjeta (procesados exclusivamente por Stripe — no accedemos a ellos),
                  confirmación de pago, referencia de transacción
                </td>
                <td className="px-4 py-3">Stripe (encargado)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Navegación</td>
                <td className="px-4 py-3">Dirección IP anonimizada, páginas visitadas, dispositivo, país</td>
                <td className="px-4 py-3">Vercel Analytics (agregado)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong className="text-gray-900">No tratamos datos especiales</strong> (salud, ideología,
          origen racial, etc.) ni datos de menores de forma deliberada (ver sección 8).
        </p>
      </Section>

      {/* 3 */}
      <Section id="finalidades" title="3. Finalidades y base legal">
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Finalidad</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Base legal (RGPD art. 6)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3">Gestionar y ejecutar tu solicitud de cotización o pedido</td>
                <td className="px-4 py-3">Art. 6.1.b — Ejecución del contrato</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Enviar comunicaciones transaccionales (confirmación de pedido, seguimiento, factura)</td>
                <td className="px-4 py-3">Art. 6.1.b — Ejecución del contrato</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Atender consultas, reclamaciones y ejercicio de derechos</td>
                <td className="px-4 py-3">Art. 6.1.c — Obligación legal / Art. 6.1.f — Interés legítimo</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Cumplimiento de obligaciones fiscales y contables</td>
                <td className="px-4 py-3">Art. 6.1.c — Obligación legal</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Prevención del fraude y seguridad de los sistemas</td>
                <td className="px-4 py-3">Art. 6.1.f — Interés legítimo</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Análisis estadístico agregado del rendimiento web (sin identificación individual)</td>
                <td className="px-4 py-3">Art. 6.1.a — Consentimiento (banner de cookies)</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Envío de comunicaciones comerciales propias a clientes existentes sobre productos similares</td>
                <td className="px-4 py-3">Art. 6.1.f — Interés legítimo (LSSI art. 21.2) — con opción de baja en cada envío</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          No tomamos decisiones automatizadas que produzcan efectos jurídicos ni elaboramos perfiles con fines distintos a la mejora del servicio solicitado.
        </p>
      </Section>

      {/* 4 */}
      <Section id="destinatarios" title="4. Destinatarios y encargados del tratamiento">
        <p>
          No cedemos tus datos a terceros salvo obligación legal. Sí contamos con encargados del
          tratamiento que actúan bajo nuestras instrucciones y con los que hemos suscrito (o están
          sujetos a) el correspondiente contrato de encargo (art. 28 RGPD):
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Encargado</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Servicio</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">País / Región</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Garantías</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Vercel, Inc.</td>
                <td className="px-4 py-3">Alojamiento web y analítica agregada</td>
                <td className="px-4 py-3">EE.UU. / UE (CDN)</td>
                <td className="px-4 py-3">Cláusulas Contractuales Tipo (CCT)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Stripe, Inc.</td>
                <td className="px-4 py-3">Procesamiento de pagos</td>
                <td className="px-4 py-3">EE.UU. / UE</td>
                <td className="px-4 py-3">CCT + Marco DPF UE-EE.UU.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Resend, Inc.</td>
                <td className="px-4 py-3">Envío de correo transaccional</td>
                <td className="px-4 py-3">EE.UU.</td>
                <td className="px-4 py-3">CCT</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Supabase, Inc.</td>
                <td className="px-4 py-3">Base de datos (pedidos y cotizaciones)</td>
                <td className="px-4 py-3">EE.UU. / AWS us-east-1</td>
                <td className="px-4 py-3">CCT</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Las fuerzas y cuerpos de seguridad del Estado, autoridades fiscales o judiciales pueden
          acceder a tus datos en el ejercicio de sus competencias legales.
        </p>
      </Section>

      {/* 5 */}
      <Section id="conservacion" title="5. Plazos de conservación">
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Tipo de dato</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Plazo</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Norma de referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3">Datos de pedido y facturación</td>
                <td className="px-4 py-3">5 años</td>
                <td className="px-4 py-3">Código de Comercio art. 30</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Datos fiscales (facturas)</td>
                <td className="px-4 py-3">10 años</td>
                <td className="px-4 py-3">Ley General Tributaria art. 66-70</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Cotizaciones no convertidas</td>
                <td className="px-4 py-3">1 año desde la solicitud</td>
                <td className="px-4 py-3">Interés legítimo</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Comunicaciones comerciales y baja</td>
                <td className="px-4 py-3">3 años desde la última interacción</td>
                <td className="px-4 py-3">LOPDGDD / LSSI</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Logs de acceso y seguridad</td>
                <td className="px-4 py-3">12 meses</td>
                <td className="px-4 py-3">Ley 34/2002 (LSSI) art. 12</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Datos de analytics (agregados)</td>
                <td className="px-4 py-3">13 meses</td>
                <td className="px-4 py-3">Directriz AEPD / CNIL</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Transcurrido el plazo activo, los datos se bloquean y solo se conservan a disposición de
          autoridades durante el período legal exigido, tras el cual son destruidos de forma segura.
        </p>
      </Section>

      {/* 6 */}
      <Section id="transferencias" title="6. Transferencias internacionales de datos">
        <p>
          Algunos encargados del tratamiento están establecidos en Estados Unidos. Las transferencias
          se amparan en:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>
            <strong className="text-gray-900">Cláusulas Contractuales Tipo (CCT)</strong> aprobadas por
            la Decisión de Ejecución (UE) 2021/914 de la Comisión Europea.
          </li>
          <li>
            <strong className="text-gray-900">Marco de Privacidad de Datos UE-EE.UU. (DPF)</strong>,
            para los prestadores adheridos (Stripe).
          </li>
        </ul>
        <p>
          Puedes solicitar una copia de las garantías aplicables escribiéndonos a{' '}
          <a
            href={`mailto:${brandConfig.privacyEmail}`}
            className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
          >
            {brandConfig.privacyEmail}
          </a>
          .
        </p>
      </Section>

      {/* 7 */}
      <Section id="derechos" title="7. Tus derechos">
        <p>
          Como interesado puedes ejercer en cualquier momento los siguientes derechos reconocidos por
          el RGPD:
        </p>
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Derecho</th>
                <th className="px-4 py-3 text-left font-semibold text-cami-200">Qué te permite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Acceso</td>
                <td className="px-4 py-3">Conocer qué datos tenemos sobre ti y cómo los tratamos.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Rectificación</td>
                <td className="px-4 py-3">Corregir datos inexactos o incompletos.</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Supresión («derecho al olvido»)</td>
                <td className="px-4 py-3">
                  Solicitar la eliminación de tus datos cuando ya no sean necesarios (salvo
                  obligaciones legales de conservación).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Limitación del tratamiento</td>
                <td className="px-4 py-3">
                  Solicitar que bloqueemos el tratamiento de tus datos mientras se resuelve una
                  impugnación o reclamación.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Portabilidad</td>
                <td className="px-4 py-3">
                  Recibir tus datos en formato estructurado y de uso común para transferirlos a otro
                  responsable (cuando el tratamiento se base en contrato o consentimiento).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Oposición</td>
                <td className="px-4 py-3">
                  Oponerte al tratamiento basado en interés legítimo o con fines de marketing
                  directo.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-gray-900">Retirada del consentimiento</td>
                <td className="px-4 py-3">
                  Retirar el consentimiento prestado en cualquier momento, sin que ello afecte a la
                  licitud del tratamiento previo.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-5 py-4">
          <p className="mb-1 font-semibold text-gray-900">Cómo ejercer tus derechos</p>
          <p>
            Envía un correo a{' '}
            <a
              href={`mailto:${brandConfig.privacyEmail}`}
              className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
            >
              {brandConfig.privacyEmail}
            </a>{' '}
            indicando el derecho que deseas ejercer e incluyendo copia de tu DNI/NIE u otro documento
            identificativo. Responderemos en el plazo máximo de <strong className="text-gray-900">1 mes</strong>{' '}
            (prorrogable 2 meses adicionales en casos complejos, con comunicación previa).
          </p>
          <p className="mt-2">
            Si consideras que el tratamiento no es conforme, tienes derecho a presentar una
            reclamación ante la{' '}
            <a
              href="https://www.aepd.es/es/derechos-y-deberes/conoce-tus-derechos/reclamacion-ante-la-aepd"
              target="_blank"
              rel="noreferrer"
              className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>
            .
          </p>
        </div>
      </Section>

      {/* 8 */}
      <Section id="menores" title="8. Menores de edad">
        <p>
          Nuestros servicios van dirigidos a empresas y profesionales. No recogemos
          conscientemente datos de menores de 14 años. Si detectamos que se han recabado datos de un
          menor sin el consentimiento de sus padres o tutores, procederemos a eliminarlos de inmediato.
          Si eres padre/madre o tutor y crees que tu hijo ha facilitado datos, contacta con nosotros en{' '}
          <a
            href={`mailto:${brandConfig.privacyEmail}`}
            className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
          >
            {brandConfig.privacyEmail}
          </a>
          .
        </p>
      </Section>

      {/* 9 */}
      <Section id="seguridad" title="9. Medidas de seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas adecuadas al nivel de riesgo, entre ellas:
        </p>
        <ul className="list-inside list-disc space-y-1 pl-2">
          <li>Transmisión cifrada mediante <strong className="text-gray-900">TLS 1.2+</strong> en todas las comunicaciones.</li>
          <li>Almacenamiento de contraseñas y tokens mediante funciones de hash resistentes (bcrypt / SHA-256).</li>
          <li>Acceso al panel de administración protegido por token secreto y cookie HttpOnly.</li>
          <li>Control de acceso basado en roles. Solo el personal autorizado accede a los datos de clientes.</li>
          <li>Copias de seguridad automáticas gestionadas por Supabase con retención de 7 días.</li>
          <li>Monitorización de errores y alertas de seguridad activas.</li>
        </ul>
        <p>
          En caso de brecha de seguridad que implique riesgo para tus derechos y libertades,
          notificaremos a la AEPD en el plazo de <strong className="text-gray-900">72 horas</strong> y a
          los afectados sin dilación indebida.
        </p>
      </Section>

      {/* 10 */}
      <Section id="cambios" title="10. Cambios en esta política">
        <p>
          Podemos actualizar esta política cuando sea necesario (cambios legislativos, nuevos
          servicios, etc.). Cuando los cambios sean sustanciales, lo comunicaremos por correo
          electrónico a los clientes afectados y/o mediante un aviso destacado en el sitio web con al
          menos <strong className="text-gray-900">30 días de antelación</strong>.
        </p>
        <p>
          La versión vigente siempre estará disponible en{' '}
          <Link
            href="/politica-privacidad"
            className="text-cami-200 underline underline-offset-2 hover:text-gray-900"
          >
            {brandConfig.siteUrl}/politica-privacidad
          </Link>
          .
        </p>
      </Section>

      {/* Footer nav */}
      <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-cami-400">
        <Link href="/" className="transition-colors hover:text-gray-900">
          ← Volver al inicio
        </Link>
        <span className="mx-3">·</span>
        <Link href="/politica-de-cookies" className="transition-colors hover:text-gray-900">
          Política de Cookies
        </Link>
        <span className="mx-3">·</span>
        <Link href="/terminos-y-condiciones" className="transition-colors hover:text-gray-900">
          Términos y Condiciones
        </Link>
      </div>
    </main>
  );
}
