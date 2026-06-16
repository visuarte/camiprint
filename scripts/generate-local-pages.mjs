/**
 * Genera landing pages SEO por ubicación.
 * Ejecutar: node scripts/generate-local-pages.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src', 'app');
const SITE_URL = 'https://camiart.com';

const locations = [
  // Comunidad Valenciana (zona real)
  { city: 'alicante', label: 'Alicante', region: 'Comunidad Valenciana', keywords: ['Alicante', 'Comunidad Valenciana'] },
  { city: 'valencia', label: 'Valencia', region: 'Comunidad Valenciana', keywords: ['Valencia', 'Comunidad Valenciana'] },
  // Murcia (zona real)
  { city: 'murcia', label: 'Murcia', region: 'Región de Murcia', keywords: ['Murcia'] },
  // Principales comunidades
  { city: 'madrid', label: 'Madrid', region: 'Comunidad de Madrid', keywords: ['Madrid'] },
  { city: 'barcelona', label: 'Barcelona', region: 'Cataluña', keywords: ['Barcelona', 'Cataluña'] },
  { city: 'malaga', label: 'Málaga', region: 'Andalucía', keywords: ['Málaga', 'Andalucía'] },
  { city: 'bilbao', label: 'Bilbao', region: 'País Vasco', keywords: ['Bilbao', 'País Vasco'] },
  { city: 'zaragoza', label: 'Zaragoza', region: 'Aragón', keywords: ['Zaragoza', 'Aragón'] },
  { city: 'palma', label: 'Palma', region: 'Islas Baleares', keywords: ['Palma', 'Baleares'] },
  { city: 'las-palmas', label: 'Las Palmas', region: 'Canarias', keywords: ['Las Palmas', 'Canarias'] },
];

function generatePage(service, city, label, region, keywords) {
  const slug = `${service}-${city}`;
  const title = service === 'camisetas-personalizadas'
    ? `Camisetas personalizadas en ${label}`
    : `Impresión DTF en ${label}`;
  const descPrefix = service === 'camisetas-personalizadas'
    ? `Camisetas personalizadas cerca de ti: impresión textil profesional en ${label}`
    : `Impresión DTF profesional en ${label}: camisetas personalizadas con estampación de alta calidad`;
  const kw = service === 'camisetas-personalizadas'
    ? [`camisetas personalizadas ${label}`, `impresión textil ${label}`, ...keywords.map(k => `camisetas con logo ${k}`)]
    : [`impresión DTF ${label}`, `DTF ${label}`, ...keywords.map(k => `estampación textil ${k}`)];
  const h1 = title;
  const areaServedType = region === 'Comunidad Valenciana' || region === 'Región de Murcia' || keywords.length === 1
    ? 'City' : 'State';

  return `import type { Metadata } from 'next';
import { brandConfig } from '@/config/brand';

export const metadata: Metadata = {
  title: \`${title} — \${brandConfig.displayName}\`,
  description: '${descPrefix}. DTF, serigrafía y bordado desde 10 unidades.',
  keywords: ${JSON.stringify(kw)},
  alternates: { canonical: \`\${brandConfig.siteUrl}/${slug}\` },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: '${title}',
  provider: { '@type': 'LocalBusiness', name: brandConfig.displayName, url: brandConfig.siteUrl },
  areaServed: { '@type': '${areaServedType}', name: '${label}' },
  description: '${descPrefix}. Diseño y producción con control de calidad.',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <section className="prose mx-auto max-w-4xl py-12 px-4 text-cami-200">
        <h1 className="text-3xl font-bold text-gray-900">${h1}</h1>
        <p>
          Fabricamos ${service === 'camisetas-personalizadas' ? 'camisetas personalizadas' : 'impresión DTF'} cerca de ti: procesos DTF, serigrafía y bordado con entrega rápida en ${label} y ${region === 'Región de Murcia' ? 'provincia' : 'toda la provincia'}.
        </p>
        <ul>
          <li>Pedidos desde 10 unidades</li>
          <li>Diseño técnico incluido</li>
          <li>Plazos: 5-10 días según técnica</li>
        </ul>
        <p>
          Solicita presupuesto online o por email para respuesta inmediata. Envío a toda España.
        </p>
      </section>
    </>
  );
}
`;
}

function createServicePages(service) {
  for (const loc of locations) {
    const dir = join(SRC, `${service}-${loc.city}`);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const content = generatePage(service, loc.city, loc.label, loc.region, loc.keywords);
    writeFileSync(join(dir, 'page.tsx'), content, 'utf-8');
    console.log(`  ✓ ${service}-${loc.city}`);
  }
}

console.log('Generando páginas de camisetas personalizadas...');
createServicePages('camisetas-personalizadas');

console.log('Generando páginas de impresión DTF...');
createServicePages('impresion-dtf');

console.log(`\n✅ ${locations.length * 2} páginas generadas en src/app/`);
