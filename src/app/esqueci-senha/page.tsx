// app/esqueci-senha/page.tsx - Página de recuperação de senha
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setSucesso(false);

    try {
      const { data, status } = await api.post('/user/auth/forgot-password', { email });

      if (status === 200) {
        setSucesso(true);
        // Em desenvolvimento, mostrar o link se vier na resposta
        if (data.resetUrl) {
          console.log('Link de reset:', data.resetUrl);
        }
      } else {
        setErro(data.mensagem || 'Erro ao processar solicitação');
      }
    } catch (err: any) {
      if (err.response?.data?.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro('Erro ao processar solicitação. Tente novamente.');
      }
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Esqueci minha senha</h1>
            <p className="text-gray-600">Digite seu email para receber um link de recuperação</p>
          </div>

          {sucesso ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Email enviado!</p>
                <p>
                  Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
                  Verifique sua caixa de entrada e spam.
                </p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Voltar para login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={carregando}
                />
              </div>

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {carregando ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar link de recuperação'
                )}
              </button>
            </form>
          )}

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

