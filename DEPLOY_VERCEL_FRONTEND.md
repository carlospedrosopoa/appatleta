# 🚀 Deploy no Vercel - App Atleta Frontend

Guia específico para deploy deste frontend no Vercel.

## 📋 Visão Geral

Este é um projeto **frontend-only** que consome uma API externa. O deploy no Vercel é simples e não requer banco de dados ou configurações complexas.

---

## ⚙️ Configuração Inicial

### 1. Criar Projeto no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Conecte sua conta GitHub (se ainda não conectou)
4. Selecione o repositório `appatleta`
5. Clique em **Import**

### 2. Configurar Variáveis de Ambiente

**⚠️ OBRIGATÓRIO:** Configure a URL da API externa!

1. No projeto, vá em **Settings → Environment Variables**
2. Adicione:

   | Variável | Valor | Ambientes |
   |----------|-------|-----------|
   | `NEXT_PUBLIC_API_URL` | `https://sua-api-externa.com/api` | Production, Preview, Development |

   **Exemplo:**
   ```
   NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
   ```

3. Clique em **Save**

### 3. Configurações de Build

O Vercel detecta automaticamente Next.js. Verifique em **Settings → General**:

- ✅ **Framework Preset**: Next.js
- ✅ **Build Command**: `npm run build` (automático)
- ✅ **Output Directory**: `.next` (automático)
- ✅ **Install Command**: `npm install` (automático)

### 4. Primeiro Deploy

O Vercel inicia o deploy automaticamente após importar o projeto. Aguarde a conclusão e verifique:

- ✅ Build concluído com sucesso
- ✅ Deploy ativo
- ✅ URL funcionando

---

## 🔄 Deploy Automático

O Vercel faz deploy automático a cada push para a branch `main`:

```bash
# Fazer mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# O Vercel detecta e faz deploy automaticamente! 🚀
```

### Branches e Pull Requests

- **Branch `main`**: Deploy automático para produção
- **Pull Requests**: Deploy automático para preview (URL temporária)

---

## 🌐 Variáveis de Ambiente

### Variável Obrigatória

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

### Configurar no Vercel

1. **Settings → Environment Variables**
2. Clique em **Add New**
3. Preencha:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL completa da API externa
   - **Environments**: Selecione Production, Preview e Development
4. Clique em **Save**

### Valores por Ambiente (Opcional)

Você pode ter URLs diferentes:

- **Production**: `https://api.seudominio.com/api`
- **Preview**: `https://api-staging.seudominio.com/api`
- **Development**: `http://localhost:3000/api`

---

## 🔍 Verificar Deploy

### 1. Status do Deploy

1. Acesse **Deployments** no Dashboard
2. Veja o status do último deploy:
   - ✅ **Ready**: Deploy concluído com sucesso
   - ⏳ **Building**: Em andamento
   - ❌ **Error**: Erro no build

### 2. Logs de Build

1. Clique no deploy
2. Veja os **Build Logs** para identificar problemas

### 3. Testar Aplicação

1. Clique na URL do deploy (ex: `https://appatleta.vercel.app`)
2. Teste:
   - ✅ Página carrega
   - ✅ Login funciona
   - ✅ Navegação funciona
   - ✅ Sem erros no console

---

## 🛠️ Troubleshooting

### Erro: "Build Failed"

**Possíveis causas:**

1. **Erro de TypeScript:**
   ```bash
   # Testar localmente
   npm run build
   ```
   Corrija os erros antes de fazer push.

2. **Dependências faltando:**
   - Verifique se todas as dependências estão no `package.json`
   - Execute `npm install` localmente

3. **Variável de ambiente não configurada:**
   - Adicione `NEXT_PUBLIC_API_URL` no Vercel
   - Faça um Redeploy

### Erro: "Cannot connect to API"

**Solução:**

1. Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente
2. Verifique se a API externa está online
3. Verifique se a API tem CORS configurado para permitir o domínio do Vercel

### Variável de Ambiente Não Funciona

**Solução:**

1. Certifique-se de que a variável começa com `NEXT_PUBLIC_`
2. Faça um **Redeploy** após adicionar/modificar variáveis
3. Verifique se selecionou os ambientes corretos

### Deploy Automático Não Funciona

**Solução:**

1. Verifique se o webhook do GitHub está configurado:
   - **Settings → Git → GitHub App**
2. Verifique se está fazendo push para a branch correta (`main`)
3. Verifique os logs em **Settings → Git**

---

## 🔄 Redeploy Manual

Se precisar fazer redeploy manual:

### Via Dashboard

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**

### Via CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Redeploy
vercel --prod
```

---

## 📊 Monitoramento

### Analytics (Opcional)

1. Vá em **Settings → Analytics**
2. Ative **Web Analytics** (gratuito)
3. Veja métricas de uso da aplicação

### Logs

1. Vá em **Deployments**
2. Clique em um deploy
3. Veja **Function Logs** para debug

---

## 🌍 Domínio Personalizado

### Adicionar Domínio Próprio

1. Vá em **Settings → Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `appatleta.seudominio.com`)
4. Configure DNS conforme instruções:
   - **CNAME**: `cname.vercel-dns.com`
   - Ou **A Record**: conforme instruções do Vercel

---

## ✅ Checklist de Deploy

Antes de considerar o deploy completo:

- [ ] Projeto criado no Vercel
- [ ] Repositório GitHub conectado
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Build concluído com sucesso
- [ ] Aplicação acessível via URL
- [ ] Login funciona (conecta com API)
- [ ] Navegação funciona
- [ ] Sem erros no console do navegador
- [ ] Deploy automático funcionando

---

## 📚 Documentação Relacionada

- `SETUP_GIT_VERCEL.md` - Guia completo de setup Git e Vercel
- `CONFIGURACAO_API_EXTERNA.md` - Configuração da API externa
- `VARIAVEIS_AMBIENTE_FRONTEND.md` - Variáveis de ambiente

---

## 🎯 Resumo Rápido

```bash
# 1. Configurar no Vercel Dashboard:
#    - Settings → Environment Variables
#    - Adicionar: NEXT_PUBLIC_API_URL=https://sua-api.com/api

# 2. Push para GitHub:
git add .
git commit -m "feat: atualizações"
git push origin main

# 3. Vercel faz deploy automático! 🚀
```

---

**✅ Seu frontend está pronto para produção no Vercel!**

