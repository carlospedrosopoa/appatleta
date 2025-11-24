# 🚀 Guia de Deploy no Vercel

## 📋 Passos para Atualizar no Vercel

### 1️⃣ Preparar as Mudanças Localmente

Antes de fazer o deploy, certifique-se de que tudo está funcionando:

```bash
# Testar localmente
npm run dev

# Verificar se não há erros
npm run lint

# Testar build (simula produção)
npm run build
```

---

### 2️⃣ Commit e Push para o GitHub

Se o projeto já está conectado ao GitHub e Vercel:

```bash
# Verificar status
git status

# Adicionar todas as mudanças
git add .

# Fazer commit
git commit -m "feat: implementa JWT e edição de usuários"

# Push para o GitHub
git push origin main
# ou
git push origin master
```

**O Vercel detecta automaticamente o push e faz o deploy!** 🎉

---

### 3️⃣ Configurar Variáveis de Ambiente no Vercel

**⚠️ IMPORTANTE:** Você precisa adicionar a variável `JWT_SECRET` no Vercel!

#### Passo a Passo:

1. **Acesse o Dashboard do Vercel:**
   - Vá para: https://vercel.com/dashboard
   - Selecione seu projeto

2. **Vá em Settings → Environment Variables**

3. **Adicione as seguintes variáveis:**

   | Nome | Valor | Ambiente |
   |------|-------|-----------|
   | `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
   | `JWT_SECRET` | `sua-chave-secreta-forte` | Production, Preview, Development |

4. **Para gerar uma chave JWT_SECRET segura:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Copie o resultado e use como valor de `JWT_SECRET`.

5. **Clique em "Save"**

6. **Redeploy o projeto:**
   - Vá em "Deployments"
   - Clique nos três pontos (⋯) do último deploy
   - Selecione "Redeploy"

---

### 4️⃣ Verificar Variáveis de Ambiente Existentes

Certifique-se de que estas variáveis estão configuradas:

✅ **Obrigatórias:**
- `DATABASE_URL` - URL de conexão PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT (NOVO - precisa adicionar!)

✅ **Opcionais:**
- `JWT_EXPIRES_IN` - Tempo de expiração (padrão: `7d`)
- `JWT_REFRESH_EXPIRES_IN` - Tempo de refresh token (padrão: `30d`)
- `NEXT_PUBLIC_API_URL` - URL da API (padrão: `/api`)

---

### 5️⃣ Deploy Manual (se necessário)

Se o deploy automático não funcionar ou você quiser forçar:

1. **Via Dashboard do Vercel:**
   - Acesse o projeto
   - Vá em "Deployments"
   - Clique em "Redeploy" no último deploy

2. **Via CLI do Vercel:**
   ```bash
   # Instalar Vercel CLI (se não tiver)
   npm i -g vercel

   # Fazer login
   vercel login

   # Deploy
   vercel --prod
   ```

---

### 6️⃣ Verificar o Deploy

Após o deploy:

1. **Acesse a URL do projeto** (ex: `https://seu-projeto.vercel.app`)
2. **Teste o login** - deve funcionar com JWT
3. **Verifique os logs** em "Deployments" → "View Function Logs"

---

## 🔍 Troubleshooting

### Erro: "JWT_SECRET is not defined"

**Solução:** Adicione a variável `JWT_SECRET` nas Environment Variables do Vercel.

### Erro: "Cannot connect to database"

**Solução:** Verifique se `DATABASE_URL` está correta e se o banco aceita conexões externas.

### Deploy falha no build

**Solução:**
1. Teste localmente: `npm run build`
2. Verifique os logs de erro no Vercel
3. Certifique-se de que todas as dependências estão no `package.json`

### Variáveis de ambiente não estão sendo aplicadas

**Solução:**
1. Após adicionar variáveis, faça um **Redeploy**
2. Verifique se selecionou os ambientes corretos (Production, Preview, Development)

---

## 📝 Checklist de Deploy

Antes de fazer o deploy, verifique:

- [ ] Código testado localmente
- [ ] `npm run build` funciona sem erros
- [ ] Todas as mudanças commitadas no Git
- [ ] Push feito para o GitHub
- [ ] `DATABASE_URL` configurada no Vercel
- [ ] `JWT_SECRET` configurada no Vercel (NOVO!)
- [ ] Variáveis de ambiente aplicadas em todos os ambientes
- [ ] Redeploy feito após adicionar variáveis

---

## 🎯 Resumo Rápido

```bash
# 1. Commit e push
git add .
git commit -m "feat: atualizações"
git push

# 2. No Vercel Dashboard:
# - Settings → Environment Variables
# - Adicionar JWT_SECRET
# - Redeploy

# 3. Pronto! 🚀
```

---

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Environment Variables no Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)

---

**✅ Após seguir estes passos, sua aplicação estará atualizada no Vercel!**

