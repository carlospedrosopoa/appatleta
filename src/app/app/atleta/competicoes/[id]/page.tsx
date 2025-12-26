// app/app/atleta/competicoes/[id]/page.tsx - Detalhes da Competição
'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Trophy, Calendar, MapPin, Users, User, Clock, Award, ArrowLeft, PlayCircle } from 'lucide-react';

interface Competicao {
  id: string;
  nome: string;
  tipo: string;
  formato: string;
  status: string;
  dataInicio?: string | null;
  dataFim?: string | null;
  descricao?: string | null;
  premio?: string | null;
  regras?: string | null;
  point?: {
    id: string;
    nome: string;
    logoUrl?: string | null;
  } | null;
  quadra?: {
    id: string;
    nome: string;
  } | null;
}

interface Jogo {
  id: string;
  rodada: string;
  numeroJogo: number;
  participante1?: {
    nome: string;
    atletaId?: string;
    parceriaId?: string;
    dupla?: {
      atleta1: { id: string; nome: string };
      atleta2: { id: string; nome: string };
    };
  } | null;
  participante2?: {
    nome: string;
    atletaId?: string;
    parceriaId?: string;
    dupla?: {
      atleta1: { id: string; nome: string };
      atleta2: { id: string; nome: string };
    };
  } | null;
  vencedorId?: string | null;
  gamesAtleta1?: number | null;
  gamesAtleta2?: number | null;
  status: string;
  dataHora?: string | null;
  quadra?: {
    id: string;
    nome: string;
  } | null;
}

export default function DetalhesCompeticaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [competicao, setCompeticao] = useState<Competicao | null>(null);
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, [id]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Buscar competição
      const { data: competicaoData } = await api.get(`/competicao/${id}`);
      setCompeticao(competicaoData);

      // Buscar jogos
      try {
        const { data: jogosData } = await api.get(`/competicao/${id}/jogos`);
        setJogos(jogosData || []);
      } catch (err) {
        // Se não houver jogos, apenas não mostrar
        setJogos([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar competição:', error);
      alert(error?.response?.data?.mensagem || 'Erro ao carregar competição');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return '—';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRodadaLabel = (rodada: string) => {
    const labels: Record<string, string> = {
      QUARTAS_FINAL: 'Quartas de Final',
      SEMIFINAL: 'Semifinais',
      FINAL: 'Final',
    };
    return labels[rodada] || rodada;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      AGENDADO: { label: 'Agendado', className: 'bg-gray-100 text-gray-800' },
      EM_ANDAMENTO: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      CONCLUIDO: { label: 'Concluído', className: 'bg-green-100 text-green-800' },
      CANCELADO: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.AGENDADO;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Agrupar jogos por rodada
  const jogosPorRodada = jogos.reduce((acc, jogo) => {
    if (!acc[jogo.rodada]) {
      acc[jogo.rodada] = [];
    }
    acc[jogo.rodada].push(jogo);
    return acc;
  }, {} as Record<string, Jogo[]>);

  const ordenRodadas = ['QUARTAS_FINAL', 'SEMIFINAL', 'FINAL'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!competicao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-gray-600">Competição não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start gap-4 mb-4">
            {competicao.point?.logoUrl && (
              <img
                src={competicao.point.logoUrl}
                alt={competicao.point.nome}
                className="w-16 h-16 object-contain rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{competicao.nome}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {competicao.formato === 'DUPLAS' ? 'Duplas' : 'Individual'}
                </span>
                {competicao.status && (
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    competicao.status === 'EM_ANDAMENTO' ? 'bg-green-100 text-green-800' :
                    competicao.status === 'CONCLUIDA' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {competicao.status === 'EM_ANDAMENTO' ? 'Em Andamento' :
                     competicao.status === 'CONCLUIDA' ? 'Concluída' :
                     competicao.status === 'CRIADA' ? 'Criada' : competicao.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {competicao.point && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{competicao.point.nome}</span>
              </div>
            )}
            {competicao.quadra && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{competicao.quadra.nome}</span>
              </div>
            )}
            {competicao.dataInicio && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Início: {formatarData(competicao.dataInicio)}</span>
              </div>
            )}
            {competicao.premio && (
              <div className="flex items-center gap-2 text-yellow-600 font-semibold">
                <Award className="w-4 h-4" />
                <span>{competicao.premio}</span>
              </div>
            )}
          </div>

          {competicao.descricao && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
              <p className="text-gray-700">{competicao.descricao}</p>
            </div>
          )}

          {competicao.regras && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Regras</h3>
              <p className="text-gray-700 whitespace-pre-line">{competicao.regras}</p>
            </div>
          )}
        </div>

        {/* Jogos */}
        {jogos.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <PlayCircle className="w-6 h-6" />
              Jogos
            </h2>
            
            {ordenRodadas.map((rodada) => {
              const jogosRodada = jogosPorRodada[rodada];
              if (!jogosRodada || jogosRodada.length === 0) return null;

              return (
                <div key={rodada} className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{getRodadaLabel(rodada)}</h3>
                  <div className="space-y-4">
                    {jogosRodada.map((jogo) => (
                      <div
                        key={jogo.id}
                        className={`p-4 rounded-lg border-2 ${
                          jogo.status === 'CONCLUIDO' ? 'border-green-200 bg-green-50' :
                          jogo.status === 'EM_ANDAMENTO' ? 'border-blue-200 bg-blue-50' :
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600">Jogo {jogo.numeroJogo}</span>
                            {getStatusBadge(jogo.status)}
                          </div>
                          {jogo.quadra && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {jogo.quadra.nome}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={`text-center p-3 rounded-lg ${
                            jogo.vencedorId === jogo.participante1?.atletaId || 
                            jogo.vencedorId === jogo.participante1?.parceriaId
                              ? 'bg-yellow-100 font-bold' : 'bg-white'
                          }`}>
                            <div className="font-semibold text-gray-900">
                              {jogo.participante1?.nome || 'A definir'}
                            </div>
                            {jogo.participante1?.dupla && (
                              <div className="text-xs text-gray-600 mt-1">
                                {jogo.participante1.dupla.atleta1.nome} & {jogo.participante1.dupla.atleta2.nome}
                              </div>
                            )}
                            {jogo.gamesAtleta1 !== null && (
                              <div className="text-2xl font-bold text-blue-600 mt-2">
                                {jogo.gamesAtleta1}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center text-gray-400 font-bold text-2xl my-auto">VS</div>

                          <div className={`text-center p-3 rounded-lg ${
                            jogo.vencedorId === jogo.participante2?.atletaId || 
                            jogo.vencedorId === jogo.participante2?.parceriaId
                              ? 'bg-yellow-100 font-bold' : 'bg-white'
                          }`}>
                            <div className="font-semibold text-gray-900">
                              {jogo.participante2?.nome || 'A definir'}
                            </div>
                            {jogo.participante2?.dupla && (
                              <div className="text-xs text-gray-600 mt-1">
                                {jogo.participante2.dupla.atleta1.nome} & {jogo.participante2.dupla.atleta2.nome}
                              </div>
                            )}
                            {jogo.gamesAtleta2 !== null && (
                              <div className="text-2xl font-bold text-blue-600 mt-2">
                                {jogo.gamesAtleta2}
                              </div>
                            )}
                          </div>
                        </div>

                        {jogo.dataHora && (
                          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {formatarData(jogo.dataHora)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Jogos ainda não foram gerados</h3>
            <p className="text-gray-600">Aguardando sorteio da competição</p>
          </div>
        )}
      </div>
    </div>
  );
}

