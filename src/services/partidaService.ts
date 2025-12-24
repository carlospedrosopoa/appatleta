// src/services/partidaService.ts - Serviço de partidas para o frontend
// Baseado na documentação: DOCUMENTACAO_API_FRONTEND_EXTERNO.md
import { api } from '@/lib/api';
import type { Partida } from '@/types/domain';

export interface CriarPartidaPayload {
  data: string; // ISO string (ex: "2024-01-15T14:00:00.000Z")
  local: string; // String livre - recomendado incluir nome da arena e quadra
  pointId?: string | null; // ID da arena (Point) onde a partida foi realizada - usado para buscar template de card
  atleta1Id: string; // Obrigatório
  atleta2Id: string; // Obrigatório
  atleta3Id?: string | null; // Opcional (para duplas)
  atleta4Id?: string | null; // Opcional (para duplas)
  gamesTime1?: number | null; // Opcional
  gamesTime2?: number | null; // Opcional
  tiebreakTime1?: number | null; // Opcional
  tiebreakTime2?: number | null; // Opcional
}

export interface AtualizarPlacarPayload {
  gamesTime1?: number | null;
  gamesTime2?: number | null;
  tiebreakTime1?: number | null;
  tiebreakTime2?: number | null;
}

export const partidaService = {
  /**
   * Lista todas as partidas cadastradas.
   * O frontend deve filtrar as partidas do atleta autenticado.
   * 
   * Endpoint: GET /api/partida/listarPartidas
   * Documentação: Seção 5.1
   */
  listar: async (): Promise<Partida[]> => {
    const res = await api.get('/partida/listarPartidas');
    return res.data || [];
  },

  /**
   * Cria uma nova partida.
   * 
   * Endpoint: POST /api/partida/criarPartida
   * Documentação: Seção 5.2
   * 
   * @param payload Dados da partida
   * @returns Partida criada
   */
  criar: async (payload: CriarPartidaPayload): Promise<Partida> => {
    const res = await api.post('/partida/criarPartida', payload);
    return res.data;
  },

  /**
   * Atualiza o placar de uma partida.
   * Apenas participantes da partida podem atualizar.
   * 
   * Endpoint: PUT /api/partida/{id}
   * Documentação: Seção 5.3
   * 
   * @param id ID da partida
   * @param payload Dados do placar
   * @returns Partida atualizada
   */
  atualizarPlacar: async (id: string, payload: AtualizarPlacarPayload): Promise<Partida> => {
    const res = await api.put(`/partida/${id}`, payload);
    return res.data;
  },

  /**
   * Obtém o card/imagem da partida.
   * 
   * Endpoint: GET /api/card/partida/{id}
   * 
   * @param id ID da partida
   * @param refresh Se true, força regeneração do card
   * @returns Blob da imagem PNG
   */
  obterCard: async (id: string, refresh: boolean = false): Promise<Blob> => {
    const endpoint = `/card/partida/${id}${refresh ? '?refresh=true' : ''}`;
    const res = await api.get(endpoint, { responseType: 'blob' });
    return res.data;
  },
};

