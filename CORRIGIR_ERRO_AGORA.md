# ⚡ Correção Rápida do Erro

## 🔴 Erro Atual

"Erro ao buscar usuário" - A requisição está falhando porque `NEXT_PUBLIC_API_URL` não está configurada.

## ✅ Solução Rápida (2 minutos)

### Passo 1: Abrir `.env.local`

Abra o arquivo `.env.local` na raiz do projeto `C:\carlao-dev\appatleta\.env.local`

### Passo 2: Adicionar Esta Linha

Adicione no final do arquivo:

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**⚠️ IMPORTANTE:** Substitua `https://sua-api-externa.com/api` pela URL real da sua API!

**Exemplos:**
- Se sua API está no Vercel: `https://seu-app-api.vercel.app/api`
- Se está rodando localmente: `http://localhost:3000/api` (ou a porta que usa)
- Se está em produção: `https://api.seudominio.com/api`

### Passo 3: Reiniciar o Servidor

1. Pare o servidor (pressione `Ctrl+C` no terminal)
2. Inicie novamente: `npm run dev`

### Passo 4: Testar

Recarregue a página no navegador. O erro deve desaparecer!

---

## 🔍 Como Descobrir a URL da API

Se você não sabe qual é a URL da API externa:

1. **Verifique o projeto da API** (o outro projeto de controle de quadras)
2. **Veja onde está deployado** (Vercel, outro servidor, etc.)
3. **Ou pergunte ao time** qual é a URL da API em produção/staging

---

## ⚠️ Se Ainda Não Funcionar

1. **Verifique se a API está online:**
   - Abra a URL da API no navegador
   - Deve retornar JSON ou uma página de API

2. **Verifique CORS:**
   - Se aparecer erro de CORS, a API precisa permitir requisições do frontend
   - Em desenvolvimento, a API deve permitir `http://localhost:3000`

3. **Verifique o console do navegador:**
   - Abra DevTools (F12)
   - Veja a aba "Network" para ver qual URL está sendo chamada
   - Veja a aba "Console" para mensagens de erro mais detalhadas

---

**Após adicionar `NEXT_PUBLIC_API_URL` e reiniciar, o erro deve ser resolvido!** ✅

