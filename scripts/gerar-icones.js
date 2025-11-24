// Script para gerar ícones temporários para PWA
const fs = require('fs');
const path = require('path');

// Criar um SVG simples que será usado como base
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2563eb" rx="100"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">A</text>
</svg>`;

// Criar diretório scripts se não existir
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Salvar SVG temporário
const svgPath = path.join(__dirname, 'icon-temp.svg');
fs.writeFileSync(svgPath, svgIcon);

console.log('✅ SVG temporário criado em:', svgPath);
console.log('');
console.log('📝 Para converter para PNG, você pode:');
console.log('');
console.log('1. Usar ferramenta online:');
console.log('   - https://cloudconvert.com/svg-to-png');
console.log('   - Faça upload do arquivo icon-temp.svg');
console.log('   - Configure tamanhos: 192x192 e 512x512');
console.log('   - Baixe e coloque em public/');
console.log('');
console.log('2. Ou usar ImageMagick (se instalado):');
console.log('   convert -resize 192x192 icon-temp.svg public/icon-192x192.png');
console.log('   convert -resize 512x512 icon-temp.svg public/icon-512x512.png');
console.log('');
console.log('3. Ou criar manualmente:');
console.log('   - Abra icon-temp.svg no navegador');
console.log('   - Tire screenshot e redimensione para 192x192 e 512x512');
console.log('   - Salve como PNG em public/');

