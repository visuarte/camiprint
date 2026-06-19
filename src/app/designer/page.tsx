import type { Metadata } from 'next'
import AppHeader from '@/components/AppHeader'
import Footer from '@/components/Footer'
import MockupGenerator from '@/components/MockupGenerator'

export const metadata: Metadata = {
  title: 'Diseñador de Camisetas | CamiArt',
  description: 'Diseña tu camiseta online: sube tu logo, añade texto y elige la posición. Vista previa 3D en tiempo real.',
}

export default function DesignerPage() {
  return (
    <main className="min-h-screen bg-white">
      <AppHeader variant="light" />
      <div className="mx-auto max-w-6xl px-5 pt-28 pb-16 md:px-16">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Diseñador de Camisetas</h1>
          <p className="mt-2 text-gray-500">
            Sube tu diseño o añade texto para ver cómo queda en la camiseta antes de pedir presupuesto.
          </p>
        </div>
        <MockupGenerator />
      </div>
      <Footer variant="light" />
    </main>
  )
}
