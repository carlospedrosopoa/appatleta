'use client';

// components/QuadrasDisponiveisPorHorarioModal.tsx - Modal para buscar quadras disponíveis em um horário específico (App Atleta)

import { useState, useEffect } from 'react';
import { quadraService, agendamentoService, bloqueioAgendaService } from '@/services/agendamentoService';
import type { Quadra } from '@/types/agendamento';
import { X, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface QuadrasDisponiveisPorHorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  quadras?: Quadra[]; // opcional: se não vier, busca todas
  onSelecionarQuadra?: (quadraId: string, data: string, hora: string) => void;
  dataInicial?: string;
  horaInicial?: string;
  duracaoInicial?: number;
}

export default function QuadrasDisponiveisPorHorarioModal({
  isOpen,
  onClose,
  quadras,
  onSelecionarQuadra,
  dataInicial,
  horaInicial,
  duracaoInicial,
}: QuadrasDisponiveisPorHorarioModalProps) {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState(60); // Duração padrão de 60 minutos
  const [carregando, setCarregando] = useState(false);
  const [quadrasDisponiveis, setQuadrasDisponiveis] = useState<Quadra[]>([]);
  const [quadrasIndisponiveis, setQuadrasIndisponiveis] = useState<Array<{ quadra: Quadra; motivo: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Inicializar com data/hora vindas da tela, se houver, senão usar agora
      const agora = new Date();
      const dataDefault = agora.toISOString().split('T')[0];
      const horaDefault = `${agora.getHours().toString().padStart(2, '0')}:${agora
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      setData(dataInicial || dataDefault);
      setHora(horaInicial || horaDefault);
      setDuracao(duracaoInicial ?? 60);
      setQuadrasDisponiveis([]);
      setQuadrasIndisponiveis([]);

      // Se não receber lista de quadras, buscar todas ativas
      if (!quadras || quadras.length === 0) {
        carregarTodasQuadras();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const carregarTodasQuadras = async () => {
    try {
      const todas = await quadraService.listar();
      const ativas = todas.filter((q) => q.ativo);
      setQuadrasDisponiveis([]);
      setQuadrasIndisponiveis([]);
      // Guarda todas as quadras em indisponíveis temporariamente; serão reclassificadas na verificação
      // Para simplificar, usamos quadras passadas via prop como fonte principal; se não houver, usamos essas
      if (!quadras || quadras.length === 0) {
        // usa ativas como base
        // não setamos em estado dedicado pois verificacao usa lista passada
      }
    } catch (error) {
      console.error('Erro ao carregar quadras:', error);
    }
  };

  const verificarDisponibilidade = async () => {
    if (!data || !hora) {
      alert('Por favor, selecione data e horário');
      return;
    }

    const baseQuadras = quadras && quadras.length > 0 ? quadras : await quadraService.listar();
    const quadrasAtivas = baseQuadras.filter((q) => q.ativo);

    setCarregando(true);
    setQuadrasDisponiveis([]);
    setQuadrasIndisponiveis([]);

    try {
      // Criar data/hora de início e fim em UTC
      const [horaStr, minutoStr] = hora.split(':');
      const ano = parseInt(data.split('-')[0]);
      const mes = parseInt(data.split('-')[1]) - 1;
      const dia = parseInt(data.split('-')[2]);
      const horaNum = parseInt(horaStr);
      const minutoNum = parseInt(minutoStr);

      const dataHoraInicio = new Date(Date.UTC(ano, mes, dia, horaNum, minutoNum, 0));
      const dataHoraFim = new Date(dataHoraInicio.getTime() + duracao * 60000);

      const dataInicioISO = dataHoraInicio.toISOString();
      const dataFimISO = dataHoraFim.toISOString();

      // Buscar agendamentos e bloqueios no período
      const [agendamentos, bloqueios] = await Promise.all([
        agendamentoService.listar({
          dataInicio: dataInicioISO,
          dataFim: dataFimISO,
          status: 'CONFIRMADO',
        }),
        bloqueioAgendaService.listar({
          dataInicio: dataInicioISO,
          dataFim: dataFimISO,
          apenasAtivos: true,
        }),
      ]);

      const disponiveis: Quadra[] = [];
      const indisponiveis: Array<{ quadra: Quadra; motivo: string }> = [];

      for (const quadra of quadrasAtivas) {
        const temAgendamento = agendamentos.some((ag) => {
          if (ag.quadraId !== quadra.id) return false;

          const agDataHora = new Date(ag.dataHora);
          const agDataHoraFim = new Date(agDataHora.getTime() + ag.duracao * 60000);

          return (
            (agDataHora >= dataHoraInicio && agDataHora < dataHoraFim) ||
            (agDataHoraFim > dataHoraInicio && agDataHoraFim <= dataHoraFim) ||
            (agDataHora <= dataHoraInicio && agDataHoraFim >= dataHoraFim)
          );
        });

        if (temAgendamento) {
          indisponiveis.push({ quadra, motivo: 'Agendamento confirmado neste horário' });
          continue;
        }

        const temBloqueio = bloqueios.some((bloqueio) => {
          if (!bloqueio.ativo) return false;

          if (bloqueio.quadraIds === null) {
            return quadra.pointId === bloqueio.pointId;
          } else {
            return bloqueio.quadraIds.includes(quadra.id);
          }
        });

        if (temBloqueio) {
          const bloqueioCobreHorario = bloqueios.some((bloqueio) => {
            if (!bloqueio.ativo) return false;

            const afetaQuadra =
              bloqueio.quadraIds === null
                ? quadra.pointId === bloqueio.pointId
                : bloqueio.quadraIds.includes(quadra.id);

            if (!afetaQuadra) return false;

            const bloqueioInicio = new Date(bloqueio.dataInicio);
            const bloqueioFim = new Date(bloqueio.dataFim);

            if (dataHoraFim <= bloqueioInicio || dataHoraInicio >= bloqueioFim) {
              return false;
            }

            if (
              bloqueio.horaInicio !== null &&
              bloqueio.horaInicio !== undefined &&
              bloqueio.horaFim !== null &&
              bloqueio.horaFim !== undefined
            ) {
              const minutosInicio = horaNum * 60 + minutoNum;
              const minutosFim = minutosInicio + duracao;

              return !(minutosFim <= bloqueio.horaInicio || minutosInicio >= bloqueio.horaFim);
            }

            return true;
          });

          if (bloqueioCobreHorario) {
            indisponiveis.push({ quadra, motivo: 'Bloqueio de agenda' });
            continue;
          }
        }

        disponiveis.push(quadra);
      }

      setQuadrasDisponiveis(disponiveis);
      setQuadrasIndisponiveis(indisponiveis);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      alert('Erro ao verificar disponibilidade das quadras');
    } finally {
      setCarregando(false);
    }
  };

  const handleSelecionarQuadra = (quadraId: string) => {
    if (onSelecionarQuadra && data && hora) {
      onSelecionarQuadra(quadraId, data, hora);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Horários e Quadras Disponíveis</h2>
            <p className="text-sm text-gray-600 mt-1">
              Escolha uma data e horário para ver quais quadras estão livres.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Formulário de busca */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Horário
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração (minutos)</label>
              <select
                value={duracao}
                onChange={(e) => setDuracao(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1h30</option>
                <option value={120}>2 horas</option>
                <option value={180}>3 horas</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={verificarDisponibilidade}
                disabled={carregando || !data || !hora}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {carregando ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="p-6">
          {carregando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verificando disponibilidade...</p>
            </div>
          ) : quadrasDisponiveis.length === 0 && quadrasIndisponiveis.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Selecione data e horário para verificar disponibilidade</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quadras Disponíveis */}
              {quadrasDisponiveis.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Quadras Disponíveis ({quadrasDisponiveis.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quadrasDisponiveis.map((quadra) => (
                      <div
                        key={quadra.id}
                        className="border-2 border-green-200 bg-green-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{quadra.nome}</h4>
                            {quadra.tipo && (
                              <p className="text-sm text-gray-600 mb-1">Tipo: {quadra.tipo}</p>
                            )}
                            {quadra.capacidade && (
                              <p className="text-sm text-gray-600">
                                Capacidade: {quadra.capacidade} pessoa
                                {quadra.capacidade !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          {onSelecionarQuadra && (
                            <button
                              onClick={() => handleSelecionarQuadra(quadra.id)}
                              className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Selecionar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quadras Indisponíveis */}
              {quadrasIndisponiveis.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Quadras Indisponíveis ({quadrasIndisponiveis.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quadrasIndisponiveis.map(({ quadra, motivo }) => (
                      <div
                        key={quadra.id}
                        className="border-2 border-red-200 bg-red-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{quadra.nome}</h4>
                            <p className="text-sm text-red-600 font-medium">{motivo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


