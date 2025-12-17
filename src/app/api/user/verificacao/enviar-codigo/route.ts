// app/api/user/verificacao/enviar-codigo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { enviarMensagemWhatsApp, formatarNumeroWhatsApp } from '@/lib/whatsappService';
import {
  gerarCodigoVerificacao,
  armazenarCodigoVerificacao,
} from '@/lib/verificacaoService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telefone, metodo } = body;

    if (!telefone) {
      return NextResponse.json(
        { mensagem: 'Telefone é obrigatório' },
        { status: 400 }
      );
    }

    if (!metodo || (metodo !== 'sms' && metodo !== 'whatsapp')) {
      return NextResponse.json(
        { mensagem: 'Método deve ser "sms" ou "whatsapp"' },
        { status: 400 }
      );
    }

    // Normalizar telefone
    const telefoneNormalizado = telefone.replace(/\D/g, '');

    // Gerar código de 6 dígitos
    const codigo = gerarCodigoVerificacao();
    const expiraEm = Date.now() + 10 * 60 * 1000; // 10 minutos

    // Armazenar código
    armazenarCodigoVerificacao(telefoneNormalizado, codigo, expiraEm);

    // Enviar código via WhatsApp ou SMS
    if (metodo === 'whatsapp') {
      const numeroWhatsApp = formatarNumeroWhatsApp(telefoneNormalizado);
      const mensagem = `Seu código de verificação é: ${codigo}\n\nEste código expira em 10 minutos.`;

      const enviado = await enviarMensagemWhatsApp({
        destinatario: numeroWhatsApp,
        mensagem,
        tipo: 'texto',
      });

      if (!enviado) {
        return NextResponse.json(
          { mensagem: 'Erro ao enviar código via WhatsApp. Tente SMS.' },
          { status: 500 }
        );
      }
    } else if (metodo === 'sms') {
      // TODO: Implementar envio de SMS
      // Por enquanto, apenas logar (em desenvolvimento)
      console.log(`[SMS] Código de verificação para ${telefoneNormalizado}: ${codigo}`);
      
      // Em desenvolvimento, sempre retorna sucesso
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Código de verificação (SMS): ${codigo}`);
      } else {
        // Em produção, integrar com serviço de SMS (Twilio, etc.)
        return NextResponse.json(
          { mensagem: 'Envio de SMS ainda não implementado. Use WhatsApp.' },
          { status: 501 }
        );
      }
    }

    return NextResponse.json({
      mensagem: `Código enviado via ${metodo === 'whatsapp' ? 'WhatsApp' : 'SMS'}`,
      metodo,
    });
  } catch (error: any) {
    console.error('Erro ao enviar código de verificação:', error);
    return NextResponse.json(
      { mensagem: 'Erro ao enviar código. Tente novamente.' },
      { status: 500 }
    );
  }
}

