// lib/cardService.ts - Serviço para geração e gerenciamento de cards de partida
import { query } from './db';
import { salvarNoGCS, baixarDoGCS, verificarArquivoGCS, isGCSConfigurado } from './gcsService';

/**
 * Busca uma partida completa com informações dos atletas
 */
async function buscarPartidaCompleta(partidaId: string) {
  const result = await query(
    `SELECT p.*, 
     a1.nome as "atleta1Nome", a1.id as "atleta1Id", a1."fotoUrl" as "atleta1FotoUrl",
     a2.nome as "atleta2Nome", a2.id as "atleta2Id", a2."fotoUrl" as "atleta2FotoUrl",
     a3.nome as "atleta3Nome", a3.id as "atleta3Id", a3."fotoUrl" as "atleta3FotoUrl",
     a4.nome as "atleta4Nome", a4.id as "atleta4Id", a4."fotoUrl" as "atleta4FotoUrl"
     FROM "Partida" p
     LEFT JOIN "Atleta" a1 ON p."atleta1Id" = a1.id
     LEFT JOIN "Atleta" a2 ON p."atleta2Id" = a2.id
     LEFT JOIN "Atleta" a3 ON p."atleta3Id" = a3.id
     LEFT JOIN "Atleta" a4 ON p."atleta4Id" = a4.id
     WHERE p.id = $1`,
    [partidaId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Partida não encontrada');
  }
  
  return result.rows[0];
}

/**
 * Gera o card da partida (imagem PNG)
 * Usa SVG + Sharp para gerar um card promocional de 1080x1920px
 */
async function gerarCardBuffer(partida: any): Promise<Buffer> {
  // Importar sharp dinamicamente
  let sharp: any;
  try {
    sharp = (await import('sharp')).default;
  } catch (error) {
    console.error('[CARD] Erro ao importar sharp:', error);
    throw new Error('Biblioteca sharp não disponível. Instale com: npm install sharp');
  }

  // Validar que a partida tem pelo menos 2 atletas
  type AtletaCard = { nome: string; foto?: string };
  const atletasArray: (AtletaCard | null)[] = [
    partida.atleta1Nome ? { nome: partida.atleta1Nome, foto: partida.atleta1FotoUrl } : null,
    partida.atleta2Nome ? { nome: partida.atleta2Nome, foto: partida.atleta2FotoUrl } : null,
    partida.atleta3Nome ? { nome: partida.atleta3Nome, foto: partida.atleta3FotoUrl } : null,
    partida.atleta4Nome ? { nome: partida.atleta4Nome, foto: partida.atleta4FotoUrl } : null,
  ];
  const atletas = atletasArray.filter((a): a is AtletaCard => a !== null);

  if (atletas.length < 2) {
    throw new Error('Partida deve ter pelo menos 2 atletas para gerar o card');
  }

  // Garantir que nomes não sejam undefined/null
  const nomesAtletas = atletas.map(a => a.nome || 'Atleta').filter(Boolean);

  // Formatar data
  const dataPartida = new Date(partida.data);
  const dataFormatada = dataPartida.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Formatar placar
  let placarTexto = 'Aguardando resultado';
  if (partida.gamesTime1 != null && partida.gamesTime2 != null) {
    placarTexto = `${partida.gamesTime1} x ${partida.gamesTime2}`;
    if (partida.tiebreakTime1 != null && partida.tiebreakTime2 != null) {
      placarTexto += ` (${partida.tiebreakTime1} x ${partida.tiebreakTime2})`;
    }
  }

  // Escapar caracteres especiais para SVG
  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const localEscapado = escapeXml(partida.local || 'Local a definir');
  const placarEscapado = escapeXml(placarTexto);
  const nomesEscapados = nomesAtletas.map(escapeXml).join(' vs ');

  // Criar SVG do card (1080x1920px - formato vertical)
  const svg = `
    <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1e40af;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="1080" height="1920" fill="url(#bgGradient)"/>
      
      <!-- Título -->
      <text x="540" y="150" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">
        PARTIDA DE TÊNIS
      </text>
      
      <!-- Data -->
      <text x="540" y="250" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" opacity="0.9">
        ${escapeXml(dataFormatada)}
      </text>
      
      <!-- Local -->
      <text x="540" y="320" font-family="Arial, sans-serif" font-size="42" fill="white" text-anchor="middle" opacity="0.85">
        ${localEscapado}
      </text>
      
      <!-- Placar -->
      <text x="540" y="450" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle">
        ${placarEscapado}
      </text>
      
      <!-- Atletas -->
      <text x="540" y="600" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" opacity="0.9">
        ${nomesEscapados}
      </text>
      
      <!-- Rodapé -->
      <text x="540" y="1850" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" opacity="0.7">
        App Atleta
      </text>
    </svg>
  `;

  // Converter SVG para PNG usando Sharp
  try {
    const buffer = Buffer.from(svg);
    const pngBuffer = await sharp(buffer)
      .resize(1080, 1920, {
        fit: 'contain',
        background: { r: 30, g: 64, b: 175, alpha: 1 },
      })
      .png()
      .toBuffer();

    return pngBuffer;
  } catch (error) {
    console.error('[CARD] Erro ao gerar card com sharp:', error);
    throw new Error('Erro ao gerar imagem do card');
  }
}

/**
 * Obtém ou gera o card da partida
 * Verifica cache no banco de dados e no GCS antes de gerar novo
 * @param partidaId ID da partida
 * @param forceRefresh Se true, ignora cache e força regeneração
 */
export async function obterCardPartida(partidaId: string, forceRefresh = false): Promise<Buffer> {
  // 1. Buscar partida com cardUrl
  const partida = await buscarPartidaCompleta(partidaId);
  
  // 2. Se não forçar refresh e cardUrl existe e GCS está configurado, tentar buscar do cache
  if (!forceRefresh && partida.cardUrl && isGCSConfigurado()) {
    try {
      // Verificar se arquivo existe no GCS
      const filePath = partida.cardUrl.replace(`https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/`, '');
      const existe = await verificarArquivoGCS(filePath);
      
      if (existe) {
        // Retornar do cache
        return await baixarDoGCS(filePath);
      } else {
        // Arquivo não existe mais no GCS, invalidar no DB
        await query('UPDATE "Partida" SET "cardUrl" = NULL WHERE id = $1', [partidaId]);
      }
    } catch (error) {
      console.error('Erro ao verificar card no GCS, regenerando:', error);
      // Continuar para gerar novo card
    }
  }
  
  // 3. Card não existe ou foi invalidado → Gerar novo
  const cardBuffer = await gerarCardBuffer(partida);
  
  // 4. Se GCS está configurado, salvar no GCS e atualizar DB
  if (isGCSConfigurado()) {
    try {
      const filePath = `cards/partida-${partidaId}.png`;
      const cardUrl = await salvarNoGCS(filePath, cardBuffer, 'image/png');
      
      // Atualizar cardUrl e cardGeradoEm no DB
      await query(
        `UPDATE "Partida" 
         SET "cardUrl" = $1, 
             "cardGeradoEm" = NOW(),
             "cardVersao" = COALESCE("cardVersao", 0) + 1
         WHERE id = $2`,
        [cardUrl, partidaId]
      );
    } catch (error) {
      console.error('Erro ao salvar card no GCS:', error);
      // Continuar mesmo se falhar ao salvar no GCS
    }
  }
  
  return cardBuffer;
}

/**
 * Invalida o card de uma partida (define cardUrl como NULL)
 * Usado quando placar é atualizado
 */
export async function invalidarCardPartida(partidaId: string): Promise<void> {
  // Buscar cardUrl atual antes de invalidar
  const result = await query('SELECT "cardUrl" FROM "Partida" WHERE id = $1', [partidaId]);
  
  if (result.rows.length === 0) {
    throw new Error('Partida não encontrada');
  }
  
  const cardUrlAntigo = result.rows[0].cardUrl;
  
  // Invalidar no DB
  await query(
    `UPDATE "Partida" 
     SET "cardUrl" = NULL,
         "cardGeradoEm" = NULL
     WHERE id = $1`,
    [partidaId]
  );
  
  // Opcional: Deletar arquivo antigo do GCS
  if (cardUrlAntigo && isGCSConfigurado()) {
    try {
      const filePath = cardUrlAntigo.replace(`https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/`, '');
      await import('./gcsService').then(({ deletarDoGCS }) => deletarDoGCS(filePath));
    } catch (error) {
      // Não lançar erro se falhar ao deletar (arquivo pode não existir)
      console.warn('Erro ao deletar card antigo do GCS:', error);
    }
  }
}

