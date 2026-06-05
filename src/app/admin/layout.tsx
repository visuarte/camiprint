'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { AdminAuthGate } from './auth-gate';

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

  const handleLogout = () => {
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { label: 'Dashboard',   href: '/admin',            icon: 'dashboard',             active: true },
    { label: 'Production',  href: '/admin/production', icon: 'factory',               active: false },
    { label: 'Orders',      href: '/admin/orders',     icon: 'receipt_long',          active: false },
    { label: 'Inventory',   href: '/admin/inventory',  icon: 'inventory_2',           active: false },
    { label: 'Clientes',    href: '/admin/clients',    icon: 'group',                 active: false },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    if (href === '#') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e2e2e2] flex">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      <aside className="hidden md:flex h-screen w-56 fixed left-0 top-0 bg-surface-charcoal border-r border-muted-steel/10 flex-col py-8 gap-4 z-50">
        {/* Brand */}
        <div className="px-5 mb-8">
          <div
            role="img"
            aria-label="Camiart"
            className="w-[170px] h-[46px] bg-[url('/icons/logo.svg')] bg-contain bg-no-repeat bg-left block"
          />
          <p className="font-label-caps text-[10px] text-[#D8DEE8] tracking-[0.3em] mt-2">
            OPERATIONS CENTER
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
                className={[
                  'flex items-center gap-3 px-5 py-4 transition-all duration-200 ease-in-out',
                  active
                    ? 'bg-hazard-orange/10 text-hazard-orange border-r-4 border-hazard-orange font-bold'
                    : disabled
                    ? 'text-[#D8DEE8]/45 cursor-not-allowed'
                    : 'text-[#D8DEE8] hover:bg-surface-container-high hover:text-white',
                ].join(' ')}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="font-label-caps text-label-caps">{item.label}</span>
                {disabled && (
                  <span className="ml-auto text-[9px] font-label-caps text-[#D8DEE8]/50 tracking-wider">SOON</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Load */}
        <div className="px-5">
          <div className="p-4 border border-muted-steel/20 rounded-lg bg-surface-container-lowest">
            <p className="font-label-caps text-[10px] text-[#D8DEE8] mb-2">SYSTEM LOAD</p>
            <div className="w-full bg-surface-bright h-1">
              <div className="bg-hazard-orange h-1 w-[42%] shadow-[0_0_8px_rgba(255,79,0,0.5)]" />
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="mt-4 flex items-center gap-3 w-full py-3 px-4 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[12px] tracking-widest hover:border-hazard-orange hover:text-hazard-orange transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span>SETTINGS</span>
          </Link>
          <button
            onClick={handleLogout}
            className="mt-4 w-full py-3 border border-muted-steel/20 text-[#D8DEE8] font-label-caps text-[12px] tracking-widest hover:border-hazard-orange hover:text-hazard-orange transition-all duration-200"
          >
            LOGOUT
          </button>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:ml-56 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-[70] h-20 border-b border-muted-steel/20 bg-[#0A0A0A] supports-[backdrop-filter]:bg-[#0A0A0A]/95 backdrop-blur-md flex justify-between items-center px-8 md:px-16">
          <h2 className="font-headline-md text-headline-md font-black text-hazard-orange tracking-tighter">
            CAMIART OPERATIONS
          </h2>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="font-label-caps text-[12px] text-white">CHIEF OPERATOR</span>
              <span className="font-label-caps text-[10px] text-[#D8DEE8]">camiart.com</span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-hazard-orange bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-hazard-orange text-[20px]">person</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative z-0 flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-hazard-orange/20 bg-surface-charcoal flex justify-between items-center px-8 md:px-16 py-6">
          <span className="font-label-caps text-[10px] text-[#D8DEE8]">
            © {new Date().getFullYear()} CAMIART INDUSTRIAL. ALL SYSTEMS OPERATIONAL.
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-label-caps text-[10px] text-green-500 tracking-tighter">SECURE NODE</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

