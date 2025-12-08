// lib/gcsService.ts - Serviço para Google Cloud Storage
// NOTA: Este serviço requer configuração do Google Cloud Storage
// Configure as variáveis de ambiente:
// - GOOGLE_CLOUD_PROJECT_ID
// - GOOGLE_CLOUD_BUCKET_NAME
// - GOOGLE_APPLICATION_CREDENTIALS (caminho para arquivo JSON de credenciais)

let storage: any = null;
let bucket: any = null;

/**
 * Inicializa o cliente do Google Cloud Storage
 * Retorna null se não estiver configurado
 */
function getStorage() {
  if (storage) return storage;
  
  try {
    // Tentar importar dinamicamente (não instalar se não usar)
    const { Storage } = require('@google-cloud/storage');
    
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_BUCKET_NAME) {
      console.warn('Google Cloud Storage não configurado. Variáveis GOOGLE_CLOUD_PROJECT_ID e GOOGLE_CLOUD_BUCKET_NAME não encontradas.');
      return null;
    }
    
    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      // Credenciais podem vir de GOOGLE_APPLICATION_CREDENTIALS ou de variáveis de ambiente
    });
    
    bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
    return storage;
  } catch (error) {
    console.warn('Google Cloud Storage não disponível:', error);
    return null;
  }
}

/**
 * Verifica se um arquivo existe no GCS
 */
export async function verificarArquivoGCS(filePath: string): Promise<boolean> {
  const storageInstance = getStorage();
  if (!storageInstance || !bucket) return false;
  
  try {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('Erro ao verificar arquivo no GCS:', error);
    return false;
  }
}

/**
 * Salva um arquivo no GCS e retorna a URL pública
 */
export async function salvarNoGCS(filePath: string, buffer: Buffer, contentType: string = 'image/png'): Promise<string> {
  const storageInstance = getStorage();
  if (!storageInstance || !bucket) {
    throw new Error('Google Cloud Storage não configurado');
  }
  
  try {
    const file = bucket.file(filePath);
    await file.save(buffer, {
      contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000', // Cache por 1 ano
      },
    });
    
    // Tornar arquivo público (ou usar signed URL se preferir)
    await file.makePublic();
    
    // Retornar URL pública
    return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${filePath}`;
  } catch (error) {
    console.error('Erro ao salvar arquivo no GCS:', error);
    throw error;
  }
}

/**
 * Baixa um arquivo do GCS
 */
export async function baixarDoGCS(filePath: string): Promise<Buffer> {
  const storageInstance = getStorage();
  if (!storageInstance || !bucket) {
    throw new Error('Google Cloud Storage não configurado');
  }
  
  try {
    const file = bucket.file(filePath);
    const [buffer] = await file.download();
    return buffer;
  } catch (error) {
    console.error('Erro ao baixar arquivo do GCS:', error);
    throw error;
  }
}

/**
 * Deleta um arquivo do GCS
 */
export async function deletarDoGCS(filePath: string): Promise<void> {
  const storageInstance = getStorage();
  if (!storageInstance || !bucket) return;
  
  try {
    const file = bucket.file(filePath);
    await file.delete();
  } catch (error) {
    // Não lançar erro se arquivo não existir
    if ((error as any).code !== 404) {
      console.error('Erro ao deletar arquivo do GCS:', error);
    }
  }
}

/**
 * Verifica se o GCS está configurado
 */
export function isGCSConfigurado(): boolean {
  return !!(
    process.env.GOOGLE_CLOUD_PROJECT_ID &&
    process.env.GOOGLE_CLOUD_BUCKET_NAME &&
    getStorage()
  );
}

