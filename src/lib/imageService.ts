// lib/imageService.ts - Serviço para processamento de imagens no backend
// NOTA: Requer instalação: npm install sharp

let sharp: any = null;

/**
 * Inicializa Sharp (carrega dinamicamente para não quebrar se não estiver instalado)
 */
function getSharp() {
  if (sharp) return sharp;
  
  try {
    sharp = require('sharp');
    return sharp;
  } catch (error) {
    console.warn('Sharp não está instalado. Execute: npm install sharp');
    return null;
  }
}

/**
 * Processa foto de perfil: redimensiona, otimiza e valida
 * @param base64 Base64 da imagem (com ou sem data URL prefix)
 * @returns Buffer da imagem processada
 */
export async function processarFotoPerfil(base64: string): Promise<Buffer> {
  const sharpInstance = getSharp();
  
  if (!sharpInstance) {
    console.error('[FOTO] ERRO: Sharp não disponível!');
    throw new Error('Sharp não está instalado. Execute: npm install sharp');
  }

  try {
    // Remover data URL prefix se existir
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    console.log(`[FOTO] Processando: ${(buffer.length / 1024 / 1024).toFixed(2)}MB → `);

    // Validar tamanho máximo antes de processar (5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Imagem muito grande (máximo 5MB)');
    }

    // Redimensionar e otimizar
    const processed = await sharpInstance(buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ 
        quality: 85,
        progressive: true,
      })
      .toBuffer();

    // Validar tamanho final (máximo 200KB após processamento)
    if (processed.length > 200 * 1024) {
      // Reduzir qualidade progressivamente
      let reprocessed = processed;
      let quality = 75;
      
      while (reprocessed.length > 200 * 1024 && quality >= 50) {
        reprocessed = await sharpInstance(buffer)
          .resize(400, 400, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ 
            quality: quality,
            progressive: true,
          })
          .toBuffer();
        
        if (reprocessed.length <= 200 * 1024) {
          console.log(`[FOTO] Processada: ${(reprocessed.length / 1024).toFixed(2)}KB (qualidade ${quality}%)`);
          return reprocessed;
        }
        
        quality -= 10;
      }
      
      // Última tentativa: reduzir dimensões também
      if (reprocessed.length > 200 * 1024) {
        reprocessed = await sharpInstance(buffer)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({ 
            quality: 70,
            progressive: true,
          })
          .toBuffer();
        
        if (reprocessed.length > 200 * 1024) {
          throw new Error(`Imagem muito grande após processamento: ${(reprocessed.length / 1024).toFixed(2)}KB. Máximo permitido: 200KB`);
        }
      }
      
      console.log(`[FOTO] Processada: ${(reprocessed.length / 1024).toFixed(2)}KB (300x300px)`);
      return reprocessed;
    }

    console.log(`[FOTO] Processada: ${(processed.length / 1024).toFixed(2)}KB`);
    return processed;
  } catch (error: any) {
    console.error(`[FOTO] ERRO: ${error.message}`);
    throw new Error(error.message || 'Erro ao processar imagem');
  }
}

/**
 * Converte Buffer para base64 (para salvar no banco)
 */
export function bufferToBase64(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

/**
 * Valida se é uma imagem válida
 */
export async function validarImagem(base64: string): Promise<boolean> {
  const sharpInstance = getSharp();
  
  if (!sharpInstance) {
    // Sem Sharp, apenas validar formato base64
    return /^data:image\/\w+;base64,/.test(base64) || /^[A-Za-z0-9+/=]+$/.test(base64);
  }

  try {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Tentar ler metadados da imagem
    await sharpInstance(buffer).metadata();
    return true;
  } catch {
    return false;
  }
}

