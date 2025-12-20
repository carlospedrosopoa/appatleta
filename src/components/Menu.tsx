// components/Menu.tsx - Menu de navegação (100% igual ao cursor)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu as MenuIcon, X } from 'lucide-react';

const Menu = () => {
  const { usuario, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', roles: ['USER', 'ADMIN'] },
    { path: '/perfil', label: 'Meu Perfil', roles: ['USER', 'ADMIN'] },
    { path: '/agendamentos', label: 'Agendamentos', roles: ['USER', 'ADMIN'] },
    { path: '/app/atleta/panelinha', label: 'Minha Panelinha', roles: ['USER'] },
    { path: '/app/atleta/consumo', label: 'Meu Consumo', roles: ['USER'] },
    { path: '/app/arena', label: 'Área da Arena', roles: ['ORGANIZER'] },
    { path: '/usuarios', label: 'Usuários', roles: ['ADMIN'] },
    { path: '/atletas', label: 'Atletas', roles: ['ADMIN'] },
    { path: '/app/admin/points', label: 'Estabelecimentos', roles: ['ADMIN'] },
    { path: '/app/admin/quadras', label: 'Quadras', roles: ['ADMIN'] },
    { path: '/app/admin/tabela-precos', label: 'Tabela de Preços', roles: ['ADMIN'] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(usuario?.role || ''));

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    router.push('/login');
  };

  if (!usuario) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_LOGO_URL && (
              <Link href="/dashboard" className="flex items-center">
                <img
                  src={process.env.NEXT_PUBLIC_LOGO_URL}
                  alt="Play Na Quadra"
                  className="h-10 w-auto"
                />
              </Link>
            )}
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              Play Na Quadra
            </Link>
          </div>

          {/* Botão do menu hamburguer (sempre visível) */}
          <div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu em formato hambúrguer (overlay abaixo do header) */}
      {mobileMenuOpen && (
        <div>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t shadow-md">
            {filteredItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Menu;
