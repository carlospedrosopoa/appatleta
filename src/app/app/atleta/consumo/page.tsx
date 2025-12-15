'use client';

// app/app/atleta/consumo/page.tsx - Página \"Meu Consumo\" do atleta
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { consumoService, type CardClienteConsumo, type StatusCard } from '@/services/consumoService';
import { Calendar, CreditCard, MapPin, Clock, CheckCircle, XCircle, ShoppingCart, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export default function MeuConsumoPage() {
  const { authReady, usuario } = useAuth();
  const [cards, setCards] = useState<CardClienteConsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusCard | 'TODOS'>('ABERTO');
  const [cardExpandido, setCardExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !usuario) return;
    carregarConsumo();
  }, [authReady, usuario, filtroStatus]);

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
                  {/* Linha compacta */}
                  <button
                    type="button"
                    onClick={() => setCardExpandido(isExpandido ? null : card.id)}
                    className="w-full flex items-center justify-between px-4 py-3 gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                          <span>Card #{card.numeroCard}</span>
                          {getStatusBadge(card.status)}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {card.pointNome}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatarDataHora(card.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs">
                      <span className="flex items-center gap-1 text-gray-700">
                        <DollarSign className="w-3 h-3" />
                        Total: <span className="font-semibold">{formatarMoeda(card.valorTotal)}</span>
                      </span>
                      <span className="flex items-center gap-1 text-gray-700">
                        Pago: <span className="font-semibold">{formatarMoeda(totalPago)}</span>
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold ${
                          saldo > 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}
                      >
                        Saldo: {formatarMoeda(saldo)}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-gray-400">
                      {isExpandido ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
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
                          <div className="space-y-1.5 text-xs sm:text-sm">
                            {card.pagamentos.map((pag, idx) => (
                              <div key={pag.id} className="flex justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-medium">
                                    {idx + 1}. {pag.formaPagamento?.nome || 'Pagamento'}
                                  </div>
                                  {pag.observacoes && (
                                    <div className="text-gray-500">Obs: {pag.observacoes}</div>
                                  )}
                                </div>
                                <div className="text-right text-gray-700">
                                  <div className="font-semibold">{formatarMoeda(pag.valor)}</div>
                                  <div className="text-[11px] text-gray-500">
                                    {formatarDataHora(pag.createdAt)}
                                  </div>
                                </div>
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
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


