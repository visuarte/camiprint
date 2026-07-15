/**
 * Configuracion centralizada de ciudades para paginas SEO.
 * Una sola fuente de verdad — el sitemap y las paginas dinamicas beben de aqui.
 */

export interface CityConfig {
  slug: string;
  name: string;
  areaType: 'City' | 'State';
  region?: string;
  offers?: boolean;
}

export const CITIES: CityConfig[] = [
  { slug: 'sevilla', name: 'Sevilla', areaType: 'City', offers: true },
  { slug: 'alicante', name: 'Alicante', areaType: 'City' },
  { slug: 'valencia', name: 'Valencia', areaType: 'City' },
  { slug: 'murcia', name: 'Murcia', areaType: 'City' },
  { slug: 'madrid', name: 'Madrid', areaType: 'City' },
  { slug: 'barcelona', name: 'Barcelona', areaType: 'City' },
  { slug: 'malaga', name: 'Málaga', areaType: 'City' },
  { slug: 'bilbao', name: 'Bilbao', areaType: 'City' },
  { slug: 'zaragoza', name: 'Zaragoza', areaType: 'City' },
  { slug: 'palma', name: 'Palma', areaType: 'City' },
  { slug: 'las-palmas', name: 'Las Palmas', areaType: 'City' },
];

export function getCity(slug: string): CityConfig | undefined {
  return CITIES.find(c => c.slug === slug);
}

export const CITY_SLUGS = CITIES.map(c => c.slug);
