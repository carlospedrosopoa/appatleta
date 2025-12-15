// services/consumoService.ts - Serviço para \"Meu Consumo\" do atleta
import { api } from '@/lib/api';

export type StatusCard = 'ABERTO' | 'FECHADO' | 'CANCELADO';

export interface CardClienteConsumo {
  id: string;
  pointId: string;
  pointNome: string;
  numeroCard: number;
  status: StatusCard;
  observacoes?: string | null;
  valorTotal: number;
  totalPago?: number;
  saldo?: number;
  usuarioId?: string | null;
  nomeAvulso?: string | null;
  telefoneAvulso?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  fechadoAt?: string | null;
  fechadoBy?: string | null;
  itens?: Array<{
    id: string;
    cardId: string;
    produtoId: string | null;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
    observacoes?: string | null;
    createdAt: string;
    updatedAt: string;
    produto?: {
      id: string;
      nome: string;
      descricao?: string | null;
      precoVenda: number;
      categoria?: string | null;
    } | null;
  }>;
  pagamentos?: Array<{
    id: string;
    cardId: string;
    formaPagamentoId: string | null;
    valor: number;
    observacoes?: string | null;
    createdAt: string;
    createdBy?: string | null;
    formaPagamento?: {
      id: string;
      nome: string;
      tipo?: string | null;
    } | null;
  }>;
}

export const consumoService = {
  listarMeusCards: async (
    status?: StatusCard,
    incluirItens: boolean = false,
    incluirPagamentos: boolean = true
  ): Promise<CardClienteConsumo[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (incluirItens) params.append('incluirItens', 'true');
    if (incluirPagamentos) params.append('incluirPagamentos', 'true');
    const query = params.toString();

    const res = await api.get(`/user/meu-consumo${query ? `?${query}` : ''}`);
    return res.data as CardClienteConsumo[];
  },
};


