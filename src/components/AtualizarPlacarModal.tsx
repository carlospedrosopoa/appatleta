// components/AtualizarPlacarModal.tsx - Modal para atualizar placar de partida
'use client';

import { useState, useEffect } from 'react';
import { partidaService } from '@/services/partidaService';
import type { Partida } from '@/types/domain';

interface AtualizarPlacarModalProps {
  isOpen: boolean;
  partida: Partida | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AtualizarPlacarModal({
  isOpen,
  partida,
  onClose,
  onSuccess,
}: AtualizarPlacarModalProps) {
  const [gamesTime1, setGamesTime1] = useState<string>('');
  const [gamesTime2, setGamesTime2] = useState<string>('');
  const [tiebreakTime1, setTiebreakTime1] = useState<string>('');
  const [tiebreakTime2, setTiebreakTime2] = useState<string>('');
  
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Carregar placar atual quando o modal abrir ou partida mudar
  useEffect(() => {
    if (isOpen && partida) {
      setGamesTime1(partida.gamesTime1?.toString() || '');
      setGamesTime2(partida.gamesTime2?.toString() || '');
      setTiebreakTime1(partida.tiebreakTime1?.toString() || '');
      setTiebreakTime2(partida.tiebreakTime2?.toString() || '');
      setErro('');
    }
  }, [isOpen, partida]);

  const resetarFormulario = () => {
    setGamesTime1('');
    setGamesTime2('');
    setTiebreakTime1('');
    setTiebreakTime2('');
    setErro('');
  };

  const handleClose = () => {
    resetarFormulario();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partida) return;

    setErro('');
    setSalvando(true);

    // Validações básicas
    if (!gamesTime1 && !gamesTime2) {
      setErro('Informe pelo menos um placar');
      setSalvando(false);
      return;
    }

    // Se informou games, ambos devem estar preenchidos
    if ((gamesTime1 && !gamesTime2) || (!gamesTime1 && gamesTime2)) {
      setErro('Informe os games de ambos os times');
      setSalvando(false);
      return;
    }

    // Validação de tiebreak (só aparece se games são 6x6, 7x6 ou 6x7)
    const g1 = parseInt(gamesTime1) || 0;
    const g2 = parseInt(gamesTime2) || 0;
    const precisaTiebreak = (g1 === 6 && g2 === 6) || (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);
    
    if (precisaTiebreak && (!tiebreakTime1 || !tiebreakTime2)) {
      setErro('Para placar 6x6, 7x6 ou 6x7, é necessário informar o tiebreak');
      setSalvando(false);
      return;
    }

    try {
      const dadosPlacar = {
        gamesTime1: gamesTime1 ? parseInt(gamesTime1) : null,
        gamesTime2: gamesTime2 ? parseInt(gamesTime2) : null,
        tiebreakTime1: tiebreakTime1 ? parseInt(tiebreakTime1) : null,
        tiebreakTime2: tiebreakTime2 ? parseInt(tiebreakTime2) : null,
      };

      // Usa o serviço centralizado para atualizar placar
      // Endpoint: PUT /api/partida/{id} (conforme documentação)
      await partidaService.atualizarPlacar(partida.id, dadosPlacar);

      handleClose();
      onSuccess();
      
    } catch (error: any) {
      console.error('Erro ao atualizar placar:', error);
      
      // Tratamento de erros específico
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network Error')) {
        setErro('Erro de conexão com a API. Verifique:\n- Se a API está online\n- Se há problemas de CORS');
      } else if (error.status === 404) {
        setErro('Partida não encontrada.');
      } else if (error.status === 403) {
        setErro('Você não tem permissão para atualizar o placar desta partida.');
      } else {
        const mensagemErro = error.data?.mensagem || error.data?.error || error.message || 'Erro ao atualizar placar';
        setErro(mensagemErro);
      }
    } finally {
      setSalvando(false);
    }
  };

  if (!isOpen || !partida) return null;

  const g1 = parseInt(gamesTime1) || 0;
  const g2 = parseInt(gamesTime2) || 0;
  const precisaTiebreak = (g1 === 6 && g2 === 6) || (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Atualizar Placar</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informações da Partida */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Data:</span>{' '}
              {new Date(partida.data).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Local:</span> {partida.local}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Jogadores:</span>{' '}
              {partida.atleta1?.nome || '—'} / {partida.atleta2?.nome || '—'} ×{' '}
              {partida.atleta3?.nome || '—'} / {partida.atleta4?.nome || '—'}
            </p>
          </div>

          {/* Placar */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Placar</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Games Time 1
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={gamesTime1}
                  onChange={(e) => setGamesTime1(e.target.value)}
                  placeholder="Ex: 6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Games Time 2
                </label>
                <input
                  type="number"
                  min="0"
                  max="7"
                  value={gamesTime2}
                  onChange={(e) => setGamesTime2(e.target.value)}
                  placeholder="Ex: 4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Tiebreak - só aparece se necessário */}
            {precisaTiebreak && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiebreak Time 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tiebreakTime1}
                    onChange={(e) => setTiebreakTime1(e.target.value)}
                    placeholder="Ex: 7"
                    required={precisaTiebreak}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiebreak Time 2 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={tiebreakTime2}
                    onChange={(e) => setTiebreakTime2(e.target.value)}
                    placeholder="Ex: 5"
                    required={precisaTiebreak}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 col-span-2">
                  * Tiebreak obrigatório para placares 6x6, 7x6 ou 6x7
                </p>
              </div>
            )}

            {/* Opção para limpar placar */}
            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setGamesTime1('');
                  setGamesTime2('');
                  setTiebreakTime1('');
                  setTiebreakTime2('');
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Limpar placar
              </button>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
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
                'Salvar Placar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

