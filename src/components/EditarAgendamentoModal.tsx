// components/EditarAgendamentoModal.tsx - Modal de edição de agendamento (100% igual ao cursor)
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useAuth } from '@/context/AuthContext';
import { quadraService, agendamentoService, bloqueioAgendaService, tabelaPrecoService } from '@/services/agendamentoService';
import { userArenaService, userAtletaService, type Arena } from '@/services/userAtletaService';
import { api } from '@/lib/api';
import type { Agendamento, ModoAgendamento } from '@/types/agendamento';
import { Calendar, Clock, MapPin, AlertCircle, User, Users, UserPlus, X } from 'lucide-react';

interface Atleta {
  id: string;
  nome: string;
  fone?: string;
}

interface EditarAgendamentoModalProps {
  isOpen: boolean;
  agendamento: Agendamento | null;
  onClose: () => void;
  onSuccess: () => void;
  quadraIdInicial?: string; // Para pré-selecionar uma quadra ao criar novo agendamento
  dataInicial?: string; // Data pré-preenchida para novo agendamento
  horaInicial?: string; // Hora pré-preenchida para novo agendamento
  duracaoInicial?: number; // Duração pré-preenchida para novo agendamento
  onCancelarAgendamento?: (agendamento: Agendamento) => void; // Callback para cancelar agendamento
}

