import { brandConfig } from '@/config/brand';
import Link from 'next/link';

export const metadata = {
  title: 'Política de Envíos — CamiPrint',
  description: 'Información sobre plazos y condiciones de envío para pedidos de camisetas y merchandising.',
  alternates: { canonical: `${brandConfig.siteUrl}/politica-de-envios` },
};

export default function Shipping() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Política de Envíos</h1>
      <p className="mt-4 text-cami-300">Última actualización: 26 de mayo de 2026</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">1. Ámbito</h2>
        <p className="text-sm text-cami-300">Esta política regula los plazos, costes y condiciones de envío aplicables a los pedidos realizados en CamiPrint. Se aplica a envíos dentro de España peninsular y, cuando proceda, a envíos internacionales según se indique en la ficha del producto.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">2. Plazos de preparación</h2>
        <p className="text-sm text-cami-300">Los pedidos se preparan en un plazo de 2 a 5 días laborables desde la confirmación del pago y la aprobación del diseño (si aplica). Los pedidos con personalización compleja pueden requerir un plazo adicional que se indicará en el presupuesto.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">3. Transporte y entrega</h2>
        <ul className="list-inside list-disc space-y-2 pl-4 text-sm text-cami-300">
          <li><strong>Envío estándar (península):</strong> 24–72 horas una vez preparado el pedido.</li>
          <li><strong>Entrega urgente:</strong> disponible bajo presupuesto y sujeto a condiciones de producción.</li>
          <li><strong>Envíos a Baleares/Canarias/CE/EEUU/otros:</strong> consultar tiempos y costes en el proceso de compra.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">4. Costes de envío</h2>
        <p className="text-sm text-cami-300">Los costes de envío se calculan en función del peso, volumen y destino y se muestran en el checkout antes de confirmar el pedido. Ofrecemos envío gratuito en pedidos que superen el importe que se indique en promociones vigentes.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">5. Seguimiento</h2>
        <p className="text-sm text-cami-300">Recibirás un email con el número de seguimiento una vez el pedido salga del almacén. Si no recibes este email en el plazo indicado, contacta con nosotros en <a href="mailto:help@CamiPrint.com" className="text-cami-200 underline">help@CamiPrint.com</a>.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">6. Incidencias, daños y pérdidas</h2>
        <p className="text-sm text-cami-300">Revisa el paquete en el momento de la entrega. Si detectas daños aparentes, anótalo en el albarán y notifícanos al correo anterior en las 24 horas siguientes, incluyendo fotos y descripción. Gestionaremos la reclamación con la agencia de transporte y, en su caso, procederemos a reposición o devolución según corresponda.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">7. Cambio de dirección y reenvío</h2>
        <p className="text-sm text-cami-300">Si necesitas cambiar la dirección después de confirmar el pedido, contacta con nosotros inmediatamente. Los cambios aceptados antes del despacho son gratuitos; si el pedido ya ha salido, los costes de reenvío correrán a cargo del cliente.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">8. Fuerza mayor</h2>
        <p className="text-sm text-cami-300">No seremos responsables por retrasos o incumplimientos derivados de causas de fuerza mayor, incluidas huelgas, pandemias, restricciones aduaneras o problemas del transportista.</p>
      </section>

      <div className="mt-12 border-t border-white/10 pt-6 text-sm text-cami-400">
        <Link href="/" className="transition-colors hover:text-white">← Volver al inicio</Link>
        <span className="mx-3">·</span>
        <Link href="/politica-privacidad" className="transition-colors hover:text-white">Política de Privacidad</Link>
        <span className="mx-3">·</span>
        <Link href="/politica-de-cookies" className="transition-colors hover:text-white">Política de Cookies</Link>
      </div>
    </main>
  );
}
