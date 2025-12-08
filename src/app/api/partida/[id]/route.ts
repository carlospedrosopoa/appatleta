// app/api/partida/[id]/route.ts
// Endpoint para atualizar uma partida (principalmente placar)
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { atualizarPlacar } from '@/lib/partidaService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const body = await request.json();
    
    const {
      gamesTime1,
      gamesTime2,
      tiebreakTime1,
      tiebreakTime2,
      // Outros campos podem ser adicionados aqui se necessário
    } = body;

    // Atualizar placar (isso já invalida o card automaticamente)
    const partidaAtualizada = await atualizarPlacar(id, {
      gamesTime1: gamesTime1 ?? null,
      gamesTime2: gamesTime2 ?? null,
      tiebreakTime1: tiebreakTime1 ?? null,
      tiebreakTime2: tiebreakTime2 ?? null,
    });

    return NextResponse.json(partidaAtualizada, { status: 200 });
  } catch (error: any) {
    console.error('Erro ao atualizar partida:', error);
    
    if (error.message?.includes('não encontrada')) {
      return NextResponse.json(
        { error: 'Partida não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar partida' },
      { status: 500 }
    );
  }
}

