# 🔧 Variáveis de Ambiente - Frontend

Este documento lista todas as variáveis de ambiente necessárias para o **frontend** do App Atleta.

## 📋 Variável Obrigatória

### API Externa

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**Descrição:** URL completa da API externa que este frontend irá consumir.

**Exemplos:**

- **Produção**: `https://api.seudominio.com/api`
- **Desenvolvimento local**: `http://localhost:3000/api` (se a API estiver rodando localmente)
- **Vercel/Deploy**: `https://seu-app-api.vercel.app/api`

**⚠️ Importante:**
- Deve incluir o protocolo (`https://` ou `http://`)
- Deve incluir o caminho `/api` se a API usar esse prefixo
- Em produção, sempre use `https://`

## 📝 Como Configurar

### Desenvolvimento Local

1. Crie um arquivo `.env.local` na raiz do projeto
2. Adicione a variável:

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

3. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Produção (Vercel)

1. Acesse o painel do Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione a variável `NEXT_PUBLIC_API_URL` com a URL da API
4. Faça um **Redeploy** para aplicar as mudanças

## ⚠️ Importante

- **NUNCA** commite arquivos `.env` ou `.env.local` no Git
- Mantenha a URL da API em segredo (especialmente se contiver tokens)
- Use variáveis diferentes para desenvolvimento e produção
- O arquivo `.env.local` já está no `.gitignore` e não será commitado

## 🔍 Verificando a Configuração

Para verificar se a variável está configurada corretamente:

```typescript
// No código (apenas em client-side)
console.log(process.env.NEXT_PUBLIC_API_URL);

// No terminal (desenvolvimento)
echo $NEXT_PUBLIC_API_URL
```

**Nota:** Variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (browser). Use apenas para valores que podem ser públicos.

## 📚 Documentação Relacionada

- `CONFIGURACAO_API_EXTERNA.md` - Guia completo de integração com API externa
- `README.md` - Documentação geral do projeto

