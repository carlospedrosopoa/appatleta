// components/QuadrasDisponiveis.tsx - Componente para mostrar quadras disponíveis no dashboard
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { quadraService, tabelaPrecoService } from '@/services/agendamentoService';
import { userArenaService, userAtletaService, type Arena } from '@/services/userAtletaService';
import type { Quadra, TabelaPreco, Point } from '@/types/agendamento';
import { MapPin, Calendar, DollarSign, Building2, ArrowRight } from 'lucide-react';

interface QuadrasDisponiveisProps {
  onAgendar?: (quadraId: string) => void;
}

export default function QuadrasDisponiveis({ onAgendar }: QuadrasDisponiveisProps) {
  const router = useRouter();
  const { usuario } = useAuth();
  const isAdmin = usuario?.role === 'ADMIN';
  const [points, setPoints] = useState<Arena[]>([]);
  const [quadras, setQuadras] = useState<(Quadra & { point: Point; precoMinimo?: number })[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarQuadras();
  }, []);

  const carregarQuadras = async () => {
    try {
      setCarregando(true);
      setErro('');

      // Para frontend externo, sempre usa userArenaService que retorna apenas arenas assinantes e ativas
      // Se for ADMIN, pode usar pointService.listar() para ver todas, mas no frontend externo geralmente não é ADMIN
      const pointsData = isAdmin 
        ? await (await import('@/services/agendamentoService')).pointService.listar()
        : await userArenaService.listar();
      
      // Filtrar e converter arenas: ADMIN vê todas, USER vê apenas assinantes (já vem filtrado do userArenaService)
      let pointsAtivos: Arena[];
      if (isAdmin) {
        // Converter Point[] para Arena[] adicionando propriedade assinante
        pointsAtivos = (pointsData as any[]).filter((p) => p.ativo).map((p) => ({
          ...p,
          assinante: p.assinante ?? true, // Se não tiver assinante, assume true para ADMIN
        })) as Arena[];
      } else {
        // userArenaService já retorna Arena[] com assinante
        pointsAtivos = pointsData as Arena[];
      }

      // Carregar todas as quadras ativas
      const todasQuadras: (Quadra & { point: Point; precoMinimo?: number })[] = [];

      for (const arena of pointsAtivos) {
        try {
          // Converter Arena para Point adicionando propriedades faltantes
          const point: Point = {
            id: arena.id,
            nome: arena.nome,
            endereco: arena.endereco,
            telefone: arena.telefone,
            email: arena.email,
            descricao: arena.descricao,
            logoUrl: arena.logoUrl ?? null,
            latitude: arena.latitude ?? null,
            longitude: arena.longitude ?? null,
            ativo: arena.ativo,
            createdAt: new Date().toISOString(), // Valor padrão
            updatedAt: new Date().toISOString(), // Valor padrão
          };

          const quadrasDoPoint = await quadraService.listar(point.id);
          const quadrasAtivas = quadrasDoPoint.filter((q) => q.ativo);

          // Para cada quadra, buscar preço mínimo
          for (const quadra of quadrasAtivas) {
            try {
              const tabelasPreco = await tabelaPrecoService.listar(quadra.id);
              const tabelasAtivas = tabelasPreco.filter((tp) => tp.ativo);
              
              let precoMinimo: number | undefined;
              if (tabelasAtivas.length > 0) {
                precoMinimo = Math.min(...tabelasAtivas.map((tp) => tp.valorHora));
              }

              todasQuadras.push({
                ...quadra,
                point,
                precoMinimo,
              });
            } catch (error) {
              // Se não conseguir buscar preço, adiciona sem preço
              todasQuadras.push({
                ...quadra,
                point,
              });
            }
          }
        } catch (error) {
          console.error(`Erro ao carregar quadras do point ${point.id}:`, error);
        }
      }

      setPoints(pointsAtivos);
      setQuadras(todasQuadras);
    } catch (error: any) {
      console.error('Erro ao carregar quadras:', error);
      setErro('Erro ao carregar quadras disponíveis');
    } finally {
      setCarregando(false);
    }
  };

  const formatCurrency = (valor: number | null | undefined) => {
    if (valor == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const handleAgendar = (quadraId: string) => {
    if (onAgendar) {
      onAgendar(quadraId);
    } else {
      router.push(`/app/atleta/agendamentos/novo?quadraId=${quadraId}`);
    }
  };


  if (carregando) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{erro}</p>
          <button
            onClick={carregarQuadras}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Agrupar quadras por estabelecimento
  const quadrasPorPoint = points.reduce((acc, point) => {
    const quadrasDoPoint = quadras.filter((q) => q.pointId === point.id);
    if (quadrasDoPoint.length > 0) {
      acc[point.id] = {
        point,
        quadras: quadrasDoPoint,
      };
    }
    return acc;
  }, {} as Record<string, { point: Point; quadras: typeof quadras }>);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Quadras Disponíveis</h2>
          <p className="text-gray-600 text-sm">
            Explore e agende quadras em {points.length} estabelecimento{points.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => router.push('/app/atleta/agendamentos')}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ver Todos os Agendamentos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {Object.keys(quadrasPorPoint).length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Nenhuma quadra disponível no momento</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(quadrasPorPoint).map(({ point, quadras: quadrasDoPoint }) => (
            <div key={point.id} className="border border-gray-200 rounded-lg p-4">
              {/* Cabeçalho do Estabelecimento */}
              <div className="flex items-start gap-3 mb-4">
                {point.logoUrl && (
                  <img
                    src={point.logoUrl}
                    alt={`Logo ${point.nome}`}
                    className="w-12 h-12 object-contain rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{point.nome}</h3>
                  {point.endereco && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {point.endereco}
                    </p>
                  )}
                  {point.telefone && (
                    <p className="text-sm text-gray-600 mt-1">📞 {point.telefone}</p>
                  )}
                </div>
              </div>

              {/* Lista de Quadras */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quadrasDoPoint.map((quadra) => (
                  <div
                    key={quadra.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{quadra.nome}</h4>
                        {quadra.tipo && (
                          <p className="text-xs text-gray-600 mb-2">
                            Tipo: {quadra.tipo}
                          </p>
                        )}
                        {quadra.capacidade && (
                          <p className="text-xs text-gray-600">
                            Capacidade: {quadra.capacidade} pessoa{quadra.capacidade !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preço */}
                    {quadra.precoMinimo && (
                      <div className="flex items-center gap-1 mb-3 text-sm">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-gray-700">
                          A partir de <span className="font-semibold text-green-600">
                            {formatCurrency(quadra.precoMinimo)}/h
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAgendar(quadra.id)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        Agendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

