// layouts/AtletaLayout.tsx - Layout da área do atleta (100% igual ao cursor)
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { 
  Menu as MenuIcon, 
  X, 
  Calendar, 
  Trophy, 
  ShoppingCart, 
  LayoutDashboard, 
  User, 
  LogOut 
} from 'lucide-react';
import PanelaIcon from '@/components/icons/PanelaIcon';

export default function AtletaLayout({ children }: { children: React.ReactNode }) {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  const navItems = [
    { to: '/app/atleta/agendamentos', label: 'Agendamentos', icon: Calendar },
    { to: '/app/atleta/jogos', label: 'Meus Jogos', icon: Trophy },
    { to: '/app/atleta/panelinha', label: 'Minha Panelinha', icon: PanelaIcon },
    { to: '/app/atleta/consumo', label: 'Meu Consumo', icon: ShoppingCart },
    // { to: '/app/atleta/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Oculto temporariamente
    { to: '/app/atleta/perfil', label: 'Meu Perfil', icon: User },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (to: string) =>
    pathname === to || pathname.startsWith(to + '/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGO_URL && (
              <img
                src={process.env.NEXT_PUBLIC_LOGO_URL}
                alt="Play Na Quadra"
                className="h-8 w-auto"
              />
            )}
            <span className="text-lg sm:text-xl font-bold text-blue-600">Play Na Quadra</span>
            <span className="hidden sm:inline text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
              Área do Atleta
            </span>
          </div>
          <div className="flex items-center gap-3">
            {usuario && (
              <span className="hidden sm:inline text-xs text-gray-600 max-w-[200px] truncate">
                {usuario.name || usuario.nome} ({usuario.email})
              </span>
            )}
            <button
              onClick={() => setMenuAberto((v) => !v)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menu</span>
              {menuAberto ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuAberto && (
          <nav className="bg-white border-t border-gray-100 shadow-md">
            <div className="max-w-7xl mx-auto px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={() => setMenuAberto(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.to)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setMenuAberto(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="py-6 px-4">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}


