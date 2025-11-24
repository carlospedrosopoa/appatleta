// components/GraficoEvolutivo.tsx - Gráfico de evolução do atleta (100% igual ao cursor)
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { Payload } from 'recharts/types/component/DefaultTooltipContent';
import type { Partida } from '@/types/domain';

type OrderMode = 'date' | 'array';

interface Props {
  atletaId: string;
  partidas: Partida[];
  tbWeight?: number; // peso da diferença do TB (default 0.1)
  order?: OrderMode; // "date" (padrão) ou "array"
  title?: string;
}

export default function GraficoEvolutivo({
  atletaId,
  partidas,
  tbWeight = 0.1,
  order = 'date',
  title = 'Evolução do Atleta (sequência de jogos)',
}: Props) {
  const dataChart = useMemo(() => {
    let base = partidas.map((p, idx) => ({ p, idx, ts: Date.parse(p.data) }));
    if (order === 'date') {
      base.sort((a, b) => {
        const aNaN = Number.isNaN(a.ts);
        const bNaN = Number.isNaN(b.ts);
        if (aNaN && bNaN) return a.idx - b.idx;
        if (aNaN) return 1;
        if (bNaN) return -1;
        if (a.ts === b.ts) return a.idx - b.idx;
        return a.ts - b.ts;
      });
    }

    let cumul = 0;
    const rows = base
      .map(({ p }, i) => {
        const t1 = [p.atleta1?.id, p.atleta2?.id];
        const t2 = [p.atleta3?.id, p.atleta4?.id];
        const meT1 = t1.includes(atletaId);
        const meT2 = t2.includes(atletaId);
        if (!meT1 && !meT2) return null;

        const g1 = p.gamesTime1,
          g2 = p.gamesTime2;
        if (g1 == null || g2 == null) return null;

        const isTB = (g1 === 7 && g2 === 6) || (g1 === 6 && g2 === 7);
        const tb1 = p.tiebreakTime1 ?? null;
        const tb2 = p.tiebreakTime2 ?? null;

        const ganhou = (g1 > g2 && meT1) || (g2 > g1 && meT2);
        const gameDiff = Math.abs(g1 - g2);
        const tbAdj = isTB && tb1 != null && tb2 != null ? Math.abs(tb1 - tb2) * tbWeight : 0;

        const margin = (ganhou ? 1 : -1) * (gameDiff + tbAdj);
        cumul += margin;

        const placar =
          isTB && tb1 != null && tb2 != null ? `${g1}x${g2} (${tb1}x${tb2})` : `${g1}x${g2}`;

        return {
          idx: i + 1,
          id: p.id,
          local: p.local ?? '',
          placar,
          margin: Number(margin.toFixed(2)),
          cumulative: Number(cumul.toFixed(2)),
        };
      })
      .filter((r): r is NonNullable<typeof r> => !!r);

    return rows;
  }, [partidas, atletaId, tbWeight, order]);

  if (!dataChart.length) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500">Sem partidas finalizadas para exibir ainda.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={dataChart}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="idx" tickFormatter={(v: number) => `Jogo ${v}`} />
          <YAxis />
          <ReferenceLine y={0} stroke="#999" />
          <Tooltip
            formatter={(value: any, name: any) => {
              if (name === 'cumulative') return [value, 'Índice acumulado'];
              if (name === 'margin') return [value, 'Margem da partida'];
              return [value, name];
            }}
            labelFormatter={(_label: any, payload: readonly Payload<any, any>[]) => {
              const item = payload?.[0]?.payload as
                | { idx: number; local?: string; placar?: string }
                | undefined;
              if (!item) return '';
              return `Jogo ${item.idx} — ${item.local || 'Local não informado'} — ${item.placar ?? ''}`;
            }}
          />
          <Line
            type="linear"
            dataKey="margin"
            stroke="#94a3b8"
            strokeDasharray="4 4"
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-500 mt-2">
        * Margem = diferença de games (positiva se vitória, negativa se derrota).{' '}
        Em 7x6/6x7, aplica-se ajuste proporcional à diferença do tiebreak (peso {tbWeight}).
      </p>
    </div>
  );
}



