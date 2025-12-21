// services/infinitePayService.ts - Serviço para integração com Infinite Pay
import { api } from '@/lib/api';

export interface InfinitePayCheckoutParams {
  cardId: string;
  valor: number;
  orderId: string; // ID único da ordem de pagamento
  descricao?: string;
  parcelas?: number;
  cpf?: string; // CPF do atleta (quando não estiver cadastrado no perfil)
}

export interface InfinitePayCheckoutResponse {
  success: boolean;
  checkoutUrl?: string; // URL web do checkout (renomeado de deeplink)
  deeplink?: string; // Mantido para compatibilidade
  error?: string;
  message?: string;
}

/**
 * Gera o DeepLink do Infinite Pay para iniciar o checkout
 * Formato: infinitepay://checkout?handle={handle}&doc_number={doc}&amount={valor}&...
 */
export function gerarDeeplinkInfinitePay(params: {
  handle: string; // Handle da conta Infinite Pay
  docNumber: string; // CPF/CNPJ do cliente
  amount: number; // Valor em centavos
  orderId: string; // ID único da ordem
  paymentMethod?: 'credit' | 'debit' | 'pix';
  installments?: number;
  description?: string;
  resultUrl?: string; // URL de callback
}): string {
  const baseUrl = 'infinitepay://checkout';
  const urlParams = new URLSearchParams();
  
  urlParams.append('handle', params.handle);
  urlParams.append('doc_number', params.docNumber);
  urlParams.append('amount', (params.amount * 100).toString()); // Converter para centavos
  urlParams.append('order_id', params.orderId);
  
  if (params.paymentMethod) {
    urlParams.append('payment_method', params.paymentMethod);
  }
  
  if (params.installments) {
    urlParams.append('installments', params.installments.toString());
  }
  
  if (params.description) {
    urlParams.append('description', params.description);
  }
  
  if (params.resultUrl) {
    urlParams.append('result_url', params.resultUrl);
  }
  
  return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Abre o Infinite Pay para processar o pagamento
 */
export async function iniciarPagamentoInfinitePay(
  params: InfinitePayCheckoutParams
): Promise<InfinitePayCheckoutResponse> {
  try {
    // Primeiro, criar a ordem de pagamento no backend
    const payload: any = {
      cardId: params.cardId,
      valor: params.valor,
      orderId: params.orderId,
      descricao: params.descricao,
      parcelas: params.parcelas,
    };

    // Adicionar CPF se fornecido
    if (params.cpf) {
      payload.cpf = params.cpf;
    }

    const response = await api.post('/user/pagamento/infinite-pay/checkout', payload);

    // Priorizar checkoutUrl (web), mas manter compatibilidade com deeplink
    const checkoutUrl = response.data.checkoutUrl || response.data.deeplink;
    
    if (checkoutUrl) {
      // Retornar a URL de checkout para ser aberta pelo componente
      return {
        success: true,
        checkoutUrl,
        deeplink: checkoutUrl, // Mantido para compatibilidade
      };
    }

    // Verificar se há mensagem de erro na resposta
    if (response.data.mensagem) {
      return {
        success: false,
        error: response.data.mensagem,
      };
    }

    return {
      success: false,
      error: response.data.error || 'Erro ao gerar checkout',
    };
  } catch (error: any) {
    console.error('Erro ao iniciar pagamento Infinite Pay:', error);
    return {
      success: false,
      error: error.response?.data?.mensagem || error.message || 'Erro ao processar pagamento',
    };
  }
}

/**
 * Verifica o status de um pagamento
 */
export async function verificarStatusPagamento(orderId: string): Promise<{
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  transactionId?: string;
  message?: string;
}> {
  try {
    const response = await api.get(`/user/pagamento/infinite-pay/status/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error);
    return {
      status: 'pending',
      message: error.response?.data?.mensagem || 'Erro ao verificar status',
    };
  }
}

export const infinitePayService = {
  gerarDeeplinkInfinitePay,
  iniciarPagamentoInfinitePay,
  verificarStatusPagamento,
};

