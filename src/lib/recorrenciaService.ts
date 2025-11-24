// lib/recorrenciaService.ts - Serviços para gerenciar agendamentos recorrentes
import { randomUUID } from 'crypto';
import type { RecorrenciaConfig } from '@/types/agendamento';

export interface AgendamentoRecorrente {
  quadraId: string;
  usuarioId: string | null;
  atletaId: string | null;
  nomeAvulso: string | null;
  telefoneAvulso: string | null;
  dataHora: string; // ISO string
  duracao: number;
  valorHora: number | null;
  valorCalculado: number | null;
  valorNegociado: number | null;
  observacoes: string | null;
  recorrenciaId: string;
  recorrenciaConfig: RecorrenciaConfig;
}

/**
 * Gera uma lista de agendamentos recorrentes baseado na configuração
 */
export function gerarAgendamentosRecorrentes(
  dataInicio: Date,
  config: RecorrenciaConfig,
  dadosBase: Omit<AgendamentoRecorrente, 'dataHora' | 'recorrenciaId' | 'recorrenciaConfig'>
): AgendamentoRecorrente[] {
  const agendamentos: AgendamentoRecorrente[] = [];
  const recorrenciaId = randomUUID();
  const intervalo = config.intervalo || 1;
  
  let dataAtual = new Date(dataInicio);
  let ocorrencias = 0;
  const maxOcorrencias = config.quantidadeOcorrencias || 365; // Limite padrão de 1 ano
  const dataFim = config.dataFim ? new Date(config.dataFim) : null;

  // Incluir a primeira ocorrência (data de início)
  agendamentos.push({
    ...dadosBase,
    dataHora: dataAtual.toISOString(),
    recorrenciaId,
    recorrenciaConfig: config,
  });
  ocorrencias++;

  // Avançar para a próxima ocorrência
  switch (config.tipo) {
    case 'DIARIO':
      dataAtual = new Date(dataAtual);
      dataAtual.setDate(dataAtual.getDate() + intervalo);
      break;
    case 'SEMANAL':
      dataAtual = new Date(dataAtual);
      dataAtual.setDate(dataAtual.getDate() + (7 * intervalo));
      break;
    case 'MENSAL':
      dataAtual = new Date(dataAtual);
      if (config.diaMes) {
        const proximoMes = dataAtual.getMonth() + intervalo;
        const ano = dataAtual.getFullYear() + Math.floor(proximoMes / 12);
        const mes = proximoMes % 12;
        const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
        const dia = Math.min(config.diaMes, ultimoDiaMes);
        dataAtual = new Date(ano, mes, dia, dataAtual.getHours(), dataAtual.getMinutes());
      } else {
        dataAtual.setMonth(dataAtual.getMonth() + intervalo);
      }
      break;
    default:
      // Sem recorrência, apenas retornar o primeiro
      return agendamentos;
  }

  while (ocorrencias < maxOcorrencias) {
    // Verificar se passou da data fim
    if (dataFim && dataAtual > dataFim) {
      break;
    }

    let deveIncluir = false;

    switch (config.tipo) {
      case 'DIARIO':
        deveIncluir = true;
        break;

      case 'SEMANAL':
        if (config.diasSemana && config.diasSemana.length > 0) {
          // Verificar se o dia atual está nos dias da semana configurados
          const diaSemana = dataAtual.getDay();
          deveIncluir = config.diasSemana.includes(diaSemana);
        } else {
          // Se não especificou dias, usar o mesmo dia da semana
          deveIncluir = true;
        }
        break;

      case 'MENSAL':
        deveIncluir = true;
        break;

      default:
        break;
    }

    if (deveIncluir) {
      agendamentos.push({
        ...dadosBase,
        dataHora: dataAtual.toISOString(),
        recorrenciaId,
        recorrenciaConfig: config,
      });
      ocorrencias++;
    }

    // Avançar para a próxima data
    switch (config.tipo) {
      case 'DIARIO':
        dataAtual = new Date(dataAtual);
        dataAtual.setDate(dataAtual.getDate() + intervalo);
        break;
      case 'SEMANAL':
        if (config.diasSemana && config.diasSemana.length > 0 && !deveIncluir) {
          // Avançar apenas 1 dia para verificar o próximo
          dataAtual = new Date(dataAtual);
          dataAtual.setDate(dataAtual.getDate() + 1);
        } else {
          // Avançar para o próximo período (ex: se intervalo=2, avança 2 semanas)
          dataAtual = new Date(dataAtual);
          dataAtual.setDate(dataAtual.getDate() + (7 * intervalo));
        }
        break;
      case 'MENSAL':
        dataAtual = new Date(dataAtual);
        if (config.diaMes) {
          const proximoMes = dataAtual.getMonth() + intervalo;
          const ano = dataAtual.getFullYear() + Math.floor(proximoMes / 12);
          const mes = proximoMes % 12;
          const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
          const dia = Math.min(config.diaMes, ultimoDiaMes);
          dataAtual = new Date(ano, mes, dia, dataAtual.getHours(), dataAtual.getMinutes());
        } else {
          dataAtual.setMonth(dataAtual.getMonth() + intervalo);
        }
        break;
    }
  }

  return agendamentos;
}

/**
 * Verifica se um agendamento faz parte de uma recorrência
 */
export function temRecorrencia(agendamento: { recorrenciaId?: string | null }): boolean {
  return !!agendamento.recorrenciaId;
}

/**
 * Obtém o próximo agendamento da recorrência a partir de uma data
 */
export function obterProximosAgendamentosRecorrencia(
  dataAtual: Date,
  config: RecorrenciaConfig,
  dadosBase: Omit<AgendamentoRecorrente, 'dataHora' | 'recorrenciaId' | 'recorrenciaConfig'>
): AgendamentoRecorrente[] {
  return gerarAgendamentosRecorrentes(dataAtual, config, dadosBase);
}

