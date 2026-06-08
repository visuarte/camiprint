'use client';

import { useEffect, useState } from 'react';
import { Manrope, Montserrat, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';
import type { GorModel } from '@/components/ProductCard';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800', '900'] });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'] });

export default function GuiaTallasClient({ modelcode }: { modelcode: string }) {
  const [model, setModel] = useState<GorModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await fetch(`/api/v1/gor-catalog?brand=roly`);
        const data = await res.json();
        const found = (data.models || []).find(
          (m: GorModel) => m.modelcode === modelcode,
        );
        setModel(found || null);
      } catch {
        setModel(null);
      } finally {
        setLoading(false);
      }
    };
    fetchModel();
  }, [modelcode]);

  return (
    <main className={`${manrope.className} min-h-screen bg-[#131313] text-[#e2e2e2] pt-24 pb-16`}>
      <div className="mx-auto max-w-4xl px-5 md:px-16">
        <Link href="/catalog" className="mb-8 inline-flex items-center gap-1 text-sm text-[#ff4f00] hover:underline">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver al catálogo
        </Link>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff4f00]/30 border-t-[#ff4f00]" />
          </div>
        ) : !model ? (
          <div className="mt-8 rounded-2xl border border-[#5c4037]/25 bg-[#1f1f1f] p-8 text-center">
            <p className="text-[#e2e2e2]/60">Modelo no encontrado.</p>
          </div>
        ) : (
          <>
            <div className={`${spaceGrotesk.className} mb-2 text-xs tracking-[0.1em] text-[#ff4f00]`}>GUÍA DE TALLAS</div>
            <h1 className={`${montserrat.className} text-3xl font-black md:text-4xl`}>
              {model.modelname}
            </h1>
            <p className="mt-2 text-sm text-[#e2e2e2]/50">{model.modelcode} · {model.family} · {model.brand}</p>
            {model.composition && <p className="mt-1 text-xs text-[#e2e2e2]/40">{model.composition}</p>}

            <div className="mt-8 overflow-hidden rounded-2xl border border-[#5c4037]/25 bg-[#1f1f1f]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#5c4037]/25 bg-[#0A0A0A]">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#ff4f00]">Talla</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-[#ff4f00]">Medidas (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5c4037]/15">
                  {model.sizes.map((s) => (
                    <tr key={s.code} className="hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-bold text-white">{s.name}</td>
                      <td className="px-4 py-3 text-[#e2e2e2]/60">
                        {s.measures || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 rounded-xl border border-[#ff4f00]/20 bg-[#ff4f00]/5 p-4 text-xs text-[#e2e2e2]/60">
              Las medidas son orientativas proporcionadas por el fabricante (Roly).
              Pueden variar ligeramente entre partidas. Para pedidos corporativos
              recomendamos solicitar una muestra física antes de la producción completa.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
