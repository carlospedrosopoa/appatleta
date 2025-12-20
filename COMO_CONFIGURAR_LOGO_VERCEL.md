# Como Configurar o Logo do Play Na Quadra no Vercel

## Passo 1: Obter a URL do Logo

Você precisa ter o logo do Play Na Quadra hospedado em algum lugar acessível via URL. Opções:

1. **Google Cloud Storage (GCS)** - Se você já usa GCS para outras imagens
2. **Vercel Blob Storage** - Armazenamento da própria Vercel
3. **CDN/Cloudflare** - Qualquer serviço de CDN
4. **GitHub/GitLab** - Repositório público com arquivo de imagem

## Passo 2: Configurar Variável de Ambiente no Vercel

### Via Dashboard do Vercel:

1. Acesse o projeto `appatleta` no Vercel: https://vercel.com
2. Vá em **Settings** → **Environment Variables**
3. Clique em **Add New**
4. Configure:
   - **Name**: `NEXT_PUBLIC_LOGO_URL`
   - **Value**: `https://sua-url-do-logo.com/logo.png` (substitua pela URL real)
   - **Environment**: Selecione todas as opções (Production, Preview, Development)
5. Clique em **Save**

### Via CLI do Vercel:

```bash
vercel env add NEXT_PUBLIC_LOGO_URL
# Quando solicitado, digite a URL do logo
# Selecione todos os ambientes (Production, Preview, Development)
```

## Passo 3: Fazer Redeploy

Após adicionar a variável de ambiente:

1. Vá em **Deployments** no Vercel
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit/push para trigger automático

## Passo 4: Verificar

Após o redeploy, o logo deve aparecer:
- No menu de navegação (topo do app)
- Ao lado do título "Minha Panelinha"
- No header do AtletaLayout

## Exemplo de URL

```
https://storage.googleapis.com/seu-bucket/playnaquadra-logo.png
```

ou

```
https://cdn.playnaquadra.com.br/logo.png
```

## Nota Importante

- A variável deve começar com `NEXT_PUBLIC_` para ser acessível no cliente (browser)
- O logo deve estar em formato PNG, SVG ou JPG
- Recomenda-se usar imagens otimizadas (WebP) para melhor performance

