// app/app/atleta/perfil/page.tsx - Perfil do atleta (100% igual ao cursor)
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { userArenaService, userAtletaService, type Arena } from '@/services/userAtletaService';

interface ModalEditarFotoProps {
  isOpen: boolean;
  atletaId: string;
  fotoAtual: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalEditarFoto({ isOpen, atletaId, fotoAtual, onClose, onSuccess }: ModalEditarFotoProps) {
  const [fotoPreview, setFotoPreview] = useState<string | null>(fotoAtual);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErro('');
      setSalvando(true); // Mostrar loading durante processamento

      try {
        // Processar imagem: redimensionar e comprimir
        const { processarFotoPerfil } = await import('@/lib/imageUtils');
        const fotoProcessada = await processarFotoPerfil(file);
        
        setFotoUrl(fotoProcessada);
        setFotoPreview(fotoProcessada);
        setErro('');
      } catch (error: any) {
        console.error('Erro ao processar foto:', error);
        setErro(error.message || 'Erro ao processar imagem. Tente novamente.');
        setFotoUrl(null);
        setFotoPreview(null);
      } finally {
        setSalvando(false);
      }
    }
  };

  const handleSalvar = async () => {
    if (!fotoUrl) {
      setErro('Por favor, selecione uma imagem.');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      const { status } = await api.put(`/atleta/${atletaId}`, { fotoUrl });
      if (status === 200) {
        onSuccess();
      } else {
        setErro('Erro ao salvar foto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
      setErro('Erro ao salvar foto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverFoto = async () => {
    setSalvando(true);
    setErro('');

    try {
      const { status } = await api.put(`/atleta/${atletaId}`, { fotoUrl: null });
      if (status === 200) {
        setFotoPreview(null);
        onSuccess();
      } else {
        setErro('Erro ao remover foto. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      setErro('Erro ao remover foto. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 relative max-w-md w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold mb-4">Alterar Foto</h3>
        
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <div className="space-y-4">
          {fotoPreview && (
            <div className="flex justify-center">
              <img
                src={fotoPreview}
                alt="Preview da foto"
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
              />
            </div>
          )}
          
          <div>
            <label className="block font-semibold mb-2">Selecionar Nova Foto</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full p-2 border rounded"
              disabled={salvando}
            />
            <p className="text-sm text-gray-500 mt-1">Formatos aceitos: JPG, PNG, GIF (máximo 5MB)</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSalvar}
              disabled={salvando || !fotoUrl}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            {fotoAtual && (
              <button
                onClick={handleRemoverFoto}
                disabled={salvando}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Remover
              </button>
            )}
            <button
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalEditarUsuarioProps {
  isOpen: boolean;
  usuario: Usuario;
  onClose: () => void;
  onSuccess: (novoNome: string) => void;
}

function ModalEditarUsuario({ isOpen, usuario, onClose, onSuccess }: ModalEditarUsuarioProps) {
  const [nome, setNome] = useState(usuario.name);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNome(usuario.name);
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMostrarSenhaAtual(false);
      setMostrarNovaSenha(false);
      setMostrarConfirmarSenha(false);
      setErro('');
    }
  }, [isOpen, usuario]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Informe o nome.');
      return;
    }

    const querTrocarSenha = novaSenha.trim().length > 0 || confirmarSenha.trim().length > 0;
    if (querTrocarSenha) {
      if (novaSenha.length < 6) {
        setErro('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setErro('A confirmação de senha não confere.');
        return;
      }
      if (!senhaAtual) {
        setErro('Informe a senha atual para alterar a senha.');
        return;
      }
    }

    try {
      setSalvando(true);

      // Se vai trocar a senha, validar a senha atual autenticando
      if (querTrocarSenha) {
        await api.post('/auth/login', {
          email: usuario.email,
          password: senhaAtual,
        });
      }

      await api.put('/user/perfil', {
        name: nome.trim(),
        password: querTrocarSenha ? novaSenha : undefined,
      });

      onSuccess(nome.trim());
      onClose();
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      const mensagem =
        error?.response?.data?.mensagem ||
        error?.data?.mensagem ||
        (error?.response?.status === 401
          ? 'Senha atual incorreta.'
          : 'Erro ao salvar. Tente novamente.');
      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 relative max-w-md w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg font-bold"
          onClick={onClose}
          disabled={salvando}
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-4">Editar Dados de Usuário</h3>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={salvando}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-semibold">Alterar senha (opcional)</label>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Senha atual</label>
              <div className="relative">
                <input
                  type={mostrarSenhaAtual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="w-full p-2 pr-20 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={salvando}
                  placeholder="Necessária para trocar a senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenhaAtual((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-2 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={salvando}
                >
                  {mostrarSenhaAtual ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nova senha</label>
              <div className="relative">
                <input
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full p-2 pr-20 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={salvando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarNovaSenha((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-2 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={salvando}
                >
                  {mostrarNovaSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={mostrarConfirmarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full p-2 pr-20 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={salvando}
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmarSenha((v) => !v)}
                  className="absolute inset-y-0 right-2 my-1 px-2 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                  disabled={salvando}
                >
                  {mostrarConfirmarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalEditarAtletaProps {
  isOpen: boolean;
  atleta: Atleta;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalEditarAtleta({ isOpen, atleta, onClose, onSuccess }: ModalEditarAtletaProps) {
  const [form, setForm] = useState({
    nome: atleta.nome || '',
    dataNascimento: atleta.dataNascimento ? atleta.dataNascimento.split('T')[0] : '',
    genero: atleta.genero || '',
    categoria: atleta.categoria || '',
    fone: atleta.fone || '',
  });
  const [points, setPoints] = useState<Arena[]>([]);
  const [pointIdPrincipal, setPointIdPrincipal] = useState<string>(atleta.pointIdPrincipal || '');
  const [pointIdsFrequentes, setPointIdsFrequentes] = useState<string[]>(
    atleta.arenasFrequentes?.map(a => a.id) || []
  );
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [carregandoArenas, setCarregandoArenas] = useState(true);

  // Atualizar formulário quando o modal abrir ou atleta mudar
  useEffect(() => {
    if (isOpen && atleta) {
      setForm({
        nome: atleta.nome || '',
        dataNascimento: atleta.dataNascimento ? atleta.dataNascimento.split('T')[0] : '',
        genero: atleta.genero || '',
        categoria: atleta.categoria || '',
        fone: atleta.fone || '',
      });
      setPointIdPrincipal(atleta.pointIdPrincipal || '');
      setPointIdsFrequentes(atleta.arenasFrequentes?.map(a => a.id) || []);
      setErro('');
      carregarArenas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, atleta?.id]);

  const carregarArenas = async () => {
    try {
      setCarregandoArenas(true);
      const data = await userArenaService.listar();
      setPoints(data);
    } catch (error) {
      console.error('Erro ao carregar arenas:', error);
    } finally {
      setCarregandoArenas(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  };

  const handleToggleArenaFrequente = (pointId: string) => {
    setPointIdsFrequentes((prev) => {
      if (prev.includes(pointId)) {
        // Se já está selecionada e é a principal, não pode remover
        if (pointIdPrincipal === pointId) {
          setErro('Não é possível remover a arena principal das arenas frequentes.');
          return prev;
        }
        return prev.filter((id) => id !== pointId);
      } else {
        return [...prev, pointId];
      }
    });
    setErro('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    // Se selecionou uma arena principal, garantir que ela está nas frequentes
    const arenasFrequentes = pointIdPrincipal && !pointIdsFrequentes.includes(pointIdPrincipal)
      ? [...pointIdsFrequentes, pointIdPrincipal]
      : pointIdsFrequentes;

    const payload = {
      nome: form.nome,
      dataNascimento: form.dataNascimento,
      genero: form.genero ? form.genero.toUpperCase() : undefined,
      categoria: form.categoria || undefined,
      fone: form.fone || undefined,
      pointIdPrincipal: pointIdPrincipal || null,
      pointIdsFrequentes: arenasFrequentes,
    };

    try {
      await userAtletaService.atualizar(payload);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar atleta:', error);
      setErro(error?.response?.data?.mensagem || error?.data?.mensagem || error?.message || 'Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg font-bold"
          onClick={onClose}
          disabled={salvando}
        >
          ✕
        </button>
        <h3 className="text-xl font-semibold mb-4">Editar Dados do Atleta</h3>
        
        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Nome completo</label>
            <input
              type="text"
              name="nome"
              placeholder="Nome completo"
              value={form.nome}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
              disabled={salvando}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Data de Nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
              disabled={salvando}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Gênero</label>
              <select
                name="genero"
                value={form.genero}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
                disabled={salvando}
              >
                <option value="">Selecione o gênero</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Categoria</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={salvando}
              >
                <option value="">Selecione a categoria</option>
                <option value="INICIANTE">INICIANTE</option>
                <option value="D">D</option>
                <option value="C">C</option>
                <option value="B">B</option>
                <option value="A">A</option>
                <option value="PRO">PRO</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Telefone</label>
            <input
              type="tel"
              name="fone"
              placeholder="(00) 00000-0000"
              value={form.fone}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={salvando}
            />
          </div>

          {!carregandoArenas && points.length > 0 && (
            <>
              <div>
                <label className="block font-semibold mb-2">Arena mais próxima da sua casa</label>
                <select
                  value={pointIdPrincipal}
                  onChange={(e) => {
                    setPointIdPrincipal(e.target.value);
                    setErro('');
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={salvando}
                >
                  <option value="">Selecione a arena mais próxima</option>
                  {points.map((point) => (
                    <option key={point.id} value={point.id}>
                      {point.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Esta será a arena principal do seu perfil</p>
              </div>

              <div>
                <label className="block font-semibold mb-2">Arenas que você frequenta</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                  {points.map((point) => (
                    <label
                      key={point.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={pointIdsFrequentes.includes(point.id)}
                        onChange={() => handleToggleArenaFrequente(point.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        disabled={salvando}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        {point.logoUrl && (
                          <img
                            src={point.logoUrl}
                            alt={`Logo ${point.nome}`}
                            className="w-6 h-6 object-contain rounded"
                          />
                        )}
                        <span className="text-sm">{point.nome}</span>
                        {pointIdPrincipal === point.id && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione todas as arenas onde você costuma jogar
                </p>
              </div>
            </>
          )}

          {carregandoArenas && (
            <div className="text-sm text-gray-500">Carregando arenas...</div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  fone?: string;
  usuarioId: string;
  pointIdPrincipal?: string | null;
  arenasFrequentes?: Array<{
    id: string;
    nome: string;
    logoUrl?: string | null;
  }>;
}

export default function AtletaPerfilPage() {
  const [token, setToken] = useState<string>('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [atleta, setAtleta] = useState<Atleta | null>(null);

  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [modalEditarAtleta, setModalEditarAtleta] = useState(false);
  const [modalEditarFoto, setModalEditarFoto] = useState(false);
  const [modalAtletaModal, setModalAtleta] = useState(false);

  const auth: any = useAuth();
  const authReady: boolean =
    typeof auth?.authReady === 'boolean' ? auth.authReady : true;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (auth?.usuario) {
      fetchUsuario();
      fetchAtleta();
    } else {
      setUsuario(null);
      setAtleta(null);
    }
  }, [authReady, auth?.usuario]);

  const fetchUsuario = async () => {
    try {
      const res = await api.get('/user/getUsuarioLogado');
      if (res.status >= 200 && res.status < 300) {
        setUsuario(res.data);
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuário', error);
      
      // Verificar se é erro de configuração da API
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network Error')) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        console.warn(
          `⚠️ Erro de conexão com a API. Verifique se NEXT_PUBLIC_API_URL está configurada corretamente.\n` +
          `URL atual: ${apiUrl}\n` +
          `Certifique-se de que a API externa está online e acessível.`
        );
      }
      
      setUsuario(null);
    }
  };

  const fetchAtleta = async () => {
    try {
      const res = await api.get('/atleta/me/atleta');
      if (res.status === 204 || !res.data) {
        setAtleta(null);
        return;
      }
      if (res.status >= 200 && res.status < 300) {
        setAtleta(res.data);
      }
    } catch (error: any) {
      if (error?.status !== 204 && error?.status !== 404) {
        console.error('Erro ao buscar atleta', error);
      }
      setAtleta(null);
    }
  };

  if (authReady === false) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        <div className="animate-pulse bg-gray-100 h-24 rounded mb-4" />
        <div className="animate-pulse bg-gray-100 h-56 rounded" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e de atleta</p>
        </div>

        {/* Usuário */}
        {usuario && (
          <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Dados de Usuário</h2>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setModalEditarUsuario(true)}
              >
                Editar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Nome</p>
                <p className="font-semibold text-gray-900">{usuario.name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{usuario.email}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tipo de Conta</p>
                <p className="font-semibold text-gray-900">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      usuario.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {usuario.role}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Atleta */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Dados de Atleta</h2>
            {atleta && (
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  onClick={() => setModalEditarAtleta(true)}
                >
                  Editar
                </button>
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  onClick={() => setModalEditarFoto(true)}
                >
                  Alterar Foto
                </button>
              </div>
            )}
          </div>

          {atleta ? (
            <div className="space-y-6">
              {/* Foto do Atleta - Destaque */}
              <div className="flex flex-col items-center mb-6">
                {atleta.fotoUrl ? (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                    <img
                      src={atleta.fotoUrl}
                      alt="Foto do atleta"
                      className="relative w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-full shadow-xl border-4 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = target.nextElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 items-center justify-center bg-gray-100 rounded-full">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                    <svg
                      className="w-16 h-16 sm:w-20 sm:h-20 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <p className="mt-4 text-lg font-semibold text-gray-900">{atleta.nome}</p>
                {atleta.categoria && (
                  <span className="mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {atleta.categoria}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {atleta.idade && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Idade</p>
                    <p className="font-semibold text-gray-900">{atleta.idade} anos</p>
                  </div>
                )}
                {atleta.genero && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Gênero</p>
                    <p className="font-semibold text-gray-900">{atleta.genero}</p>
                  </div>
                )}
                {atleta.fone && (
                  <div className="p-4 bg-gray-50 rounded-lg sm:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Telefone</p>
                    <p className="font-semibold text-gray-900">{atleta.fone}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">Você ainda não cadastrou seu perfil de atleta.</p>
              <button
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => setModalAtleta(true)}
              >
                Criar Perfil de Atleta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal editar usuário */}
      {modalEditarUsuario && usuario && (
        <ModalEditarUsuario
          isOpen={modalEditarUsuario}
          usuario={usuario}
          onClose={() => setModalEditarUsuario(false)}
          onSuccess={(novoNome) => {
            setUsuario((prev) => (prev ? { ...prev, name: novoNome } : prev));
            fetchUsuario();
          }}
        />
      )}

      {modalEditarAtleta && atleta && (
        <ModalEditarAtleta
          isOpen={modalEditarAtleta}
          atleta={atleta}
          onClose={() => setModalEditarAtleta(false)}
          onSuccess={() => {
            setModalEditarAtleta(false);
            fetchAtleta();
          }}
        />
      )}

      {modalEditarFoto && (
        <ModalEditarFoto
          isOpen={modalEditarFoto}
          atletaId={atleta?.id || ''}
          fotoAtual={atleta?.fotoUrl || null}
          onClose={() => setModalEditarFoto(false)}
          onSuccess={() => {
            setModalEditarFoto(false);
            fetchAtleta();
          }}
        />
      )}

      {modalAtletaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 relative max-w-md w-full">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
              onClick={() => setModalAtleta(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-semibold mb-4">Criar Perfil de Atleta</h3>
            <p className="text-gray-600 mb-4">Redirecionando para página de criação...</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalAtleta(false);
                  window.location.href = '/app/atleta/preencher-perfil';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Ir para Criar Perfil
              </button>
              <button
                onClick={() => setModalAtleta(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
