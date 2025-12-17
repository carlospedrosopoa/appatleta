// app/api/user/auth/register-com-telefone/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, email, name, password, atletaId } = body;

    if (!telefone || !email || !name || !password) {
      return NextResponse.json(
        { mensagem: 'Telefone, email, nome e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { mensagem: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Normalizar telefone
    const telefoneNormalizado = telefone.replace(/\D/g, '');
    const emailNormalizado = email.toLowerCase().trim();

    // Verificar se email já existe
    const emailExiste = await query('SELECT id FROM "User" WHERE email = $1', [emailNormalizado]);
    if (emailExiste.rows.length > 0) {
      return NextResponse.json(
        { mensagem: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }

    // Verificar se telefone já está em uso por outro usuário
    if (atletaId) {
      const atletaExistente = await query(
        'SELECT "usuarioId" FROM "Atleta" WHERE id = $1',
        [atletaId]
      );
      
      if (atletaExistente.rows.length > 0 && atletaExistente.rows[0].usuarioId) {
        return NextResponse.json(
          { mensagem: 'Este atleta já possui uma conta vinculada' },
          { status: 400 }
        );
      }
    }

    // Criar hash da senha
    const hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Criar usuário
    await query(
      'INSERT INTO "User" (id, name, email, password, role, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, name, emailNormalizado, hash, 'USER']
    );

    // Se tem atletaId, vincular o atleta ao usuário
    if (atletaId) {
      // Verificar se o telefone do atleta confere
      const atleta = await query(
        'SELECT id, fone FROM "Atleta" WHERE id = $1',
        [atletaId]
      );

      if (atleta.rows.length > 0) {
        const telefoneAtleta = atleta.rows[0].fone?.replace(/\D/g, '');
        
        if (telefoneAtleta === telefoneNormalizado) {
          // Vincular atleta ao usuário
          await query(
            'UPDATE "Atleta" SET "usuarioId" = $1, "updatedAt" = NOW() WHERE id = $2',
            [userId, atletaId]
          );
        }
      }
    } else {
      // Criar novo atleta se não existe
      const atletaIdNovo = uuidv4();
      await query(
        `INSERT INTO "Atleta" (id, nome, fone, "usuarioId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [atletaIdNovo, name, telefoneNormalizado, userId]
      );
    }

    // Buscar usuário criado
    const usuarioCriado = await query(
      'SELECT id, name, email, role FROM "User" WHERE id = $1',
      [userId]
    );

    return NextResponse.json(
      {
        mensagem: 'Conta criada com sucesso',
        usuario: usuarioCriado.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao criar conta com telefone:', error);
    return NextResponse.json(
      { mensagem: error.message || 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    );
  }
}


