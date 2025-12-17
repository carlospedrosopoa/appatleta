// app/api/user/verificacao/validar-codigo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  obterCodigoVerificacao,
  removerCodigoVerificacao,
} from '@/lib/verificacaoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, codigo } = body;

    if (!telefone || !codigo) {
      return NextResponse.json(
        { mensagem: 'Telefone e código são obrigatórios' },
        { status: 400 }
      );
    }

    // Normalizar telefone
    const telefoneNormalizado = telefone.replace(/\D/g, '');

    // Buscar código armazenado
    const dadosCodigo = obterCodigoVerificacao(telefoneNormalizado);

    if (!dadosCodigo) {
      return NextResponse.json(
        { mensagem: 'Código não encontrado ou expirado. Solicite um novo código.' },
        { status: 400 }
      );
    }

    // Validar código
    if (dadosCodigo.codigo !== codigo) {
      return NextResponse.json(
        { mensagem: 'Código inválido. Verifique e tente novamente.' },
        { status: 400 }
      );
    }

    // Código válido - remover do armazenamento
    removerCodigoVerificacao(telefoneNormalizado);

    return NextResponse.json({
      mensagem: 'Código validado com sucesso',
      valido: true,
    });
  } catch (error: any) {
    console.error('Erro ao validar código:', error);
    return NextResponse.json(
      { mensagem: 'Erro ao validar código. Tente novamente.' },
      { status: 500 }
    );
  }
}

