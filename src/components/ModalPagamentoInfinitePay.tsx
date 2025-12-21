// components/ModalPagamentoInfinitePay.tsx - Modal para pagamento via Infinite Pay
'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { infinitePayService, type InfinitePayCheckoutParams } from '@/services/infinitePayService';
import type { CardClienteConsumo } from '@/services/consumoService';
import { userAtletaService } from '@/services/userAtletaService';

interface ModalPagamentoInfinitePayProps {
  isOpen: boolean;
  card: CardClienteConsumo | null;
  valorPagar: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ModalPagamentoInfinitePay({
  isOpen,
  card,
  valorPagar,
  onClose,
  onSuccess,
}: ModalPagamentoInfinitePayProps) {
  const [parcelas, setParcelas] = useState(1);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cpf, setCpf] = useState('');
  const [cpfNecessario, setCpfNecessario] = useState(false);
  const [verificandoCpf, setVerificandoCpf] = useState(true);

  useEffect(() => {
    if (isOpen && card) {
      // Gerar orderId único
      setOrderId(`card-${card.id}-${Date.now()}`);
      setErro('');
      setParcelas(1);
      setProcessando(false);
      setCpf('');
      setCpfNecessario(false);
      setVerificandoCpf(true);
      
      // Verificar se o atleta tem CPF cadastrado
      verificarCpfAtleta();
    }
  }, [isOpen, card]);

  const verificarCpfAtleta = async () => {
    try {
      const atleta = await userAtletaService.obter();
      // Verificar se o atleta tem CPF (assumindo que pode estar em um campo futuro ou precisar ser solicitado)
      // Por enquanto, vamos sempre solicitar o CPF se não estiver na resposta
      // TODO: Quando o campo CPF for adicionado ao perfil do atleta, verificar aqui
      setCpfNecessario(true); // Sempre solicitar CPF por enquanto
      setVerificandoCpf(false);
    } catch (error) {
      console.error('Erro ao verificar perfil do atleta:', error);
      // Se não conseguir buscar o perfil, solicitar CPF
      setCpfNecessario(true);
      setVerificandoCpf(false);
    }
  };

  const formatarCpf = (value: string) => {
    // Remove tudo que não é dígito
    const apenasDigitos = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpfLimitado = apenasDigitos.slice(0, 11);
    
    // Aplica a máscara
    if (cpfLimitado.length <= 3) {
      return cpfLimitado;
    } else if (cpfLimitado.length <= 6) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3)}`;
    } else if (cpfLimitado.length <= 9) {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6)}`;
    } else {
      return `${cpfLimitado.slice(0, 3)}.${cpfLimitado.slice(3, 6)}.${cpfLimitado.slice(6, 9)}-${cpfLimitado.slice(9)}`;
    }
  };

  const validarCpf = (cpf: string): boolean => {
    const apenasDigitos = cpf.replace(/\D/g, '');
    return apenasDigitos.length === 11;
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  const handlePagar = async () => {
    if (!card || !orderId) return;

    // Validar CPF se necessário
    if (cpfNecessario) {
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (!validarCpf(cpfLimpo)) {
        setErro('Por favor, informe um CPF válido');
        return;
      }
    }

    setProcessando(true);
    setErro('');

    try {
      const params: InfinitePayCheckoutParams = {
        cardId: card.id,
        valor: valorPagar,
        orderId,
        descricao: `Pagamento Card #${card.numeroCard} - ${card.pointNome}`,
        parcelas: parcelas > 1 ? parcelas : undefined,
        cpf: cpfNecessario ? cpf.replace(/\D/g, '') : undefined,
      };

      const result = await infinitePayService.iniciarPagamentoInfinitePay(params);

      if (!result.success) {
        setErro(result.error || 'Erro ao processar pagamento');
        setProcessando(false);
      } else if (result.deeplink) {
        // O DeepLink foi gerado e será aberto
        // Fechar o modal e redirecionar
        setProcessando(false);
        onClose();
        
        // Pequeno delay para garantir que o modal feche antes do redirecionamento
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = result.deeplink!;
          }
        }, 100);
      } else {
        setErro('Erro ao gerar link de pagamento');
        setProcessando(false);
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      setErro(error.message || 'Erro ao processar pagamento');
      setProcessando(false);
    }
  };

  if (!isOpen || !card) return null;

  const maxParcelas = Math.min(12, Math.floor(valorPagar / 10)); // Mínimo de R$ 10 por parcela

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Pagar com Infinite Pay</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={processando}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{erro}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Card de Consumo</div>
              <div className="font-semibold text-lg">Card #{card.numeroCard}</div>
              <div className="text-sm text-gray-600">{card.pointNome}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor a pagar
              </label>
              <div className="text-2xl font-bold text-blue-600">
                {formatarMoeda(valorPagar)}
              </div>
            </div>

            {valorPagar >= 20 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parcelas
                </label>
                <select
                  value={parcelas}
                  onChange={(e) => setParcelas(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processando}
                >
                  {Array.from({ length: maxParcelas }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}x de {formatarMoeda(valorPagar / num)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {verificandoCpf ? (
              <div className="text-center py-4">
                <Loader className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                <p className="text-sm text-gray-600 mt-2">Verificando dados...</p>
              </div>
            ) : cpfNecessario && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatarCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={processando}
                />
                <p className="text-xs text-gray-500 mt-1">
                  CPF necessário para processar o pagamento
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">Como funciona:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Clique em "Pagar Agora!"</li>
                    <li>Você será redirecionado para o app Infinite Pay</li>
                    <li>Complete o pagamento no app Infinite Pay</li>
                    <li>Volte para este app para confirmar</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            disabled={processando}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePagar}
            disabled={processando || valorPagar <= 0 || (cpfNecessario && !validarCpf(cpf))}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {processando ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pagar Agora!
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

