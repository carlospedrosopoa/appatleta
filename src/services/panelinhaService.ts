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
}

export interface AtualizarPanelinhaPayload {
  nome?: string;
  descricao?: string;
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

