import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Template Nuevo | CamiArt',
  description: 'Template editable para iteraciones visuales de la landing.',
};

const navItems = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

const processSteps = [
  {
    step: '01',
    title: 'Brief rapido',
    body: 'Nos cuentas objetivo, unidades y fechas. Te respondemos con propuesta clara.',
  },
  {
    step: '02',
    title: 'Diseno y validacion',
    body: 'Ajustamos el arte contigo hasta aprobar una version lista para produccion.',
  },
  {
    step: '03',
    title: 'Produccion y entrega',
    body: 'Fabricacion controlada, seguimiento y entrega en plazo acordado.',
  },
];

const testimonials = [
  {
    quote:
      'Cumplieron tiempos y calidad en una campana con deadline agresivo.',
    author: 'Marta R.',
    role: 'Marketing, SaaS B2B',
  },
  {
    quote: 'Proceso ordenado y sin friccion. Repetimos para el siguiente evento.',
    author: 'Diego P.',
    role: 'People Ops, Retail',
  },
  {
    quote: 'Muy buen acabado y comunicacion continua durante todo el pedido.',
    author: 'Laura G.',
    role: 'Compras, Hosteleria',
  },
];

const faqItems = [
  {
    q: 'Cual es el minimo de unidades?',
    a: 'Este template parte de un minimo sugerido de 10 unidades por referencia.',
  },
  {
    q: 'Cuanto tarda un pedido?',
    a: 'El flujo estandar contempla entre 5 y 10 dias habiles, segun volumen.',
  },
  {
    q: 'Incluye ayuda con el diseno?',
    a: 'Si. Puedes iterar el arte dentro del alcance definido antes de producir.',
  },
];

export default function TemplateNuevoPage() {
  return (
    <main className="min-h-screen bg-cami-950 text-cami-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-cami-950/80 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="text-sm font-semibold tracking-[0.14em] text-cami-200">
            CAMIART TEMPLATE
          </a>
          <ul className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cami-200 transition hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#contacto"
            className="rounded-full border border-accent-300/30 bg-metal-button px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition hover:brightness-110"
          >
            CTA principal
          </a>
        </nav>
      </header>

      <section id="inicio" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="pointer-events-none absolute -top-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent-400/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cami-300">
              Bloque editable v1
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Titular potente para tu nueva landing
            </h1>
            <p className="mt-5 max-w-xl text-base text-cami-200 sm:text-lg">
              Este hero esta preparado para que cambies mensaje, oferta y enfoque visual sin romper estructura.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contacto"
                className="rounded-full border border-accent-300/40 bg-metal-button px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition hover:brightness-110"
              >
                Solicitar propuesta
              </a>
              <a
                href="#proceso"
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition hover:bg-white/10"
              >
                Ver proceso
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cami-300">Caja lateral editable</p>
            <ul className="mt-4 space-y-3 text-sm text-cami-100">
              <li className="rounded-2xl border border-white/10 bg-cami-900/70 px-4 py-3">Oferta 1: pack inicial</li>
              <li className="rounded-2xl border border-white/10 bg-cami-900/70 px-4 py-3">Oferta 2: pack equipo</li>
              <li className="rounded-2xl border border-white/10 bg-cami-900/70 px-4 py-3">Oferta 3: pack volumen</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="proceso" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Proceso</h2>
          <p className="max-w-lg text-sm text-cami-300">Puedes cambiar pasos, orden y copy segun cada vertical.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {processSteps.map((item) => (
            <article key={item.step} className="rounded-3xl border border-white/12 bg-white/[0.04] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cami-300">Paso {item.step}</p>
              <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-cami-200">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonios" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">Testimonios</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.author} className="rounded-3xl border border-white/12 bg-cami-900/60 p-6">
              <p className="text-sm leading-relaxed text-cami-100">"{item.quote}"</p>
              <p className="mt-5 text-sm font-semibold text-white">{item.author}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-cami-300">{item.role}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">FAQ</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <details key={item.q} className="rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold text-white">{item.q}</summary>
              <p className="mt-3 text-sm text-cami-200">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-accent-300/30 bg-gradient-to-br from-cami-900 to-cami-950 p-8 shadow-glow lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cami-300">Bloque final editable</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">CTA de cierre</h2>
          <p className="mt-4 max-w-2xl text-sm text-cami-200 sm:text-base">
            Sustituye este bloque por formulario, integracion CRM o WhatsApp segun el flujo que quieras testear.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="mailto:hola@camiart.com"
              className="rounded-full border border-accent-300/40 bg-metal-button px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 shadow-metal transition hover:brightness-110"
            >
              Empezar ahora
            </a>
            <a
              href="/"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-cami-100 transition hover:bg-white/10"
            >
              Volver al home actual
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
