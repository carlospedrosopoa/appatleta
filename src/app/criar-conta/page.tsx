// app/criar-conta/page.tsx - Página de registro baseada em telefone
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Phone, Mail } from 'lucide-react';

type Etapa = 'telefone' | 'confirmar-email' | 'criar-senha';

export default function CriarContaPage() {
  const [etapa, setEtapa] = useState<Etapa>('telefone');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [emailConfirmado, setEmailConfirmado] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [name, setName] = useState('');
  const [atletaEncontrado, setAtletaEncontrado] = useState<any>(null);
  const [atletaIncompleto, setAtletaIncompleto] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redireciona se já autenticado
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      router.push('/app/atleta');
    }
  }, [router]);

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return valor;
  };

  const mascararEmail = (email: string) => {
    const [local, dominio] = email.split('@');
    if (!local || !dominio) return email;
    
    const localMascarado = local.length > 2 
      ? `${local.substring(0, 2)}${'*'.repeat(Math.min(local.length - 2, 4))}`
      : '**';
    
    return `${localMascarado}@${dominio}`;
  };

  const handleBuscarTelefone = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      const telefoneNormalizado = telefone.replace(/\D/g, '');
      
      const { data, status } = await api.post('/user/atleta/buscar-por-telefone', {
        telefone: telefoneNormalizado,
      });

      if (status === 200 && data) {
        setAtletaEncontrado(data);
        setName(data.nome || '');
        setAtletaIncompleto(false);

        const emailEncontrado: string | null = data.email || null;
        const isEmailTemporario =
          !!emailEncontrado &&
          (emailEncontrado.endsWith('@pendente.local') ||
            emailEncontrado.startsWith('temp_'));
        
        // Se já tem conta "normal" (usuarioId existe e email não é temporário), redireciona para login
        if (data.usuarioId && emailEncontrado && !isEmailTemporario) {
          router.push(`/login?email=${encodeURIComponent(emailEncontrado)}`);
          return;
        }
        
        // Se o email é temporário ou não existe, tratar como cadastro pendente/incompleto
        if (!emailEncontrado || isEmailTemporario) {
          // Marca como atleta incompleto para pedir email no próximo passo
          setAtletaIncompleto(true);
          setEtapa('criar-senha');
          return;
        }

        // Se tem email "real" mas ainda não tem usuário vinculado, vai para confirmação de email
        if (emailEncontrado && !data.usuarioId) {
          setEmailMascarado(mascararEmail(emailEncontrado));
          setEtapa('confirmar-email');
        }
      } else {
        // Telefone não encontrado - novo cadastro
        setEtapa('criar-senha');
      }
    } catch (err: any) {
      // Se não encontrou, permite criar nova conta
      if (err?.response?.status === 404) {
        setEtapa('criar-senha');
      } else {
        setErro(err?.response?.data?.mensagem || 'Erro ao buscar telefone. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailConfirmado || emailConfirmado !== atletaEncontrado?.email) {
      setErro('Email não confere. Verifique e tente novamente.');
      return;
    }

    setEmail(emailConfirmado);
    // Após confirmar email, vai direto para criar senha
    setEtapa('criar-senha');
  };

  const handleCriarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const telefoneNormalizado = telefone.replace(/\D/g, '');
      
      const payload: any = {
        telefone: telefoneNormalizado,
        password,
      };

      // Se já existe atleta, apenas cria/atualiza usuário
      if (atletaEncontrado) {
        payload.email = email || atletaEncontrado.email;
        payload.name = name || atletaEncontrado.nome;
        payload.atletaId = atletaEncontrado.id;
      } else {
        // Novo cadastro
        payload.email = email;
        payload.name = name;
      }

      const { data, status } = await api.post('/user/auth/register-com-telefone', payload);

      if (status === 200 || status === 201) {
        // Redireciona para login após sucesso
        router.replace('/login?mensagem=Conta criada com sucesso! Faça login para continuar.');
      } else {
        setErro(data.mensagem || data.error || 'Erro ao criar conta. Verifique os dados.');
      }
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          err?.response?.data?.error ||
          'Erro ao criar conta. Verifique os dados.'
      );
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  // Etapa 1: Informar telefone
  if (etapa === 'telefone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h1>
              <p className="text-gray-600">Informe seu telefone para começar</p>
            </div>

            {erro && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <form onSubmit={handleBuscarTelefone} className="space-y-5">
              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="telefone"
                    type="tel"
                    value={formatarTelefone(telefone)}
                    onChange={(e) => {
                      const apenasNumeros = e.target.value.replace(/\D/g, '');
                      if (apenasNumeros.length <= 11) {
                        setTelefone(apenasNumeros);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    required
                    disabled={carregando}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Informe o número de telefone cadastrado ou use para criar nova conta
                </p>
              </div>

              <button
                type="submit"
                disabled={carregando || telefone.replace(/\D/g, '').length < 10}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {carregando ? 'Buscando...' : 'Continuar'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem conta?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Fazer login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 2: Confirmar email (se atleta já existe)
  if (etapa === 'confirmar-email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirmar Email</h1>
              <p className="text-gray-600">Confirme seu email para continuar</p>
              <p className="text-sm text-gray-500 mt-2">
                Email cadastrado: <strong>{emailMascarado}</strong>
              </p>
            </div>

            {erro && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <form onSubmit={handleConfirmarEmail} className="space-y-5">
              <div>
                <label htmlFor="emailConfirmado" className="block text-sm font-medium text-gray-700 mb-2">
                  Digite seu email completo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="emailConfirmado"
                    type="email"
                    value={emailConfirmado}
                    onChange={(e) => setEmailConfirmado(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="seu@email.com"
                    required
                    disabled={carregando}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEtapa('telefone');
                    setErro('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  disabled={carregando}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={carregando}
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Etapa 3: Criar senha
  if (etapa === 'criar-senha') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {atletaEncontrado ? 'Criar Senha' : 'Criar Conta'}
              </h1>
              <p className="text-gray-600">
                {atletaEncontrado
                  ? 'Crie uma senha para acessar sua conta'
                  : 'Complete seus dados para finalizar o cadastro'}
              </p>
            </div>

            {erro && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <form onSubmit={handleCriarSenha} className="space-y-5">
              {(!atletaEncontrado || atletaIncompleto) && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Seu nome"
                      required
                      disabled={carregando}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="seu@email.com"
                      required
                      disabled={carregando}
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  disabled={carregando}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Digite a senha novamente"
                  required
                  minLength={6}
                  disabled={carregando}
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {carregando ? 'Criando...' : 'Criar Conta'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem conta?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                  Fazer login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (não deveria chegar aqui)
  return null;
}

