// components/MinhasPartidasCompacta.tsx - Componente de partidas compactas (100% igual ao cursor)
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Partida } from '@/types/domain';
import NovaPartidaModal from './NovaPartidaModal';
import CardPartidaModal from './CardPartidaModal';

interface Props {
  partidas: Partida[];
  onAbrirTodas: () => void;
  onAtualizarPlacar: (partida: Partida) => void;
  atletaId: string;
  onNovaPartida: () => void;
  pageSize?: number;
  mostrarBotaoVerTodas?: boolean;
}

export default function MinhasPartidasCompacta({
  partidas,
  onAbrirTodas,
  onAtualizarPlacar,
  atletaId,
  onNovaPartida,
  pageSize = 5,
  mostrarBotaoVerTodas = true,
}: Props) {
  const [showCardId, setShowCardId] = useState<string | null>(null);
  const [novaAberta, setNovaAberta] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((partidas?.length || 0) / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [partidas.length, totalPages, page]);

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const partidasPagina = useMemo(() => partidas.slice(start, end), [partidas, start, end]);

  const formatarPlacar = (p: Partida) => {
    if (p.gamesTime1 == null || p.gamesTime2 == null) return 'Ainda não informado';
    let base = `${p.gamesTime1} x ${p.gamesTime2}`;
    const teveTB =
      (p.gamesTime1 === 7 && p.gamesTime2 === 6) ||
      (p.gamesTime1 === 6 && p.gamesTime2 === 7);
    if (teveTB && p.tiebreakTime1 != null && p.tiebreakTime2 != null) {
      base += ` (${p.tiebreakTime1} x ${p.tiebreakTime2})`;
    }
    return base;
  };

  const resultadoEmoji = (p: Partida): string => {
    const time1 = [p.atleta1?.id, p.atleta2?.id];
    const time2 = [p.atleta3?.id, p.atleta4?.id];
    const atletaNoTime1 = time1.includes(atletaId);
    const atletaNoTime2 = time2.includes(atletaId);

    if (p.gamesTime1 == null || p.gamesTime2 == null) return '⚪';

    if (
      (p.gamesTime1 === 7 && p.gamesTime2 === 6) ||
      (p.gamesTime1 === 6 && p.gamesTime2 === 7)
    ) {
      if (p.tiebreakTime1 != null && p.tiebreakTime2 != null) {
        if (p.tiebreakTime1 > p.tiebreakTime2 && atletaNoTime1) return '🟢';
        if (p.tiebreakTime2 > p.tiebreakTime1 && atletaNoTime2) return '🟢';
        if (p.tiebreakTime1 < p.tiebreakTime2 && atletaNoTime1) return '🔴';
        if (p.tiebreakTime2 < p.tiebreakTime1 && atletaNoTime2) return '🔴';
      }
      return '⚪';
    }

    if (p.gamesTime1 > p.gamesTime2 && atletaNoTime1) return '🟢';
    if (p.gamesTime2 > p.gamesTime1 && atletaNoTime2) return '🟢';
    if (p.gamesTime1 < p.gamesTime2 && atletaNoTime1) return '🔴';
    if (p.gamesTime2 < p.gamesTime1 && atletaNoTime2) return '🔴';
    return '⚪';
  };

  const podeAnterior = page > 1;
  const podeProxima = page < totalPages;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Minhas Partidas</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setNovaAberta(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            + Nova Partida
          </button>
          {mostrarBotaoVerTodas && (
            <button
              onClick={onAbrirTodas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Ver todas
            </button>
          )}
        </div>
      </div>

      {partidas.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600">Você ainda não participou de nenhuma partida.</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {partidasPagina.map((p) => (
              <li key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{resultadoEmoji(p)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {p.atleta1?.nome || '—'} / {p.atleta2?.nome || '—'} × {p.atleta3?.nome || '—'} / {p.atleta4?.nome || '—'}
                        </p>
                        {p.panelinhas && p.panelinhas.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-500 text-white rounded-full shadow-sm">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            {p.panelinhas.length === 1 
                              ? p.panelinhas[0].nome 
                              : `${p.panelinhas.length} Panelinhas`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p className="font-medium">
                      {new Date(p.data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p>{p.local}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700">
                    Placar: <span className="text-gray-900">{formatarPlacar(p)}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onAtualizarPlacar(p)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                    >
                      Atualizar placar
                    </button>
                    <button
                      onClick={() => setShowCardId(p.id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                    >
                      Ver Card
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!podeAnterior}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!podeProxima}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Próxima →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Card da Partida */}
      <CardPartidaModal
        isOpen={showCardId !== null}
        partidaId={showCardId || ''}
        onClose={() => setShowCardId(null)}
        forceRefresh={false}
      />

      {/* Modal Nova Partida */}
      <NovaPartidaModal
        isOpen={novaAberta}
        onClose={() => setNovaAberta(false)}
        onSuccess={() => {
          setNovaAberta(false);
          onNovaPartida();
        }}
        atletaAtualId={atletaId}
      />

    </div>
  );
}
