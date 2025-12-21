'use client';

// app/app/atleta/consumo/page.tsx - Página \"Meu Consumo\" do atleta
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { consumoService, type CardClienteConsumo, type StatusCard } from '@/services/consumoService';
import { Calendar, CreditCard, MapPin, Clock, CheckCircle, XCircle, ShoppingCart, DollarSign, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ModalPagamentoInfinitePay from '@/components/ModalPagamentoInfinitePay';

export default function MeuConsumoPage() {
  const { authReady, usuario } = useAuth();
  const [cards, setCards] = useState<CardClienteConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusCard | 'TODOS'>('ABERTO');
  const [cardExpandido, setCardExpandido] = useState<string | null>(null);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [cardParaPagar, setCardParaPagar] = useState<CardClienteConsumo | null>(null);
  const [aguardandoWebhook, setAguardandoWebhook] = useState(false);
  const [orderIdAguardando, setOrderIdAguardando] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !usuario) return;
    carregarConsumo();
    
    // Verificar se há callback de pagamento na URL
    // O Infinite Pay pode redirecionar com: payment_callback (nosso parâmetro), order_nsu, transaction_nsu, slug, capture_method
    const urlParams = new URLSearchParams(window.location.search);
    // Priorizar payment_callback (que enviamos no redirectUrl), depois order_nsu (que o Infinite Pay pode adicionar)
    const orderNsu = urlParams.get('payment_callback') || urlParams.get('order_nsu');
    const transactionNsu = urlParams.get('transaction_nsu');
    const slug = urlParams.get('slug');
    
    if (orderNsu) {
      console.log('[PAGAMENTO CALLBACK] Detectado na URL:', { orderNsu, transactionNsu, slug });
      // Verificar status do pagamento
      verificarStatusPagamento(orderNsu, transactionNsu, slug);
      // Limpar parâmetros da URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [authReady, usuario]);

  const verificarStatusPagamento = async (orderNsu: string, transactionNsu: string | null, slug: string | null) => {
    setAguardandoWebhook(true);
    setOrderIdAguardando(orderNsu);
    
    let tentativas = 0;
    const maxTentativas = 30; // 30 tentativas = ~1 minuto (2 segundos por tentativa)
    let intervalId: NodeJS.Timeout | null = null;
    
    const fecharAguardando = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setAguardandoWebhook(false);
      setOrderIdAguardando(null);
    };
    
    const verificar = async (): Promise<boolean> => {
      try {
        // Verificar status no backend (se o webhook já processou)
        const { api } = await import('@/lib/api');
        const statusResponse = await api.get(`/user/pagamento/infinite-pay/status/${orderNsu}`);
        
        console.log('[PAGAMENTO STATUS]', { orderNsu, status: statusResponse.data.status, tentativas });
        
        // Se o status for APPROVED, pagamento foi processado
        if (statusResponse.data.status === 'APPROVED' || statusResponse.data.status === 'approved') {
          // Recarregar cards para mostrar o pagamento atualizado
          await carregarConsumo();
          
          // Fechar modal de aguardo
          fecharAguardando();
          return true;
        }
        
        // Se o status for PENDING mas já tentamos várias vezes, recarregar mesmo assim
        // (pode ser que o webhook ainda não processou, mas o pagamento foi aprovado)
        if (tentativas >= 15) {
          console.log('[PAGAMENTO] Timeout parcial - recarregando cards mesmo com status PENDING');
          await carregarConsumo();
          // Aguardar mais um pouco antes de fechar
          await new Promise(resolve => setTimeout(resolve, 1000));
          fecharAguardando();
          return true;
        }
        
        return false;
      } catch (error: any) {
        console.error('Erro ao verificar status do pagamento:', error);
        
        // Se der 404, significa que o orderId não existe ainda (webhook não processou)
        // Continuar tentando
        if (error.response?.status === 404) {
          return false;
        }
        
        // Para outros erros, se já tentamos várias vezes, recarregar e fechar
        if (tentativas >= 10) {
          console.log('[PAGAMENTO] Erro após várias tentativas - recarregando cards');
          await carregarConsumo();
          fecharAguardando();
          return true;
        }
        
        return false;
      }
    };
    
    // Primeira verificação imediata
    const processado = await verificar();
    if (processado) {
      return;
    }
    
    // Polling: verificar a cada 2 segundos
    intervalId = setInterval(async () => {
      tentativas++;
      const processado = await verificar();
      
      if (processado || tentativas >= maxTentativas) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (tentativas >= maxTentativas && !processado) {
          // Timeout final - recarregar e fechar
          console.log('[PAGAMENTO] Timeout final - recarregando cards');
          await carregarConsumo();
          fecharAguardando();
        }
      }
    }, 2000); // Verificar a cada 2 segundos
  };

  const carregarConsumo = async () => {
    try {
      setLoading(true);
      const status = filtroStatus === 'TODOS' ? undefined : filtroStatus;
      const data = await consumoService.listarMeusCards(status, true, true);
      setCards(data);
    } catch (error) {
      console.error('Erro ao carregar consumo do atleta:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const formatarDataHora = (data: string) =>
    new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusBadge = (status: StatusCard) => {
    switch (status) {
      case 'ABERTO':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Aberto
          </span>
        );
      case 'FECHADO':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Fechado
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelado
          </span>
        );
    }
  };

  if (!authReady || !usuario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meu Consumo</h1>
            <p className="text-gray-600 text-sm">
              Veja todos os cards em que você é o titular e acompanhe seus gastos nas arenas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-600">Status:</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusCard | 'TODOS')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ABERTO">Abertos</option>
              <option value="FECHADO">Fechados</option>
              <option value="CANCELADO">Cancelados</option>
              <option value="TODOS">Todos</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <p className="text-gray-600">Carregando seus cards de consumo...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">Nenhum consumo encontrado</p>
            <p className="text-gray-500 text-sm">
              Quando você tiver cards de consumo em alguma arena, eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => {
              const isExpandido = cardExpandido === card.id;
              const totalPago = card.totalPago ?? 0;
              const saldo = card.saldo ?? card.valorTotal - totalPago;

              return (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Cabeçalho compacto com logo, número do card, data/hora e status */}
                  <button
                    type="button"
                    onClick={() => setCardExpandido(isExpandido ? null : card.id)}
                    className="w-full flex flex-col gap-2 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
                          {card.pointLogoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={card.pointLogoUrl}
                              alt={card.pointNome}
                              className="w-9 h-9 object-contain"
                            />
                          ) : (
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">
                            Card #{card.numeroCard}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{card.pointNome}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatarDataHora(card.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between gap-3 text-xs mt-1">
                      <div className="flex flex-col gap-0.5 text-gray-700">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Total:{' '}
                          <span className="font-semibold">{formatarMoeda(card.valorTotal)}</span>
                        </span>
                        <span>
                          Pago:{' '}
                          <span className="font-semibold">{formatarMoeda(totalPago)}</span>
                        </span>
                        <span
                          className={`font-semibold ${
                            saldo > 0 ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          Saldo: {formatarMoeda(saldo)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {/* Status na última linha, alinhado à direita */}
                        {getStatusBadge(card.status)}
                        <div className="text-gray-400">
                          {isExpandido ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Detalhes */}
                  {isExpandido && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3 text-sm">
                      {card.itens && card.itens.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
                            <ShoppingCart className="w-4 h-4" />
                            Itens consumidos
                          </div>
                          <div className="space-y-1.5 text-xs sm:text-sm">
                            {card.itens.map((item, idx) => (
                              <div key={item.id} className="flex justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {idx + 1}. {item.produto?.nome || 'Produto'}
                                  </div>
                                  {item.observacoes && (
                                    <div className="text-gray-500">Obs: {item.observacoes}</div>
                                  )}
                                </div>
                                <div className="text-right text-gray-700">
                                  <div>
                                    {item.quantidade} x {formatarMoeda(item.precoUnitario)}
                                  </div>
                                  <div className="font-semibold">{formatarMoeda(item.precoTotal)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.pagamentos && card.pagamentos.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            Pagamentos
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm">
                            {card.pagamentos.map((pag, idx) => (
                              <div key={pag.id} className="border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                                <div className="flex justify-between items-start gap-3 mb-1">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">
                                      {idx + 1}. {pag.formaPagamento?.nome || 'Pagamento'}
                                    </div>
                                  </div>
                                  <div className="text-right text-gray-700 flex-shrink-0">
                                    <div className="font-semibold">{formatarMoeda(pag.valor)}</div>
                                    <div className="text-[11px] text-gray-500">
                                      {formatarDataHora(pag.createdAt)}
                                    </div>
                                  </div>
                                </div>
                                {pag.observacoes && (
                                  <div className="mt-1.5 text-[11px] text-gray-500 break-words">
                                    <span className="font-medium">Obs:</span>{' '}
                                    <span className="whitespace-pre-wrap">{pag.observacoes}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {card.observacoes && (
                        <div className="bg-white rounded-lg border border-gray-200 p-3 text-xs sm:text-sm">
                          <div className="flex items-center gap-2 mb-1 text-gray-800 font-semibold">
                            <FileText className="w-4 h-4" />
                            Observações do card
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{card.observacoes}</p>
                        </div>
                      )}

                      {/* Botão de pagamento - apenas para cards abertos com saldo */}
                      {card.status === 'ABERTO' && saldo > 0 && (
                        <div className="bg-white rounded-lg border-2 border-blue-200 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-800 mb-1">
                                Saldo pendente
                              </div>
                              <div className="text-2xl font-bold text-red-600">
                                {formatarMoeda(saldo)}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCardParaPagar(card);
                              setModalPagamento(true);
                            }}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <CreditCard className="w-5 h-5" />
                            Pagar Agora!
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      <ModalPagamentoInfinitePay
        isOpen={modalPagamento}
        card={cardParaPagar}
        valorPagar={cardParaPagar ? (cardParaPagar.saldo ?? cardParaPagar.valorTotal - (cardParaPagar.totalPago ?? 0)) : 0}
        onClose={() => {
          setModalPagamento(false);
          setCardParaPagar(null);
        }}
        onSuccess={() => {
          setModalPagamento(false);
          setCardParaPagar(null);
          carregarConsumo(); // Recarregar lista de cards
        }}
      />

      {/* Modal de Aguardando Webhook */}
      {aguardandoWebhook && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Processando pagamento...
              </h3>
              <p className="text-gray-600 text-sm">
                Aguarde enquanto confirmamos seu pagamento.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Isso pode levar alguns segundos.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">O que está acontecendo:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Pagamento aprovado pelo Infinite Pay</li>
                    <li>Aguardando confirmação no sistema</li>
                    <li>Lançando pagamento no seu card</li>
                  </ol>
                </div>
              </div>
            </div>
            
            {orderIdAguardando && (
              <p className="text-xs text-gray-400 mt-4">
                ID: {orderIdAguardando.substring(0, 20)}...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


