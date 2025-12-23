// app/vincular-conta/page.tsx - Vincular conta por telefone
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Phone, Mail, Lock, User, Calendar, MapPin } from 'lucide-react';

export default function VincularContaPage() {
  const [telefone, setTelefone] = useState('');
  const [etapa, setEtapa] = useState<'buscar' | 'completar'>('buscar');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [usuarioEncontrado, setUsuarioEncontrado] = useState<any>(null);
  
  // Dados do formulário de completar cadastro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  
  const router = useRouter();
  const { login, usuario, authReady, autenticado } = useAuth();

  useEffect(() => {
    if (!authReady) return;
    
    // Se já estiver autenticado, redireciona
    if (autenticado && usuario) {
      router.replace('/app/atleta');
    }
  }, [authReady, autenticado, usuario, router]);

  const handleBuscarTelefone = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      // Buscar usuário pendente por telefone
      const { data, status } = await api.post('/user/buscar-pendente', {
        telefone,
      });

      if (status === 200 && data.encontrado) {
        setUsuarioEncontrado({
          telefone: data.telefone,
          nome: data.nome,
          atletaId: data.atletaId,
          usuarioId: data.usuarioId,
        });
        setNome(data.nome || '');
        setEtapa('completar');
      } else {
        setErro('Telefone não encontrado. Verifique o número e tente novamente, ou crie uma nova conta.');
      }
    } catch (err: any) {
      if (err?.response?.data?.codigo === 'TELEFONE_NAO_ENCONTRADO' || 
          err?.response?.data?.mensagem?.includes('Telefone não encontrado')) {
        setErro('Telefone não encontrado. Verifique o número e tente novamente, ou crie uma nova conta.');
      } else {
        setErro(err?.response?.data?.mensagem || 'Erro ao buscar telefone. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleCompletarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (!email || !password || !nome) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const dadosAtleta: any = {
        nome: nome || undefined,
      };

      if (dataNascimento) {
        dadosAtleta.dataNascimento = dataNascimento;
      }
      if (genero) {
        dadosAtleta.genero = genero;
      }

      const telefoneNormalizado = telefone.replace(/\D/g, '');
      
      const { data, status } = await api.post('/user/completar-cadastro', {
        telefone: telefoneNormalizado,
        email,
        password,
        dadosAtleta,
      });

      if (status !== 200) {
        setErro(data.mensagem || 'Erro ao completar cadastro');
        return;
      }

      // Fazer login automaticamente após completar cadastro
      try {
        const loginResponse = await api.post('/auth/login', { email, password });
        const usuarioData = loginResponse.data.usuario || loginResponse.data.user;
        const tokenJWT = loginResponse.data.token;

        login({
          token: tokenJWT || undefined,
          usuario: usuarioData,
          basicCreds: null,
        });

        // Redireciona para o perfil do atleta
        router.replace('/app/atleta');
      } catch (loginErr: any) {
        // Se login falhar, redireciona para página de login
        router.replace('/login?mensagem=Cadastro completado com sucesso! Faça login para continuar.');
      }
    } catch (err: any) {
      setErro(
        err?.response?.data?.mensagem ||
          err?.response?.data?.error ||
          'Erro ao completar cadastro. Verifique os dados.'
      );
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  const formatarTelefone = (valor: string) => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return valor;
  };

  if (etapa === 'completar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Completar Cadastro</h1>
              <p className="text-gray-600">Complete seus dados para finalizar o cadastro</p>
              <p className="text-sm text-gray-500 mt-2">Telefone: {formatarTelefone(telefone)}</p>
            </div>

            {erro && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <form onSubmit={handleCompletarCadastro} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Seu nome completo"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="seu@email.com"
                      required
                      disabled={carregando}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Nascimento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="dataNascimento"
                      type="date"
                      value={dataNascimento}
                      onChange={(e) => setDataNascimento(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      disabled={carregando}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-2">
                    Gênero
                  </label>
                  <select
                    id="genero"
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    disabled={carregando}
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      disabled={carregando}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="confirmarSenha"
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Digite a senha novamente"
                      required
                      minLength={6}
                      disabled={carregando}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEtapa('buscar');
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
                  {carregando ? 'Completando...' : 'Completar Cadastro'}
                </button>
              </div>
            </form>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vincular Conta</h1>
            <p className="text-gray-600">Informe seu telefone para vincular sua conta</p>
          </div>

          {erro && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
              {erro.includes('Telefone não encontrado') && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <Link
                    href="/criar-conta"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Criar uma nova conta
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleBuscarTelefone} className="space-y-6">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="(00) 00000-0000"
                  required
                  disabled={carregando}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Use o mesmo número de telefone que foi cadastrado pelo administrador
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={carregando || telefone.replace(/\D/g, '').length < 10}
            >
              {carregando ? 'Buscando...' : 'Buscar Conta'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta pendente?{' '}
                <Link href="/criar-conta" className="text-blue-600 hover:text-blue-800 font-medium">
                  Criar nova conta
                </Link>
              </p>
            </div>

            <div className="text-center pt-4 border-t">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">
                Já tem uma conta? Fazer login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

