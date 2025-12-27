// app/app/atleta/competicoes/page.tsx - Minhas Competições
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Trophy, Calendar, MapPin, Users, User, Clock, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  point?: {
    id: string;
    nome: string;
    logoUrl?: string | null;
  } | null;
  quadra?: {
    id: string;
    nome: string;
  } | null;
  parceriaId?: string | null;
  parceiro?: {
    id: string;
    nome: string;
  } | null;
}

export default function MinhasCompeticoesPage() {
  const router = useRouter();
  const [competicoes, setCompeticoes] = useState<Competicao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarCompeticoes();
  }, []);

  const carregarCompeticoes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/competicao/me');
      setCompeticoes(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar competições:', error);
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      CRIADA: { label: 'Criada', className: 'bg-gray-100 text-gray-800' },
      EM_ANDAMENTO: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-800' },
      CONCLUIDA: { label: 'Concluída', className: 'bg-green-100 text-green-800' },
      CANCELADA: { label: 'Cancelada', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.CRIADA;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getFormatoLabel = (formato: string) => {
    return formato === 'DUPLAS' ? 'Duplas' : 'Individual';
  };

  const getTipoLabel = (tipo: string) => {
    return tipo === 'SUPER_8' ? 'Super 8' : tipo;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Minhas Competições
          </h1>
          <p className="text-gray-600">Acompanhe suas competições e desempenho</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando competições...</p>
          </div>
        ) : competicoes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma competição encontrada</h3>
            <p className="text-gray-600">Você ainda não está participando de nenhuma competição</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {competicoes.map((competicao) => (
              <div
                key={competicao.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer"
                onClick={() => router.push(`/app/atleta/competicoes/${competicao.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{competicao.nome}</h3>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(competicao.status)}
                      <span className="text-xs text-gray-500">
                        {getTipoLabel(competicao.tipo)} • {getFormatoLabel(competicao.formato)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {competicao.point && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{competicao.point.nome}</span>
                      {competicao.point.logoUrl && (
                        <img
                          src={competicao.point.logoUrl}
                          alt={competicao.point.nome}
                          className="w-5 h-5 object-contain rounded"
                        />
                      )}
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
                      <span>{formatarData(competicao.dataInicio)}</span>
                    </div>
                  )}
                  {competicao.formato === 'DUPLAS' && competicao.parceiro && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Parceiro: {competicao.parceiro.nome}</span>
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
                  <p className="text-sm text-gray-700 line-clamp-2 mb-4">{competicao.descricao}</p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/app/atleta/competicoes/${competicao.id}`);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


