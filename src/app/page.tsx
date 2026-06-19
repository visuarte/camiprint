import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AppHeader from '@/components/AppHeader'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'CamiArt — Camisetas personalizadas para tu negocio',
  description: 'Camisetas, polos y sudaderas corporativas con tu marca. DTF, bordado o serigrafía. Presupuesto gratis en 24h. Desde 10 unidades.',
  keywords: ['camisetas personalizadas', 'camisetas empresa', 'ropa laboral personalizada', 'uniforme empresa', 'DTF', 'serigrafía'],
  openGraph: {
    title: 'CamiArt — Camisetas personalizadas para tu negocio',
    description: 'Camisetas corporativas con tu marca. Presupuesto gratis en 24h. Desde 10 unidades.',
    url: 'https://camiart.com',
    siteName: 'CamiArt',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CamiArt — Camisetas personalizadas',
    description: 'Camisetas corporativas con tu marca. Presupuesto gratis en 24h.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://camiart.com' },
}

const fonts = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');
  :root {
    --ff-body: 'Inter', system-ui, -apple-system, sans-serif;
    --ff-display: 'Space Grotesk', 'Inter', sans-serif;
    --c-accent: #ff4f00;
    --c-accent-hover: #e64500;
    --c-bg: #fafafa;
    --c-surface: #ffffff;
    --c-text: #111111;
    --c-text-secondary: #6b7280;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }
`

export default function HomePage() {
  return (
    <>
      <style>{fonts}</style>
      <div style={{ fontFamily: 'var(--ff-body)', background: '#fff', color: 'var(--c-text)', minHeight: '100vh' }}>
        <AppHeader variant="light" />

        <main>
          {/* HERO — instant, clean, professional */}
          <section style={{
            position: 'relative', overflow: 'hidden', padding: '80px 0 60px',
            background: 'linear-gradient(135deg, #fafafa 0%, #fff 50%, #fff4ed 100%)'
          }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: '#fff0e6', borderRadius: 100, padding: '6px 16px 6px 6px',
                    fontSize: 13, fontWeight: 600, color: 'var(--c-accent)', marginBottom: 24
                  }}>
                    <span style={{
                      background: 'var(--c-accent)', color: '#fff', borderRadius: 100,
                      padding: '2px 10px', fontSize: 11, fontWeight: 700
                    }}>NUEVO</span>
                    Diseñador 3D online
                  </div>
                  <h1 style={{
                    fontFamily: 'var(--ff-display)', fontSize: 56, fontWeight: 900,
                    lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0
                  }}>
                    Tu marca en cada<br />
                    <span style={{ color: 'var(--c-accent)' }}> prenda</span>
                  </h1>
                  <p style={{
                    fontSize: 18, lineHeight: 1.6, color: 'var(--c-text-secondary)',
                    marginTop: 20, maxWidth: 480
                  }}>
                    Camisetas, polos y sudaderas personalizadas para empresas.
                    Diseño gratis, producción propia, envío en 3-7 días.
                  </p>
                  <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                    <Link href="/catalog"
                      style={{
                        background: 'var(--c-accent)', color: '#fff', padding: '14px 32px',
                        borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15,
                        textDecoration: 'none', transition: 'all .2s',
                        display: 'inline-flex', alignItems: 'center', gap: 8
                      }}>
                      VER CATÁLOGO
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                    <Link href="/designer"
                      style={{
                        border: '2px solid #e5e7eb', color: 'var(--c-text)', padding: '14px 32px',
                        borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 15,
                        textDecoration: 'none', transition: 'all .2s',
                        display: 'inline-flex', alignItems: 'center', gap: 8
                      }}>
                      DISEÑAR 3D
                    </Link>
                  </div>
                  <div style={{ display: 'flex', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
                    {[['Desde 10 uds', 'sin mínimo abusivo'], ['Presupuesto', 'gratis en 24h'], ['Envío', '3-7 días España']].map(([a, b]) => (
                      <div key={a}>
                        <p style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, margin: 0 }}>{a}</p>
                        <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', margin: '2px 0 0' }}>{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: -24,
                    background: 'radial-gradient(circle, rgba(255,79,0,0.08) 0%, transparent 70%)',
                    borderRadius: '50%'
                  }} />
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                    position: 'relative'
                  }}>
                    {['/portfolio/real-1.jpg', '/portfolio/real-2.jpg', '/portfolio/real-3.jpg', '/portfolio/real-4.jpg'].map((src, i) => (
                      <div key={src} style={{
                        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                        aspectRatio: i < 2 ? '1' : '1',
                        background: '#f3f4f6'
                      }}>
                        <Image src={src} alt={`Ejemplo ${i + 1}`} width={300} height={300}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          priority={i < 2} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST BAR */}
          <section style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '28px 0' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', opacity: 0.4 }}>
                {['DTF Premium', 'Serigrafía', 'Bordado', 'Vinilo', 'Sublimación'].map((t) => (
                  <span key={t} style={{ fontFamily: 'var(--ff-display)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t}</span>
                ))}
              </div>
            </div>
          </section>

          {/* CATEGORIES */}
          <section style={{ padding: '80px 0' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 36, fontWeight: 900, textAlign: 'center', margin: 0 }}>Nuestros productos</h2>
              <p style={{ textAlign: 'center', color: 'var(--c-text-secondary)', marginTop: 8, fontSize: 16 }}>
                Cuatro categorías, una calidad
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 40 }}>
                {[
                  { name: 'Camisetas', img: '/portfolio/real-1.jpg', desc: 'DTF, vinilo, serigrafía' },
                  { name: 'Polos', img: '/portfolio/real-2.jpg', desc: 'Bordado corporativo' },
                  { name: 'Sudaderas', img: '/portfolio/real-3.jpg', desc: 'Personalización completa' },
                  { name: 'Uniformes', img: '/portfolio/real-4.jpg', desc: 'Equipos completos' },
                ].map((cat) => (
                  <Link key={cat.name} href="/catalog" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#f3f4f6', aspectRatio: '3/4' }}>
                      <Image src={cat.img} alt={cat.name} width={300} height={400}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} />
                    </div>
                    <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: 17, fontWeight: 700, margin: '12px 0 2px' }}>{cat.name}</h3>
                    <p style={{ fontSize: 14, color: 'var(--c-text-secondary)', margin: 0 }}>{cat.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section style={{ background: '#f9fafb', padding: '80px 0' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 36, fontWeight: 900, margin: 0 }}>Cómo funciona</h2>
              <p style={{ color: 'var(--c-text-secondary)', marginTop: 8, fontSize: 16 }}>Tres pasos. Sin complicaciones.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 }}>
                {[
                  { n: '01', t: 'Diseñas', d: 'Elige modelo y color. Sube tu logo o usa nuestro diseñador 3D.' },
                  { n: '02', t: 'Aprobamos', d: 'Te enviamos la prueba virtual gratis. Hasta 3 cambios sin coste.' },
                  { n: '03', t: 'Recibes', d: 'Producimos y enviamos a toda España en 3-7 días.' },
                ].map((s) => (
                  <div key={s.n} style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)', padding: 32,
                    border: '1px solid #f3f4f6'
                  }}>
                    <span style={{ fontFamily: 'var(--ff-display)', fontSize: 48, fontWeight: 900, color: 'rgba(255,79,0,0.15)' }}>{s.n}</span>
                    <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, margin: '12px 0 8px' }}>{s.t}</h3>
                    <p style={{ fontSize: 15, color: 'var(--c-text-secondary)', lineHeight: 1.5, margin: 0 }}>{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section style={{ padding: '80px 0' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 36, fontWeight: 900, textAlign: 'center', margin: 0 }}>Lo que dicen</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 40 }}>
                {[
                  { n: 'Marina G.', c: 'Brasa Norte', t: '120 camisetas para todo el equipo. La calidad superó nuestras expectativas.' },
                  { n: 'Javier R.', c: 'Nexo Logistics', t: '200 camisetas en 8 días. Entregaron a tiempo con acabado excelente.' },
                  { n: 'Sofía R.', c: 'TasteLab', t: 'Validación del diseño en 2 horas, entrega en 9 días. Impecable.' },
                ].map((t) => (
                  <div key={t.n} style={{ background: '#f9fafb', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: '#374151', fontStyle: 'italic', margin: 0 }}>
                      &ldquo;{t.t}&rdquo;
                    </p>
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t.n}</p>
                      <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', margin: 0 }}>{t.c}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            padding: '80px 0', textAlign: 'center'
          }}>
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 24px' }}>
              <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 36, fontWeight: 900, color: '#fff', margin: 0 }}>
                ¿Hablamos?
              </h2>
              <p style={{ color: '#9ca3af', marginTop: 12, fontSize: 16, lineHeight: 1.6 }}>
                Presupuesto gratis en 24h. Sin compromiso.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/catalog"
                  style={{
                    background: 'var(--c-accent)', color: '#fff', padding: '14px 36px',
                    borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 15,
                    textDecoration: 'none'
                  }}>
                  PEDIR PRESUPUESTO
                </Link>
                <a href="tel:+34900000000"
                  style={{
                    border: '2px solid #374151', color: '#fff', padding: '14px 36px',
                    borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 15,
                    textDecoration: 'none'
                  }}>
                  LLÁMANOS
                </a>
              </div>
            </div>
          </section>

          {/* SCHEMA.ORG */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CamiArt',
              url: 'https://camiart.com',
              logo: 'https://camiart.com/logo.png',
              description: 'Camisetas personalizadas para empresas.',
              email: 'hola@camiart.com',
              address: { '@type': 'PostalAddress', addressLocality: 'Alicante', addressCountry: 'ES' },
              sameAs: ['https://www.instagram.com/camiart', 'https://www.facebook.com/camiart'],
            })
          }} />
        </main>

        <Footer variant="light" />
      </div>
    </>
  )
}
