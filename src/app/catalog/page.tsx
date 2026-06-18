import { Suspense } from 'react';
import CatalogPageClient from './CatalogPageClient';

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#ff4f00]/30 border-t-[#ff4f00]" />
          <p className="mt-4 text-sm text-[#e2e2e2]/60">Cargando catálogo...</p>
        </div>
      </main>
    }>
      <CatalogPageClient />
    </Suspense>
  );
}
