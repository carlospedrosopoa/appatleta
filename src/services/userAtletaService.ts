// services/userAtletaService.ts - Serviços para frontend externo (atletas/USER)
// Este serviço usa as novas rotas organizadas em /api/user/*
import { api } from '@/lib/api';

export interface Arena {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  descricao?: string;
  logoUrl?: string;
  latitude?: number;
  longitude?: number;
  ativo: boolean;
  assinante: boolean;
}

export interface Atleta {
  id: string;
  nome: string;
  dataNascimento: string;
  genero?: string;
  categoria?: string;
  idade?: number;
  fotoUrl?: string;
  fone?: string;
  usuarioId: string;
  pointIdPrincipal?: string | null;
  arenasFrequentes?: Array<{
    id: string;
    nome: string;
    logoUrl?: string;
  }>;
  arenaPrincipal?: {
    id: string;
    nome: string;
    logoUrl?: string;
  };
  assinante?: boolean;
}

export interface CriarAtletaPayload {
  nome: string;
  dataNascimento: string;
  categoria?: string;
  genero?: string;
  fone?: string;
  fotoUrl?: string | null;
  pointIdPrincipal?: string | null;
  pointIdsFrequentes?: string[];
}

export interface AtualizarAtletaPayload {
  nome?: string;
  dataNascimento?: string;
  categoria?: string;
  genero?: string;
  fone?: string;
  fotoUrl?: string | null;
  pointIdPrincipal?: string | null;
  pointIdsFrequentes?: string[];
}

// Serviço de autenticação para frontend externo
export const userAuthService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/user/auth/register', { name, email, password });
    return res.data;
  },

  me: async () => {
    const res = await api.get('/user/auth/me');
    return res.data;
  },
};

// Serviço de arenas para frontend externo
export const userArenaService = {
  /**
   * Lista todas as arenas assinantes e ativas disponíveis.
   * 
   * Endpoint: GET /api/user/arenas/listar
   * Esta rota retorna apenas arenas assinantes (assinante = true) e ativas (ativo = true)
   * Retorna apenas campos públicos (sem tokens WhatsApp ou outras informações sensíveis)
   * 
   * @returns Lista de arenas assinantes e ativas
   */
  listar: async (): Promise<Arena[]> => {
    const res = await api.get('/user/arenas/listar');
    return res.data;
  },
};

// Serviço de perfil de atleta para frontend externo
export const userAtletaService = {
  /**
   * Retorna o perfil do atleta vinculado ao usuário autenticado.
   * 
   * Endpoint: GET /api/user/perfil/atleta
   * 
   * @returns Perfil do atleta ou null se não tiver perfil (status 204)
   */
  obter: async (): Promise<Atleta | null> => {
    try {
      const res = await api.get('/user/perfil/atleta');
      // 204 No Content significa que não tem perfil
      if (res.status === 204 || !res.data) {
        return null;
      }
      return res.data;
    } catch (error: any) {
      // 204 ou 404 = não tem atleta
      if (error?.status === 204 || error?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Cria um perfil de atleta para o usuário autenticado.
   * 
   * Endpoint: POST /api/user/perfil/criar
   * 
   * @param payload Dados do atleta
   * @returns Atleta criado
   */
  criar: async (payload: CriarAtletaPayload): Promise<Atleta> => {
    const res = await api.post('/user/perfil/criar', payload);
    return res.data;
  },

  /**
   * Atualiza o perfil do atleta do usuário autenticado.
   * 
   * Endpoint: PUT /api/user/perfil/atualizar
   * Esta rota atualiza apenas o perfil do próprio usuário autenticado
   * 
   * @param payload Dados para atualizar (todos opcionais)
   * @returns Atleta atualizado
   */
  atualizar: async (payload: AtualizarAtletaPayload): Promise<Atleta> => {
    const res = await api.put('/user/perfil/atualizar', payload);
    return res.data;
  },

  /**
   * Busca um atleta pelo telefone.
   * Apenas retorna atletas cadastrados no app (com usuarioId).
   * Se não existir, retorna erro 404.
   * 
   * Endpoint: POST /api/user/atleta/buscar-por-telefone
   * 
   * @param telefone Telefone do atleta (com ou sem formatação)
   * @returns Objeto com id, nome, telefone e flag "existe" (sempre true se retornar)
   * @throws Erro 404 se o atleta não for encontrado
   */
  buscarPorTelefone: async (telefone: string): Promise<{
    id: string;
    nome: string;
    telefone: string;
    existe: boolean;
  }> => {
    const res = await api.post('/user/atleta/buscar-por-telefone', { telefone });
    return res.data;
  },
};


