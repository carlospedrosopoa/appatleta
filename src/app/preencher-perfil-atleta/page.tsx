// app/preencher-perfil-atleta/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { userArenaService, userAtletaService, type Arena } from '@/services/userAtletaService';

interface AtletaForm {
  nome: string;
  dataNascimento: string;
  genero: string;
  categoria: string;
  esportePreferido: string;
  esportesPratica: string[];
}

export default function PreencherPerfilAtletaPage() {
  const router = useRouter();
  const { usuario, authReady } = useAuth();

  const [form, setForm] = useState<AtletaForm>({
    nome: '',
    dataNascimento: '',
    genero: '',
    categoria: '',
    esportePreferido: '',
    esportesPratica: [],
  });

  const [points, setPoints] = useState<Arena[]>([]);
  const [pointIdPrincipal, setPointIdPrincipal] = useState<string>('');
  const [pointIdsFrequentes, setPointIdsFrequentes] = useState<string[]>([]);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);
  const [carregandoArenas, setCarregandoArenas] = useState(true);
  const [erro, setErro] = useState('');
  const [atletaExistente, setAtletaExistente] = useState<any>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (!usuario) {
      router.push('/login');
      return;
    }

    const carregarArenas = async () => {
      try {
        // Usa o serviço específico para frontend externo (já retorna apenas arenas assinantes e ativas)
        const data = await userArenaService.listar();
        setPoints(data);
      } catch (error) {
        console.error('Erro ao carregar arenas:', error);
      } finally {
        setCarregandoArenas(false);
      }
    };

    const verificarAtleta = async () => {
      try {
        const atleta = await userAtletaService.obter();
        if (atleta) {
          // Já tem atleta - carregar dados para edição
          setAtletaExistente(atleta);
          setModoEdicao(true);
          
          // Preencher formulário com dados existentes
          setForm({
            nome: atleta.nome || '',
            dataNascimento: atleta.dataNascimento ? atleta.dataNascimento.split('T')[0] : '',
            genero: atleta.genero || '',
            categoria: atleta.categoria || '',
            esportePreferido: atleta.esportePreferido || '',
            esportesPratica: atleta.esportesPratica || [],
          });
          
          if (atleta.fotoUrl) {
            setFotoPreview(atleta.fotoUrl);
            setFotoUrl(atleta.fotoUrl);
          }
          
          if (atleta.arenaPrincipal?.id) {
            setPointIdPrincipal(atleta.arenaPrincipal.id);
          }
          
          if (atleta.arenasFrequentes && atleta.arenasFrequentes.length > 0) {
            setPointIdsFrequentes(atleta.arenasFrequentes.map((a: any) => a.id));
          }
        }
      } catch (error: any) {
        // 204 ou 404 = não tem atleta, pode criar
        if (error?.status !== 204 && error?.status !== 404) {
          console.error('Erro ao verificar atleta:', error);
        }
      }
      setVerificando(false);
    };

    carregarArenas();
    verificarAtleta();
  }, [authReady, usuario, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErro('');

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
      }
    }
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

    // Se selecionou uma arena principal, garantir que ela está nas frequentes
    const arenasFrequentes = pointIdPrincipal && !pointIdsFrequentes.includes(pointIdPrincipal)
      ? [...pointIdsFrequentes, pointIdPrincipal]
      : pointIdsFrequentes;

    const payload = {
      ...form,
      genero: form.genero ? form.genero.toUpperCase() : '',
      fotoUrl: fotoUrl || null,
      pointIdPrincipal: pointIdPrincipal || null,
      pointIdsFrequentes: arenasFrequentes,
    };

    try {
      if (modoEdicao && atletaExistente) {
        // Atualizar atleta existente
        console.log('[ATUALIZAR ATLETA DEBUG] Payload sendo enviado:', payload);
        const resultado = await userAtletaService.atualizar(payload);
        console.log('[ATUALIZAR ATLETA DEBUG] Atleta atualizado com sucesso:', resultado);
        router.push('/app/atleta/perfil');
      } else {
        // Criar novo atleta
        console.log('[CRIAR ATLETA DEBUG] Payload sendo enviado:', payload);
        const resultado = await userAtletaService.criar(payload);
        console.log('[CRIAR ATLETA DEBUG] Atleta criado com sucesso:', resultado);
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('[ATLETA DEBUG] Erro ao salvar atleta:', error);
      console.error('[ATLETA DEBUG] Status:', error?.status);
      console.error('[ATLETA DEBUG] Response:', error?.response);
      console.error('[ATLETA DEBUG] Data:', error?.data);
      setErro(error?.response?.data?.mensagem || error?.data?.mensagem || error?.message || 'Erro ao salvar perfil. Tente novamente.');
    }
  };

  if (verificando || !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="p-4">Verificando perfil de atleta...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded-xl shadow-md mt-10">
      <h1 className="text-2xl font-bold mb-4">
        {modoEdicao ? 'Editar Perfil de Atleta' : 'Preencha seu perfil de atleta'}
      </h1>
      
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
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Data de Nascimento</label>
          <input
            type="date"
            name="dataNascimento"
            value={form.dataNascimento}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Gênero</label>
          <select
            name="genero"
            value={form.genero}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
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
            className="w-full p-2 border rounded"
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

        <div>
          <label className="block font-semibold mb-1">Esporte Preferido</label>
          <select
            name="esportePreferido"
            value={form.esportePreferido}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione seu esporte preferido</option>
            <option value="Tênis">Tênis</option>
            <option value="Futebol">Futebol</option>
            <option value="Vôlei">Vôlei</option>
            <option value="Basquete">Basquete</option>
            <option value="Futsal">Futsal</option>
            <option value="Futvolei">Futvolei</option>
            <option value="Beach Tennis">Beach Tennis</option>
            <option value="Padel">Padel</option>
            <option value="Pickleball">Pickleball</option>
            <option value="Squash">Squash</option>
            <option value="Badminton">Badminton</option>
            <option value="Handebol">Handebol</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Este será seu esporte padrão nas seleções</p>
        </div>

        <div>
          <label className="block font-semibold mb-2">Esportes que Pratica</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border rounded p-3 max-h-64 overflow-y-auto">
            {['Tênis', 'Futebol', 'Vôlei', 'Basquete', 'Futsal', 'Futvolei', 'Beach Tennis', 'Padel', 'Pickleball', 'Squash', 'Badminton', 'Handebol'].map((esporte) => (
              <label key={esporte} className="flex items-center gap-2 p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.esportesPratica.includes(esporte)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setForm({ ...form, esportesPratica: [...form.esportesPratica, esporte] });
                    } else {
                      setForm({ ...form, esportesPratica: form.esportesPratica.filter((e) => e !== esporte) });
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{esporte}</span>
              </label>
            ))}
          </div>
          {form.esportesPratica.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Selecionados: {form.esportesPratica.join(', ')}
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Foto do Atleta</label>
          <div className="space-y-2">
            {fotoPreview && (
              <div className="flex justify-center">
                <img
                  src={fotoPreview}
                  alt="Preview da foto"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="w-full p-2 border rounded"
            />
            <p className="text-sm text-gray-500">Formatos aceitos: JPG, PNG, GIF (máximo 5MB)</p>
          </div>
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
                className="w-full p-2 border rounded"
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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Salvar Perfil
        </button>
      </form>
    </div>
  );
}



