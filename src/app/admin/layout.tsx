'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Check if this is the login page
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    // Clear admin token cookie
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Ajustes', href: '/admin/settings', icon: '⚙️' },
    { name: 'Órdenes', href: '/admin/orders', icon: '📦' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 flex-col bg-neutral-900 border-r border-neutral-800">
            <div className="p-6 border-b border-neutral-800">
              <h1 className="text-xl font-bold">CamiPrint Admin</h1>
              <p className="text-xs text-neutral-400 mt-1">Panel de Control</p>
            </div>

            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white'
                          : 'text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-neutral-800">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* Mobile Header */}
          <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-50">
            <h1 className="font-bold">CamiPrint Admin</h1>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-neutral-800 rounded"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="md:hidden fixed inset-0 top-16 bg-neutral-900 z-40 p-4">
              <nav className="space-y-2 mb-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
