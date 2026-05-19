'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    size: string;
  };
}

interface Order {
  id: string;
  customerId: string;
  email: string;
  phone: string;
  address: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [paramsData, setParamsData] = useState<{ id: string } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then(setParamsData);
  }, [params]);

  useEffect(() => {
    if (!paramsData) return;

    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const token = getCookie('admin_token');
        const response = await fetch(`/api/admin/orders/${paramsData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError('Orden no encontrada');
          } else {
            throw new Error('Failed to fetch order');
          }
          return;
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        setError('Error al cargar la orden');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [paramsData]);

  const handleResendEmail = async () => {
    if (!order) return;

    try {
      setIsResending(true);
      const token = getCookie('admin_token');
      const response = await fetch(`/api/admin/orders/${order.id}/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      alert('Email de confirmación reenviado exitosamente');
    } catch (err) {
      alert('Error al resend email');
      console.error(err);
    } finally {
      setIsResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-800 rounded w-1/3"></div>
          <div className="h-64 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6 md:p-8">
        <Link
          href="/admin/orders"
          className="text-blue-400 hover:text-blue-300 transition text-sm mb-4 inline-block"
        >
          ← Volver a órdenes
        </Link>
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-100">
          {error || 'Error desconocido'}
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900 text-yellow-100 border-yellow-700',
    paid: 'bg-green-900 text-green-100 border-green-700',
    cancelled: 'bg-red-900 text-red-100 border-red-700',
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/admin/orders"
        className="text-blue-400 hover:text-blue-300 transition text-sm mb-6 inline-block"
      >
        ← Volver a órdenes
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orden #{order.id.substring(0, 8)}</h1>
            <p className="text-neutral-400">
              {new Date(order.createdAt).toLocaleString('es-ES')}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              statusColors[order.status] || 'bg-neutral-700 text-neutral-300 border-neutral-600'
            }`}
          >
            {order.status === 'pending'
              ? 'Pendiente de pago'
              : order.status === 'paid'
              ? 'Pagado'
              : order.status === 'cancelled'
              ? 'Cancelado'
              : order.status}
          </span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Customer & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400 mb-1">Email</p>
                  <p className="font-medium">{order.email}</p>
                </div>
                <div>
                  <p className="text-neutral-400 mb-1">Teléfono</p>
                  <p className="font-medium">{order.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-neutral-400 mb-1">Dirección</p>
                  <p className="font-medium">{order.address}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Artículos</h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center pb-3 border-b border-neutral-800 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">
                        {item.product?.name || `Producto ${item.productId.substring(0, 8)}`}
                      </p>
                      <p className="text-sm text-neutral-400">
                        Talla: {item.product?.size || 'N/A'} | Cantidad: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Summary */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-700">
                  <span className="text-neutral-400">Envío</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Línea de tiempo</h2>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="w-0.5 h-8 bg-neutral-700 my-1"></div>
                  </div>
                  <div>
                    <p className="font-medium">Orden creada</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(order.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>

                {order.status === 'paid' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="font-medium">Pago recibido</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(order.updatedAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg transition text-sm font-medium"
            >
              {isResending ? 'Enviando...' : '📧 Resend Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
