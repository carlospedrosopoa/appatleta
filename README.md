# App Atleta - Frontend Next.js

Frontend para usuários do tipo **USER** (atletas) que consome a API externa do sistema de controle de quadras e agendamentos.

Este é um projeto **frontend-only** que se conecta a uma API externa para gerenciar agendamentos, partidas e perfis de atletas.

## 🚀 Setup Rápido

### ⚡ Quick Start

Para configurar Git e Vercel rapidamente, veja: **[QUICK_START.md](./QUICK_START.md)**

### 📚 Guias Completos

- **[SETUP_GIT_VERCEL.md](./SETUP_GIT_VERCEL.md)** - Guia completo de configuração Git e Vercel
- **[DEPLOY_VERCEL_FRONTEND.md](./DEPLOY_VERCEL_FRONTEND.md)** - Guia específico de deploy no Vercel
- **[CONFIGURACAO_API_EXTERNA.md](./CONFIGURACAO_API_EXTERNA.md)** - Como configurar a integração com API externa

### Configuração Inicial

1. **Configure Git e GitHub:**
   - Inicialize o repositório Git
   - Crie repositório no GitHub
   - Faça push do código

2. **Configure Vercel:**
   - Conecte o repositório GitHub ao Vercel
   - Configure a variável `NEXT_PUBLIC_API_URL`
   - Deploy automático será feito

3. **Variável de Ambiente Obrigatória:**
   - `NEXT_PUBLIC_API_URL`: URL completa da API externa (ex: `https://api.seudominio.com/api`)

### ⚠️ Importante

- **NEXT_PUBLIC_API_URL é obrigatória** - Configure a URL da API externa que este frontend irá consumir
- A API externa deve ter CORS configurado para permitir requisições deste frontend
- Veja os guias acima para instruções detalhadas

## 📦 Instalação Local

### Pré-requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn**
- **API externa** rodando e acessível (ou URL da API em produção)

### Passos para rodar localmente

1. **Clone o repositório** (se ainda não tiver):
   ```bash
   git clone <url-do-repositorio>
   cd appatleta
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   # URL da API Externa
   NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
   ```
   
   **Exemplos:**
   - **API em produção**: `NEXT_PUBLIC_API_URL=https://api.seudominio.com/api`
   - **API local (se estiver rodando localmente)**: `NEXT_PUBLIC_API_URL=http://localhost:3000/api`
   - **API no Vercel**: `NEXT_PUBLIC_API_URL=https://seu-app-api.vercel.app/api`

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**:
   - Abra seu navegador em: `http://localhost:3000`
   - A aplicação redirecionará para `/login` se não estiver autenticado

### ⚠️ Importante

- Certifique-se de que a **API externa está acessível** e configurada com CORS para permitir requisições deste frontend
- O arquivo `.env.local` não deve ser commitado (já está no `.gitignore`)
- Este projeto **não possui banco de dados próprio** - todos os dados vêm da API externa

## 🔧 Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework de estilos
- **JWT (jwt-decode)** - Decodificação de tokens JWT para autenticação
- **Recharts** - Gráficos e visualizações
- **API Externa** - Consome API REST para todas as operações de dados

## 📝 Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL completa da API externa (ex: `https://api.seudominio.com/api`) | ✅ Sim |

### Exemplo de `.env.local`:

```env
# URL da API Externa
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**⚠️ IMPORTANTE:** 
- Configure a URL completa da API externa incluindo o protocolo (`https://` ou `http://`)
- A API externa deve ter CORS configurado para permitir requisições deste frontend
- Em desenvolvimento local, se a API estiver rodando na mesma máquina, use `http://localhost:PORTA/api`

## 🏗️ Estrutura

- `/src/app` - Páginas e rotas do frontend
  - `/app/atleta` - Área do atleta (dashboard, agendamentos, perfil)
  - `/login` - Página de login
  - `/criar-conta` - Página de registro
- `/src/components` - Componentes React reutilizáveis
- `/src/lib` - Utilitários e cliente de API (`api.ts` - consome API externa)
- `/src/services` - Serviços de negócio (agendamentos, etc.)
- `/src/context` - Context API (AuthContext para autenticação)
- `/src/types` - Tipos TypeScript

## 🔌 Integração com API Externa

Este frontend consome uma API externa através do cliente configurado em `src/lib/api.ts`. Todas as requisições são feitas usando:

- **Autenticação JWT**: Tokens são armazenados no `localStorage` e enviados no header `Authorization: Bearer <token>`
- **Cliente API**: Usa `fetch` com wrapper estilo axios para facilitar o uso
- **URL Base**: Configurada via `NEXT_PUBLIC_API_URL`

### Endpoints Principais Consumidos:

- `/auth/login` - Autenticação
- `/auth/register` - Registro de usuário
- `/atleta/*` - Operações com atletas
- `/agendamento/*` - Gerenciamento de agendamentos
- `/partida/*` - Partidas e histórico
- `/point/*` - Arenas/Points
- `/quadra/*` - Quadras disponíveis

**Nota:** As rotas em `/src/app/api/*` são rotas antigas do projeto original e **não devem ser usadas** neste frontend. Este projeto consome apenas a API externa.
