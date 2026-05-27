
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { brandConfig } from "@/config/brand";
import CookieBanner from "@/app/components/CookieBanner";
import WhatsAppFloating from '@/app/components/WhatsAppFloating';

const manrope = Manrope({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-display",
});

const addressParts = brandConfig.postalAddress.split(",").map((part) => part.trim()).filter(Boolean);

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brandConfig.displayName,
  url: brandConfig.siteUrl,
  logo: `${brandConfig.siteUrl}/icon-512.svg`,
  description: brandConfig.seo.description,
  email: brandConfig.supportEmail,
  telephone: brandConfig.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    streetAddress: addressParts[0],
    ...(addressParts[1] ? { addressLocality: addressParts[1] } : {}),
    addressCountry: "ES",
  },
  sameAs: Object.values(brandConfig.socialLinks),
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: brandConfig.displayName,
  url: brandConfig.siteUrl,
  inLanguage: "es-ES",
  description: brandConfig.seo.description,
};

export const metadata: Metadata = {
  title: brandConfig.seo.defaultTitle,
  description: brandConfig.seo.description,
  keywords: [
    "camisetas personalizadas para empresas",
    "camisetas laborales",
    "camisetas publicitarias",
    "uniformes empresariales",
    "ropa laboral personalizada",
    "merchandising textil",
    "estampacion de camisetas",
  ],
  metadataBase: new URL(brandConfig.siteUrl),
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: brandConfig.siteUrl,
    siteName: brandConfig.displayName,
    title: brandConfig.seo.defaultTitle,
    description:
      "Camisetas personalizadas para empresas con diseño gratuito, entregas rápidas y precios por volumen.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: brandConfig.seo.ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: brandConfig.seo.defaultTitle,
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
    canonical: brandConfig.siteUrl,
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
    <html lang="es" data-scroll-behavior="smooth" className={`h-full antialiased ${manrope.variable} ${spaceGrotesk.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden bg-neutral-950 text-neutral-100">
        <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
        <main id="main-content" className="flex flex-1 flex-col">{children}</main>
        <WhatsAppFloating />
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
