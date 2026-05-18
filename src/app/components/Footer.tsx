const legalLinks = [
  { label: 'Politica de Privacidad', href: '/politica-privacidad' },
  { label: 'Terminos y Condiciones', href: '/terminos-y-condiciones' },
  { label: 'Politica de Envios', href: '/politica-de-envios' },
];

const quickLinks = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Ofertas', href: '#ofertas' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/camiprint',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/camiprint',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M13.8 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.5-1.5H17V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2V11H8v3h2.4v8h3.4z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/camiprint',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="currentColor">
        <path d="M6.3 8.5a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8zM4.7 9.9h3.2V20H4.7V9.9zm5 0H13v1.4h.1c.4-.8 1.4-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V20h-3.2v-4.8c0-1.1 0-2.5-1.6-2.5s-1.8 1.2-1.8 2.4V20H9.7V9.9z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer data-reveal data-reveal-delay="150" className="mt-10 border-t border-white/10 bg-gradient-to-b from-cami-950 to-black px-4 py-12 md:px-6 md:py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
        <section aria-label="Camiart" className="space-y-3">
          <a href="#inicio" className="inline-flex text-2xl font-extrabold tracking-tight text-white transition-opacity hover:opacity-90">
            Camiart
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-cami-300">
            Produccion de camisetas para empresas, restauracion y eventos. Propuestas claras, calidad estable y entregas puntuales.
          </p>
        </section>

        <section aria-label="Enlaces rapidos" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cami-200">Enlaces rapidos</h2>
          <ul className="space-y-2 text-sm text-cami-300">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Contacto" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cami-200">Contacto</h2>
          <ul className="space-y-2 text-sm text-cami-300">
            <li>
              <a href="mailto:hola@camiprint.com" className="transition-colors hover:text-white">hola@camiprint.com</a>
            </li>
            <li>
              <a href="tel:+34900111222" className="transition-colors hover:text-white">+34 900 111 222</a>
            </li>
            <li>
              <p>Av. de la Industria 18, Madrid</p>
            </li>
          </ul>
        </section>

        <section aria-label="Legal y redes" className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cami-200">Legal y social</h2>
          <ul className="space-y-2 text-sm text-cami-300">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 pt-1">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cami-200 transition-all hover:border-white/35 hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-xs text-cami-400">
        © {new Date().getFullYear()} Camiart. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer;
