// Script para gerar ícones PNG para PWA usando sharp
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Garantir que o diretório public existe
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Função para criar um ícone SVG
function criarSVG(tamanho) {
  const radius = tamanho * 0.2;
  return `
    <svg width="${tamanho}" height="${tamanho}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${tamanho}" height="${tamanho}" rx="${radius}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${tamanho * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">A</text>
    </svg>
  `;
}

async function gerarIcones() {
  try {
    const tamanhos = [192, 512];
    
    for (const tamanho of tamanhos) {
      const svg = criarSVG(tamanho);
      const outputPath = path.join(publicDir, `icon-${tamanho}x${tamanho}.png`);
      
      await sharp(Buffer.from(svg))
        .resize(tamanho, tamanho)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Ícone ${tamanho}x${tamanho} criado: ${outputPath}`);
    }
    
    console.log('\n🎉 Todos os ícones foram gerados com sucesso!');
    console.log('📁 Arquivos criados em: public/');
    console.log('\n✅ Agora você pode fazer build e testar o PWA!');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.log('\n💡 Alternativa: Use o arquivo public/gerar-icones.html no navegador');
    process.exit(1);
  }
}

gerarIcones();

