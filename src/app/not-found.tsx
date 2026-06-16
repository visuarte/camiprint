import Link from 'next/link';
import { PublicWhatsAppLink } from '@/app/components/PublicContactClient';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cami-900 px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-7xl font-extrabold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-cami-200">Página no encontrada</p>
        <p className="mt-2 text-cami-400">Lo sentimos — la página o el recurso solicitado no existe o se ha movido.</p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="rounded-md bg-cami-500 px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-cami-600">
            Volver al inicio
          </Link>
          <Link href="/portfolio" className="rounded-md border border-gray-200/10 px-4 py-2 text-sm font-medium text-cami-100 hover:bg-gray-50/3">
            Ver portfolio
          </Link>
          <PublicWhatsAppLink className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-green-700">
            Contactar por WhatsApp
          </PublicWhatsAppLink>
        </div>

        <p className="mt-8 text-sm text-cami-400">Si crees que esto es un error, escríbenos y revisamos el enlace.</p>
      </div>
    </main>
  );
}
