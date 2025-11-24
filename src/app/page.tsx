// app/page.tsx - Página inicial (igual ao cursor - redireciona baseado no role)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { autenticado, usuario, authReady } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (redirecting) return;

    const timer = setTimeout(() => {
      try {
        setRedirecting(true);

        if (autenticado && usuario) {
          // Redireciona baseado no role (igual ao cursor)
          if (usuario.role === 'ADMIN') {
            router.replace('/app/admin');
          } else if (usuario.role === 'ORGANIZER') {
            router.replace('/app/arena');
          } else {
            router.replace('/app/atleta');
          }
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Erro ao redirecionar:', error);
        router.replace('/login');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [authReady, autenticado, usuario, router]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Carregando...</h1>
      </div>
    </div>
  );
}