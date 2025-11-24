# ⚡ Quick Start - Configuração Rápida

Guia rápido para configurar Git e Vercel em poucos minutos.

## 🚀 Passos Rápidos

### 1. Inicializar Git e Criar Repositório

```bash
# Navegar para o diretório do projeto
cd C:\carlao-dev\appatleta

# Inicializar Git (se ainda não foi feito)
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "feat: inicializa frontend App Atleta"

# Criar repositório no GitHub (via site):
# 1. Acesse: https://github.com/new
# 2. Nome: appatleta
# 3. Não marque "Initialize with README"
# 4. Clique em "Create repository"

# Conectar ao GitHub (substitua SEU_USUARIO)
git remote add origin https://github.com/SEU_USUARIO/appatleta.git

# Push inicial
git branch -M main
git push -u origin main
```

### 2. Configurar Vercel

1. **Acesse:** https://vercel.com/dashboard
2. **Clique em:** "Add New Project"
3. **Conecte GitHub** (se ainda não conectou)
4. **Selecione:** repositório `appatleta`
5. **Clique em:** "Import"

### 3. Configurar Variável de Ambiente no Vercel

1. No projeto Vercel, vá em **Settings → Environment Variables**
2. **Adicione:**
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://sua-api-externa.com/api`
   - **Environments:** Marque Production, Preview e Development
3. **Clique em:** "Save"

### 4. Aguardar Deploy

O Vercel faz deploy automaticamente. Aguarde alguns minutos e verifique:

- ✅ Build concluído
- ✅ Deploy ativo
- ✅ URL funcionando

### 5. Testar

Acesse a URL do Vercel e teste:
- ✅ Página carrega
- ✅ Login funciona
- ✅ Navegação funciona

---

## 📝 Próximos Passos

Após a configuração inicial:

1. **Leia:** `SETUP_GIT_VERCEL.md` - Guia completo
2. **Configure:** `CONFIGURACAO_API_EXTERNA.md` - Integração com API
3. **Deploy:** `DEPLOY_VERCEL_FRONTEND.md` - Guia de deploy

---

## ⚠️ Importante

- Configure `NEXT_PUBLIC_API_URL` antes do primeiro deploy
- Certifique-se de que a API externa tem CORS configurado
- Teste localmente antes de fazer push: `npm run build`

---

**✅ Pronto! Seu frontend está configurado!**

