
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Camiart - Camisetas Personalizadas para Empresas",
  description:
    "Camiart crea camisetas personalizadas para empresas, restaurantes y eventos. Diseño gratuito, producción profesional y entrega rápida con ofertas por volumen.",
  keywords: [
    "camisetas personalizadas para empresas",
    "camisetas laborales",
    "camisetas publicitarias",
    "uniformes empresariales",
    "ropa laboral personalizada",
    "merchandising textil",
    "estampacion de camisetas",
  ],
  metadataBase: new URL("https://camiprint.com"),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://camiprint.com",
    siteName: "Camiart",
    title: "Camiart - Camisetas Personalizadas para Empresas",
    description:
      "Camisetas personalizadas para empresas con diseño gratuito, entregas rápidas y precios por volumen.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Camiart - Camisetas Personalizadas para Empresas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Camiart - Camisetas Personalizadas para Empresas",
    description:
      "Diseño gratuito, producción profesional y entregas rápidas para camisetas corporativas.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://camiprint.com",
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
    <html lang="es" className={`h-full antialiased ${inter.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden bg-neutral-950 text-neutral-100">
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <main id="main-content" className="flex flex-1 flex-col">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