export default function EditarAgendamentoModal({
  isOpen,
  agendamento,
  onClose,
  onSuccess,
  quadraIdInicial,
  dataInicial,
  horaInicial,
  duracaoInicial,
  onCancelarAgendamento,
}: EditarAgendamentoModalProps) {
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === 'ADMIN';
  const isOrganizer = usuario?.role === 'ORGANIZER';
  const canGerenciarAgendamento = !!(isAdmin || isOrganizer);

  const [points, setPoints] = useState<Arena[]>([]);
  const [quadras, setQuadras] = useState<any[]>([]);
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [agendamentosExistentes, setAgendamentosExistentes] = useState<Agendamento[]>([]);
  const [bloqueiosExistentes, setBloqueiosExistentes] = useState<any[]>([]);
  const [carregandoAtletas, setCarregandoAtletas] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [disponibilidade, setDisponibilidade] = useState<Array<{
    point: any;
    quadras: Array<{
      quadra: any;
      disponivel: boolean;
      motivo?: string;
    }>;
  }>>([]);
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(false);
  const [meuPerfilAtleta, setMeuPerfilAtleta] = useState<any>(null);

  // Modo de agendamento (apenas para admin)
  const [modo, setModo] = useState<ModoAgendamento>('normal');

  // Campos comuns
  const [pointId, setPointId] = useState('');
  const [quadraId, setQuadraId] = useState('');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [duracao, setDuracao] = useState(60);
  const [observacoes, setObservacoes] = useState('');
  const [valorHora, setValorHora] = useState<number | null>(null);
  const [valorCalculado, setValorCalculado] = useState<number | null>(null);

  // Log quando valores mudam
  useEffect(() => {
    console.log('Valores atualizados:', { valorHora, valorCalculado });
  }, [valorHora, valorCalculado]);
  const [valorNegociado, setValorNegociado] = useState<string>('');

  // Campos específicos por modo
  const [atletaId, setAtletaId] = useState('');
  const [nomeAvulso, setNomeAvulso] = useState('');
  const [telefoneAvulso, setTelefoneAvulso] = useState('');
  const [buscaAtleta, setBuscaAtleta] = useState('');
  
  // Atletas participantes
  const [atletasParticipantes, setAtletasParticipantes] = useState<Array<{ id: string; nome: string; telefone: string }>>([]);
  const [telefoneNovoParticipante, setTelefoneNovoParticipante] = useState('');
  const [buscandoAtleta, setBuscandoAtleta] = useState(false);

  // Verificar se pode alterar data/hora/duração (precisa faltar 12 horas ou mais)
  const podeAlterarDataHora = useMemo(() => {
    if (!agendamento || !agendamento.dataHora) return true; // Novo agendamento sempre pode
    
    // Extrair data/hora do agendamento atual
    const dataHoraStr = agendamento.dataHora;
    const match = dataHoraStr.match(/T(\d{2}):(\d{2})/);
    if (!match) return true;
    
    const hora = parseInt(match[1], 10);
    const minuto = parseInt(match[2], 10);
    const dataPart = dataHoraStr.split('T')[0];
    const [ano, mes, dia] = dataPart.split('-').map(Number);
    
    // Criar data/hora do agendamento
    const dataHoraAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
    
    // Verificar se faltam 12 horas ou mais
    const agora = new Date();
    const diferencaMs = dataHoraAgendamento.getTime() - agora.getTime();
    const diferencaHoras = diferencaMs / (1000 * 60 * 60);
    
    return diferencaHoras >= 12;
  }, [agendamento]);

  // Verificar se pode alterar observações e atletas (não pode se status for CONCLUIDO ou CANCELADO)
  const podeAlterarDetalhes = useMemo(() => {
    if (!agendamento) return true; // Novo agendamento sempre pode
    return agendamento.status !== 'CONCLUIDO' && agendamento.status !== 'CANCELADO';
  }, [agendamento]);


  useEffect(() => {
    if (isOpen) {
      carregarDados();
      if (agendamento) {
        preencherFormulario();
      } else {
        // Modo criação - resetar formulário
        resetarFormulario();
        // Se houver quadraIdInicial, pré-selecionar após carregar dados
        if (quadraIdInicial) {
          // Aguardar um pouco para os dados carregarem
          setTimeout(() => {
            selecionarQuadraInicial(quadraIdInicial);
          }, 100);
        }
      }
    }
  }, [isOpen, agendamento, quadraIdInicial, dataInicial, horaInicial, duracaoInicial]);

  useEffect(() => {
    if (pointId && !isOrganizer) {
      carregarQuadras(pointId);
    }
  }, [pointId]);

  const carregarValoresQuadra = async (quadraIdParam?: string, dataParam?: string, horaParam?: string, duracaoParam?: number) => {
    // Usar parâmetros se fornecidos, senão usar os estados
    const quadraIdParaUsar = quadraIdParam || quadraId;
    const dataParaUsar = dataParam || data;
    const horaParaUsar = horaParam || hora;
    const duracaoParaUsar = duracaoParam || duracao;

    console.log('carregarValoresQuadra chamado com:', { quadraIdParaUsar, dataParaUsar, horaParaUsar, duracaoParaUsar });

    if (!quadraIdParaUsar || !dataParaUsar || !horaParaUsar || !duracaoParaUsar) {
      console.log('carregarValoresQuadra: faltando parâmetros');
      return;
    }

    try {
      // Buscar tabela de preços da quadra
      const tabelasPreco = await tabelaPrecoService.listar(quadraIdParaUsar);
      console.log('Tabelas de preço encontradas:', tabelasPreco);
      const tabelasAtivas = tabelasPreco.filter((tp) => tp.ativo && tp.inicioMinutoDia != null && tp.fimMinutoDia != null);
      console.log('Tabelas ativas:', tabelasAtivas);

      if (tabelasAtivas.length === 0) {
        console.log('Nenhuma tabela ativa encontrada');
        setValorHora(null);
        setValorCalculado(null);
        return;
      }

      // Converter hora para minutos (ex: "14:30" -> 870 minutos)
      const [horaStr, minutoStr] = horaParaUsar.split(':');
      const minutosHora = parseInt(horaStr) * 60 + parseInt(minutoStr);
      console.log('Minutos da hora selecionada:', minutosHora);

      // Encontrar a tabela de preço que se aplica a este horário
      const tabelaAplicavel = tabelasAtivas.find((tp) => {
        if (tp.inicioMinutoDia == null || tp.fimMinutoDia == null) return false;
        
        const minutosInicio = tp.inicioMinutoDia;
        const minutosFim = tp.fimMinutoDia;

        const aplicavel = minutosHora >= minutosInicio && minutosHora < minutosFim;
        console.log(`Verificando tabela ${minutosInicio}-${minutosFim}: aplicável: ${aplicavel}`);
        return aplicavel;
      });

      if (tabelaAplicavel && tabelaAplicavel.valorHora != null) {
        const valorHoraCalculado = tabelaAplicavel.valorHora;
        const valorTotalCalculado = (valorHoraCalculado * duracaoParaUsar) / 60;

        console.log('Valores calculados (tabela aplicável):', { valorHoraCalculado, valorTotalCalculado, duracaoParaUsar });
        setValorHora(valorHoraCalculado);
        setValorCalculado(valorTotalCalculado);
      } else {
        // Se não encontrar tabela específica, usar a primeira ativa com valorHora válido
        const primeiraTabela = tabelasAtivas.find((tp) => tp.valorHora != null);
        if (primeiraTabela && primeiraTabela.valorHora != null) {
          const valorHoraCalculado = primeiraTabela.valorHora;
          const valorTotalCalculado = (valorHoraCalculado * duracaoParaUsar) / 60;

          console.log('Valores calculados (primeira tabela):', { valorHoraCalculado, valorTotalCalculado, duracaoParaUsar });
          setValorHora(valorHoraCalculado);
          setValorCalculado(valorTotalCalculado);
        } else {
          console.log('Nenhuma tabela válida encontrada');
          setValorHora(null);
          setValorCalculado(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar valores da quadra:', error);
      setValorHora(null);
      setValorCalculado(null);
    }
  };

  useEffect(() => {
    if (quadraId && data) {
      verificarDisponibilidade();
    }
  }, [quadraId, data]);

  useEffect(() => {
    console.log('useEffect valores - quadraId, data, hora, duracao mudaram:', { quadraId, data, hora, duracao });
    if (quadraId && data && hora && duracao) {
      console.log('Chamando carregarValoresQuadra do useEffect');
      carregarValoresQuadra(quadraId, data, hora, duracao);
    }
  }, [quadraId, data, hora, duracao]);

  // Verificar disponibilidade de todas as quadras quando for novo agendamento com data/hora/duração
  useEffect(() => {
    if (!agendamento && data && hora && duracao && points.length > 0) {
      verificarDisponibilidadeGeral();
    }
  }, [data, hora, duracao, points, agendamento]);

  useEffect(() => {
    if (modo === 'normal') {
      setAtletaId('');
      setNomeAvulso('');
      setTelefoneAvulso('');
    } else if (modo === 'atleta') {
      setNomeAvulso('');
      setTelefoneAvulso('');
      setBuscaAtleta('');
    } else if (modo === 'avulso') {
      setAtletaId('');
    }
  }, [modo]);

  const atletasFiltrados = useMemo(() => {
    if (!buscaAtleta.trim()) return atletas;
    const termo = buscaAtleta.toLowerCase();
    return atletas.filter((a) => {
      const base = `${a.nome} ${a.fone || ''}`.toLowerCase();
      return base.includes(termo);
    });
  }, [atletas, buscaAtleta]);

  const adicionarParticipantePorTelefone = async () => {
    if (!telefoneNovoParticipante.trim()) {
      setErro('Por favor, informe o telefone do atleta');
      return;
    }

    try {
      setBuscandoAtleta(true);
      setErro('');
      
      const resultado = await userAtletaService.buscarPorTelefone(telefoneNovoParticipante);

      // Verificar se já está na lista
      if (atletasParticipantes.some((p) => p.id === resultado.id)) {
        setErro('Este atleta já está na lista de participantes');
        setTelefoneNovoParticipante('');
        return;
      }

      // Adicionar à lista
      setAtletasParticipantes((prev) => [
        ...prev,
        {
          id: resultado.id,
          nome: resultado.nome,
          telefone: resultado.telefone,
        },
      ]);

      // Limpar campo
      setTelefoneNovoParticipante('');
    } catch (error: any) {
      console.error('Erro ao buscar atleta:', error);
      // Se for erro 404, mostrar mensagem específica
      const status = error?.status || error?.response?.status;
      
      // Tentar obter a mensagem de diferentes lugares onde pode estar
      let mensagem = '';
      if (error?.response?.data?.mensagem) {
        mensagem = error.response.data.mensagem;
      } else if (error?.message) {
        mensagem = error.message;
      } else if (error?.data?.mensagem) {
        mensagem = error.data.mensagem;
      } else {
        mensagem = 'Erro ao buscar atleta. Verifique o telefone e tente novamente.';
      }
      
      // Se for erro 404 e a mensagem não mencionar "cadastrado", usar mensagem padrão
      if (status === 404 && !mensagem.toLowerCase().includes('cadastrado')) {
        mensagem = 'Este número não está cadastrado como usuário do app';
      }
      
      // Debug: verificar estrutura do erro
      console.log('Status do erro:', status);
      console.log('Mensagem extraída:', mensagem);
      console.log('Estrutura completa do erro:', error);
      
      setErro(mensagem);
    } finally {
      setBuscandoAtleta(false);
    }
  };

  const removerParticipante = (atletaId: string) => {
    setAtletasParticipantes((prev) => prev.filter((p) => p.id !== atletaId));
  };

  const carregarDados = async () => {
    try {
      // Se for USER e não for edição, carregar perfil de atleta apenas para exibição
      if (usuario?.role === 'USER' && !agendamento) {
        try {
          const perfilAtleta = await userAtletaService.obter();
          setMeuPerfilAtleta(perfilAtleta);
        } catch (error) {
          console.error('Erro ao carregar perfil de atleta:', error);
          // Se não tiver perfil, continua normalmente (a API vai validar)
        }
      }

      const [pointsData, atletasData, quadrasData] = await Promise.all([
        // ADMIN e ORGANIZER podem ver todos os points, USER apenas assinantes (via userArenaService)
        (isAdmin || isOrganizer) 
          ? (await import('@/services/agendamentoService')).pointService.listar()
          : usuario?.role === 'USER' 
            ? userArenaService.listar() // Retorna apenas arenas assinantes e ativas
            : Promise.resolve([] as Arena[]),
        canGerenciarAgendamento
          ? (async () => {
              try {
                // Para ORGANIZER e ADMIN, não precisa passar parâmetros - a API já retorna todos os atletas
                const res = await api.get(`/atleta/listarAtletas`);
                const data = Array.isArray(res.data) ? res.data : res.data?.atletas || [];
                return data;
              } catch (error) {
                console.error('Erro ao carregar atletas:', error);
                return [];
              }
            })()
          : Promise.resolve([] as Atleta[]),
        isOrganizer ? quadraService.listar() : Promise.resolve([]),
      ]);

      // Filtrar e converter arenas: ADMIN/ORGANIZER vê todas, USER vê apenas assinantes (já vem filtrado do userArenaService)
      let pointsFiltrados: Arena[];
      if (isAdmin || isOrganizer) {
        // Converter Point[] para Arena[] adicionando propriedade assinante
        pointsFiltrados = (pointsData as any[]).filter((p) => p.ativo).map((p) => ({
          ...p,
          assinante: p.assinante ?? true, // Se não tiver assinante, assume true para ADMIN/ORGANIZER
        })) as Arena[];
      } else {
        // userArenaService já retorna Arena[] com assinante, ou Promise.resolve([]) retorna []
        pointsFiltrados = (pointsData || []) as Arena[];
      }

      setPoints(pointsFiltrados);
      if (canGerenciarAgendamento) {
        setCarregandoAtletas(true);
        setAtletas(atletasData as Atleta[]);
        setCarregandoAtletas(false);
      }
      // Se for ORGANIZER, carregar quadras diretamente
      if (isOrganizer && quadrasData.length > 0) {
        setQuadras((quadrasData as any[]).filter((q: any) => q.ativo));
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const resetarFormulario = () => {
    setPointId('');
    setQuadraId('');
    // Usar valores iniciais se fornecidos, senão resetar
    setData(dataInicial || '');
    setHora(horaInicial || '');
    setDuracao(duracaoInicial || 60);
    setObservacoes('');
    setValorHora(null);
    setValorCalculado(null);
    setValorNegociado('');
    setAtletaId('');
    setNomeAvulso('');
    setTelefoneAvulso('');
    setBuscaAtleta('');
    setModo('normal');
    setAgendamentosExistentes([]);
    setErro('');
    setAtletasParticipantes([]);
  };

  const selecionarQuadraInicial = async (quadraIdParaSelecionar: string) => {
    try {
      // Buscar a quadra para obter o pointId
      const quadra = await quadraService.obter(quadraIdParaSelecionar);
      if (quadra) {
        setPointId(quadra.pointId);
        // Carregar quadras do point e então selecionar
        if (!isOrganizer) {
          await carregarQuadras(quadra.pointId);
        }
        // Aguardar um pouco para garantir que as quadras foram carregadas
        setTimeout(() => {
          setQuadraId(quadraIdParaSelecionar);
        }, 300);
      }
    } catch (error) {
      console.error('Erro ao buscar quadra inicial:', error);
    }
  };

  const preencherFormulario = () => {
    if (!agendamento) return;

    // Preenche dados básicos
    // Extrair data/hora diretamente da string UTC sem conversão de timezone
    // Isso garante que 20h gravado = 20h exibido no formulário
    const dataHoraStr = agendamento.dataHora;
    setData(dataHoraStr.split('T')[0]);
    const match = dataHoraStr.match(/T(\d{2}):(\d{2})/);
    setHora(match ? `${match[1]}:${match[2]}` : '00:00');
    setDuracao(agendamento.duracao);
    setObservacoes(agendamento.observacoes || '');
    setValorHora(agendamento.valorHora ?? null);
    setValorCalculado(agendamento.valorCalculado ?? null);
    setValorNegociado(
      agendamento.valorNegociado != null
        ? agendamento.valorNegociado.toString().replace('.', ',')
        : ''
    );

    // Preenche quadra e point
    setQuadraId(agendamento.quadraId);
    setPointId(agendamento.quadra.point.id);

    // Determina o modo baseado no agendamento
    if (agendamento.atletaId && agendamento.atleta) {
      setModo('atleta');
      setAtletaId(agendamento.atletaId);
    } else if (agendamento.nomeAvulso) {
      setModo('avulso');
      setNomeAvulso(agendamento.nomeAvulso);
      setTelefoneAvulso(agendamento.telefoneAvulso || '');
    } else {
      setModo('normal');
    }

    // Preencher atletas participantes
    if (agendamento.atletasParticipantes && agendamento.atletasParticipantes.length > 0) {
      const participantes = agendamento.atletasParticipantes
        .map((p: any) => ({
          id: p.atletaId,
          nome: p.atleta?.nome || 'Atleta',
          telefone: p.atleta?.fone || '',
        }))
        .filter((p: any) => p.id);
      setAtletasParticipantes(participantes);
    } else {
      setAtletasParticipantes([]);
    }
  };

  const carregarQuadras = async (pointId: string) => {
    try {
      const data = await quadraService.listar(pointId);
      setQuadras(data.filter((q: any) => q.ativo));
    } catch (error) {
      console.error('Erro ao carregar quadras:', error);
    }
  };

  const verificarDisponibilidade = async () => {
    if (!quadraId || !data) return;

    try {
      const dataInicio = `${data}T00:00:00`;
      const dataFim = `${data}T23:59:59`;

      // Carregar agendamentos e bloqueios em paralelo
      const [agendamentos, bloqueios] = await Promise.all([
        agendamentoService.listar({
          quadraId,
          dataInicio,
          dataFim,
          status: 'CONFIRMADO',
        }),
        bloqueioAgendaService.listar({
          dataInicio,
          dataFim,
          apenasAtivos: true,
        }),
      ]);

      // Remove o agendamento atual da lista (para não considerar conflito com ele mesmo)
      if (agendamento) {
        setAgendamentosExistentes(
          agendamentos.filter((ag) => ag.id !== agendamento.id)
        );
      } else {
        setAgendamentosExistentes(agendamentos);
      }

      // Filtrar bloqueios que afetam esta quadra
      // Buscar a quadra novamente caso não esteja na lista ainda
      let quadra = quadras.find((q: any) => q.id === quadraId);
      if (!quadra && quadraId) {
        // Tentar buscar a quadra diretamente
        try {
          const quadraData = await quadraService.obter(quadraId);
          quadra = quadraData as any;
        } catch (error) {
          console.error('Erro ao buscar quadra:', error);
        }
      }

      if (quadra) {
        const bloqueiosAfetandoQuadra = bloqueios.filter((bloqueio: any) => {
          // Verificar se o bloqueio afeta esta quadra
          if (bloqueio.quadraIds === null) {
            // Bloqueio geral - verificar se a quadra pertence ao mesmo point
            return quadra.pointId === bloqueio.pointId;
          } else {
            // Bloqueio específico - verificar se a quadra está na lista
            return bloqueio.quadraIds.includes(quadraId);
          }
        });
        setBloqueiosExistentes(bloqueiosAfetandoQuadra);
      } else {
        setBloqueiosExistentes([]);
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
    }
  };

  const verificarConflito = (): string | null => {
    if (!data || !hora || !duracao || !quadraId) return null;

    // Extrair componentes do horário solicitado
    const [solHoraNum, solMinutoNum] = hora.split(':').map(Number);
    const solMinutosInicio = solHoraNum * 60 + solMinutoNum;
    const solMinutosFim = solMinutosInicio + duracao;
    
    // Verificar se não é no passado (comparar data e hora)
    const agora = new Date();
    const [solAno, solMes, solDia] = data.split('-').map(Number);
    const dataSolicitada = new Date(solAno, solMes - 1, solDia, solHoraNum, solMinutoNum);
    
    if (dataSolicitada < agora) {
      return 'Não é possível agendar no passado';
    }

    // Verificar conflitos com bloqueios
    for (const bloqueio of bloqueiosExistentes) {
      // Extrair componentes das datas do bloqueio
      const bloqueioDataInicioStr = bloqueio.dataInicio;
      const bloqueioDataFimStr = bloqueio.dataFim;
      const [bloqAnoInicio, bloqMesInicio, bloqDiaInicio] = bloqueioDataInicioStr.split('T')[0].split('-').map(Number);
      const [bloqAnoFim, bloqMesFim, bloqDiaFim] = bloqueioDataFimStr.split('T')[0].split('-').map(Number);
      
      // Verificar se o dia está dentro do período do bloqueio
      const diaEstaNoPeriodo = 
        (solAno > bloqAnoInicio || (solAno === bloqAnoInicio && solMes > bloqMesInicio) || 
         (solAno === bloqAnoInicio && solMes === bloqMesInicio && solDia >= bloqDiaInicio)) &&
        (solAno < bloqAnoFim || (solAno === bloqAnoFim && solMes < bloqMesFim) || 
         (solAno === bloqAnoFim && solMes === bloqMesFim && solDia <= bloqDiaFim));

      if (!diaEstaNoPeriodo) continue;

      // Verificar horário
      if (bloqueio.horaInicio === null || bloqueio.horaFim === null) {
        // Dia inteiro bloqueado
        return `Conflito com bloqueio: "${bloqueio.titulo}" (dia inteiro bloqueado)`;
      }

      // Verificar se há sobreposição de horários
      // TypeScript: garantir que não são null nem undefined
      const bloqueioInicio = bloqueio.horaInicio ?? 0;
      const bloqueioFim = bloqueio.horaFim ?? 1439;

      if (
        (solMinutosInicio >= bloqueioInicio && solMinutosInicio < bloqueioFim) ||
        (solMinutosFim > bloqueioInicio && solMinutosFim <= bloqueioFim) ||
        (solMinutosInicio <= bloqueioInicio && solMinutosFim >= bloqueioFim)
      ) {
        const horaInicioBloqueio = Math.floor(bloqueioInicio / 60);
        const minutoInicioBloqueio = bloqueioInicio % 60;
        const horaFimBloqueio = Math.floor(bloqueioFim / 60);
        const minutoFimBloqueio = bloqueioFim % 60;
        
        return `Conflito com bloqueio: "${bloqueio.titulo}" (${horaInicioBloqueio.toString().padStart(2, '0')}:${minutoInicioBloqueio.toString().padStart(2, '0')} às ${horaFimBloqueio.toString().padStart(2, '0')}:${minutoFimBloqueio.toString().padStart(2, '0')})`;
      }
    }

    // Verificar conflitos com agendamentos existentes
    // Usar a mesma lógica da API: comparar diretamente os componentes extraídos
    for (const ag of agendamentosExistentes) {
      // Extrair componentes do agendamento existente
      const agDataHoraStr = ag.dataHora;
      const agMatch = agDataHoraStr.match(/T(\d{2}):(\d{2})/);
      const agHora = agMatch ? parseInt(agMatch[1], 10) : 0;
      const agMinuto = agMatch ? parseInt(agMatch[2], 10) : 0;
      const agDataPart = agDataHoraStr.split('T')[0];
      const [agAno, agMes, agDia] = agDataPart.split('-').map(Number);
      
      // Verificar se é o mesmo dia
      if (agAno !== solAno || agMes !== solMes || agDia !== solDia) {
        continue;
      }
      
      // Calcular minutos do agendamento existente
      const agMinutosInicio = agHora * 60 + agMinuto;
      const agMinutosFim = agMinutosInicio + ag.duracao;
      
      // Verificar sobreposição (mesma lógica da API)
      if (
        (solMinutosInicio >= agMinutosInicio && solMinutosInicio < agMinutosFim) ||
        (solMinutosFim > agMinutosInicio && solMinutosFim <= agMinutosFim) ||
        (solMinutosInicio <= agMinutosInicio && solMinutosFim >= agMinutosFim)
      ) {
        const agHoraFim = Math.floor(agMinutosFim / 60) % 24;
        const agMinutoFim = agMinutosFim % 60;
        
        const inicio = `${String(agHora).padStart(2, '0')}:${String(agMinuto).padStart(2, '0')}`;
        const fim = `${String(agHoraFim).padStart(2, '0')}:${String(agMinutoFim).padStart(2, '0')}`;
        return `Conflito com agendamento existente das ${inicio} às ${fim}`;
      }
    }

    return null;
  };

  const verificarDisponibilidadeGeral = async () => {
    if (!data || !hora || !duracao) return;

    setCarregandoDisponibilidade(true);
    try {
      const dataHoraInicio = `${data}T${hora}:00`;
      const dataHoraFim = new Date(new Date(dataHoraInicio).getTime() + duracao * 60000).toISOString();
      const dataInicio = `${data}T00:00:00`;
      const dataFim = `${data}T23:59:59`;

      const disponibilidadeArray: Array<{
        point: any;
        quadras: Array<{
          quadra: any;
          disponivel: boolean;
          motivo?: string;
        }>;
      }> = [];

      // Para cada point, verificar disponibilidade de suas quadras
      for (const point of points) {
        try {
          const quadrasDoPoint = await quadraService.listar(point.id);
          const quadrasAtivas = quadrasDoPoint.filter((q: any) => q.ativo);

          // Buscar agendamentos e bloqueios para este point
          const [agendamentos, bloqueios] = await Promise.all([
            agendamentoService.listar({
              pointId: point.id,
              dataInicio,
              dataFim,
              status: 'CONFIRMADO',
            }),
            bloqueioAgendaService.listar({
              dataInicio,
              dataFim,
              apenasAtivos: true,
            }),
          ]);

          // Extrair componentes do horário solicitado uma vez para usar em todas as verificações
          const [solDataPart, solHoraPart] = dataHoraInicio.split('T');
          const [solAno, solMes, solDia] = solDataPart.split('-').map(Number);
          const [solHora, solMinuto] = solHoraPart.split(':').map(Number);
          const solMinutosInicio = solHora * 60 + solMinuto;
          const solMinutosFim = solMinutosInicio + duracao;

          const quadrasDisponibilidade = quadrasAtivas.map((quadra: any) => {
            // Verificar conflitos com agendamentos
            // Usar a mesma lógica da API: extrair componentes da data/hora e comparar diretamente
            const conflitoAgendamento = agendamentos.find((ag: Agendamento) => {
              if (ag.quadraId !== quadra.id) return false;
              
              // Extrair componentes do agendamento existente
              const agDataHoraStr = ag.dataHora;
              const agMatch = agDataHoraStr.match(/T(\d{2}):(\d{2})/);
              const agHora = agMatch ? parseInt(agMatch[1], 10) : 0;
              const agMinuto = agMatch ? parseInt(agMatch[2], 10) : 0;
              const agDataPart = agDataHoraStr.split('T')[0];
              const [agAno, agMes, agDia] = agDataPart.split('-').map(Number);
              
              // Calcular fim do agendamento existente
              const agMinutosInicio = agHora * 60 + agMinuto;
              const agMinutosFim = agMinutosInicio + ag.duracao;
              
              // Verificar se é o mesmo dia
              if (agAno !== solAno || agMes !== solMes || agDia !== solDia) {
                return false;
              }
              
              // Verificar sobreposição de horários (mesma lógica da API)
              return (
                (solMinutosInicio >= agMinutosInicio && solMinutosInicio < agMinutosFim) ||
                (solMinutosFim > agMinutosInicio && solMinutosFim <= agMinutosFim) ||
                (solMinutosInicio <= agMinutosInicio && solMinutosFim >= agMinutosFim)
              );
            });

            if (conflitoAgendamento) {
              return {
                quadra,
                disponivel: false,
                motivo: 'Horário já agendado',
              };
            }

            // Verificar bloqueios
            const bloqueioAfetando = bloqueios.find((bloqueio: any) => {
              if (bloqueio.quadraIds === null) {
                return bloqueio.pointId === point.id;
              } else {
                return bloqueio.quadraIds.includes(quadra.id);
              }
            });

            if (bloqueioAfetando) {
              // Extrair componentes das datas do bloqueio
              const bloqueioDataInicioStr = bloqueioAfetando.dataInicio;
              const bloqueioDataFimStr = bloqueioAfetando.dataFim;
              const [bloqAnoInicio, bloqMesInicio, bloqDiaInicio] = bloqueioDataInicioStr.split('T')[0].split('-').map(Number);
              const [bloqAnoFim, bloqMesFim, bloqDiaFim] = bloqueioDataFimStr.split('T')[0].split('-').map(Number);
              
              // Verificar se o dia está dentro do período do bloqueio
              const diaEstaNoPeriodo = 
                (solAno > bloqAnoInicio || (solAno === bloqAnoInicio && solMes > bloqMesInicio) || 
                 (solAno === bloqAnoInicio && solMes === bloqMesInicio && solDia >= bloqDiaInicio)) &&
                (solAno < bloqAnoFim || (solAno === bloqAnoFim && solMes < bloqMesFim) || 
                 (solAno === bloqAnoFim && solMes === bloqMesFim && solDia <= bloqDiaFim));
              
              if (diaEstaNoPeriodo) {
                // Verificar horário
                if (bloqueioAfetando.horaInicio === null || bloqueioAfetando.horaFim === null) {
                  // Dia inteiro bloqueado
                  return {
                    quadra,
                    disponivel: false,
                    motivo: 'Horário bloqueado',
                  };
                }
                
                // Verificar sobreposição de horários
                // TypeScript: garantir que não são null nem undefined
                const bloqueioInicio = bloqueioAfetando.horaInicio ?? 0;
                const bloqueioFim = bloqueioAfetando.horaFim ?? 1439;
                
                const temConflito =
                  (solMinutosInicio >= bloqueioInicio && solMinutosInicio < bloqueioFim) ||
                  (solMinutosFim > bloqueioInicio && solMinutosFim <= bloqueioFim) ||
                  (solMinutosInicio <= bloqueioInicio && solMinutosFim >= bloqueioFim);

                if (temConflito) {
                  return {
                    quadra,
                    disponivel: false,
                    motivo: 'Horário bloqueado',
                  };
                }
              }
            }

            return {
              quadra,
              disponivel: true,
            };
          });

          if (quadrasDisponibilidade.length > 0) {
            disponibilidadeArray.push({
              point,
              quadras: quadrasDisponibilidade,
            });
          }
        } catch (error) {
          console.error(`Erro ao verificar disponibilidade do point ${point.id}:`, error);
        }
      }

      setDisponibilidade(disponibilidadeArray);
    } catch (error) {
      console.error('Erro ao verificar disponibilidade geral:', error);
    } finally {
      setCarregandoDisponibilidade(false);
    }
  };

  const selecionarQuadraDisponivel = async (pointIdSelecionado: string, quadraIdSelecionada: string) => {
    console.log('selecionarQuadraDisponivel chamado:', { pointIdSelecionado, quadraIdSelecionada, data, hora, duracao });
    
    // Primeiro atualizar os estados
    setPointId(pointIdSelecionado);
    setQuadraId(quadraIdSelecionada);
    
    // Carregar quadras para garantir que está na lista
    await carregarQuadras(pointIdSelecionado);
    
    // Carregar valores da quadra selecionada passando os parâmetros diretamente
    // para evitar problemas com estados ainda não atualizados
    if (data && hora && duracao) {
      console.log('Chamando carregarValoresQuadra com:', { quadraIdSelecionada, data, hora, duracao });
      await carregarValoresQuadra(quadraIdSelecionada, data, hora, duracao);
    } else {
      console.log('Não chamando carregarValoresQuadra - faltando:', { data, hora, duracao });
    }
    
    // Verificar disponibilidade específica da quadra selecionada
    if (data) {
      // Aguardar um pouco para garantir que o estado quadraId foi atualizado
      await new Promise(resolve => setTimeout(resolve, 50));
      await verificarDisponibilidade();
    }
    
    // Verificar disponibilidade novamente para atualizar a tabela
    if (data && hora && duracao) {
      await verificarDisponibilidadeGeral();
    }
  };

  const validarFormulario = (): string | null => {
    if (!quadraId || !data || !hora) {
      return 'Preencha todos os campos obrigatórios';
    }

    // Para ADMIN, pointId é obrigatório
    if (isAdmin && !pointId) {
      return 'Selecione um estabelecimento';
    }

    if (modo === 'atleta' && !atletaId) {
      return 'Selecione um atleta';
    }

    if (modo === 'avulso') {
      if (!nomeAvulso.trim()) {
        return 'Informe o nome para agendamento avulso';
      }
      if (!telefoneAvulso.trim()) {
        return 'Informe o telefone para agendamento avulso';
      }
      const telefoneLimpo = telefoneAvulso.replace(/\D/g, '');
      if (telefoneLimpo.length < 10) {
        return 'Telefone inválido';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErro('');

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    const conflito = verificarConflito();
    if (conflito) {
      setErro(conflito);
      return;
    }

    setSalvando(true);

    try {
      // Enviar o horário escolhido pelo usuário sem conversão de timezone
      // O backend vai salvar exatamente como informado (tratando como UTC direto)
      // Isso garante que 20h escolhido = 20h gravado no banco
      const dataHora = `${data}T${hora}:00`;
      const payload: any = {
        quadraId,
        dataHora,
        duracao,
        observacoes: observacoes || undefined,
      };

      // A API já faz a vinculação automática para USER, então não precisamos enviar atletaId
      // Para ADMIN/ORGANIZER, usar a lógica de modo
      if (canGerenciarAgendamento) {
        // Para ADMIN/ORGANIZER, usar a lógica de modo
        if (modo === 'atleta' && atletaId) {
          payload.atletaId = atletaId;
          // Remove campos de avulso se existirem
          payload.nomeAvulso = null;
          payload.telefoneAvulso = null;
        } else if (modo === 'avulso') {
          payload.nomeAvulso = nomeAvulso.trim();
          payload.telefoneAvulso = telefoneAvulso.trim();
          // Remove atletaId se existir
          payload.atletaId = null;
        } else {
          // Modo normal - remove campos específicos
          payload.atletaId = null;
          payload.nomeAvulso = null;
          payload.telefoneAvulso = null;
        }
      }

      // Valor negociado (ADMIN e ORGANIZER podem informar)
      if (canGerenciarAgendamento && valorNegociado.trim()) {
        const valor = parseFloat(valorNegociado.replace(',', '.'));
        if (!isNaN(valor) && valor > 0) {
          payload.valorNegociado = valor;
        }
      }

      // Atletas participantes
      if (atletasParticipantes.length > 0) {
        payload.atletasParticipantesIds = atletasParticipantes.map((p) => p.id);
      }

      let resultado;
      if (agendamento) {
        // Modo edição
        resultado = await agendamentoService.atualizar(agendamento.id, payload);
      } else {
        // Modo criação
        resultado = await agendamentoService.criar(payload);
      }

      // Atualiza os valores exibidos com o retorno do backend (recalculado)
      setValorHora(resultado.valorHora ?? null);
      setValorCalculado(resultado.valorCalculado ?? null);
      setValorNegociado(
        resultado.valorNegociado != null
          ? resultado.valorNegociado.toString().replace('.', ',')
          : ''
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Erro ao ${agendamento ? 'atualizar' : 'criar'} agendamento:`, error);
      setErro(
        error?.response?.data?.mensagem ||
          error?.data?.mensagem ||
          `Erro ao ${agendamento ? 'atualizar' : 'criar'} agendamento. Tente novamente.`
      );
    } finally {
      setSalvando(false);
    }
  };

  const getHorariosOcupados = (): string[] => {
    if (!data) return [];

    return agendamentosExistentes.map((ag) => {
      // Extrair hora diretamente da string sem conversão de timezone
      const agDataHoraStr = ag.dataHora;
      const match = agDataHoraStr.match(/T(\d{2}):(\d{2})/);
      const horaInicio = match ? parseInt(match[1], 10) : 0;
      const minutoInicio = match ? parseInt(match[2], 10) : 0;
      return `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`;
    });
  };

  const horariosOcupados = getHorariosOcupados();
  const conflito = verificarConflito();

  const formatCurrency = (v: number | null) =>
    v == null
      ? '—'
      : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </Dialog.Title>
          <p className="text-sm text-gray-600 mb-6">
            {agendamento
              ? 'Atualize as informações do agendamento'
              : 'Preencha os dados para criar um novo agendamento'}
          </p>

          {/* Seletor de Modo (apenas para admin/organizador) - USER sempre usa modo atleta */}
          {canGerenciarAgendamento && !(usuario?.role === 'USER' && !agendamento) && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Agendamento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setModo('normal')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    modo === 'normal'
                      ? 'border-blue-600 bg-blue-100 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Para mim</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModo('atleta')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    modo === 'atleta'
                      ? 'border-blue-600 bg-blue-100 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Para atleta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModo('avulso')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                    modo === 'avulso'
                      ? 'border-blue-600 bg-blue-100 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="font-medium">Avulso</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Para USER, mostrar informações do próprio perfil de atleta */}
            {usuario?.role === 'USER' && !agendamento && meuPerfilAtleta && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Agendamento para você</span>
                </div>
                <div className="text-sm text-purple-700">
                  <p className="font-semibold">{meuPerfilAtleta?.nome || 'Carregando...'}</p>
                  {meuPerfilAtleta?.fone && (
                    <p className="text-purple-600 mt-1">📞 {meuPerfilAtleta.fone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Seleção de Atleta (modo atleta) - apenas para ADMIN/ORGANIZER */}
            {canGerenciarAgendamento && modo === 'atleta' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Selecionar Atleta *
                </label>
                {carregandoAtletas ? (
                  <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-center text-gray-600">
                    Carregando atletas...
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={buscaAtleta}
                      onChange={(e) => setBuscaAtleta(e.target.value)}
                      placeholder="Buscar por nome ou telefone..."
                      className="mb-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <select
                      value={atletaId}
                      onChange={(e) => setAtletaId(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Selecione um atleta</option>
                      {atletasFiltrados.map((atleta) => (
                        <option key={atleta.id} value={atleta.id}>
                          {atleta.nome} {atleta.fone && `- ${atleta.fone}`}
                        </option>
                      ))}
                    </select>
                    {atletasFiltrados.length === 0 && !!buscaAtleta.trim() && (
                      <p className="mt-1 text-xs text-gray-500">
                        Nenhum atleta encontrado para "{buscaAtleta}". Tente outro nome ou telefone.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Campos Avulso (modo avulso) */}
            {canGerenciarAgendamento && modo === 'avulso' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserPlus className="inline w-4 h-4 mr-1" />
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={nomeAvulso}
                    onChange={(e) => setNomeAvulso(e.target.value)}
                    required
                    placeholder="Nome completo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="text"
                    value={telefoneAvulso}
                    onChange={(e) => {
                      const masked = e.target.value
                        .replace(/\D/g, '')
                        .replace(/^(\d{2})(\d)/, '($1) $2')
                        .replace(/(\d{5})(\d)/, '$1-$2')
                        .slice(0, 15);
                      setTelefoneAvulso(masked);
                    }}
                    required
                    placeholder="(99) 99999-9999"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            )}

            {/* Data, Hora e Duração - Ocultar se já foram preenchidos na página principal (novo agendamento) */}
            {(!(!agendamento && dataInicial && horaInicial && duracaoInicial) || agendamento) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {!podeAlterarDataHora && agendamento && (
                  <div className="col-span-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        Não é possível alterar data, hora ou duração. Faltam menos de 12 horas para o início do agendamento.
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Data *
                  </label>
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={!podeAlterarDataHora && !!agendamento}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Hora *
                  </label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                    disabled={!podeAlterarDataHora && !!agendamento}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duração (min) *</label>
                  <select
                    value={duracao}
                    onChange={(e) => setDuracao(Number(e.target.value))}
                    required
                    disabled={!podeAlterarDataHora && !!agendamento}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 horas</option>
                  </select>
                </div>
              </div>
            )}

            {/* Mostrar resumo quando data/hora/duração vieram da página principal */}
            {!agendamento && dataInicial && horaInicial && duracaoInicial && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900 mb-2">Horário Selecionado:</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">Data: </span>
                    <span className="text-blue-900 font-semibold">
                      {new Date(data).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Hora: </span>
                    <span className="text-blue-900 font-semibold">{hora}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Duração: </span>
                    <span className="text-blue-900 font-semibold">{duracao} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Disponibilidade (apenas para novo agendamento com data/hora/duração) */}
            {!agendamento && data && hora && duracao ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Arenas e Quadras Disponíveis
                </label>
                {carregandoDisponibilidade ? (
                  <div className="text-center py-8 text-gray-600">
                    Verificando disponibilidade...
                  </div>
                ) : disponibilidade.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    Nenhuma quadra disponível para o horário selecionado.
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Arena</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quadra</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {disponibilidade.map((item) =>
                            item.quadras.map((q) => (
                              <tr key={q.quadra.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {item.point.logoUrl && (
                                    <img
                                      src={item.point.logoUrl}
                                      alt={item.point.nome}
                                      className="w-6 h-6 inline-block mr-2 rounded object-contain"
                                    />
                                  )}
                                  {item.point.nome}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {q.quadra.nome}
                                  {q.quadra.tipo && <span className="text-gray-500 ml-1">({q.quadra.tipo})</span>}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {q.disponivel ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Disponível
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {q.motivo || 'Indisponível'}
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {q.disponivel ? (
                                    <button
                                      type="button"
                                      onClick={() => selecionarQuadraDisponivel(item.point.id, q.quadra.id)}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Selecionar
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {quadraId && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Quadra selecionada:</strong>{' '}
                      {quadras.find((q) => q.id === quadraId)?.nome || 'Carregando...'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Seleção tradicional (para edição ou quando não há data/hora/duração) */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Estabelecimento
                  </label>
                  {isAdmin ? (
                    <select
                      value={pointId}
                      onChange={(e) => {
                        setPointId(e.target.value);
                        setQuadraId('');
                      }}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="">Selecione um estabelecimento</option>
                      {points.map((point) => (
                        <option key={point.id} value={point.id}>
                          {point.nome}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700">
                      {isOrganizer ? 'Arena do gestor' : agendamento?.quadra?.point?.nome || 'Selecione um estabelecimento'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quadra *</label>
                  <select
                    value={quadraId}
                    onChange={(e) => setQuadraId(e.target.value)}
                    required
                    disabled={!pointId && !isOrganizer}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Selecione uma quadra</option>
                    {quadras.map((quadra) => (
                      <option key={quadra.id} value={quadra.id}>
                        {quadra.nome} {quadra.tipo && `(${quadra.tipo})`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Adicionar Atletas Participantes por Telefone */}
            {(usuario?.role === 'USER' || canGerenciarAgendamento) && (
              <div>
                {!podeAlterarDetalhes && agendamento && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">
                        Não é possível alterar participantes. O agendamento está {agendamento.status === 'CONCLUIDO' ? 'concluído' : 'cancelado'}.
                      </p>
                    </div>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Atletas Participantes (opcional)
                </label>
                
                {/* Formulário para adicionar participante */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Telefone do Atleta *
                    </label>
                    <input
                      type="text"
                      value={telefoneNovoParticipante}
                      onChange={(e) => {
                        // Permitir apenas números, espaços, parênteses, hífens e +
                        const valor = e.target.value.replace(/[^\d\s()+-]/g, '');
                        setTelefoneNovoParticipante(valor);
                      }}
                      placeholder="(99) 99999-9999"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={buscandoAtleta || (!podeAlterarDetalhes && !!agendamento)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={adicionarParticipantePorTelefone}
                    disabled={buscandoAtleta || !telefoneNovoParticipante.trim() || (!podeAlterarDetalhes && !!agendamento)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                  >
                    {buscandoAtleta ? 'Buscando...' : 'Adicionar Atleta'}
                  </button>
                  {/* Exibir erro específico do formulário de participantes */}
                  {erro && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {erro}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Informe o telefone do atleta cadastrado no app. Apenas atletas com cadastro podem ser adicionados como participantes.
                  </p>
                </div>

                {/* Lista de participantes adicionados */}
                {atletasParticipantes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-600">Participantes adicionados:</p>
                    <div className="flex flex-wrap gap-2">
                      {atletasParticipantes.map((participante) => (
                        <span
                          key={participante.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                        >
                          <Users className="w-4 h-4" />
                          <span>{participante.nome}</span>
                          <span className="text-xs text-blue-600">({participante.telefone})</span>
                          <button
                            type="button"
                            onClick={() => removerParticipante(participante.id)}
                            disabled={!podeAlterarDetalhes && !!agendamento}
                            className="hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remover participante"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              {!podeAlterarDetalhes && agendamento && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      Não é possível alterar observações. O agendamento está {agendamento.status === 'CONCLUIDO' ? 'concluído' : 'cancelado'}.
                    </p>
                  </div>
                </div>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                disabled={!podeAlterarDetalhes && !!agendamento}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Informações adicionais sobre o agendamento..."
              />
            </div>

            {/* Valores */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700">
                      R$
                    </span>
                    Tabela / hora
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(valorHora)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Total calculado (tabela)</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatCurrency(valorCalculado)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <label className="block text-xs text-emerald-700 mb-1 font-medium">
                    Valor negociado
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      R$
                    </span>
                    {canGerenciarAgendamento && (
                      <span className="ml-1 text-[10px] text-emerald-700">(editável)</span>
                    )}
                  </label>
                  {canGerenciarAgendamento ? (
                    <input
                      type="text"
                      value={valorNegociado}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d,.-]/g, '');
                        setValorNegociado(raw);
                      }}
                      placeholder="Ex: 90,00"
                      className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm bg-white"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-emerald-800">
                      {formatCurrency(
                        valorNegociado.trim()
                          ? parseFloat(valorNegociado.replace(',', '.'))
                          : valorCalculado
                      )}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                O <span className="font-semibold text-emerald-700">valor negociado</span> é o que será considerado como{' '}
                <span className="font-semibold">valor final do agendamento</span>. Se ficar em branco, o sistema usa automaticamente o{' '}
                <span className="font-semibold">total calculado pela tabela de preços</span> da quadra (quando existir).
              </p>
            </div>

            {/* Horários Ocupados */}
            {quadraId && data && horariosOcupados.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Horários já ocupados neste dia:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {horariosOcupados.map((horario, idx) => (
                        <span
                          key={idx}
                          className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
                        >
                          {horario}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {erro && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{erro}</p>
                </div>
              </div>
            )}

            {conflito && !erro && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{conflito}</p>
                </div>
              </div>
            )}


            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={salvando}
                className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-800 font-medium transition-colors disabled:opacity-50"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={salvando || !!conflito}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {salvando ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </span>
                ) : agendamento ? (
                  'Salvar Alterações'
                ) : (
                  'Criar Agendamento'
                )}
              </button>
              
              {/* Botão Cancelar Agendamento - última opção quando estiver editando */}
              {agendamento && onCancelarAgendamento && (
                <button
                  type="button"
                  onClick={() => {
                    if (agendamento) {
                      onCancelarAgendamento(agendamento);
                      onClose();
                    }
                  }}
                  disabled={salvando}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar Agendamento
                </button>
              )}
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

