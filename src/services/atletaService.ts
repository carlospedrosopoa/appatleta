// src/services/atletaService.ts - Serviço de atletas para o frontend
// Baseado na documentação: DOCUMENTACAO_API_FRONTEND_EXTERNO.md
import { api } from '@/lib/api';

export interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string; // ISO string
  genero?: 'MASCULINO' | 'FEMININO' | 'OUTRO' | null;
  categoria?: string | null;
  idade?: number;
  fotoUrl?: string | null;
  fone?: string | null;
  usuarioId: string;
  pointIdPrincipal?: string | null;
  arenasFrequentes?: Array<{
    id: string;
    nome: string;
    logoUrl?: string | null;
  }>;
  arenaPrincipal?: {
    id: string;
    nome: string;
    logoUrl?: string | null;
  } | null;
  assinante?: boolean;
}

export interface AtletaParaSelecao {
  id: string;
  nome: string;
  idade?: number;
  categoria?: string | null;
}

export interface CriarAtletaPayload {
  nome: string; // Obrigatório
  dataNascimento: string; // Formato YYYY-MM-DD (ex: "1990-01-01")
  categoria?: string | null; // Opcional: INICIANTE, D, C, B, A, PRO
  genero?: 'MASCULINO' | 'FEMININO' | 'OUTRO' | null;
  fone?: string | null;
  fotoUrl?: string | null; // Base64 (data:image/...) ou URL
  pointIdPrincipal?: string | null;
  pointIdsFrequentes?: string[];
}

export interface AtualizarAtletaPayload {
  nome?: string;
  dataNascimento?: string; // Formato YYYY-MM-DD
  categoria?: string | null;
  genero?: 'MASCULINO' | 'FEMININO' | 'OUTRO' | null;
  fone?: string | null;
  fotoUrl?: string | null; // Base64 ou URL
  pointIdPrincipal?: string | null;
  pointIdsFrequentes?: string[];
}

// ⚠️ DEPRECATED: Para frontend externo, use userAtletaService de userAtletaService.ts
// Este serviço é mantido apenas para compatibilidade
export const atletaService = {
  /**
   * Retorna o perfil do atleta vinculado ao usuário autenticado.
   * 
   * ⚠️ DEPRECATED: Use userAtletaService.obter() de userAtletaService.ts
   * que usa /api/user/perfil/atleta
   * 
   * Endpoint: GET /api/atleta/me/atleta
   * Documentação: Seção 6.1
   * 
   * @returns Perfil do atleta ou null se não tiver atleta (status 204)
   */
  obterMeuPerfil: async (): Promise<Atleta | null> => {
    try {
      const res = await api.get('/atleta/me/atleta');
      // Status 204 = não tem atleta ainda (isso é ok)
      if (res.status === 204 || !res.data) {
        return null;
      }
      return res.data;
    } catch (error: any) {
      // 404 ou 204 = não tem atleta ainda (isso é ok)
      if (error?.status === 404 || error?.status === 204) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Cria um perfil de atleta para o usuário autenticado.
   * 
   * ⚠️ DEPRECATED: Use userAtletaService.criar() de userAtletaService.ts
   * que usa /api/user/perfil/criar
   * 
   * Endpoint: POST /api/atleta/criarAtleta
   * Documentação: Seção 6.2
   * 
   * @param payload Dados do atleta
   * @returns Atleta criado
   */
  criar: async (payload: CriarAtletaPayload): Promise<Atleta> => {
    const res = await api.post('/atleta/criarAtleta', payload);
    return res.data;
  },

  /**
   * Atualiza o perfil do atleta.
   * 
   * ⚠️ DEPRECATED: Use userAtletaService.atualizar() de userAtletaService.ts
   * que usa /api/user/perfil/atualizar (não precisa passar ID, usa o usuário autenticado)
   * 
   * Endpoint: PUT /api/atleta/{id}
   * Documentação: Seção 6.3
   * 
   * @param id ID do atleta
   * @param payload Dados para atualizar (todos opcionais)
   * @returns Atleta atualizado
   */
  atualizar: async (id: string, payload: AtualizarAtletaPayload): Promise<Atleta> => {
    const res = await api.put(`/atleta/${id}`, payload);
    return res.data;
  },

  /**
   * Lista atletas para seleção (usado em formulários de partidas).
   * Retorna todos os atletas disponíveis no sistema.
   * 
   * Endpoint: GET /api/atleta/para-selecao
   * 
   * @param busca Termo de busca opcional (filtra por nome)
   * @returns Lista de atletas simplificados
   */
  listarParaSelecao: async (busca?: string): Promise<AtletaParaSelecao[]> => {
    const endpoint = busca 
      ? `/atleta/para-selecao?busca=${encodeURIComponent(busca)}`
      : '/atleta/para-selecao';
    const res = await api.get(endpoint);
    return res.data || [];
  },
};

