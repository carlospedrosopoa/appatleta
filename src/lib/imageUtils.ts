// lib/imageUtils.ts - Utilitários para processamento de imagens no frontend
import imageCompression from 'browser-image-compression';

/**
 * Processa foto de perfil: redimensiona e comprime antes de enviar
 * @param file Arquivo de imagem original
 * @returns Base64 da imagem processada
 */
export async function processarFotoPerfil(file: File): Promise<string> {
  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    throw new Error('Por favor, selecione apenas arquivos de imagem.');
  }

  // Validar tamanho máximo original (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('A imagem deve ter no máximo 5MB.');
  }

  const options = {
    maxSizeMB: 0.2, // 200KB máximo após compressão
    maxWidthOrHeight: 400, // Redimensionar para 400x400px
    useWebWorker: true, // Usar Web Worker para não travar a UI
    fileType: 'image/jpeg', // Converter para JPEG (menor tamanho)
    initialQuality: 0.85, // Qualidade inicial de 85%
  };

  try {
    console.log(`[FOTO] Frontend: ${(file.size / 1024 / 1024).toFixed(2)}MB → `);
    
    // Comprimir e redimensionar imagem
    const compressedFile = await imageCompression(file, options);
    
    // Converter para base64
    const base64 = await fileToBase64(compressedFile);
    
    console.log(`[FOTO] Frontend: ${(compressedFile.size / 1024).toFixed(2)}KB (base64: ${(base64.length / 1024).toFixed(2)}KB)`);
    
    return base64;
  } catch (error: any) {
    console.error(`[FOTO] Frontend ERRO: ${error.message}`);
    throw new Error(error.message || 'Erro ao processar imagem. Tente novamente.');
  }
}

/**
 * Converte arquivo File para base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Valida dimensões da imagem (opcional, para validação adicional)
 */
export function validarDimensoesImagem(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Aceitar qualquer dimensão (será redimensionada)
      resolve(true);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Arquivo não é uma imagem válida'));
    };
    
    img.src = url;
  });
}

