import { brandConfig } from '@/config/brand';

export const metadata = {
  title: 'Términos y Condiciones — CamiPrint',
  description: 'Términos y condiciones de uso y contratación de CamiPrint.',
  alternates: { canonical: `${brandConfig.siteUrl}/terminos-y-condiciones` },
};

export default function Terms() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold text-white">Términos y Condiciones</h1>
      <p className="mt-4 text-cami-300">Última actualización: 26 de mayo de 2026</p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-white">1. Objeto</h2>
        <p className="text-sm text-cami-300">Estos Términos y Condiciones regulan el uso del sitio web y la contratación de productos ofrecidos por {brandConfig.displayName} a través de https://CamiPrint.com.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">2. Aceptación</h2>
        <p className="text-sm text-cami-300">La realización de un pedido implica la aceptación íntegra de los presentes términos. Nos reservamos el derecho a modificar las condiciones en cualquier momento; las variaciones serán de aplicación a los pedidos realizados con posterioridad.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">3. Productos y precios</h2>
        <p className="text-sm text-cami-300">Los precios están expresados en euros e incluyen el IVA legal cuando proceda. Los gastos de envío se calculan aparte. Nos esforzamos por mostrar la información de producto de forma precisa; si detectas un error de precio, te informaremos y podrás cancelar el pedido o confirmar el pago correcto.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">4. Pedidos y contrato</h2>
        <p className="text-sm text-cami-300">Para formalizar la compra debes completar el proceso de checkout y efectuar el pago. El contrato queda formalizado cuando enviemos el email de confirmación del pedido.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">5. Pago</h2>
        <p className="text-sm text-cami-300">Aceptamos los métodos de pago que se indican en la pasarela (Stripe). Los datos de tarjeta son gestionados por Stripe y no son almacenados por {brandConfig.displayName}.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">6. Entrega y devoluciones</h2>
        <p className="text-sm text-cami-300">Los plazos y condiciones de entrega se describen en nuestra <a href="/politica-de-envios" className="text-cami-200 underline">Política de Envíos</a>. Debido a la naturaleza personalizada de muchos productos, las devoluciones solo se aceptan por defectos de fabricación o errores imputables a CamiPrint; para el resto de casos consultar condiciones específicas en la política de devolución incluida en la confirmación del pedido.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">7. Garantía</h2>
        <p className="text-sm text-cami-300">Nuestros productos cuentan con la garantía legal frente a defectos de conformidad según la legislación vigente. Para ejercer la garantía, contacta con <a href="mailto:help@CamiPrint.com" className="text-cami-200 underline">help@CamiPrint.com</a> y facilita la información del pedido y fotografías.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">8. Propiedad intelectual</h2>
        <p className="text-sm text-cami-300">Todos los contenidos del sitio (textos, imágenes, marcas y diseños) son titularidad de {brandConfig.displayName} o de terceros que han autorizado su uso. Queda prohibida la reproducción o explotación no autorizada.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">9. Responsabilidad</h2>
        <p className="text-sm text-cami-300">En la medida permitida por la ley, la responsabilidad de {brandConfig.displayName} se limita al importe del pedido por incumplimiento demostrable. No somos responsables por daños indirectos o lucro cesante.</p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold text-white">10. Ley aplicable y jurisdicción</h2>
        <p className="text-sm text-cami-300">Estos términos se rigen por la ley española. Para la resolución de conflictos, las partes se someten a los juzgados y tribunales del domicilio del consumidor o, en su defecto, a los tribunales de Madrid.</p>
      </section>

      <div className="mt-12 border-t border-white/10 pt-6 text-sm text-cami-400">
        <a href="/" className="transition-colors hover:text-white">← Volver al inicio</a>
        <span className="mx-3">·</span>
        <a href="/politica-privacidad" className="transition-colors hover:text-white">Política de Privacidad</a>
        <span className="mx-3">·</span>
        <a href="/politica-de-cookies" className="transition-colors hover:text-white">Política de Cookies</a>
      </div>
    </main>
  );
}
