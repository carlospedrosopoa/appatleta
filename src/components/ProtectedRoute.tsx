// components/ProtectedRoute.tsx - Proteção de rotas para Next.js (igual ao cursor)
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

type Role = 'ADMIN' | 'USER' | 'ORGANIZER' | string;

type Props = {
  children: ReactNode;
  requiredRole?: Role;
  allowedRoles?: Role[];
  loginRedirectTo?: string;
  unauthorizedRedirectTo?: string;
};

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles,
  loginRedirectTo = '/login',
  unauthorizedRedirectTo = '/unauthorized',
}: Props) {
  const { usuario, autenticado, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;

    if (!autenticado || !usuario) {
      router.replace(loginRedirectTo);
      return;
    }

    const rolesToCheck: Role[] =
      allowedRoles && allowedRoles.length
        ? allowedRoles
        : requiredRole
        ? [requiredRole]
        : [];

    if (rolesToCheck.length) {
      const ok = rolesToCheck.includes(usuario.role as Role);
      if (!ok) {
        router.replace(unauthorizedRedirectTo);
        return;
      }
    }
  }, [authReady, autenticado, usuario, requiredRole, allowedRoles, loginRedirectTo, unauthorizedRedirectTo, router]);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return null;
  }

  const rolesToCheck: Role[] =
    allowedRoles && allowedRoles.length
      ? allowedRoles
      : requiredRole
      ? [requiredRole]
      : [];

  if (rolesToCheck.length) {
    const ok = rolesToCheck.includes(usuario.role as Role);
    if (!ok) {
      return null;
    }
  }

  return <>{children}</>;
}



