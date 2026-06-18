'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGate } from './auth-gate';
import { clearAdminToken } from './auth-client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  // Protegemos toda la sección admin con el AuthGate
  return (
    <AdminAuthGate>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthGate>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  const handleLogout = async () => {
    await clearAdminToken();
    router.push('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { label: 'Dashboard',   href: '/admin',            icon: 'dashboard',             active: true },
    { label: 'Producción',  href: '/admin/production', icon: 'factory',               active: false },
    { label: 'Pedidos',     href: '/admin/orders',     icon: 'receipt_long',          active: false },
    { label: 'Inventario',  href: '/admin/inventory',  icon: 'inventory_2',           active: false },
    { label: 'Clientes',    href: '/admin/clients',    icon: 'group',                 active: false },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '#') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex h-screen w-56 fixed left-0 top-0 bg-white border-r border-gray-200 flex-col py-8 gap-4 z-50">
        {/* Brand */}
        <div className="px-5 mb-8">
          <span className={`text-xl font-extrabold text-[#ff4f00]`}>CAMIART</span>
          <p className="text-[10px] font-semibold text-gray-400 tracking-[0.3em] mt-2 uppercase">
            Centro de operaciones
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const disabled = item.href === '#';
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-disabled={disabled}
                onClick={disabled ? (e) => e.preventDefault() : undefined}
                className={`flex items-center gap-3 px-5 py-3 transition-all text-sm font-medium ${
                  active
                    ? 'bg-[#ff4f00]/10 text-[#ff4f00] border-r-4 border-[#ff4f00]'
                    : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span>{item.label}</span>
                {disabled && (
                  <span className="ml-auto text-[9px] text-gray-400 tracking-wider uppercase">Próximamente</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div className="px-5 space-y-2">
          <Link href="/admin/settings"
            className="flex items-center gap-3 w-full py-3 px-4 border border-gray-200 text-gray-600 text-sm font-medium hover:border-[#ff4f00] hover:text-[#ff4f00] transition-all rounded-lg">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>Configuración</span>
          </Link>
          <button onClick={handleLogout}
            className="w-full py-3 border border-gray-200 text-gray-500 text-sm font-medium hover:border-red-300 hover:text-red-500 transition-all rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-56 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-[70] h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md flex justify-between items-center px-6 md:px-10">
          <h2 className="text-lg font-black text-[#ff4f00] tracking-tight uppercase">
            CAMIART OPERACIONES
          </h2>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-gray-800">Operador principal</span>
              <span className="text-[10px] text-gray-400">camiart.com</span>
            </div>
            <div className="w-9 h-9 rounded-full border-2 border-[#ff4f00] bg-gray-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#ff4f00] text-[18px]">person</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-0 flex-1 overflow-auto bg-gray-50 p-6 md:p-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white flex justify-between items-center px-6 md:px-10 py-4">
          <span className="text-[10px] font-medium text-gray-400">
            © {new Date().getFullYear()} CAMIART
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-medium text-green-600">Sistema operativo</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

