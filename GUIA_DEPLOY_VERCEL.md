# 🚀 Guia Completo: Publicar App Atleta no Vercel

Este guia vai te ajudar a publicar o frontend **App Atleta** no Vercel passo a passo.

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Vercel (gratuita)
- ✅ Código do projeto commitado no Git
- ✅ URL da API externa que o frontend vai consumir

---

## 🔧 Passo 1: Preparar o Código no GitHub

### 1.1. Verificar se o projeto está no GitHub

```bash
cd C:\carlao-dev\appatleta
git remote -v
```

Se não aparecer nada, você precisa conectar ao GitHub:

### 1.2. Criar repositório no GitHub

1. Acesse https://github.com/new
2. Crie um novo repositório chamado `appatleta` (ou outro nome)
3. **NÃO** inicialize com README, .gitignore ou licença (já temos isso)

### 1.3. Conectar o projeto local ao GitHub

```bash
# Se ainda não inicializou o Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "feat: projeto inicial app atleta"

# Conectar ao repositório GitHub (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/appatleta.git

# Enviar código para o GitHub
git branch -M main
git push -u origin main
```

---

## 🌐 Passo 2: Criar Projeto no Vercel

### 2.1. Acessar o Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub (recomendado) ou crie uma conta

### 2.2. Importar Projeto

1. No dashboard do Vercel, clique em **"Add New Project"** ou **"New Project"**
2. Se você fez login com GitHub, você verá seus repositórios
3. Selecione o repositório `appatleta`
4. Clique em **"Import"**

### 2.3. Configurar o Projeto

O Vercel detecta automaticamente que é um projeto Next.js. Verifique:

- ✅ **Framework Preset**: Next.js (deve estar automático)
- ✅ **Root Directory**: `./` (raiz do projeto)
- ✅ **Build Command**: `npm run build` (automático)
- ✅ **Output Directory**: `.next` (automático)
- ✅ **Install Command**: `npm install` (automático)

**⚠️ IMPORTANTE:** Não clique em "Deploy" ainda! Primeiro configure as variáveis de ambiente.

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1. Adicionar Variável Obrigatória

**ANTES de fazer o deploy**, você precisa configurar a URL da API:

1. Na tela de configuração do projeto, role até **"Environment Variables"**
2. Clique em **"Add"** ou **"Add New"**
3. Preencha:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: A URL completa da sua API externa
     - Exemplo: `https://api.seudominio.com/api`
     - Exemplo: `https://seu-backend.vercel.app/api`
   - **Environments**: Selecione todas as opções:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

4. Clique em **"Save"**

### 3.2. Exemplo de Configuração

**Se sua API está em outro projeto no Vercel:**
```
Name: NEXT_PUBLIC_API_URL
Value: https://sua-api.vercel.app/api
Environments: Production, Preview, Development
```

**Se sua API está em outro servidor:**
```
Name: NEXT_PUBLIC_API_URL
Value: https://api.seudominio.com/api
Environments: Production, Preview, Development
```

**⚠️ IMPORTANTE:**
- Use `https://` em produção (nunca `http://`)
- Inclua o caminho `/api` se sua API usa esse prefixo
- A URL deve estar acessível publicamente
- **Se a API está no Vercel**: Use a URL pública do projeto (ex: `https://nome-do-projeto-api.vercel.app/api`)

### 3.3. Como Encontrar a URL da API no Vercel

Se sua API está em outro projeto no Vercel:

1. Acesse o dashboard do Vercel
2. Abra o projeto da sua API
3. Na página do projeto, você verá a URL de produção no topo
4. Exemplo: `https://carlaobtonline.vercel.app`
5. Adicione o caminho `/api` se necessário: `https://carlaobtonline.vercel.app/api`
6. Use essa URL completa no `NEXT_PUBLIC_API_URL`

---

## 🚀 Passo 4: Fazer o Deploy

### 4.1. Deploy Inicial

1. Após configurar as variáveis de ambiente, clique em **"Deploy"**
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Você verá o progresso em tempo real

### 4.2. Verificar o Deploy

Após o deploy:

1. ✅ Status deve mostrar **"Ready"** (verde)
2. ✅ Você receberá uma URL como: `https://appatleta.vercel.app`
3. ✅ Clique na URL para testar

