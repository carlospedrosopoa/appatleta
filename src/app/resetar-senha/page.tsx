// app/resetar-senha/page.tsx - Página de redefinir senha com token
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';

function ResetSenhaForm() {
  const [token, setToken] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    if (!token) {
      setErro('Token inválido. Verifique o link de recuperação.');
      setCarregando(false);
      return;
    }

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      setCarregando(false);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      setCarregando(false);
      return;
    }

    try {
      const { data, status } = await api.post('/user/auth/reset-password', { 
        token,
        password: senha 
      });

      if (status === 200) {
        setSucesso(true);
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login?mensagem=Senha redefinida com sucesso!');
        }, 3000);
      } else {
        setErro(data.mensagem || 'Erro ao redefinir senha');
      }
    } catch (err: any) {
      if (err.response?.data?.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro('Erro ao redefinir senha. Tente novamente.');
      }
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Senha redefinida!</h1>
              <p className="text-gray-600 mb-6">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
              </p>
              <a
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ir para login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                src="/icon-192x192.png"
                alt="Play na Quadra"
                className="h-16 w-16 rounded-xl shadow-md"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Redefinir senha</h1>
            <p className="text-gray-600">Digite sua nova senha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!token && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                Token não encontrado. Verifique o link de recuperação.
              </div>
            )}

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Nova senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={carregando || !token}
              />
              <p className="mt-1 text-xs text-gray-500">Mínimo de 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={carregando || !token}
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando || !token}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {carregando ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redefinindo...
                </span>
              ) : (
                'Redefinir senha'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Voltar para login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetSenhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResetSenhaForm />
    </Suspense>
  );
}

