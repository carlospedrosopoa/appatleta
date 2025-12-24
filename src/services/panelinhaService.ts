// services/panelinhaService.ts - Serviços para gerenciar panelinhas
import { api } from '@/lib/api';

export interface AtletaBusca {
  id: string;
  nome: string;
  telefone?: string;
  fotoUrl?: string;
  dataNascimento?: string;
  genero?: string;
  categoria?: string;
  email?: string;
}

export interface PanelinhaMembro {
  id: string;
  nome: string;
  fotoUrl?: string;
  telefone?: string;
  dataNascimento?: string;
  genero?: string;
  categoria?: string;
}

export interface Panelinha {
  id: string;
  nome: string;
  descricao?: string;
  esporte?: string;
  atletaIdCriador: string;
  ehCriador: boolean;
  totalMembros: number;
  membros: PanelinhaMembro[];
  createdAt: string;
  updatedAt: string;
}

export interface CriarPanelinhaPayload {
  nome: string;
  descricao?: string;
  esporte?: string;
}

export interface AtualizarPanelinhaPayload {
  nome?: string;
  descricao?: string;
  esporte?: string;
}

export interface RankingPanelinha {
  id: string;
  panelinhaId: string;
  atletaId: string;
  pontuacao: number;
  vitorias: number;
  derrotas: number;
  derrotasTieBreak: number;
  partidasJogadas: number;
  saldoGames: number;
  gamesFeitos: number;
  gamesSofridos: number;
  posicao: number | null;
  ultimaAtualizacao: string;
  atleta: {
    id: string;
    nome: string;
    fotoUrl?: string;
  };
}

export interface PartidaPanelinha {
  id: string;
  data: string;
  local: string;
  gamesTime1: number | null;
  gamesTime2: number | null;
  tiebreakTime1: number | null;
  tiebreakTime2: number | null;
  createdAt: string;
  updatedAt: string;
  atleta1?: { id: string; nome: string; fotoUrl?: string } | null;
  atleta2?: { id: string; nome: string; fotoUrl?: string } | null;
  atleta3?: { id: string; nome: string; fotoUrl?: string } | null;
  atleta4?: { id: string; nome: string; fotoUrl?: string } | null;
}

export interface CriarJogoPanelinhaPayload {
  data: string;
  local: string;
  pointId?: string | null;
  atleta1Id: string;
  atleta2Id: string;
  atleta3Id?: string;
  atleta4Id?: string;
  gamesTime1?: number | null;
  gamesTime2?: number | null;
  tiebreakTime1?: number | null;
  tiebreakTime2?: number | null;
}

// Buscar atletas por nome ou telefone
export async function buscarAtletas(termo: string, limite: number = 20): Promise<AtletaBusca[]> {
  try {
    const { data } = await api.get(`/user/atleta/buscar?q=${encodeURIComponent(termo)}&limite=${limite}`);
    return data.atletas || [];
  } catch (error: any) {
    console.error('Erro ao buscar atletas:', error);
    throw error;
  }
}

// Listar panelinhas do atleta autenticado
export async function listarPanelinhas(): Promise<Panelinha[]> {
  try {
    const { data } = await api.get('/user/panelinha');
    return data.panelinhas || [];
  } catch (error: any) {
    console.error('Erro ao listar panelinhas:', error);
    throw error;
  }
}

// Obter panelinha específica
export async function obterPanelinha(id: string): Promise<Panelinha> {
  try {
    const { data } = await api.get(`/user/panelinha/${id}`);
    return data;
  } catch (error: any) {
    console.error('Erro ao obter panelinha:', error);
    throw error;
  }
}

// Criar nova panelinha
export async function criarPanelinha(payload: CriarPanelinhaPayload): Promise<Panelinha> {
  try {
    const { data } = await api.post('/user/panelinha', payload);
    return data;
  } catch (error: any) {
    console.error('Erro ao criar panelinha:', error);
    throw error;
  }
}

// Atualizar panelinha
export async function atualizarPanelinha(id: string, payload: AtualizarPanelinhaPayload): Promise<Panelinha> {
  try {
    const { data } = await api.put(`/user/panelinha/${id}`, payload);
    return data;
  } catch (error: any) {
    console.error('Erro ao atualizar panelinha:', error);
    throw error;
  }
}

// Deletar panelinha
export async function deletarPanelinha(id: string): Promise<void> {
  try {
    await api.delete(`/user/panelinha/${id}`);
  } catch (error: any) {
    console.error('Erro ao deletar panelinha:', error);
    throw error;
  }
}

// Adicionar atleta à panelinha
export async function adicionarAtletaPanelinha(panelinhaId: string, atletaId: string): Promise<PanelinhaMembro> {
  try {
    const { data } = await api.post(`/user/panelinha/${panelinhaId}/atletas`, { atletaId });
    return data.atleta;
  } catch (error: any) {
    console.error('Erro ao adicionar atleta à panelinha:', error);
    throw error;
  }
}

// Remover atleta da panelinha
export async function removerAtletaPanelinha(panelinhaId: string, atletaId: string): Promise<void> {
  try {
    await api.delete(`/user/panelinha/${panelinhaId}/atletas/${atletaId}`);
  } catch (error: any) {
    console.error('Erro ao remover atleta da panelinha:', error);
    throw error;
  }
}

// Obter ranking da panelinha
export async function obterRankingPanelinha(panelinhaId: string): Promise<RankingPanelinha[]> {
  try {
    const { data } = await api.get(`/user/panelinha/${panelinhaId}/ranking`);
    return data.ranking || [];
  } catch (error: any) {
    console.error('Erro ao obter ranking:', error);
    throw error;
  }
}

// Recalcular ranking da panelinha
export async function recalcularRankingPanelinha(panelinhaId: string): Promise<RankingPanelinha[]> {
  try {
    const { data } = await api.put(`/user/panelinha/${panelinhaId}/ranking`);
    return data.ranking || [];
  } catch (error: any) {
    console.error('Erro ao recalcular ranking:', error);
    throw error;
  }
}

// Listar jogos da panelinha
export async function listarJogosPanelinha(panelinhaId: string): Promise<PartidaPanelinha[]> {
  try {
    const { data } = await api.get(`/user/panelinha/${panelinhaId}/jogos`);
    return data.jogos || [];
  } catch (error: any) {
    console.error('Erro ao listar jogos:', error);
    throw error;
  }
}

// Criar jogo na panelinha
export async function criarJogoPanelinha(panelinhaId: string, payload: CriarJogoPanelinhaPayload): Promise<PartidaPanelinha> {
  try {
    const { data } = await api.post(`/user/panelinha/${panelinhaId}/jogos`, payload);
    return data.partida;
  } catch (error: any) {
    console.error('Erro ao criar jogo:', error);
    throw error;
  }
}

// Deletar jogo da panelinha
export async function deletarJogoPanelinha(panelinhaId: string, jogoId: string): Promise<void> {
  try {
    await api.delete(`/user/panelinha/${panelinhaId}/jogos/${jogoId}`);
  } catch (error: any) {
    console.error('Erro ao deletar jogo:', error);
    throw error;
  }
}

// Exportar todas as funções como um objeto para facilitar o uso
export const panelinhaService = {
  buscarAtletas,
  listarPanelinhas,
  obterPanelinha,
  criarPanelinha,
  atualizarPanelinha,
  deletarPanelinha,
  adicionarAtletaPanelinha,
  removerAtletaPanelinha,
  obterRankingPanelinha,
  recalcularRankingPanelinha,
  listarJogosPanelinha,
  criarJogoPanelinha,
  deletarJogoPanelinha,
};

