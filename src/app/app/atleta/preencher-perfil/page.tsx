// app/app/atleta/preencher-perfil/page.tsx - Criar perfil de atleta
'use client';

// Redireciona para a página existente
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PreencherPerfilAtletaPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/preencher-perfil-atleta');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Carregando...</h1>
      </div>
    </div>
  );
}



