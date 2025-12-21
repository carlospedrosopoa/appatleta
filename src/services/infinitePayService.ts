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
 * Verifica o status de um pagamento usando a API do Infinite Pay
 */
export async function verificarStatusPagamento(
  orderNsu: string, 
  transactionNsu: string | null, 
  slug: string | null
): Promise<{
  paid: boolean;
  amount?: number;
  paid_amount?: number;
  installments?: number;
  capture_method?: string;
}> {
  try {
    // Usar a API do Infinite Pay para verificar status
    // Conforme documentação: POST https://api.infinitepay.io/invoices/public/checkout/payment_check
    const handle = process.env.NEXT_PUBLIC_INFINITE_PAY_HANDLE || '';
    
    if (!handle || !transactionNsu || !slug) {
      // Se não tiver dados completos, verificar no nosso backend
      const response = await api.get(`/user/pagamento/infinite-pay/status/${orderNsu}`);
      return {
        paid: response.data.status === 'approved',
        amount: response.data.amount,
        paid_amount: response.data.amount,
        capture_method: response.data.capture_method,
      };
    }

    // Chamar API do Infinite Pay diretamente
    const infinitePayResponse = await fetch('https://api.infinitepay.io/invoices/public/checkout/payment_check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        handle,
        order_nsu: orderNsu,
        transaction_nsu: transactionNsu,
        slug,
      }),
    });

    if (infinitePayResponse.ok) {
      const data = await infinitePayResponse.json();
      return data;
    }

    // Fallback para nosso backend
    const response = await api.get(`/user/pagamento/infinite-pay/status/${orderNsu}`);
    return {
      paid: response.data.status === 'approved',
      amount: response.data.amount,
      paid_amount: response.data.amount,
      capture_method: response.data.capture_method,
    };
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error);
    return {
      paid: false,
    };
  }
}

export const infinitePayService = {
  gerarDeeplinkInfinitePay,
  iniciarPagamentoInfinitePay,
  verificarStatusPagamento,
};

