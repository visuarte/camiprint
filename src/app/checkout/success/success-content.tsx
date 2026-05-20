'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderStatus {
  id: string;
  status: 'pending' | 'paid' | 'cancelled' | 'shipped' | 'delivered';
  email: string;
}

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const [mounted, setMounted] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Fetch order status
    if (orderId) {
      fetchOrderStatus();
      // Poll for order status updates (webhook may take a moment)
      const interval = setInterval(fetchOrderStatus, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [orderId]);

  const fetchOrderStatus = async () => {
    if (!orderId) return;
    try {
      // Note: This endpoint doesn't exist yet, we'll create a GET endpoint
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  // Generar fecha de entrega estimada (5-7 días hábiles)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  const formattedDate = estimatedDelivery.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isPaid = orderStatus?.status === 'paid';
  const isPending = orderStatus?.status === 'pending';
  const isCancelled = orderStatus?.status === 'cancelled';

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h1>
          <p className="text-gray-600 mb-6">Gracias por tu compra en Camiprint.</p>

          {/* Order Number */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Número de Pedido</p>
              <p className="text-2xl font-bold text-blue-600 font-mono break-all">{orderId}</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4 mb-8 text-left bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pago Recibido</p>
                <p className="text-sm text-gray-600">Tu pago ha sido procesado exitosamente.</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg
                className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                  isPaid ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-blue-600'
                }`}
                fill={isPaid || isPending ? 'currentColor' : 'none'}
                stroke={!isPaid && !isPending ? 'currentColor' : 'none'}
                viewBox="0 0 20 20"
              >
                {isPaid ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : isPending ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {isPaid && '✉️ Confirmación Enviada'}
                  {isPending && '⏳ Procesando Confirmación'}
                  {!isPaid && !isPending && 'Confirmación'}
                </p>
                <p className="text-sm text-gray-600">
                  {isPaid && 'Recibirás un email con los detalles de tu pedido.'}
                  {isPending && 'El email de confirmación será enviado en breve.'}
                  {!isPaid && !isPending && 'Procesando...'}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-900">Entrega Estimada</p>
                <p className="text-sm text-gray-600">Alrededor del {formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Tu pedido está siendo preparado. Recibirás notificaciones de envío cuando esté en camino.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/catalog"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Seguir Comprando
            </Link>

            <button
              onClick={() => window.print()}
              className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9m4 0h4m-2-2v2m0 0v2m0-6V9m0 0V7" />
              </svg>
              Imprimir Comprobante
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>¿Preguntas sobre tu pedido?</p>
          <p className="mt-1">
            Contáctanos en{' '}
            <a href="mailto:support@camiprint.com" className="text-blue-600 hover:text-blue-700 font-medium">
              support@camiprint.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
