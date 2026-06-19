'use client'

import { useState } from 'react'
import ProductionDashboard from '@/components/admin/ProductionDashboard'
import LegacyQueueView from '@/components/admin/LegacyQueueView'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800'] })

export default function ProductionPage() {
  const [tab, setTab] = useState<'unified' | 'queue'>('unified')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`${montserrat.className} text-2xl font-black text-gray-900`}>Producción</h1>
            <p className="mt-1 text-sm text-gray-500">Control unificado: taller propio + Gor Factory</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTab('unified')}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                tab === 'unified' ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              Vista Unificada
            </button>
            <button onClick={() => setTab('queue')}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                tab === 'queue' ? 'bg-gray-900 text-white' : 'border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              Cola Taller
            </button>
          </div>
        </div>

        {tab === 'unified' ? <ProductionDashboard /> : <LegacyQueueView />}
      </div>
    </main>
  )
}
