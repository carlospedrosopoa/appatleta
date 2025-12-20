// components/MinhasPartidas.tsx - Lista completa de partidas (100% igual ao cursor)
'use client';

import { useState } from 'react';
import type { Partida } from '@/types/domain';
import NovaPartidaModal from './NovaPartidaModal';
import CardPartidaModal from './CardPartidaModal';

interface Props {
  atletaId: string;
  partidas: Partida[];
  onAbrirTodas: () => void;
  onNovaPartida: () => void;
  onAtualizarPlacar: (partida: Partida) => void;
}

export default function MinhasPartidas({
  atletaId,
  partidas,
  onAbrirTodas,
  onNovaPartida,
  onAtualizarPlacar,
}: Props) {
  const [showCardId, setShowCardId] = useState<string | null>(null);
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [agendarAberta, setAgendarAberta] = useState(false);
  const [partidaParaAgendar, setPartidaParaAgendar] = useState<Partida | null>(null);

  const formatarPlacar = (p: Partida) => {
    if (p.gamesTime1 == null || p.gamesTime2 == null) return 'Ainda não informado';
    let base = `${p.gamesTime1} x ${p.gamesTime2}`;
    if (
      (p.gamesTime1 === 6 && p.gamesTime2 === 6) ||
      (p.gamesTime1 === 7 && p.gamesTime2 === 6) ||
      (p.gamesTime1 === 6 && p.gamesTime2 === 7)
    ) {
      if (p.tiebreakTime1 != null && p.tiebreakTime2 != null) {
        base += ` (${p.tiebreakTime1} x ${p.tiebreakTime2})`;
      }
    }
    return base;
  };

  const resultadoEmoji = (p: Partida): string => {
    const time1 = [p.atleta1?.id, p.atleta2?.id];
    const time2 = [p.atleta3?.id, p.atleta4?.id];
    const atletaNoTime1 = time1.includes(atletaId);
    const atletaNoTime2 = time2.includes(atletaId);

    if (p.gamesTime1 == null || p.gamesTime2 == null) return '⚪';

    if ((p.gamesTime1 === 7 && p.gamesTime2 === 6) || (p.gamesTime1 === 6 && p.gamesTime2 === 7)) {
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

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Minhas Partidas</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setModalNovaAberto(true)}
            className="text-sm text-green-600 hover:underline"
          >
            + Nova Partida
          </button>
          <button onClick={onAbrirTodas} className="text-sm text-blue-600 hover:underline">
            Fechar
          </button>
        </div>
      </div>

      {partidas.length === 0 ? (
        <p className="text-sm text-gray-500">Você ainda não participou de nenhuma partida.</p>
      ) : (
        <ul className="space-y-3">
          {partidas.map((p) => (
            <li key={p.id} className="border rounded p-3 text-sm">
              <div className="flex justify-between items-center mb-1">
                <span>{resultadoEmoji(p)}</span>
                <span className="text-gray-600">
                  {new Date(p.data).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {p.local}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="font-medium">
                    {p.atleta1?.nome || '—'} / {p.atleta2?.nome || '—'} × {p.atleta3?.nome || '—'} /{' '}
                    {p.atleta4?.nome || '—'}
                  </p>
                  {p.panelinhas && p.panelinhas.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-purple-500 text-white rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {p.panelinhas.length === 1 
                        ? p.panelinhas[0].nome 
                        : `${p.panelinhas.length} Panelinhas`}
                    </span>
                  )}
                </div>
                <p>Placar: {formatarPlacar(p)}</p>
              </div>
              <div className="mt-2 flex justify-end gap-3 flex-wrap">
                <button
                  onClick={() => onAtualizarPlacar(p)}
                  className="text-blue-600 hover:underline text-xs"
                >
                  Atualizar placar
                </button>
                <button
                  onClick={() => setShowCardId(p.id)}
                  className="text-green-600 hover:underline text-xs"
                >
                  Ver Card
                </button>
                <button
                  onClick={() => {
                    setPartidaParaAgendar(p);
                    setAgendarAberta(true);
                  }}
                  className="text-purple-600 hover:underline text-xs"
                >
                  Agendar novo Jogo
                </button>
              </div>
            </li>
          ))}
        </ul>
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
        isOpen={modalNovaAberto}
        onClose={() => setModalNovaAberto(false)}
        onSuccess={() => {
          setModalNovaAberto(false);
          onNovaPartida();
        }}
        atletaAtualId={atletaId}
      />
    </div>
  );
}


