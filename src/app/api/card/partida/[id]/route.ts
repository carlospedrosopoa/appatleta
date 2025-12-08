// app/api/card/partida/[id]/route.ts
// Endpoint para obter o card/imagem da partida
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { obterCardPartida } from '@/lib/cardService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticação
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const partidaId = id;

    if (!partidaId) {
      return NextResponse.json(
        { error: 'ID da partida é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se deve forçar regeneração
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Obter card (gera se necessário)
    const cardBuffer = await obterCardPartida(partidaId, forceRefresh);

    // Retornar como imagem PNG
    // Converter Buffer para Uint8Array para compatibilidade com NextResponse
    return new NextResponse(new Uint8Array(cardBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });
  } catch (error: any) {
    console.error('[CARD] Erro ao obter card da partida:', error);
    
    // Erros específicos
    if (error.message === 'Partida não encontrada') {
      return NextResponse.json(
        { error: 'Partida não encontrada' },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('pelo menos 2 atletas')) {
      return NextResponse.json(
        { error: 'Partida deve ter pelo menos 2 atletas para gerar o card' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('Sharp não')) {
      return NextResponse.json(
        { error: 'Erro de configuração: biblioteca de imagens não disponível' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar card da partida' },
      { status: 500 }
    );
  }
}

