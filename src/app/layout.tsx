import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camiprint | Camisetas laborales y publicitarias",
  description:
    "Tienda online de camisetas para negocios, restaurantes y empresas. Ofertas por cantidad desde 10 unidades, entrega en 7-10 días, diseño gratuito.",
  keywords: [
    "camisetas laborales",
    "camisetas publicitarias",
    "uniformes empresariales",
    "camisetas personalizadas",
    "estampación de camisetas",
  ],
  metadataBase: new URL("https://camiprint.com"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://camiprint.com",
    siteName: "Camiprint",
    title: "Camiprint | Camisetas laborales y publicitarias",
    description:
      "Tienda online de camisetas para negocios, restaurantes y empresas. Ofertas por cantidad desde 10 unidades.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Camiprint - Camisetas personalizadas",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://camiprint.com" />
      </head>
      <body className="flex min-h-full flex-col bg-neutral-950 text-neutral-100">
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="w-full bg-gradient-to-t from-neutral-900 via-neutral-800 to-neutral-950 border-t border-neutral-700 py-8 mt-8 shadow-2xl">
          <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-lg font-semibold tracking-wide text-neutral-100 drop-shadow">Camiprint © {new Date().getFullYear()}</div>
            <div className="flex gap-6 text-neutral-400 text-sm">
              <a href="/" className="hover:text-white transition-colors">Inicio</a>
              <a href="/" className="hover:text-white transition-colors">Productos</a>
              <a href="/" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/camiprint" target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-pink-400 transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 2C4.238 2 2 4.238 2 7v10c0 2.762 2.238 5 5 5h10c2.762 0 5-2.238 5-5V7c0-2.762-2.238-5-5-5H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5 1.5a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
              </a>
              <a href="https://www.facebook.com/camiprint" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-blue-400 transition-colors">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 2H7C4.238 2 2 4.238 2 7v10c0 2.762 2.238 5 5 5h5v-7h-2v-3h2v-2c0-2.21 1.343-3 3-3 .857 0 1.5.07 1.5.07v2h-1c-.828 0-1 .672-1 1.5v1.5h2.5l-.5 3H16v7h1c2.762 0 5-2.238 5-5V7c0-2.762-2.238-5-5-5z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
