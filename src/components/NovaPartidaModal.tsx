// components/NovaPartidaModal.tsx - Modal para criar nova partida
'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { atletaService } from '@/services/atletaService';
import { partidaService } from '@/services/partidaService';
import { userArenaService, type Arena } from '@/services/userAtletaService';
import type { Atleta } from '@/types/domain';

interface NovaPartidaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  atletaAtualId?: string; // ID do atleta logado (para pré-selecionar)
}

export default function NovaPartidaModal({
  isOpen,
  onClose,
  onSuccess,
  atletaAtualId,
}: NovaPartidaModalProps) {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [carregandoAtletas, setCarregandoAtletas] = useState(false);
  const [buscaAtleta, setBuscaAtleta] = useState('');
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [carregandoArenas, setCarregandoArenas] = useState(false);
  
  // Formulário - inicializa com valores padrão (hoje e hora atual)
  const hoje = new Date();
  const dataPadrao = hoje.toISOString().split('T')[0];
  const horaPadrao = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;
  
  const [data, setData] = useState(dataPadrao);
  const [hora, setHora] = useState(horaPadrao);
  const [pointId, setPointId] = useState<string>('');
  const [atleta1Id, setAtleta1Id] = useState<string>(atletaAtualId || '');
  const [atleta2Id, setAtleta2Id] = useState<string>('');
  const [atleta3Id, setAtleta3Id] = useState<string>('');
  const [atleta4Id, setAtleta4Id] = useState<string>('');
  const [gamesTime1, setGamesTime1] = useState<string>('');
  const [gamesTime2, setGamesTime2] = useState<string>('');
  const [tiebreakTime1, setTiebreakTime1] = useState<string>('');
  const [tiebreakTime2, setTiebreakTime2] = useState<string>('');
  
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar atletas e arenas quando o modal abrir (sempre recarregar para ter dados atualizados)
  useEffect(() => {
    if (isOpen) {
      carregarAtletas('');
      carregarArenas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Buscar atletas quando o termo de busca mudar (debounce opcional)
  useEffect(() => {
    if (!isOpen) return;
    
    // Debounce simples - busca após 300ms sem digitar
    const timeoutId = setTimeout(() => {
      carregarAtletas(buscaAtleta);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaAtleta, isOpen]);

  // Pré-selecionar atleta atual quando disponível
  useEffect(() => {
    if (atletaAtualId && !atleta1Id) {
      setAtleta1Id(atletaAtualId);
    }
  }, [atletaAtualId, atleta1Id]);

  const carregarArenas = async () => {
    setCarregandoArenas(true);
    try {
      const data = await userArenaService.listar();
      setArenas(data);
    } catch (error: any) {
      console.error('Erro ao carregar arenas:', error);
      // Não mostrar erro para o usuário, apenas deixar lista vazia
      setArenas([]);
    } finally {
      setCarregandoArenas(false);
    }
  };

  const carregarAtletas = async (termoBusca: string = '') => {
    setCarregandoAtletas(true);
    setErro(''); // Limpa erros anteriores
    try {
      // Usa o serviço centralizado para listar atletas para seleção
      const data = await atletaService.listarParaSelecao(termoBusca || undefined);
      
      if (data.length === 0) {
        if (termoBusca) {
          // Se está buscando e não encontrou, não é erro - apenas não há resultados
          setAtletas([]);
        } else {
          setErro('Nenhum atleta encontrado no sistema.');
          setAtletas([]);
        }
      } else {
        // Converter AtletaParaSelecao[] para Atleta[] (mapear null para undefined em categoria)
        const atletasConvertidos: Atleta[] = data.map((atleta) => ({
          id: atleta.id,
          nome: atleta.nome,
          idade: atleta.idade,
          categoria: atleta.categoria ?? undefined, // Converter null para undefined
        }));
        setAtletas(atletasConvertidos);
        setErro(''); // Limpa erro se encontrou resultados
      }
    } catch (error: any) {
      console.error('Erro ao carregar atletas:', error);
      const mensagemErro = error.data?.mensagem || error.data?.error || error.message || 'Erro ao carregar lista de atletas';
      setErro(`Erro ao carregar atletas: ${mensagemErro}`);
      setAtletas([]); // Limpa lista em caso de erro
    } finally {
      setCarregandoAtletas(false);
    }
  };

  // A busca agora é feita na API, então não precisa filtrar localmente
  // Mas mantemos para compatibilidade caso a API não suporte busca
  const atletasFiltrados = useMemo(() => {
    // Se não há busca, retorna todos
    if (!buscaAtleta.trim()) return atletas;
    
    // Se há busca, a API já filtrou, mas podemos fazer filtro adicional local se necessário
    // Por enquanto, confiamos na busca da API
    return atletas;
  }, [atletas, buscaAtleta]);

  const resetarFormulario = () => {
    // Atualiza valores padrão ao resetar
    const hoje = new Date();
    const novaDataPadrao = hoje.toISOString().split('T')[0];
    const novaHoraPadrao = `${String(hoje.getHours()).padStart(2, '0')}:${String(hoje.getMinutes()).padStart(2, '0')}`;
    
    setData(novaDataPadrao);
    setHora(novaHoraPadrao);
    setLocal('');
    setAtleta1Id(atletaAtualId || '');
    setAtleta2Id('');
    setAtleta3Id('');
    setAtleta4Id('');
    setGamesTime1('');
    setGamesTime2('');
    setTiebreakTime1('');
    setTiebreakTime2('');
    setErro('');
    setBuscaAtleta('');
  };

  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    // Validações
    if (!atleta1Id || !atleta2Id) {
      setErro('Selecione pelo menos 2 atletas');
      setSalvando(false);
      return;
    }

    // Valida data e hora (já devem estar preenchidos com valores padrão)
    const dataFinal = data || dataPadrao;
    const horaFinal = hora || horaPadrao;
    
    if (!dataFinal || !horaFinal) {
      setErro('Data e hora são obrigatórias');
      setSalvando(false);
      return;
    }

    // Local não é mais obrigatório, vamos usar o nome da arena selecionada ou um valor padrão

    // Verificar se não há atletas duplicados
    const atletasSelecionados = [atleta1Id, atleta2Id, atleta3Id, atleta4Id].filter(Boolean);
    const atletasUnicos = new Set(atletasSelecionados);
    if (atletasSelecionados.length !== atletasUnicos.size) {
      setErro('Não é possível selecionar o mesmo atleta duas vezes');
      setSalvando(false);
      return;
    }

    try {
      // Combinar data e hora no formato ISO 8601 completo
      // Formato esperado: "2024-01-15T10:00:00.000Z"
      const dataHoraISO = new Date(`${dataFinal}T${horaFinal}:00`).toISOString();
      
      // Se uma arena foi selecionada, usar o nome dela como local, senão usar valor padrão
      const arenaSelecionada = arenas.find(a => a.id === pointId);
      const localParaSalvar = arenaSelecionada ? arenaSelecionada.nome : 'Partida';
      
      const dadosPartida = {
        data: dataHoraISO,
        local: localParaSalvar,
        pointId: pointId || null,
        atleta1Id,
        atleta2Id,
        atleta3Id: atleta3Id || null,
        atleta4Id: atleta4Id || null,
        gamesTime1: gamesTime1 ? parseInt(gamesTime1) : null,
        gamesTime2: gamesTime2 ? parseInt(gamesTime2) : null,
        tiebreakTime1: tiebreakTime1 ? parseInt(tiebreakTime1) : null,
        tiebreakTime2: tiebreakTime2 ? parseInt(tiebreakTime2) : null,
      };

      // Usa o serviço centralizado para criar partida
      await partidaService.criar(dadosPartida);

      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar partida:', error);
      const mensagemErro = error.data?.mensagem || error.data?.error || error.message || 'Erro ao criar partida';
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  const getAtletaNome = (id: string) => {
    return atletas.find((a) => a.id === id)?.nome || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Nova Partida</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Data e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Arena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arena (opcional)
            </label>
            <select
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
              disabled={carregandoArenas}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="">Selecione uma arena (opcional)</option>
              {arenas.map((arena) => (
                <option key={arena.id} value={arena.id}>
                  {arena.nome}
                </option>
              ))}
            </select>
            {carregandoArenas && (
              <p className="text-xs text-gray-500 mt-1">Carregando arenas...</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Selecionar a arena permite usar o template de card personalizado dela.
            </p>
          </div>

          {/* Busca de Atletas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Atleta {atletas.length > 0 && `(${atletasFiltrados.length} de ${atletas.length})`}
            </label>
            <div className="relative">
              <input
                type="text"
                value={buscaAtleta}
                onChange={(e) => setBuscaAtleta(e.target.value)}
                placeholder="Digite o nome do atleta para buscar..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                disabled={carregandoAtletas || atletas.length === 0}
              />
              {buscaAtleta && (
                <button
                  type="button"
                  onClick={() => setBuscaAtleta('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Limpar busca"
                >
                  ✕
                </button>
              )}
            </div>
            {atletas.length > 0 && atletasFiltrados.length === 0 && buscaAtleta && (
              <p className="text-sm text-gray-500 mt-1">Nenhum atleta encontrado com "{buscaAtleta}"</p>
            )}
          </div>

          {/* Seleção de Atletas */}
          <div className="space-y-4">
            {carregandoAtletas ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-sm text-gray-500 mt-2">Carregando lista de atletas...</p>
              </div>
            ) : atletas.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800 font-medium">Nenhum atleta encontrado</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {buscaAtleta 
                    ? `Nenhum atleta encontrado com "${buscaAtleta}". Tente outra busca.`
                    : 'Nenhum atleta cadastrado no sistema ainda.'}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atleta 1 (Time 1) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={atleta1Id}
                    onChange={(e) => setAtleta1Id(e.target.value)}
                    required
                    disabled={atletasFiltrados.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione um atleta</option>
                    {atletasFiltrados.map((atleta) => (
                      <option 
                        key={atleta.id} 
                        value={atleta.id}
                        disabled={atleta.id === atleta2Id || atleta.id === atleta3Id || atleta.id === atleta4Id}
                      >
                        {atleta.nome}
                        {atleta.idade ? ` (${atleta.idade} anos)` : ''}
                        {atleta.categoria ? ` - ${atleta.categoria}` : ''}
                        {atleta.id === atleta2Id || atleta.id === atleta3Id || atleta.id === atleta4Id ? ' (já selecionado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atleta 2 (Time 1) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={atleta2Id}
                    onChange={(e) => setAtleta2Id(e.target.value)}
                    required
                    disabled={atletasFiltrados.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione um atleta</option>
                    {atletasFiltrados.map((atleta) => (
                      <option 
                        key={atleta.id} 
                        value={atleta.id}
                        disabled={atleta.id === atleta1Id || atleta.id === atleta3Id || atleta.id === atleta4Id}
                      >
                        {atleta.nome}
                        {atleta.idade ? ` (${atleta.idade} anos)` : ''}
                        {atleta.categoria ? ` - ${atleta.categoria}` : ''}
                        {atleta.id === atleta1Id || atleta.id === atleta3Id || atleta.id === atleta4Id ? ' (já selecionado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atleta 3 (Time 2) <span className="text-gray-500 text-xs">(opcional)</span>
                  </label>
                  <select
                    value={atleta3Id}
                    onChange={(e) => setAtleta3Id(e.target.value)}
                    disabled={atletasFiltrados.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Nenhum (jogo de duplas)</option>
                    {atletasFiltrados.map((atleta) => (
                      <option 
                        key={atleta.id} 
                        value={atleta.id}
                        disabled={atleta.id === atleta1Id || atleta.id === atleta2Id || atleta.id === atleta4Id}
                      >
                        {atleta.nome}
                        {atleta.idade ? ` (${atleta.idade} anos)` : ''}
                        {atleta.categoria ? ` - ${atleta.categoria}` : ''}
                        {atleta.id === atleta1Id || atleta.id === atleta2Id || atleta.id === atleta4Id ? ' (já selecionado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Atleta 4 (Time 2) <span className="text-gray-500 text-xs">(opcional)</span>
                  </label>
                  <select
                    value={atleta4Id}
                    onChange={(e) => setAtleta4Id(e.target.value)}
                    disabled={atletasFiltrados.length === 0}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Nenhum (jogo de duplas)</option>
                    {atletasFiltrados.map((atleta) => (
                      <option 
                        key={atleta.id} 
                        value={atleta.id}
                        disabled={atleta.id === atleta1Id || atleta.id === atleta2Id || atleta.id === atleta3Id}
                      >
                        {atleta.nome}
                        {atleta.idade ? ` (${atleta.idade} anos)` : ''}
                        {atleta.categoria ? ` - ${atleta.categoria}` : ''}
                        {atleta.id === atleta1Id || atleta.id === atleta2Id || atleta.id === atleta3Id ? ' (já selecionado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Placar (Opcional) */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Placar (Opcional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Games Time 1</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={gamesTime1}
                  onChange={(e) => setGamesTime1(e.target.value)}
                  placeholder="Ex: 6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Games Time 2</label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={gamesTime2}
                  onChange={(e) => setGamesTime2(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                />
              </div>
              {(gamesTime1 === '6' && gamesTime2 === '6') || 
               (gamesTime1 === '7' && gamesTime2 === '6') || 
               (gamesTime1 === '6' && gamesTime2 === '7') ? (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tiebreak Time 1</label>
                    <input
                      type="number"
                      min="0"
                      value={tiebreakTime1}
                      onChange={(e) => setTiebreakTime1(e.target.value)}
                      placeholder="Ex: 7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tiebreak Time 2</label>
                    <input
                      type="number"
                      min="0"
                      value={tiebreakTime2}
                      onChange={(e) => setTiebreakTime2(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={salvando}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {salvando ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                'Criar Partida'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