### 4.3. Testar a Aplicação

Abra a URL no navegador e verifique:

- ✅ Página carrega sem erros
- ✅ Login funciona
- ✅ Navegação funciona
- ✅ Sem erros no console do navegador (F12)

---

## 🔄 Passo 5: Deploy Automático

A partir de agora, **toda vez que você fizer push para o GitHub**, o Vercel fará deploy automaticamente!

```bash
# Fazer alterações no código
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# O Vercel detecta automaticamente e faz deploy! 🚀
```

### 5.1. Branches e Pull Requests

- **Branch `main`**: Deploy automático para produção
- **Pull Requests**: Deploy automático para preview (URL temporária para testar)

---

## 🛠️ Troubleshooting (Solução de Problemas)

### ❌ Erro: "Build Failed"

**Possíveis causas:**

1. **Erro de TypeScript:**
   ```bash
   # Testar build localmente primeiro
   cd C:\carlao-dev\appatleta
   npm run build
   ```
   Corrija os erros antes de fazer push.

2. **Dependências faltando:**
   - Verifique se todas estão no `package.json`
   - Execute `npm install` localmente

3. **Variável de ambiente não configurada:**
   - Adicione `NEXT_PUBLIC_API_URL` no Vercel
   - Faça um **Redeploy** (veja abaixo)

### ❌ Erro: "Cannot connect to API"

**Solução:**

1. Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente
2. Verifique se a API externa está online e acessível
3. Verifique se a API tem CORS configurado para permitir o domínio do Vercel:
   ```
   Access-Control-Allow-Origin: https://appatleta.vercel.app
   ```

### ❌ Variável de Ambiente Não Funciona

**Solução:**

1. Certifique-se de que a variável começa com `NEXT_PUBLIC_`
2. Faça um **Redeploy** após adicionar/modificar variáveis
3. Verifique se selecionou os ambientes corretos (Production, Preview, Development)

### 🔄 Como Fazer Redeploy

**Via Dashboard:**
1. Vá em **Deployments** no Vercel
2. Clique nos três pontos (⋯) do último deploy
3. Selecione **Redeploy**

**Via CLI:**
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Redeploy
vercel --prod
```

---

## 🌍 Domínio Personalizado (Opcional)

Se você quiser usar um domínio próprio:

1. Vá em **Settings → Domains**
2. Clique em **Add Domain**
3. Digite seu domínio (ex: `appatleta.seudominio.com`)
4. Configure DNS conforme instruções do Vercel:
   - **CNAME**: `cname.vercel-dns.com`
   - Ou **A Record**: conforme instruções

---

## ✅ Checklist Final

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

## 📱 Testando no Smartphone

Após o deploy, você pode testar no smartphone:

1. **Acesse a URL no navegador do celular:**
   - Exemplo: `https://appatleta.vercel.app`

2. **Adicione à Tela Inicial (PWA):**
   - No Android: Menu → "Adicionar à tela inicial"
   - No iOS: Compartilhar → "Adicionar à Tela de Início"

3. **Teste todas as funcionalidades:**
   - Login
   - Navegação
   - Agendamentos
   - Perfil

---

## 🎯 Resumo Rápido

```bash
# 1. Preparar código no GitHub
git add .
git commit -m "feat: projeto inicial"
git remote add origin https://github.com/SEU_USUARIO/appatleta.git
git push -u origin main

# 2. No Vercel Dashboard:
#    - Criar novo projeto
#    - Importar repositório GitHub
#    - Configurar: NEXT_PUBLIC_API_URL=https://sua-api.com/api
#    - Deploy!

# 3. Deploy automático ativado! 🚀
#    Toda vez que fizer push, o Vercel faz deploy automaticamente
```

---

## 📚 Documentação Relacionada

- `DEPLOY_VERCEL_FRONTEND.md` - Guia detalhado de deploy
- `CONFIGURACAO_API_EXTERNA.md` - Configuração da API externa
- `VARIAVEIS_AMBIENTE_FRONTEND.md` - Variáveis de ambiente

---

**✅ Seu frontend está pronto para produção no Vercel!**

Se tiver dúvidas, consulte a documentação do Vercel: https://vercel.com/docs

