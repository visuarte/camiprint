'use client'

import PricingManager from '@/components/admin/PricingManager'
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700', '800'] })

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="mb-8">
          <h1 className={`${montserrat.className} text-2xl font-black text-gray-900`}>Precios y Costes</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona márgenes, costes de fábrica y precios de venta Camiart</p>
        </div>
        <PricingManager />
      </div>
    </main>
  )
}
