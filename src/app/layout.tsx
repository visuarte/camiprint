
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

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
      <body className="flex min-h-full flex-col overflow-x-hidden bg-neutral-950 text-neutral-100">
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <main id="main-content" className="flex flex-1 flex-col">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
