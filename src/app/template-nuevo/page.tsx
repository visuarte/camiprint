'use client';

import { useEffect, useState } from 'react';
import { Manrope, Montserrat, Space_Grotesk } from 'next/font/google';
import ContactSection from '@/app/components/ContactSection';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] });

const navItems = [
  { label: 'INICIO', href: '#inicio' },
  { label: 'PROCESO', href: '#proceso' },
  { label: 'TESTIMONIOS', href: '#testimonios' },
  { label: 'FAQ', href: '#faq' },
];

const processSteps = [
  {
    step: '01',
    icon: 'assignment',
    title: 'Brief rapido',
    body: 'Nos cuentas objetivo, unidades y fechas. Te respondemos con propuesta clara.',
  },
  {
    step: '02',
    icon: 'draw',
    title: 'Diseno y validacion',
    body: 'Ajustamos el arte contigo hasta aprobar una version lista para produccion.',
  },
  {
    step: '03',
    icon: 'conveyor_belt',
    title: 'Produccion y entrega',
    body: 'Fabricacion controlada, seguimiento y entrega en plazo acordado.',
  },
];

const testimonials = [
  {
    quote: 'Cumplieron tiempos y calidad en una campana con deadline agresivo.',
    author: 'Marta R.',
    role: 'MARKETING, SAAS B2B',
  },
  {
    quote: 'Proceso ordenado y sin friccion. Repetimos para el siguiente evento.',
    author: 'Diego P.',
    role: 'PEOPLE OPS, RETAIL',
  },
  {
    quote: 'Muy buen acabado y comunicacion continua durante todo el pedido.',
    author: 'Laura G.',
    role: 'COMPRAS, HOSTELERIA',
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <main className={`${manrope.className} min-h-screen overflow-x-hidden bg-[#131313] text-[#e2e2e2]`}>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#ff4f00]/35 bg-[#131313]/92 shadow-[0_6px_26px_rgba(255,79,0,0.18)] backdrop-blur-xl">
        <nav className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 md:px-16">
          <a href="#inicio" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-[#ff4f00]" style={{ fontVariationSettings: "'FILL' 1" }}>
              precision_manufacturing
            </span>
            <span className={`${montserrat.className} text-xl font-extrabold tracking-tight text-[#ff4f00]`}>CAMIART</span>
          </a>

          <div className={`${spaceGrotesk.className} hidden items-center gap-8 text-sm tracking-[0.1em] md:flex`}>
            {navItems.map((item, index) => (
              <a
                key={item.href}
                href={item.href}
                className={index === 0 ? 'font-bold text-[#ff4f00] [text-shadow:0_0_8px_rgba(255,79,0,0.6)]' : 'text-[#e2e2e2]/70 transition-colors hover:text-[#e2e2e2]'}
              >
                {item.label}
              </a>
            ))}
            <a href="#contacto" className="bg-[#ff4f00] px-6 py-2 font-bold text-[#0A0A0A] transition hover:scale-105">
              CONTACTO
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md border border-[#ff4f00]/45 bg-[#ff4f00]/10 p-1.5 text-[#ff4f00] md:hidden"
            aria-label="Abrir menu"
            aria-expanded={isMenuOpen}
            aria-controls="template-v2-mobile-menu"
          >
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </nav>

        {isMenuOpen && (
          <div
            id="template-v2-mobile-menu"
            className={`${spaceGrotesk.className} fixed inset-0 z-[120] bg-[#0b0b0b] px-5 pb-8 pt-24 md:hidden`}
            role="dialog"
            aria-modal="true"
            aria-label="Menu movil"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#ff4f00]/35 pb-4">
              <p className="text-xs font-bold tracking-[0.14em] text-[#ff4f00]">NAVEGACION</p>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md border border-[#ff4f00]/45 bg-[#ff4f00]/10 px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#ff4f00]"
              >
                CERRAR
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm tracking-[0.1em]">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md border border-[#ff4f00]/30 bg-[#1a1a1a] px-4 py-4 text-[#e2e2e2]"
                >
                  {item.label}
                </a>
              ))}
              <a
                href="#contacto"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 rounded-md bg-[#ff4f00] px-4 py-4 text-center font-bold text-[#0A0A0A]"
              >
                CONTACTO
              </a>
            </div>
          </div>
        )}
      </header>

      <section id="inicio" className="relative min-h-[90vh] overflow-hidden bg-[#0A0A0A] pt-28">
        <div className="hazard-pattern absolute inset-0 opacity-10" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-5 pb-20 md:grid-cols-2 md:px-16">
          <div className="space-y-8">
            <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 rounded-full border border-[#ff4f00]/30 bg-[#ff4f00]/10 px-4 py-1 text-xs tracking-[0.1em] text-[#ff4f00]`}>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff4f00]" />
              INDUSTRIAL KINETIC DESIGN
            </div>
            <h1 className={`${montserrat.className} text-4xl font-black leading-tight md:text-7xl`}>
              Titular potente para tu <span className="text-[#ff4f00]">nueva landing</span>
            </h1>
            <p className="max-w-xl text-lg text-[#e2e2e2]/80">
              Este hero esta preparado para que cambies mensaje, oferta y enfoque visual sin romper estructura.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className={`${montserrat.className} bg-[#ff4f00] px-10 py-4 text-sm font-bold text-[#0A0A0A]`}>
                EMPEZAR AHORA
              </button>
              <a href="#proceso" className={`${montserrat.className} border border-[#e2e2e2]/20 px-10 py-4 text-sm font-bold text-[#e2e2e2]`}>
                PROCESOS
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-[#ff4f00]/20 blur-[120px]" />
            <img
              src="https://lh3.googleusercontent.com/aida/AP1WRLuHB4IklFXGvFxBa4PCSD-vG4HVQABBeP9W3qzJnmKb8DWPUI9xdxzbEzFP7qaogaanIe5Cn1DhrLpfIQRd2-gGJhgGHpcfjQ_0i2JrL6EdGdB6YTSFKYDI1x0Z2Hk19uOzozwwZM81Ff7F5_usrNhKJh_KN62g4I_F5aH3suO3dFGjlL2p42mcynLntyyggbV6LfUqgyZo0sLGYljHmhclSM_pH8hNynMDR0hIef8l2wzSvoetne_LuBR-"
              alt="CamiArt Premium T-Shirt"
              className="animate-float relative z-10 w-full drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>
      </section>

      <section id="proceso" className="mx-auto w-full max-w-[1440px] px-5 py-24 md:px-16">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className={`${spaceGrotesk.className} mb-2 text-sm tracking-[0.1em] text-[#ff4f00]`}>NUESTRO FLUJO</h2>
            <h3 className={`${montserrat.className} text-4xl font-extrabold md:text-5xl`}>Precision en cada fase.</h3>
          </div>
          <div className="mb-2 h-1 w-24 bg-[#ff4f00]" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {processSteps.map((item) => (
            <article key={item.step} className="group relative overflow-hidden border border-[#5c4037]/35 bg-[#1f1f1f] p-8 transition-all hover:border-[#ff4f00]">
              <span className={`${montserrat.className} absolute right-3 top-2 text-8xl font-black text-white/5 group-hover:text-white/10`}>
                {item.step}
              </span>
              <span className="material-symbols-outlined mb-6 text-5xl text-[#ff4f00]">{item.icon}</span>
              <h4 className={`${montserrat.className} mb-4 text-2xl font-bold uppercase`}>{item.title}</h4>
              <p className="text-[#e2e2e2]/70">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="testimonios" className="border-y border-[#5c4037]/25 bg-[#0A0A0A] py-24">
        <div className="mx-auto w-full max-w-[1440px] px-5 md:px-16">
          <div className="mb-16 text-center">
            <h3 className={`${montserrat.className} text-4xl font-extrabold md:text-5xl`}>Impacto Real</h3>
            <p className="mt-4 text-[#e2e2e2]/60">Nuestra maquinaria habla a traves de sus resultados.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="relative border-l-4 border-[#ff4f00] bg-[#1b1b1b] p-8 shadow-xl">
                <span className="material-symbols-outlined absolute right-3 top-3 text-6xl text-[#ff4f00]/30" style={{ fontVariationSettings: "'FILL' 1" }}>
                  format_quote
                </span>
                <p className="relative z-10 mb-6 text-lg italic">"{item.quote}"</p>
                <p className={`${montserrat.className} text-base font-bold`}>{item.author}</p>
                <p className={`${spaceGrotesk.className} text-xs tracking-[0.1em] text-[#ff4f00]`}>{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-[1000px] px-5 py-24 md:px-16">
        <div className="mb-12 flex items-center gap-4">
          <div className="h-[2px] flex-grow bg-[#5c4037]/40" />
          <h3 className={`${montserrat.className} px-4 text-2xl font-bold uppercase tracking-widest`}>Consultas Tecnicas</h3>
          <div className="h-[2px] flex-grow bg-[#5c4037]/40" />
        </div>

        <div className="space-y-4">
          {faqItems.map((item) => (
            <details key={item.q} className="group border border-[#5c4037]/35 bg-[#1b1b1b] p-6 open:border-[#ff4f00]">
              <summary className={`${montserrat.className} flex list-none items-center justify-between text-lg font-bold`}>
                {item.q}
                <span className="material-symbols-outlined text-[#ff4f00] transition-transform group-open:rotate-180">expand_more</span>
              </summary>
              <p className="mt-4 border-t border-[#5c4037]/20 pt-4 text-[#e2e2e2]/70">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <ContactSection />

      <footer className="relative w-full border-t-4 border-[#ff4f00] bg-[#0e0e0e] py-12">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-5 md:grid-cols-2 md:px-16">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#ff4f00]">precision_manufacturing</span>
              <span className={`${montserrat.className} text-lg font-extrabold text-[#e2e2e2]`}>CAMIART</span>
            </div>
            <p className="text-sm text-[#CBD5E1]">© 2026 CAMIART INDUSTRIAL. PRECISION ENGINEERED.</p>
          </div>

          <div className={`${spaceGrotesk.className} flex flex-wrap gap-x-8 gap-y-4 text-xs tracking-[0.1em] md:justify-end`}>
            <a className="text-[#CBD5E1] transition-colors hover:text-[#ff4f00]" href="#">TECNOLOGIA</a>
            <a className="text-[#CBD5E1] transition-colors hover:text-[#ff4f00]" href="#">PROCESOS</a>
            <a className="text-[#CBD5E1] transition-colors hover:text-[#ff4f00]" href="#">SEGURIDAD</a>
            <a className="text-[#CBD5E1] transition-colors hover:text-[#ff4f00]" href="#">PRIVACIDAD</a>
          </div>
        </div>
        <div className="hazard-pattern mt-12 h-2 w-full opacity-30" />
      </footer>

      <style>{`
        .hazard-pattern {
          background-image: repeating-linear-gradient(-45deg, #ff4f00, #ff4f00 10px, transparent 10px, transparent 20px);
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}
