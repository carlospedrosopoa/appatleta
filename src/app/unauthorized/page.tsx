// app/unauthorized/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function UnauthorizedPage() {
  const { usuario } = useAuth();
  const isAdminOrOrganizer = usuario?.role === 'ADMIN' || usuario?.role === 'ORGANIZER';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Acesso Negado</h1>
        {isAdminOrOrganizer ? (
          <>
            <p className="text-gray-600 mb-4">
              Este aplicativo é exclusivo para atletas. Organizadores e administradores devem usar o sistema web.
            </p>
            <Link 
              href="/login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              onClick={() => {
                // Fazer logout se necessário
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('token');
                  localStorage.removeItem('basicCreds');
                }
              }}
            >
              Voltar ao Login
            </Link>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
            <Link href="/login" className="text-blue-500 hover:underline">
              Voltar ao Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}



