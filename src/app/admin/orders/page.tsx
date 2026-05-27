'use client';

import { useEffect, useState } from 'react';
import RespondModal from './RespondModal';
import Link from 'next/link';
import { adminFetch, getAdminToken } from '../auth-client';

interface Order {
  id: string;
  customerId: string;
  email: string;
  phone: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // '' = all, 'pending', 'paid', 'cancelled'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [respondingOrder, setRespondingOrder] = useState<string | null>(null);
  const limit = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const token = getAdminToken();
        
        if (!token) {
          setError('No autorizado. Por favor inicia sesión.');
          setIsLoading(false);
          return;
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) params.append('status', status);
        if (search) params.append('search', search);

        const response = await adminFetch(`/api/admin/orders?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const data = await response.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError('Error al cargar órdenes');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [status, search, page]);

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900 text-yellow-100 border-yellow-700',
    paid: 'bg-green-900 text-green-100 border-green-700',
    cancelled: 'bg-red-900 text-red-100 border-red-700',
  };

  const handleReset = () => {
    setStatus('');
    setSearch('');
    setPage(1);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-2">Órdenes</h1>
      <p className="text-neutral-400 mb-8">Gestiona y consulta todas las órdenes</p>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">Búsqueda</label>
            <input
              type="text"
              placeholder="Order ID o email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleReset}
              className="flex-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition text-sm"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6 text-red-100">
          {error}
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-neutral-800 rounded"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8 text-center">
          <p className="text-neutral-400">No se encontraron órdenes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900">
                  <th className="px-4 py-3 text-left font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-left font-medium">Fecha</th>
                  <th className="px-4 py-3 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-800 hover:bg-neutral-800 transition"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{order.id.substring(0, 8)}</td>
                    <td className="px-4 py-3">{order.email.split('@')[0]}</td>
                    <td className="px-4 py-3 text-neutral-400">{order.email}</td>
                    <td className="px-4 py-3 font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          statusColors[order.status] || 'bg-neutral-700 text-neutral-300 border-neutral-600'
                        }`}
                      >
                        {order.status === 'pending'
                          ? 'Pendiente'
                          : order.status === 'paid'
                          ? 'Pagado'
                          : order.status === 'cancelled'
                          ? 'Cancelado'
                          : order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-400 hover:text-blue-300 transition text-xs font-medium"
                        >
                          Ver
                        </Link>
                        <button
                          onClick={() => setRespondingOrder(order.id)}
                          className="text-xs px-2 py-1 bg-neutral-800 border border-neutral-700 rounded hover:bg-neutral-700 transition"
                        >
                          Responder
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                  <button onClick={() => setRespondingOrder(order.id)} className="ml-2 px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-xs transition">
                    Responder
                  </button>
                    <p className="font-mono text-xs text-neutral-400 mb-1">
                      {order.id.substring(0, 8)}
                    </p>
                    <p className="font-medium">{order.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      statusColors[order.status] || 'bg-neutral-700 text-neutral-300 border-neutral-600'
                    }`}
                  >
                    {order.status === 'pending'
                      ? 'Pendiente'
                      : order.status === 'paid'
                      ? 'Pagado'
                      : order.status === 'cancelled'
                      ? 'Cancelado'
                      : order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-neutral-400">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {respondingOrder && (
        <RespondModal
          orderId={respondingOrder}
          onClose={() => setRespondingOrder(null)}
          onSuccess={() => {
            // refresh list after successful response
            setPage(1);
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed border border-neutral-700 rounded-lg transition text-sm"
          >
            ← Anterior
          </button>
          <p className="text-sm text-neutral-400">
            Página {page} de {totalPages}
          </p>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:cursor-not-allowed border border-neutral-700 rounded-lg transition text-sm"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

function getCookie(name: string): string {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
