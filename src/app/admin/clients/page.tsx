'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { adminFetch, getAdminToken } from '../auth-client';

type ClientRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
  lastOrderStatus: string | null;
};

type ClientsResponse = {
  customers: ClientRow[];
  total: number;
  totalOrders: number;
  totalRevenue: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, totalOrders: 0, totalRevenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [createError, setCreateError] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const loadClients = async () => {
      try {
        setIsLoading(true);
        setError('');

        if (!getAdminToken()) {
          setError('No autorizado. Por favor inicia sesión.');
          return;
        }

        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) params.append('search', search);

        const response = await adminFetch(`/api/admin/clients?${params}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch clients: ${response.status}`);
        }

        const data = (await response.json()) as ClientsResponse;
        setClients(data.customers);
        setSummary({
          total: data.total,
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
        });
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
        setError('Error al cargar clientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, [page, search]);

  const statusTone = (status: string | null) => {
    if (!status) return 'text-[#D8DEE8] border-muted-steel/20 bg-surface-container-lowest';
    const s = status.toLowerCase();
    if (s === 'paid' || s === 'shipped' || s === 'completed') return 'text-green-400 border-green-500/40 bg-green-500/10';
    if (s === 'pending' || s === 'new') return 'text-hazard-orange border-hazard-orange/40 bg-hazard-orange/10';
    if (s === 'cancelled') return 'text-red-300 border-red-500/40 bg-red-500/10';
    return 'text-[#D8DEE8] border-muted-steel/20 bg-surface-container-lowest';
  };

  const handleReset = () => {
    setSearch('');
    setPage(1);
  };

  const handleCreateClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');
    setCreateMessage('');

    if (!newClient.name.trim() || !newClient.email.trim() || !newClient.phone.trim() || !newClient.address.trim()) {
      setCreateError('Completa nombre, email, teléfono y dirección.');
      return;
    }

    try {
      setCreatingClient(true);
      const response = await adminFetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || `Failed to create client: ${response.status}`);
      }

      const customer = data.customer as ClientRow;
      setClients((current) => [
        {
          ...customer,
          orderCount: 0,
          totalSpent: 0,
          lastOrderAt: null,
          lastOrderStatus: null,
        },
        ...current,
      ]);
      setSummary((current) => ({
        ...current,
        total: current.total + 1,
      }));
      setCreateMessage('Cliente creado correctamente. Ya puedes usarlo para registrar el pedido.');
      setNewClient({ name: '', email: '', phone: '', address: '' });
      setPage(1);
    } catch (err) {
      console.error(err);
      setCreateError(err instanceof Error ? err.message : 'No se pudo crear el cliente.');
    } finally {
      setCreatingClient(false);
    }
  };

  const recentClients = useMemo(() => clients.slice(0, 3), [clients]);

  return (
    <div className="p-8 md:p-14 flex flex-col gap-10">
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="border border-hazard-orange/30 bg-surface-charcoal p-4 md:p-5 relative overflow-hidden min-h-[150px] flex flex-col justify-between">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL CLIENTS</p>
          <p className="font-display-lg text-[32px] md:text-[36px] leading-none font-black text-white">{summary.total.toLocaleString()}</p>
          <p className="mt-2 text-[#D8DEE8] text-xs md:text-sm leading-5">Clientes reales registrados en la base de datos.</p>
        </div>
        <div className="border border-muted-steel/10 bg-surface-charcoal p-4 md:p-5 min-h-[150px] flex flex-col justify-between">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">TOTAL ORDERS</p>
          <p className="font-display-lg text-[32px] md:text-[36px] leading-none font-black text-white">{summary.totalOrders.toLocaleString()}</p>
          <p className="mt-2 text-[#D8DEE8] text-xs md:text-sm leading-5">Pedidos asociados a los clientes filtrados.</p>
        </div>
        <div className="border border-muted-steel/10 bg-surface-charcoal p-4 md:p-5 min-h-[150px] flex flex-col justify-between">
          <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">REVENUE</p>
          <p className="font-display-lg text-[32px] md:text-[36px] leading-none font-black text-white">
            €{summary.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="mt-2 text-[#D8DEE8] text-xs md:text-sm leading-5">Ingresos totales derivados de esos clientes.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <div className="xl:col-span-8 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-5">
            <div>
              <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">CUSTOMERS DATABASE</p>
              <h1 className="font-headline-md text-[28px] md:text-[34px] text-white leading-none">CLIENTES REALES</h1>
            </div>
            <Link
              href="/admin/orders"
              className="h-9 inline-flex items-center px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] leading-none hover:bg-surface-container-high transition-colors"
            >
              VIEW ORDERS →
            </Link>
          </div>

          <div className="bg-surface-container-lowest border border-muted-steel/10 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-11 px-4 bg-surface-bright border border-muted-steel/20 text-white placeholder:text-[#D8DEE8]/50 outline-none"
              />
              <button
                onClick={handleReset}
                className="h-11 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:border-hazard-orange hover:text-hazard-orange transition-colors"
              >
                RESET FILTERS
              </button>
            </div>
          </div>

          {error && (
            <div className="border border-red-700/50 bg-red-900/20 p-4 text-red-200 text-sm mb-5">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 bg-surface-container-lowest border border-muted-steel/10" />
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="border border-muted-steel/10 bg-surface-container-lowest p-6 text-[#D8DEE8] text-sm">
              No hay clientes reales para mostrar con esos filtros.
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <article key={client.id} className="border border-muted-steel/10 bg-surface-container-lowest p-4 md:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">{client.id.slice(0, 8).toUpperCase()}</p>
                      <h3 className="text-[16px] text-white font-semibold leading-snug truncate">{client.name}</h3>
                      <p className="text-[#D8DEE8] text-sm mt-1 break-all">{client.email}</p>
                      <p className="text-[#D8DEE8]/80 text-sm mt-1">{client.phone}</p>
                      <p className="text-[#D8DEE8]/60 text-xs mt-2 line-clamp-2">{client.address}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-[280px]">
                      <div className="border border-muted-steel/10 bg-surface-charcoal p-3">
                        <p className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">ORDERS</p>
                        <p className="text-white text-lg font-bold mt-1">{client.orderCount}</p>
                      </div>
                      <div className="border border-muted-steel/10 bg-surface-charcoal p-3">
                        <p className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">SPENT</p>
                        <p className="text-white text-lg font-bold mt-1">€{client.totalSpent.toFixed(2)}</p>
                      </div>
                      <div className="border border-muted-steel/10 bg-surface-charcoal p-3 col-span-2 sm:col-span-1 lg:col-span-2">
                        <p className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">LAST ORDER</p>
                        <p className={`inline-flex mt-1 px-2.5 py-1 border text-[10px] font-label-caps tracking-[0.08em] ${statusTone(client.lastOrderStatus)}`}>
                          {client.lastOrderStatus ?? 'SIN PEDIDOS'}
                        </p>
                        <p className="text-[#D8DEE8] text-xs mt-2">
                          {client.lastOrderAt ? new Date(client.lastOrderAt).toLocaleDateString('es-ES') : 'No hay pedido reciente'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Link
                      href="/admin/orders"
                      className="inline-flex items-center h-9 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors"
                    >
                      VER PEDIDOS
                    </Link>
                    <span className="text-[#D8DEE8]/60 text-xs">
                      Registrado el {new Date(client.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
              className="h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed hover:border-hazard-orange hover:text-hazard-orange transition-colors"
            >
              ← ANTERIOR
            </button>
            <span className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.08em]">
              PÁGINA {page} DE {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page >= totalPages}
              className="h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed hover:border-hazard-orange hover:text-hazard-orange transition-colors"
            >
              SIGUIENTE →
            </button>
          </div>
        </div>

        <aside className="xl:col-span-4 border border-muted-steel/10 bg-surface-charcoal p-6 md:p-7">
          <div className="border border-muted-steel/10 bg-surface-container-lowest p-4 mb-5">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-3">MANUAL CLIENT</p>
            <form className="space-y-3" onSubmit={handleCreateClient}>
              <input
                type="text"
                placeholder="Nombre y apellidos o empresa"
                value={newClient.name}
                onChange={(e) => setNewClient((current) => ({ ...current, name: e.target.value }))}
                className="w-full h-10 px-3 bg-surface-bright border border-muted-steel/20 text-white placeholder:text-[#D8DEE8]/50 outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient((current) => ({ ...current, email: e.target.value }))}
                className="w-full h-10 px-3 bg-surface-bright border border-muted-steel/20 text-white placeholder:text-[#D8DEE8]/50 outline-none"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={newClient.phone}
                onChange={(e) => setNewClient((current) => ({ ...current, phone: e.target.value }))}
                className="w-full h-10 px-3 bg-surface-bright border border-muted-steel/20 text-white placeholder:text-[#D8DEE8]/50 outline-none"
              />
              <textarea
                placeholder="Dirección"
                value={newClient.address}
                onChange={(e) => setNewClient((current) => ({ ...current, address: e.target.value }))}
                className="w-full h-24 px-3 py-2 bg-surface-bright border border-muted-steel/20 text-white placeholder:text-[#D8DEE8]/50 outline-none resize-none"
              />
              <button
                type="submit"
                disabled={creatingClient}
                className="w-full h-10 px-4 border border-hazard-orange text-hazard-orange font-label-caps text-[11px] tracking-[0.08em] hover:bg-hazard-orange hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingClient ? 'CREANDO...' : 'CREAR CLIENTE'}
              </button>
              {createError && <p className="text-red-300 text-xs leading-5">{createError}</p>}
              {createMessage && <p className="text-green-400 text-xs leading-5">{createMessage}</p>}
            </form>
          </div>

          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="font-headline-md text-[22px] md:text-[26px] leading-none text-white">RECENT CLIENTS</h2>
          </div>

          <div className="space-y-3">
            {recentClients.length === 0 ? (
              <div className="border border-muted-steel/10 bg-surface-container-lowest p-4 text-[#D8DEE8] text-sm">
                No hay clientes recientes para mostrar.
              </div>
            ) : (
              recentClients.map((client) => (
                <div key={client.id} className="border border-muted-steel/10 bg-surface-container-lowest p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-1">{client.name}</p>
                      <p className="text-[13px] text-white truncate">{client.email}</p>
                      <p className="text-[#D8DEE8] text-xs mt-1">{client.orderCount} pedidos · €{client.totalSpent.toFixed(2)}</p>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 border text-[10px] font-label-caps tracking-[0.08em] ${statusTone(client.lastOrderStatus)}`}>
                      {client.lastOrderStatus ?? 'SIN PEDIDOS'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 border-t border-muted-steel/10 pt-4">
            <p className="font-label-caps text-[10px] text-hazard-orange tracking-[0.08em] mb-2">REAL ACTIONS</p>
            <div className="space-y-2">
              <Link href="/admin/orders" className="block h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors leading-[40px]">
                REVISAR PEDIDOS →
              </Link>
              <Link href="/admin/settings" className="block h-10 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[11px] tracking-[0.08em] hover:bg-surface-container-high transition-colors leading-[40px]">
                AJUSTES DEL SISTEMA →
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}