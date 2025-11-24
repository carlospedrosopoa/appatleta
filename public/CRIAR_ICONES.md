# 🎨 Criar Ícones para PWA

## 📋 Ícones Necessários

Você precisa criar dois ícones e colocá-los na pasta `public/`:

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

## 🛠️ Como Criar os Ícones

### Opção 1: Gerador Online (Mais Fácil) ⭐

1. Acesse: https://www.pwabuilder.com/imageGenerator
2. Faça upload de uma imagem (pode ser qualquer tamanho)
3. Baixe os ícones gerados
4. Coloque em `public/icon-192x192.png` e `public/icon-512x512.png`

### Opção 2: RealFaviconGenerator

1. Acesse: https://realfavicongenerator.net/
2. Faça upload de uma imagem
3. Configure as opções
4. Baixe e extraia os arquivos
5. Use os ícones de 192x192 e 512x512

### Opção 3: Design Manual

1. Crie um design no Figma/Photoshop/Canva
2. Exporte como PNG:
   - 192x192 pixels (icon-192x192.png)
   - 512x512 pixels (icon-512x512.png)
3. Coloque os arquivos em `public/`

## 📝 Requisitos dos Ícones

- **Formato:** PNG
- **Tamanhos:** 192x192 e 512x512 pixels
- **Fundo:** Pode ser transparente ou sólido
- **Design:** Deve funcionar bem em tamanho pequeno (ícone na tela inicial)

## ✅ Após Criar

1. Coloque os arquivos em `public/icon-192x192.png` e `public/icon-512x512.png`
2. Reinicie o servidor (`npm run dev`)
3. Teste no mobile

## 🎨 Dica de Design

- Use cores contrastantes
- Evite texto muito pequeno
- Teste como fica em tamanho pequeno (ícone na tela inicial)
- Use o tema azul (#2563eb) para manter consistência

