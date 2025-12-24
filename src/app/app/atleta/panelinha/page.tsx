// app/app/atleta/panelinha/page.tsx - Minha Panelinha
'use client';

import { useEffect, useState } from 'react';
import { 
  panelinhaService, 
  type Panelinha, 
  type AtletaBusca,
  type PanelinhaMembro,
  type RankingPanelinha,
  type PartidaPanelinha,
  type CriarJogoPanelinhaPayload
} from '@/services/panelinhaService';
import { userArenaService, type Arena } from '@/services/userAtletaService';

interface ModalCriarPanelinhaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ESPORTES_DISPONIVEIS = ['Tênis', 'Futebol', 'Vôlei', 'Basquete', 'Futsal', 'Futvolei', 'Beach Tennis', 'Padel', 'Pickleball', 'Squash', 'Badminton', 'Handebol'];

function ModalCriarPanelinha({ isOpen, onClose, onSuccess }: ModalCriarPanelinhaProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [esporte, setEsporte] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setErro('Nome da panelinha é obrigatório');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      await panelinhaService.criarPanelinha({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        esporte: esporte.trim() || undefined,
      });
      setNome('');
      setDescricao('');
      setEsporte('');
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar panelinha:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao criar panelinha');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Nova Panelinha</h2>
        
        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Panelinha *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Turma de Beach Tennis"
            disabled={salvando}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Esporte (opcional)
          </label>
          <select
            value={esporte}
            onChange={(e) => setEsporte(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={salvando}
          >
            <option value="">Selecione um esporte...</option>
            {ESPORTES_DISPONIVEIS.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descreva sua panelinha..."
            disabled={salvando}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalBuscarAtletasProps {
  isOpen: boolean;
  panelinhaId: string;
  membrosAtuais: PanelinhaMembro[];
  onClose: () => void;
  onAdicionar: (atletaId: string) => void;
}

function ModalBuscarAtletas({ isOpen, panelinhaId, membrosAtuais, onClose, onAdicionar }: ModalBuscarAtletasProps) {
  const [termo, setTermo] = useState('');
  const [atletas, setAtletas] = useState<AtletaBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [adicionando, setAdicionando] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && termo.length >= 2) {
      const timeoutId = setTimeout(() => {
        buscarAtletas();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else if (termo.length < 2) {
      setAtletas([]);
    }
  }, [termo, isOpen]);

  const buscarAtletas = async () => {
    if (termo.length < 2) return;

    setBuscando(true);
    try {
      const resultados = await panelinhaService.buscarAtletas(termo, 20);
      setAtletas(resultados);
    } catch (error: any) {
      console.error('Erro ao buscar atletas:', error);
      setAtletas([]);
    } finally {
      setBuscando(false);
    }
  };

  const handleAdicionar = async (atletaId: string) => {
    // Verificar se já está na panelinha
    if (membrosAtuais.some(m => m.id === atletaId)) {
      alert('Este atleta já está na panelinha');
      return;
    }

    setAdicionando(atletaId);
    try {
      await panelinhaService.adicionarAtletaPanelinha(panelinhaId, atletaId);
      onAdicionar(atletaId);
      // Remover da lista de resultados
      setAtletas(atletas.filter(a => a.id !== atletaId));
    } catch (error: any) {
      console.error('Erro ao adicionar atleta:', error);
      alert(error.data?.mensagem || error.message || 'Erro ao adicionar atleta');
    } finally {
      setAdicionando(null);
    }
  };

  if (!isOpen) return null;

  const idsMembros = new Set(membrosAtuais.map(m => m.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold mb-4">Buscar Atletas</h2>
          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nome ou telefone (mínimo 2 caracteres)..."
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {buscando && (
            <div className="text-center py-8 text-gray-500">
              Buscando...
            </div>
          )}

          {!buscando && termo.length < 2 && (
            <div className="text-center py-8 text-gray-500">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}

          {!buscando && termo.length >= 2 && atletas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum atleta encontrado
            </div>
          )}

          {!buscando && atletas.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {atletas.map((atleta) => {
                const jaEstaNaPanelinha = idsMembros.has(atleta.id);
                const estaAdicionando = adicionando === atleta.id;

                return (
                  <div
                    key={atleta.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {atleta.fotoUrl ? (
                          <img
                            src={atleta.fotoUrl}
                            alt={atleta.nome}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                            {atleta.nome.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{atleta.nome}</h3>
                        {atleta.telefone && (
                          <p className="text-sm text-gray-600 truncate">{atleta.telefone}</p>
                        )}
                        {atleta.categoria && (
                          <p className="text-xs text-gray-500 mt-1">{atleta.categoria}</p>
                        )}
                      </div>
                      <div>
                        {jaEstaNaPanelinha ? (
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Já está
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAdicionar(atleta.id)}
                            disabled={estaAdicionando}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {estaAdicionando ? 'Adicionando...' : 'Adicionar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalDetalhesPanelinhaProps {
  isOpen: boolean;
  panelinha: Panelinha | null;
  onClose: () => void;
  onAtualizar: () => void;
  onDeletar: () => void;
}

function ModalDetalhesPanelinha({ isOpen, panelinha, onClose, onAtualizar, onDeletar }: ModalDetalhesPanelinhaProps) {
  const [abaAtiva, setAbaAtiva] = useState<'membros' | 'ranking' | 'jogos'>('membros');
  const [mostrarBuscar, setMostrarBuscar] = useState(false);
  const [mostrarCriarJogo, setMostrarCriarJogo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [esporte, setEsporte] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [ranking, setRanking] = useState<RankingPanelinha[]>([]);
  const [jogos, setJogos] = useState<PartidaPanelinha[]>([]);
  const [carregandoRanking, setCarregandoRanking] = useState(false);
  const [carregandoJogos, setCarregandoJogos] = useState(false);

  useEffect(() => {
    if (panelinha) {
      setNome(panelinha.nome);
      setDescricao(panelinha.descricao || '');
      setEsporte(panelinha.esporte || '');
      setEditando(false);
      setAbaAtiva('membros');
    }
  }, [panelinha]);

  useEffect(() => {
    if (panelinha && abaAtiva === 'ranking') {
      carregarRanking();
    }
  }, [panelinha, abaAtiva]);

  useEffect(() => {
    if (panelinha && abaAtiva === 'jogos') {
      carregarJogos();
    }
  }, [panelinha, abaAtiva]);

  const carregarRanking = async () => {
    if (!panelinha) return;
    setCarregandoRanking(true);
    try {
      const rankingData = await panelinhaService.obterRankingPanelinha(panelinha.id);
      setRanking(rankingData);
    } catch (error: any) {
      console.error('Erro ao carregar ranking:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao carregar ranking');
    } finally {
      setCarregandoRanking(false);
    }
  };

  const carregarJogos = async () => {
    if (!panelinha) return;
    setCarregandoJogos(true);
    try {
      const jogosData = await panelinhaService.listarJogosPanelinha(panelinha.id);
      setJogos(jogosData);
    } catch (error: any) {
      console.error('Erro ao carregar jogos:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao carregar jogos');
    } finally {
      setCarregandoJogos(false);
    }
  };

  const handleSalvar = async () => {
    if (!panelinha) return;

    if (!nome.trim()) {
      setErro('Nome da panelinha é obrigatório');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      await panelinhaService.atualizarPanelinha(panelinha.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        esporte: esporte.trim() || undefined,
      });
      setEditando(false);
      onAtualizar();
    } catch (error: any) {
      console.error('Erro ao atualizar panelinha:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao atualizar panelinha');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverAtleta = async (atletaId: string) => {
    if (!panelinha) return;

    if (!confirm('Tem certeza que deseja remover este atleta da panelinha?')) {
      return;
    }

    setRemovendo(atletaId);
    try {
      await panelinhaService.removerAtletaPanelinha(panelinha.id, atletaId);
      onAtualizar();
    } catch (error: any) {
      console.error('Erro ao remover atleta:', error);
      alert(error.data?.mensagem || error.message || 'Erro ao remover atleta');
    } finally {
      setRemovendo(null);
    }
  };

  const handleDeletar = async () => {
    if (!panelinha) return;

    if (!confirm('Tem certeza que deseja deletar esta panelinha? Esta ação não pode ser desfeita.')) {
      return;
    }

    setSalvando(true);
    try {
      await panelinhaService.deletarPanelinha(panelinha.id);
      onDeletar();
    } catch (error: any) {
      console.error('Erro ao deletar panelinha:', error);
      alert(error.data?.mensagem || error.message || 'Erro ao deletar panelinha');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen || !panelinha) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                {editando ? 'Editar Panelinha' : panelinha.nome}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {erro && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {erro}
              </div>
            )}

            {editando ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Panelinha *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={salvando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Esporte
                  </label>
                  <select
                    value={esporte}
                    onChange={(e) => setEsporte(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={salvando}
                  >
                    <option value="">Selecione um esporte...</option>
                    {ESPORTES_DISPONIVEIS.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={salvando}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditando(false);
                      setNome(panelinha.nome);
                      setDescricao(panelinha.descricao || '');
                      setEsporte(panelinha.esporte || '');
                      setErro('');
                    }}
                    disabled={salvando}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {panelinha.esporte && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                      {panelinha.esporte}
                    </span>
                  </div>
                )}
                {panelinha.descricao && (
                  <p className="text-gray-600 mb-4">{panelinha.descricao}</p>
                )}
              </>
            )}
          </div>

          {/* Abas */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-4">
              <button
                onClick={() => setAbaAtiva('membros')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  abaAtiva === 'membros'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Membros ({panelinha.totalMembros})
              </button>
              <button
                onClick={() => setAbaAtiva('ranking')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  abaAtiva === 'ranking'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ranking
              </button>
              <button
                onClick={() => setAbaAtiva('jogos')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  abaAtiva === 'jogos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Jogos
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {abaAtiva === 'membros' && (
              <>
                {panelinha.membros.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum membro ainda. Adicione atletas para começar!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {panelinha.membros.map((membro) => (
                      <div
                        key={membro.id}
                        className="border border-gray-200 rounded-lg p-4 flex items-center gap-4"
                      >
                        <div className="flex-shrink-0">
                          {membro.fotoUrl ? (
                            <img
                              src={membro.fotoUrl}
                              alt={membro.nome}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                              {membro.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{membro.nome}</h4>
                          {membro.telefone && (
                            <p className="text-sm text-gray-600 truncate">{membro.telefone}</p>
                          )}
                          {membro.categoria && (
                            <p className="text-xs text-gray-500 mt-1">{membro.categoria}</p>
                          )}
                        </div>
                        {panelinha.ehCriador && membro.id !== panelinha.atletaIdCriador && (
                          <button
                            onClick={() => handleRemoverAtleta(membro.id)}
                            disabled={removendo === membro.id}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {removendo === membro.id ? 'Removendo...' : 'Remover'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {abaAtiva === 'ranking' && (
              <>
                {carregandoRanking ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando ranking...
                  </div>
                ) : ranking.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum jogo registrado ainda. Crie jogos para ver o ranking!
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pos</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atleta</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pontos</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">V</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">D</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">DTB</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Saldo</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jogos</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ranking.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-bold text-gray-900">
                              {r.posicao || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {r.atleta.fotoUrl ? (
                                  <img
                                    src={r.atleta.fotoUrl}
                                    alt={r.atleta.nome}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                    {r.atleta.nome.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-medium text-gray-900">{r.atleta.nome}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-bold text-blue-600">
                              {r.pontuacao}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">
                              {r.vitorias}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">
                              {r.derrotas}
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">
                              {r.derrotasTieBreak}
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-medium">
                              <span className={r.saldoGames >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {r.saldoGames > 0 ? '+' : ''}{r.saldoGames}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-600">
                              {r.partidasJogadas}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {abaAtiva === 'jogos' && (
              <>
                {carregandoJogos ? (
                  <div className="text-center py-8 text-gray-500">
                    Carregando jogos...
                  </div>
                ) : jogos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum jogo registrado ainda. Crie o primeiro jogo!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {jogos.map((jogo) => {
                      const time1 = [jogo.atleta1, jogo.atleta3].filter(Boolean);
                      const time2 = [jogo.atleta2, jogo.atleta4].filter(Boolean);
                      const temPlacar = jogo.gamesTime1 !== null && jogo.gamesTime2 !== null;
                      const teveTieBreak = jogo.tiebreakTime1 !== null || jogo.tiebreakTime2 !== null;
                      
                      return (
                        <div key={jogo.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="text-sm text-gray-500">
                                {new Date(jogo.data).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="text-sm text-gray-500">{jogo.local}</div>
                            </div>
                            {panelinha.ehCriador && (
                              <button
                                onClick={async () => {
                                  if (!confirm('Tem certeza que deseja deletar este jogo? Esta ação não pode ser desfeita e o ranking será recalculado.')) {
                                    return;
                                  }
                                  try {
                                    await panelinhaService.deletarJogoPanelinha(panelinha.id, jogo.id);
                                    await carregarJogos();
                                    onAtualizar(); // Atualizar ranking se necessário
                                  } catch (error: any) {
                                    alert(error.data?.mensagem || error.message || 'Erro ao deletar jogo');
                                  }
                                }}
                                className="ml-4 px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                                title="Deletar jogo"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Time 1</div>
                              <div className="space-y-1">
                                {time1.map((atleta) => (
                                  <div key={atleta?.id} className="flex items-center gap-2">
                                    {atleta?.fotoUrl ? (
                                      <img
                                        src={atleta.fotoUrl}
                                        alt={atleta.nome}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                        {atleta?.nome.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-sm">{atleta?.nome}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Time 2</div>
                              <div className="space-y-1">
                                {time2.map((atleta) => (
                                  <div key={atleta?.id} className="flex items-center gap-2">
                                    {atleta?.fotoUrl ? (
                                      <img
                                        src={atleta.fotoUrl}
                                        alt={atleta.nome}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                                        {atleta?.nome.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="text-sm">{atleta?.nome}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {temPlacar && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-center gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {jogo.gamesTime1}
                                  </div>
                                  <div className="text-xs text-gray-500">Time 1</div>
                                </div>
                                <div className="text-xl font-bold text-gray-400">x</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {jogo.gamesTime2}
                                  </div>
                                  <div className="text-xs text-gray-500">Time 2</div>
                                </div>
                                {teveTieBreak && (
                                  <div className="text-xs text-gray-500 ml-2">
                                    (TB: {jogo.tiebreakTime1 || 0} x {jogo.tiebreakTime2 || 0})
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {mostrarBuscar && (
        <ModalBuscarAtletas
          isOpen={mostrarBuscar}
          panelinhaId={panelinha.id}
          membrosAtuais={panelinha.membros}
          onClose={() => setMostrarBuscar(false)}
          onAdicionar={() => {
            setMostrarBuscar(false);
            onAtualizar();
          }}
        />
      )}

      {mostrarCriarJogo && (
        <ModalCriarJogo
          isOpen={mostrarCriarJogo}
          panelinhaId={panelinha.id}
          membros={panelinha.membros}
          onClose={() => setMostrarCriarJogo(false)}
          onSuccess={() => {
            setMostrarCriarJogo(false);
            carregarJogos();
            onAtualizar(); // Atualizar para recarregar ranking se necessário
          }}
        />
      )}
    </>
  );
}

interface ModalCriarJogoProps {
  isOpen: boolean;
  panelinhaId: string;
  membros: PanelinhaMembro[];
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCriarJogo({ isOpen, panelinhaId, membros, onClose, onSuccess }: ModalCriarJogoProps) {
  const [atleta1Id, setAtleta1Id] = useState('');
  const [atleta2Id, setAtleta2Id] = useState('');
  const [atleta3Id, setAtleta3Id] = useState('');
  const [atleta4Id, setAtleta4Id] = useState('');
  const [data, setData] = useState(() => {
    const hoje = new Date();
    hoje.setHours(hoje.getHours() + 1);
    return hoje.toISOString().slice(0, 16);
  });
  const [pointId, setPointId] = useState<string>('');
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [carregandoArenas, setCarregandoArenas] = useState(false);
  const [gamesTime1, setGamesTime1] = useState<number | null>(null);
  const [gamesTime2, setGamesTime2] = useState<number | null>(null);
  const [tiebreakTime1, setTiebreakTime1] = useState<number | null>(null);
  const [tiebreakTime2, setTiebreakTime2] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar arenas e resetar seleções quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarArenas();
      setAtleta1Id('');
      setAtleta2Id('');
      setAtleta3Id('');
      setAtleta4Id('');
      setPointId('');
      setErro('');
    }
  }, [isOpen]);

  const carregarArenas = async () => {
    setCarregandoArenas(true);
    try {
      const data = await userArenaService.listar();
      setArenas(data);
    } catch (error: any) {
      console.error('Erro ao carregar arenas:', error);
      setArenas([]);
    } finally {
      setCarregandoArenas(false);
    }
  };

  const handleSelecionarAtleta = (atletaId: string) => {
    if (salvando) return;
    
    // Verificar se o atleta já foi selecionado
    if ([atleta1Id, atleta2Id, atleta3Id, atleta4Id].includes(atletaId)) {
      // Se já está selecionado, remover da posição atual
      if (atleta1Id === atletaId) setAtleta1Id('');
      else if (atleta2Id === atletaId) setAtleta2Id('');
      else if (atleta3Id === atletaId) setAtleta3Id('');
      else if (atleta4Id === atletaId) setAtleta4Id('');
      return;
    }

    // Adicionar na próxima posição disponível
    // Ordem: Time 1 completo (Jogador 1, Jogador 2) → Time 2 completo (Jogador 1, Jogador 2)
    if (!atleta1Id) {
      setAtleta1Id(atletaId);
    } else if (!atleta3Id) {
      setAtleta3Id(atletaId);
    } else if (!atleta2Id) {
      setAtleta2Id(atletaId);
    } else if (!atleta4Id) {
      setAtleta4Id(atletaId);
    }
  };

  const getPosicaoAtleta = (atletaId: string): string | null => {
    if (atleta1Id === atletaId) return 'Time 1 - Jogador 1';
    if (atleta2Id === atletaId) return 'Time 2 - Jogador 1';
    if (atleta3Id === atletaId) return 'Time 1 - Jogador 2';
    if (atleta4Id === atletaId) return 'Time 2 - Jogador 2';
    return null;
  };

  const handleSalvar = async () => {
    if (!atleta1Id || !atleta2Id || !atleta3Id || !atleta4Id) {
      setErro('Selecione 4 atletas para formar as duplas');
      return;
    }

    if (!data) {
      setErro('Data e hora são obrigatórios');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      // Se uma arena foi selecionada, usar o nome dela como local, senão usar valor padrão
      const arenaSelecionada = arenas.find(a => a.id === pointId);
      const localParaSalvar = arenaSelecionada ? arenaSelecionada.nome : 'Jogo';
      
      const payload: CriarJogoPanelinhaPayload = {
        data: new Date(data).toISOString(),
        local: localParaSalvar,
        pointId: pointId || null,
        atleta1Id,
        atleta2Id,
        atleta3Id,
        atleta4Id,
        gamesTime1: gamesTime1 !== null && gamesTime1 !== undefined ? gamesTime1 : null,
        gamesTime2: gamesTime2 !== null && gamesTime2 !== undefined ? gamesTime2 : null,
        tiebreakTime1: tiebreakTime1 !== null && tiebreakTime1 !== undefined ? tiebreakTime1 : null,
        tiebreakTime2: tiebreakTime2 !== null && tiebreakTime2 !== undefined ? tiebreakTime2 : null,
      };

      await panelinhaService.criarJogoPanelinha(panelinhaId, payload);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao criar jogo:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao criar jogo');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Montar Jogo</h2>
            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {salvando ? 'Salvando...' : 'Criar Jogo'}
            </button>
          </div>
          
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {erro}
            </div>
          )}

          {/* Visualização dos times formados */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <h3 className="text-sm font-semibold text-blue-800 mb-3">Time 1</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 min-h-[40px]">
                    {atleta1Id ? (
                      (() => {
                        const atleta = membros.find(m => m.id === atleta1Id);
                        return atleta ? (
                          <div className="flex items-center gap-2">
                            {atleta.fotoUrl ? (
                              <img src={atleta.fotoUrl} alt={atleta.nome} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                {atleta.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium">{atleta.nome}</span>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">Jogador 1</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-h-[40px]">
                    {atleta3Id ? (
                      (() => {
                        const atleta = membros.find(m => m.id === atleta3Id);
                        return atleta ? (
                          <div className="flex items-center gap-2">
                            {atleta.fotoUrl ? (
                              <img src={atleta.fotoUrl} alt={atleta.nome} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                {atleta.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium">{atleta.nome}</span>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">Jogador 2</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="text-sm font-semibold text-red-800 mb-3">Time 2</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 min-h-[40px]">
                    {atleta2Id ? (
                      (() => {
                        const atleta = membros.find(m => m.id === atleta2Id);
                        return atleta ? (
                          <div className="flex items-center gap-2">
                            {atleta.fotoUrl ? (
                              <img src={atleta.fotoUrl} alt={atleta.nome} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                {atleta.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium">{atleta.nome}</span>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">Jogador 1</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-h-[40px]">
                    {atleta4Id ? (
                      (() => {
                        const atleta = membros.find(m => m.id === atleta4Id);
                        return atleta ? (
                          <div className="flex items-center gap-2">
                            {atleta.fotoUrl ? (
                              <img src={atleta.fotoUrl} alt={atleta.nome} className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                                {atleta.nome.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm font-medium">{atleta.nome}</span>
                          </div>
                        ) : null;
                      })()
                    ) : (
                      <span className="text-xs text-gray-400">Jogador 2</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de atletas para seleção */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Clique nos atletas para formar as duplas (ordem: Time 1 completo, depois Time 2)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {membros.map((membro) => {
                const posicao = getPosicaoAtleta(membro.id);
                const estaSelecionado = posicao !== null;
                const isTime1 = posicao?.includes('Time 1');
                const isTime2 = posicao?.includes('Time 2');
                
                return (
                  <button
                    key={membro.id}
                    type="button"
                    onClick={() => handleSelecionarAtleta(membro.id)}
                    disabled={salvando}
                    className={`
                      flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all
                      ${estaSelecionado 
                        ? isTime1 
                          ? 'border-blue-500 bg-blue-100' 
                          : 'border-red-500 bg-red-100'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }
                      ${salvando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {membro.fotoUrl ? (
                      <img
                        src={membro.fotoUrl}
                        alt={membro.nome}
                        className={`w-12 h-12 rounded-full object-cover border-2 ${
                          estaSelecionado 
                            ? isTime1 ? 'border-blue-500' : 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                    ) : (
                      <div className={`
                        w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold border-2
                        ${estaSelecionado 
                          ? isTime1 ? 'border-blue-500 bg-blue-200' : 'border-red-500 bg-red-200'
                          : 'border-gray-300'
                        }
                      `}>
                        {membro.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className={`text-xs font-medium text-center ${estaSelecionado ? 'font-semibold' : ''}`}>
                      {membro.nome}
                    </span>
                    {posicao && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isTime1 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {posicao}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora *
            </label>
            <input
              type="datetime-local"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={salvando}
            />
          </div>

          {/* Arena */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arena (opcional)
            </label>
            <select
              value={pointId}
              onChange={(e) => setPointId(e.target.value)}
              disabled={carregandoArenas || salvando}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Placar (opcional - pode preencher depois)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time 1</label>
                <input
                  type="number"
                  min="0"
                  value={gamesTime1 ?? ''}
                  onChange={(e) => setGamesTime1(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="Games"
                  disabled={salvando}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Time 2</label>
                <input
                  type="number"
                  min="0"
                  value={gamesTime2 ?? ''}
                  onChange={(e) => setGamesTime2(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="Games"
                  disabled={salvando}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TB Time 1</label>
                <input
                  type="number"
                  min="0"
                  value={tiebreakTime1 ?? ''}
                  onChange={(e) => setTiebreakTime1(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="Tie Break"
                  disabled={salvando}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">TB Time 2</label>
                <input
                  type="number"
                  min="0"
                  value={tiebreakTime2 ?? ''}
                  onChange={(e) => setTiebreakTime2(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                  placeholder="Tie Break"
                  disabled={salvando}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PanelinhaPage() {
  const [panelinhas, setPanelinhas] = useState<Panelinha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [panelinhaSelecionada, setPanelinhaSelecionada] = useState<Panelinha | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [erro, setErro] = useState('');
  const [mostrarBuscar, setMostrarBuscar] = useState(false);
  const [mostrarCriarJogo, setMostrarCriarJogo] = useState(false);
  const [panelinhaParaAcao, setPanelinhaParaAcao] = useState<Panelinha | null>(null);
  const [mostrarEditar, setMostrarEditar] = useState(false);
  const [panelinhaParaEditar, setPanelinhaParaEditar] = useState<Panelinha | null>(null);

  const carregarPanelinhas = async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await panelinhaService.listarPanelinhas();
      setPanelinhas(lista);
    } catch (error: any) {
      console.error('Erro ao carregar panelinhas:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao carregar panelinhas');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPanelinhas();
  }, []);

  const handleAbrirDetalhes = async (panelinha: Panelinha) => {
    try {
      const completa = await panelinhaService.obterPanelinha(panelinha.id);
      setPanelinhaSelecionada(completa);
      setMostrarDetalhes(true);
    } catch (error: any) {
      console.error('Erro ao obter panelinha:', error);
      alert(error.data?.mensagem || error.message || 'Erro ao carregar panelinha');
    }
  };

  const logoUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_LOGO_URL : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Play Na Quadra"
              className="h-10 w-auto"
            />
          )}
          <h1 className="text-3xl font-bold">Minha Panelinha</h1>
        </div>
        <button
          onClick={() => setMostrarCriar(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nova Panelinha
        </button>
      </div>

      {erro && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="text-center py-12 text-gray-500">
          Carregando panelinhas...
        </div>
      ) : panelinhas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Você ainda não tem panelinhas criadas.</p>
          <button
            onClick={() => setMostrarCriar(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Criar Primeira Panelinha
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {panelinhas.map((panelinha, index) => {
            // Array de cores de fundo variadas para diferenciar os cards
            const coresFundo = [
              'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
              'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200',
              'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
              'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200',
              'bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200',
              'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200',
            ];
            const corFundo = coresFundo[index % coresFundo.length];
            
            return (
            <div
              key={panelinha.id}
              className={`${corFundo} border-2 rounded-xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1`}
            >
              <div 
                onClick={() => handleAbrirDetalhes(panelinha)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold">{panelinha.nome}</h2>
                  {panelinha.ehCriador && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Criador
                    </span>
                  )}
                </div>
                
                {panelinha.esporte && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium">
                      {panelinha.esporte}
                    </span>
                  </div>
                )}
                
                {panelinha.descricao && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {panelinha.descricao}
                  </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">
                    {panelinha.totalMembros} {panelinha.totalMembros === 1 ? 'membro' : 'membros'}
                  </span>
                </div>

                {panelinha.membros.length > 0 && (
                  <div className="flex -space-x-2 mb-4">
                    {panelinha.membros.slice(0, 4).map((membro) => (
                      <div key={membro.id} className="relative">
                        {membro.fotoUrl ? (
                          <img
                            src={membro.fotoUrl}
                            alt={membro.nome}
                            className="w-10 h-10 rounded-full border-2 border-white object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold">
                            {membro.nome.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}
                    {panelinha.totalMembros > 4 && (
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                        +{panelinha.totalMembros - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botões de ação - apenas para criador */}
              {panelinha.ehCriador && (
                <div className="mt-4 pt-4 border-t border-gray-300 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={async () => {
                      try {
                        const completa = await panelinhaService.obterPanelinha(panelinha.id);
                        setPanelinhaParaAcao(completa);
                        setMostrarBuscar(true);
                      } catch (error: any) {
                        alert(error.data?.mensagem || error.message || 'Erro ao carregar panelinha');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    + Atleta
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const completa = await panelinhaService.obterPanelinha(panelinha.id);
                        setPanelinhaParaAcao(completa);
                        setMostrarCriarJogo(true);
                      } catch (error: any) {
                        alert(error.data?.mensagem || error.message || 'Erro ao carregar panelinha');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                  >
                    + Jogo
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Tem certeza que deseja recalcular o ranking desta panelinha?')) return;
                      try {
                        await panelinhaService.recalcularRankingPanelinha(panelinha.id);
                        alert('Ranking recalculado com sucesso!');
                        carregarPanelinhas();
                      } catch (error: any) {
                        alert(error.data?.mensagem || error.message || 'Erro ao recalcular ranking');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Recalcular
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const completa = await panelinhaService.obterPanelinha(panelinha.id);
                        setPanelinhaParaEditar(completa);
                        setMostrarEditar(true);
                      } catch (error: any) {
                        alert(error.data?.mensagem || error.message || 'Erro ao carregar panelinha');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('Tem certeza que deseja deletar esta panelinha? Esta ação não pode ser desfeita.')) return;
                      try {
                        await panelinhaService.deletarPanelinha(panelinha.id);
                        carregarPanelinhas();
                      } catch (error: any) {
                        alert(error.data?.mensagem || error.message || 'Erro ao deletar panelinha');
                      }
                    }}
                    className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Deletar
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      <ModalCriarPanelinha
        isOpen={mostrarCriar}
        onClose={() => setMostrarCriar(false)}
        onSuccess={() => {
          setMostrarCriar(false);
          carregarPanelinhas();
        }}
      />

      <ModalDetalhesPanelinha
        isOpen={mostrarDetalhes}
        panelinha={panelinhaSelecionada}
        onClose={() => {
          setMostrarDetalhes(false);
          setPanelinhaSelecionada(null);
        }}
        onAtualizar={() => {
          carregarPanelinhas();
          if (panelinhaSelecionada) {
            panelinhaService.obterPanelinha(panelinhaSelecionada.id).then(setPanelinhaSelecionada);
          }
        }}
        onDeletar={() => {
          setMostrarDetalhes(false);
          setPanelinhaSelecionada(null);
          carregarPanelinhas();
        }}
      />

      {mostrarBuscar && panelinhaParaAcao && (
        <ModalBuscarAtletas
          isOpen={mostrarBuscar}
          panelinhaId={panelinhaParaAcao.id}
          membrosAtuais={panelinhaParaAcao.membros}
          onClose={() => {
            setMostrarBuscar(false);
            setPanelinhaParaAcao(null);
          }}
          onAdicionar={() => {
            setMostrarBuscar(false);
            setPanelinhaParaAcao(null);
            carregarPanelinhas();
          }}
        />
      )}

      {mostrarCriarJogo && panelinhaParaAcao && (
        <ModalCriarJogo
          isOpen={mostrarCriarJogo}
          panelinhaId={panelinhaParaAcao.id}
          membros={panelinhaParaAcao.membros}
          onClose={() => {
            setMostrarCriarJogo(false);
            setPanelinhaParaAcao(null);
          }}
          onSuccess={() => {
            setMostrarCriarJogo(false);
            setPanelinhaParaAcao(null);
            carregarPanelinhas();
          }}
        />
      )}

      {mostrarEditar && panelinhaParaEditar && (
        <ModalEditarPanelinha
          isOpen={mostrarEditar}
          panelinha={panelinhaParaEditar}
          onClose={() => {
            setMostrarEditar(false);
            setPanelinhaParaEditar(null);
          }}
          onSuccess={() => {
            setMostrarEditar(false);
            setPanelinhaParaEditar(null);
            carregarPanelinhas();
          }}
        />
      )}
    </div>
  );
}

interface ModalEditarPanelinhaProps {
  isOpen: boolean;
  panelinha: Panelinha;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalEditarPanelinha({ isOpen, panelinha, onClose, onSuccess }: ModalEditarPanelinhaProps) {
  const [nome, setNome] = useState(panelinha.nome);
  const [descricao, setDescricao] = useState(panelinha.descricao || '');
  const [esporte, setEsporte] = useState(panelinha.esporte || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome(panelinha.nome);
      setDescricao(panelinha.descricao || '');
      setEsporte(panelinha.esporte || '');
      setErro('');
    }
  }, [isOpen, panelinha]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      setErro('Nome da panelinha é obrigatório');
      return;
    }

    setSalvando(true);
    setErro('');

    try {
      await panelinhaService.atualizarPanelinha(panelinha.id, {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        esporte: esporte.trim() || undefined,
      });
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao atualizar panelinha:', error);
      setErro(error.data?.mensagem || error.message || 'Erro ao atualizar panelinha');
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Editar Panelinha</h2>
        
        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Panelinha *
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Turma de Beach Tennis"
            disabled={salvando}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Esporte (opcional)
          </label>
          <select
            value={esporte}
            onChange={(e) => setEsporte(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={salvando}
          >
            <option value="">Selecione um esporte...</option>
            {ESPORTES_DISPONIVEIS.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Descreva sua panelinha..."
            disabled={salvando}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

