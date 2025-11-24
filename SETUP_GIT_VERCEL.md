# 🚀 Setup Git e Vercel - App Atleta Frontend

Guia completo para configurar o repositório Git e deploy no Vercel para este frontend.

## 📋 Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Node.js 18+ instalado localmente
- Git instalado

---

## 1️⃣ Configuração do Git

### Passo 1: Inicializar Repositório Git (se ainda não estiver)

```bash
# Verificar se já existe um repositório Git
git status

# Se não existir, inicializar
git init

# Configurar usuário (se ainda não configurado globalmente)
git config user.name "Seu Nome"
git config user.email "seu@email.com"
```

### Passo 2: Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha:
   - **Repository name**: `appatleta` (ou outro nome de sua escolha)
   - **Description**: "Frontend para atletas - App de agendamentos e partidas"
   - **Visibility**: Escolha Public ou Private
   - **NÃO** marque "Initialize with README" (já temos um)
3. Clique em **Create repository**

### Passo 3: Conectar Repositório Local ao GitHub

```bash
# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/appatleta.git

# Ou se preferir SSH:
# git remote add origin git@github.com:SEU_USUARIO/appatleta.git

# Verificar se foi adicionado corretamente
git remote -v
```

### Passo 4: Primeiro Commit e Push

```bash
# Verificar status
git status

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: inicializa frontend App Atleta"

# Criar branch main (se necessário)
git branch -M main

# Push para GitHub
git push -u origin main
```

**✅ Repositório Git configurado!**

---

## 2️⃣ Configuração do Vercel

### Passo 1: Conectar Projeto ao Vercel

#### Opção A: Via Dashboard (Recomendado)

1. Acesse https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Selecione **Import Git Repository**
4. Conecte sua conta GitHub (se ainda não conectou)
5. Selecione o repositório `appatleta`
6. Clique em **Import**

#### Opção B: Via CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# No diretório do projeto
cd C:\carlao-dev\appatleta

# Deploy inicial
vercel

# Seguir as instruções interativas:
# - Set up and deploy? Y
# - Which scope? (selecione sua conta)
# - Link to existing project? N
# - Project name? appatleta (ou outro nome)
# - Directory? ./
# - Override settings? N
```

### Passo 2: Configurar Variáveis de Ambiente

**⚠️ IMPORTANTE:** Configure a URL da API externa!

1. No Dashboard do Vercel, vá em **Settings → Environment Variables**
2. Adicione a variável:

   | Nome | Valor | Ambientes |
   |------|-------|-----------|
   | `NEXT_PUBLIC_API_URL` | `https://sua-api-externa.com/api` | Production, Preview, Development |

   **Exemplo:**
   ```
   NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
   ```

3. Clique em **Save**

### Passo 3: Configurar Build Settings

O Vercel detecta automaticamente Next.js, mas você pode verificar:

1. Vá em **Settings → General**
2. Verifique:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (ou `next build`)
   - **Output Directory**: `.next` (padrão)
   - **Install Command**: `npm install`

### Passo 4: Primeiro Deploy

Se você conectou via Dashboard, o Vercel já iniciou o deploy automaticamente.

Se usou CLI, faça:

```bash
# Deploy para produção
vercel --prod
```

**✅ Deploy configurado!**

---

## 3️⃣ Configuração Contínua

### Deploy Automático

O Vercel faz deploy automático a cada push para a branch `main`:

```bash
# Fazer mudanças no código
# ... editar arquivos ...

# Commit e push
git add .
git commit -m "feat: descrição das mudanças"
git push origin main

# O Vercel detecta automaticamente e faz deploy! 🚀
```

### Verificar Deploy

1. Acesse o Dashboard do Vercel
2. Vá em **Deployments**
3. Veja o status do último deploy
4. Clique na URL para acessar a aplicação

---

## 4️⃣ Domínio Personalizado (Opcional)

### Configurar Domínio Próprio

1. No Vercel Dashboard, vá em **Settings → Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `appatleta.seudominio.com`)
4. Siga as instruções para configurar DNS:
   - Adicione um registro CNAME apontando para `cname.vercel-dns.com`
   - Ou configure A record conforme instruções

---

## 5️⃣ Variáveis de Ambiente por Ambiente

Você pode ter URLs diferentes para cada ambiente:

### Production (Produção)
```
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api
```

### Preview (Pull Requests)
```
NEXT_PUBLIC_API_URL=https://api-staging.seudominio.com/api
```

### Development (Local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Como configurar:**
1. No Vercel Dashboard → **Settings → Environment Variables**
2. Ao adicionar variável, selecione os ambientes desejados
3. Você pode ter valores diferentes para cada ambiente

---

## 6️⃣ Checklist de Setup

Antes de considerar o setup completo, verifique:

### Git
- [ ] Repositório Git inicializado
- [ ] Repositório criado no GitHub
- [ ] Remote configurado corretamente
- [ ] Primeiro commit e push realizados
- [ ] `.gitignore` está funcionando (arquivos sensíveis não são commitados)

### Vercel
- [ ] Projeto criado no Vercel
- [ ] Conectado ao repositório GitHub
- [ ] Variável `NEXT_PUBLIC_API_URL` configurada
- [ ] Primeiro deploy realizado com sucesso
- [ ] Aplicação acessível via URL do Vercel
- [ ] Deploy automático funcionando

### Testes
- [ ] Aplicação carrega corretamente
- [ ] Login funciona (conecta com API externa)
- [ ] Navegação entre páginas funciona
- [ ] Sem erros no console do navegador

---

## 🔍 Troubleshooting

### Erro: "Repository not found"

**Solução:**
- Verifique se o repositório existe no GitHub
- Verifique se você tem permissão de acesso
- Reconecte a conta GitHub no Vercel

### Erro: "Build failed"

**Solução:**
1. Verifique os logs de build no Vercel
2. Teste localmente: `npm run build`
3. Verifique se todas as dependências estão no `package.json`
4. Verifique se não há erros de TypeScript

### Variável de ambiente não funciona

**Solução:**
1. Certifique-se de que a variável começa com `NEXT_PUBLIC_`
2. Faça um **Redeploy** após adicionar variáveis
3. Verifique se selecionou os ambientes corretos

### Deploy automático não funciona

**Solução:**
1. Verifique se o webhook do GitHub está configurado no Vercel
2. Verifique se está fazendo push para a branch correta (`main` ou `master`)
3. Verifique os logs em **Settings → Git**

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Next.js no Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Git Documentation](https://git-scm.com/doc)

---

## 🎯 Comandos Rápidos

```bash
# Git - Status e commit
git status
git add .
git commit -m "feat: descrição"
git push origin main

# Vercel CLI - Deploy
vercel              # Preview
vercel --prod       # Produção
vercel --dev        # Modo desenvolvimento

# Build local (testar antes de deploy)
npm run build
npm start
```

---

**✅ Após seguir este guia, seu frontend estará configurado no Git e Vercel!**

