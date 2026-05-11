import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Camiprint | Camisetas laborales y publicitarias",
  description:
    "Tienda online de camisetas para negocios, restaurantes y empresas con ofertas rápidas por cantidad.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex flex-col min-h-full">
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
