// app/api/user/atleta/buscar-por-telefone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone } = body;

    if (!telefone) {
      return NextResponse.json(
        { mensagem: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    // Normalizar telefone (apenas números)
    const telefoneNormalizado = telefone.replace(/\D/g, '');

    if (telefoneNormalizado.length < 10) {
      return NextResponse.json(
        { mensagem: 'Telefone inválido' },
        { status: 400 }
      );
    }

    // Buscar atleta por telefone
    // Busca na tabela Atleta pelo campo fone
    const result = await query(
      `SELECT 
        a.id,
        a.nome,
        a.fone as telefone,
        a."usuarioId",
        u.email
      FROM "Atleta" a
      LEFT JOIN "User" u ON u.id = a."usuarioId"
      WHERE a.fone = $1
      LIMIT 1`,
      [telefoneNormalizado]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { mensagem: 'Atleta não encontrado' },
        { status: 404 }
      );
    }

    const atleta = result.rows[0];

    return NextResponse.json({
      id: atleta.id,
      nome: atleta.nome,
      telefone: atleta.telefone,
      email: atleta.email || null,
      usuarioId: atleta.usuarioId || null,
      existe: true,
    });
  } catch (error: any) {
    console.error('Erro ao buscar atleta por telefone:', error);
    return NextResponse.json(
      { mensagem: 'Erro ao buscar atleta. Tente novamente.' },
      { status: 500 }
    );
  }
}


