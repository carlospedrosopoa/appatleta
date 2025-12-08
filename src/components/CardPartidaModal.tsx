// components/CardPartidaModal.tsx - Modal para visualizar e baixar card de partida
'use client';

import { useState, useEffect } from 'react';
import { partidaService } from '@/services/partidaService';

interface CardPartidaModalProps {
  isOpen: boolean;
  partidaId: string;
  onClose: () => void;
  forceRefresh?: boolean; // Se true, força regeneração do card
}

export default function CardPartidaModal({
  isOpen,
  partidaId,
  onClose,
  forceRefresh = false,
}: CardPartidaModalProps) {
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  // Carregar card quando modal abrir ou partida mudar
  useEffect(() => {
    if (!isOpen || !partidaId) {
      return;
    }

    loadCard(partidaId, forceRefresh);
  }, [isOpen, partidaId, forceRefresh]);

  // Cleanup: revogar blob URL quando componente desmontar ou fechar
  useEffect(() => {
    return () => {
      if (cardUrl) {
        URL.revokeObjectURL(cardUrl);
      }
    };
  }, [cardUrl]);

  const loadCard = async (id: string, refresh = false) => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    setCardUrl(null);

    try {
      // Limpar URL anterior se existir
      if (cardUrl) {
        URL.revokeObjectURL(cardUrl);
        setCardUrl(null);
      }

      // Usa o serviço centralizado para obter card da partida
      const blob = await partidaService.obterCard(id, refresh);
      const imageUrl = URL.createObjectURL(blob);
      
      setCardUrl(imageUrl);
      setLoading(false);
    } catch (err: any) {
      console.error('[CARD] Erro ao carregar card:', err);
      
      // Tratamento de erros específicos
      const status = err.status || err.response?.status || 500;
      setErrorCode(status);

      if (status === 401) {
        setError('Sessão expirada. Faça login novamente.');
        // Opcional: redirecionar para login após 2 segundos
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (status === 404) {
        setError('Partida não encontrada.');
      } else if (status === 400) {
        setError('Partida inválida. Verifique se a partida tem pelo menos 2 atletas.');
      } else if (status === 500) {
        setError('Erro ao gerar card. Tente novamente mais tarde.');
      } else {
        setError(err.message || 'Erro ao carregar card. Tente novamente.');
      }

      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!cardUrl) return;

    const link = document.createElement('a');
    link.href = cardUrl;
    link.download = `card-partida-${partidaId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenNewTab = () => {
    if (!cardUrl) return;
    window.open(cardUrl, '_blank');
  };

  const handleRefresh = () => {
    loadCard(partidaId, true);
  };

  const handleClose = () => {
    // Limpar blob URL antes de fechar
    if (cardUrl) {
      URL.revokeObjectURL(cardUrl);
      setCardUrl(null);
    }
    setError(null);
    setErrorCode(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 relative max-w-[95vw] max-h-[95vh] overflow-auto animate-in zoom-in-95 duration-200">
        {/* Botão Fechar */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all z-10"
          onClick={handleClose}
          aria-label="Fechar"
        >
          ×
        </button>

        {/* Título */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Card da Partida</h2>
          <p className="text-sm text-gray-500 mt-1">Visualize e baixe o card promocional</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Gerando card...</p>
            {forceRefresh && (
              <p className="text-sm text-gray-500 mt-2">Forçando regeneração...</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Erro ao carregar card</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {errorCode && (
                    <p className="text-xs text-red-600 mt-1">Código: {errorCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Botão para tentar novamente */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => loadCard(partidaId, false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Tentar Novamente
              </button>
              {errorCode === 401 && (
                <button
                  onClick={() => {
                    window.location.href = '/login';
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Ir para Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Card Image */}
        {cardUrl && !loading && !error && (
          <div className="space-y-4">
            {/* Imagem do Card */}
            <div className="flex justify-center bg-gray-50 rounded-lg p-4">
              <img
                src={cardUrl}
                alt="Card da Partida"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxHeight: '70vh' }}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-200">
              {/* Download */}
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Baixar Card
              </button>

              {/* Abrir em Nova Aba */}
              <button
                onClick={handleOpenNewTab}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Abrir em Nova Aba
              </button>

              {/* Regenerar Card */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Regenerar Card
              </button>
            </div>

            {/* Informações */}
            <div className="text-center text-xs text-gray-500 pt-2">
              <p>Dimensões: 1080x1920px | Formato: PNG</p>
              <p className="mt-1">Card gerado automaticamente pelo sistema</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

