// app/app/atleta/agendamentos/page.tsx - Agendamentos do atleta (100% igual ao cursor)
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { agendamentoService } from '@/services/agendamentoService';
import { userArenaService, userAtletaService, type Arena } from '@/services/userAtletaService';
import EditarAgendamentoModal from '@/components/EditarAgendamentoModal';
import ConfirmarCancelamentoRecorrenteModal from '@/components/ConfirmarCancelamentoRecorrenteModal';
import type { Agendamento, StatusAgendamento } from '@/types/agendamento';
import { Calendar, Clock, MapPin, Plus, X, CheckCircle, XCircle, CalendarCheck, User, Users, UserPlus, Edit, ChevronDown, ChevronUp } from 'lucide-react';

export default function AgendamentosPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === 'ADMIN';
  const [points, setPoints] = useState<Arena[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataAgendamento, setDataAgendamento] = useState('');
  const [horaAgendamento, setHoraAgendamento] = useState('');
  const [duracaoAgendamento, setDuracaoAgendamento] = useState(60);
  const [incluirPassados, setIncluirPassados] = useState(false);
  const [agendamentoExpandido, setAgendamentoExpandido] = useState<string | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null);
  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [agendamentoCancelando, setAgendamentoCancelando] = useState<Agendamento | null>(null);
  const [meuPerfilAtleta, setMeuPerfilAtleta] = useState<any>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    carregarAgendamentos();
  }, [incluirPassados]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar perfil de atleta do usuário para verificar permissões
      if (usuario?.role === 'USER') {
        try {
          const perfilAtleta = await userAtletaService.obter();
          setMeuPerfilAtleta(perfilAtleta);
        } catch (error) {
          console.error('Erro ao carregar perfil de atleta:', error);
        }
      }
      
      // Para frontend externo, sempre usa userArenaService que retorna apenas arenas assinantes e ativas
      // Se for ADMIN, pode usar pointService.listar() para ver todas, mas no frontend externo geralmente não é ADMIN
      const [pointsData, agendamentosData] = await Promise.all([
        isAdmin ? (await import('@/services/agendamentoService')).pointService.listar() : userArenaService.listar(),
        agendamentoService.listar({ apenasMeus: true, incluirPassados: incluirPassados }),
      ]);
      
      // Filtrar e converter arenas: ADMIN vê todas, USER vê apenas assinantes (já vem filtrado do userArenaService)
      let pointsFiltrados: Arena[];
      if (isAdmin) {
        // Converter Point[] para Arena[] adicionando propriedade assinante
        // Como ADMIN vê todas, assumimos que todas são assinantes (ou pode ajustar conforme lógica de negócio)
        pointsFiltrados = (pointsData as any[]).filter((p) => p.ativo).map((p) => ({
          ...p,
          assinante: p.assinante ?? true, // Se não tiver assinante, assume true para ADMIN
        })) as Arena[];
      } else {
        // userArenaService já retorna Arena[] com assinante
        pointsFiltrados = pointsData as Arena[];
      }
      
      setPoints(pointsFiltrados);
      setAgendamentos(agendamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarAgendamentos = async () => {
    try {
      const data = await agendamentoService.listar({ 
        apenasMeus: true,
        incluirPassados: incluirPassados 
      });
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  const handleEditar = (agendamento: Agendamento) => {
    // Para USER, verificar se o agendamento está vinculado ao seu atleta
    let podeEditar = false;
    if (isAdmin) {
      podeEditar = true;
    } else if (usuario?.role === 'USER') {
      // Verificar se o agendamento pertence ao usuário ou ao atleta do usuário
      podeEditar = !!(agendamento.usuarioId === usuario?.id || 
                   (agendamento.atletaId && meuPerfilAtleta?.id === agendamento.atletaId));
    } else {
      podeEditar = !!(agendamento.usuarioId === usuario?.id);
    }
    
    if (!podeEditar) {
      alert('Você não tem permissão para editar este agendamento');
      return;
    }

    setAgendamentoEditando(agendamento);
    setModalEditarAberto(true);
  };

  const handleCancelar = (agendamento: Agendamento) => {
    const podeCancelar = isAdmin || agendamento.usuarioId === usuario?.id;
    
    if (!podeCancelar) {
      alert('Você não tem permissão para cancelar este agendamento');
      return;
    }

    setAgendamentoCancelando(agendamento);
    setModalCancelarAberto(true);
  };

  const confirmarCancelamento = async () => {
    if (!agendamentoCancelando) return;

    try {
      await agendamentoService.cancelar(agendamentoCancelando.id, false);
      setModalCancelarAberto(false);
      setAgendamentoCancelando(null);
      carregarAgendamentos();
    } catch (error: any) {
      alert(error?.response?.data?.mensagem || 'Erro ao cancelar agendamento');
    }
  };

  const getStatusBadge = (status: StatusAgendamento) => {
    const styles = {
      CONFIRMADO: 'bg-green-100 text-green-700',
      CANCELADO: 'bg-red-100 text-red-700',
      CONCLUIDO: 'bg-gray-100 text-gray-700',
    };

    const icons = {
      CONFIRMADO: <CheckCircle className="w-3 h-3" />,
      CANCELADO: <XCircle className="w-3 h-3" />,
      CONCLUIDO: <CalendarCheck className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const getTipoBadge = (agendamento: Agendamento) => {
    if (agendamento.atletaId && agendamento.atleta) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
          <Users className="w-3 h-3" />
          Atleta
        </span>
      );
    }
    if (agendamento.nomeAvulso) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
          <UserPlus className="w-3 h-3" />
          Avulso
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
        <User className="w-3 h-3" />
        Próprio
      </span>
    );
  };

  const getInfoAgendamento = (agendamento: Agendamento) => {
    if (agendamento.atletaId && agendamento.atleta) {
      return {
        nome: agendamento.atleta.nome,
        contato: agendamento.atleta.fone || '—',
        tipo: 'Atleta',
      };
    }
    if (agendamento.nomeAvulso) {
      return {
        nome: agendamento.nomeAvulso,
        contato: agendamento.telefoneAvulso || '—',
        tipo: 'Avulso',
      };
    }
    return {
      nome: agendamento.usuario?.name || '—',
      contato: agendamento.usuario?.email || '—',
      tipo: 'Próprio',
    };
  };

  const formatCurrency = (v: number | null) =>
    v == null
      ? '—'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse bg-white rounded-xl shadow-lg p-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          </div>
          
          {/* Formulário compacto para buscar quadra */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Data</label>
                <input
                  type="date"
                  value={dataAgendamento}
                  onChange={(e) => setDataAgendamento(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Hora</label>
                <input
                  type="time"
                  value={horaAgendamento}
                  onChange={(e) => setHoraAgendamento(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Duração</label>
                <select
                  value={duracaoAgendamento}
                  onChange={(e) => setDuracaoAgendamento(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value={30}>30min</option>
                  <option value={60}>1h</option>
                  <option value={90}>1h30</option>
                  <option value={120}>2h</option>
                  <option value={180}>3h</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                if (!dataAgendamento || !horaAgendamento) {
                  alert('Por favor, preencha a data e hora antes de buscar uma quadra');
                  return;
                }
                setModalEditarAberto(true);
                setAgendamentoEditando(null);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Buscar Quadra
            </button>
          </div>
        </div>

        {/* Lista de Agendamentos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Meus Agendamentos</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirPassados}
                onChange={(e) => setIncluirPassados(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Mostrar passados</span>
            </label>
          </div>
          {agendamentos.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum agendamento encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agendamentos.map((agendamento) => {
                // Extrair data/hora diretamente da string UTC sem conversão de timezone
                // Isso garante que 20h gravado = 20h exibido (igual ao organizer)
                const dataHoraStr = agendamento.dataHora;
                const match = dataHoraStr.match(/T(\d{2}):(\d{2})/);
                const horaInicio = match ? parseInt(match[1], 10) : 0;
                const minutoInicio = match ? parseInt(match[2], 10) : 0;
                
                // Calcular hora de fim
                const minutosTotais = horaInicio * 60 + minutoInicio + agendamento.duracao;
                const horaFim = Math.floor(minutosTotais / 60) % 24;
                const minutoFim = minutosTotais % 60;
                
                // Extrair data para exibição e comparações
                const dataPart = dataHoraStr.split('T')[0];
                const [ano, mes, dia] = dataPart.split('-').map(Number);
                const dataHora = new Date(ano, mes - 1, dia, horaInicio, minutoInicio); // Para formatação e comparações
                const dataFim = new Date(ano, mes - 1, dia, horaFim, minutoFim);
                
                const info = getInfoAgendamento(agendamento);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                const dataAgendamentoDate = new Date(ano, mes - 1, dia);
                const isHoje = dataAgendamentoDate.getTime() === hoje.getTime();
                const isPassado = dataAgendamentoDate < hoje;
                const isExpandido = agendamentoExpandido === agendamento.id;

                return (
                  <div
                    key={agendamento.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Linha compacta - sempre visível */}
                    <div 
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setAgendamentoExpandido(isExpandido ? null : agendamento.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Data e Hora */}
                        <div className="flex-shrink-0 text-left">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>
                              {isHoje 
                                ? 'Hoje'
                                : dataHora.toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                  })
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {String(horaInicio).padStart(2, '0')}:{String(minutoInicio).padStart(2, '0')}
                            </span>
                          </div>
                        </div>

                        {/* Quadra e Arena */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                              {agendamento.quadra.nome}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            {agendamento.quadra.point.logoUrl && (
                              <img
                                src={agendamento.quadra.point.logoUrl}
                                alt={`Logo ${agendamento.quadra.point.nome}`}
                                className="w-3 h-3 object-contain rounded"
                              />
                            )}
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{agendamento.quadra.point.nome}</span>
                          </div>
                        </div>

                        {/* Status e Indicadores */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(agendamento.status)}
                          {isPassado && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Passado
                            </span>
                          )}
                        </div>

                        {/* Botão Editar - na linha compacta */}
                        {agendamento.status === 'CONFIRMADO' && 
                         (isAdmin || agendamento.usuarioId === usuario?.id || 
                          (usuario?.role === 'USER' && agendamento.atletaId && meuPerfilAtleta?.id === agendamento.atletaId)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditar(agendamento);
                            }}
                            className="flex-shrink-0 p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Editar agendamento"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Botão expandir/colapsar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAgendamentoExpandido(isExpandido ? null : agendamento.id);
                          }}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                        >
                          {isExpandido ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpandido && (
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3 bg-gray-50">
                        {/* Data completa */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 text-blue-900 font-semibold mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {dataHora.toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-blue-700">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3" />
                              <span className="font-medium">
                                {String(horaInicio).padStart(2, '0')}:{String(minutoInicio).padStart(2, '0')}
                              </span>
                              <span className="text-blue-500">→</span>
                              <span className="font-medium">
                                {String(horaFim).padStart(2, '0')}:{String(minutoFim).padStart(2, '0')}
                              </span>
                            </div>
                            <span className="text-blue-500">•</span>
                            <span>{agendamento.duracao} min</span>
                          </div>
                        </div>

                        {/* Valor - Destaque */}
                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <span className="text-sm font-medium text-emerald-700">Valor Total</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-emerald-700">
                              {formatCurrency(
                                agendamento.valorNegociado ?? agendamento.valorCalculado
                              )}
                            </span>
                            {agendamento.valorCalculado != null &&
                              agendamento.valorNegociado != null &&
                              agendamento.valorCalculado !== agendamento.valorNegociado && (
                                <p className="text-xs text-emerald-600 mt-0.5">
                                  Tabela: {formatCurrency(agendamento.valorCalculado)}
                                </p>
                              )}
                          </div>
                        </div>

                        {/* Informações adicionais */}
                        {agendamento.quadra.tipo && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Tipo de Quadra</p>
                            <p className="text-sm text-gray-700">{agendamento.quadra.tipo}</p>
                          </div>
                        )}

                        {/* Participantes */}
                        {agendamento.atletasParticipantes && agendamento.atletasParticipantes.length > 0 && (
                          <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              Participantes ({agendamento.atletasParticipantes.length})
                            </p>
                            <div className="space-y-1.5">
                              {agendamento.atletasParticipantes.map((participante) => (
                                <div
                                  key={participante.id}
                                  className="flex items-center gap-2 p-2 bg-white rounded border border-purple-100"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {participante.atleta.nome}
                                    </p>
                                    {participante.atleta.fone && (
                                      <p className="text-xs text-gray-600 truncate">
                                        {participante.atleta.fone}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Observações */}
                        {agendamento.observacoes && (
                          <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
                            <p className="text-sm text-gray-700">{agendamento.observacoes}</p>
                          </div>
                        )}

                        {/* Ações */}
                        {agendamento.status === 'CONFIRMADO' && 
                         (isAdmin || agendamento.usuarioId === usuario?.id || 
                          (usuario?.role === 'USER' && agendamento.atletaId && meuPerfilAtleta?.id === agendamento.atletaId)) && (
                          <div className="flex gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleEditar(agendamento)}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex-1 justify-center"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleCancelar(agendamento)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex-1 justify-center"
                            >
                              <X className="w-4 h-4" />
                              Cancelar
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
      </div>

      {/* Modal de Edição */}
      <EditarAgendamentoModal
        isOpen={modalEditarAberto}
        agendamento={agendamentoEditando}
        dataInicial={agendamentoEditando ? undefined : dataAgendamento}
        horaInicial={agendamentoEditando ? undefined : horaAgendamento}
        duracaoInicial={agendamentoEditando ? undefined : duracaoAgendamento}
        onClose={() => {
          setModalEditarAberto(false);
          setAgendamentoEditando(null);
        }}
        onSuccess={() => {
          setModalEditarAberto(false);
          setAgendamentoEditando(null);
          // Limpar campos após sucesso
          setDataAgendamento('');
          setHoraAgendamento('');
          setDuracaoAgendamento(60);
          carregarAgendamentos();
        }}
        onCancelarAgendamento={(agendamento) => {
          handleCancelar(agendamento);
        }}
      />

      {/* Modal de Confirmação de Cancelamento */}
      <ConfirmarCancelamentoRecorrenteModal
        isOpen={modalCancelarAberto}
        agendamento={agendamentoCancelando}
        onClose={() => {
          setModalCancelarAberto(false);
          setAgendamentoCancelando(null);
        }}
        onConfirmar={confirmarCancelamento}
      />
    </div>
  );
}
