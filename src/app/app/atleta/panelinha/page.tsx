// app/app/atleta/panelinha/page.tsx - Minha Panelinha
'use client';

import { useEffect, useState } from 'react';
import { 
  panelinhaService, 
  type Panelinha, 
  type AtletaBusca,
  type PanelinhaMembro 
} from '@/services/panelinhaService';

interface ModalCriarPanelinhaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function ModalCriarPanelinha({ isOpen, onClose, onSuccess }: ModalCriarPanelinhaProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
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
      });
      setNome('');
      setDescricao('');
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
  const [mostrarBuscar, setMostrarBuscar] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [removendo, setRemovendo] = useState<string | null>(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (panelinha) {
      setNome(panelinha.nome);
      setDescricao(panelinha.descricao || '');
      setEditando(false);
    }
  }, [panelinha]);

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
                {panelinha.descricao && (
                  <p className="text-gray-600 mb-4">{panelinha.descricao}</p>
                )}
                <div className="flex gap-3">
                  {panelinha.ehCriador && (
                    <>
                      <button
                        onClick={() => setEditando(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setMostrarBuscar(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        + Adicionar Atleta
                      </button>
                      <button
                        onClick={handleDeletar}
                        disabled={salvando}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Deletar
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="font-semibold text-lg mb-4">
              Membros ({panelinha.totalMembros})
            </h3>
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
    </>
  );
}

export default function PanelinhaPage() {
  const [panelinhas, setPanelinhas] = useState<Panelinha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [panelinhaSelecionada, setPanelinhaSelecionada] = useState<Panelinha | null>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [erro, setErro] = useState('');

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
          {panelinhas.map((panelinha) => (
            <div
              key={panelinha.id}
              onClick={() => handleAbrirDetalhes(panelinha)}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold">{panelinha.nome}</h2>
                {panelinha.ehCriador && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    Criador
                  </span>
                )}
              </div>
              
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
                <div className="flex -space-x-2">
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
          ))}
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
    </div>
  );
}

