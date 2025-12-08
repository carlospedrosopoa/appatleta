# 📱 Resumo do Projeto - App Atleta

## 🎯 Visão Geral

**App Atleta** é um **frontend mobile-first** desenvolvido em Next.js para atletas gerenciarem agendamentos de quadras, partidas e seus perfis. O aplicativo consome uma API externa e funciona como um **PWA (Progressive Web App)**, podendo ser instalado no smartphone.

### Propósito
- Gerenciar agendamentos de quadras esportivas
- Visualizar e criar partidas
- Acompanhar desempenho e estatísticas
- Gerenciar perfil de atleta
- Interface otimizada para smartphones

---

## 🛠️ Tecnologias Utilizadas

### Core Framework
- **Next.js 16.0.3** - Framework React com App Router
- **React 19.2.0** - Biblioteca UI moderna
- **TypeScript 5** - Tipagem estática para maior segurança

### Estilização
- **Tailwind CSS 4** - Framework de estilos utility-first
- **PostCSS** - Processamento de CSS
- **Lucide React** - Biblioteca de ícones

### UI Components
- **Radix UI** - Componentes acessíveis e sem estilo
  - `@radix-ui/react-select`
  - `@radix-ui/react-label`
  - `@radix-ui/react-slot`
- **Headless UI** - Componentes UI sem estilo
- **Class Variance Authority** - Gerenciamento de variantes de componentes
- **clsx** & **tailwind-merge** - Utilitários para classes CSS

### Autenticação & Segurança
- **JWT (jsonwebtoken)** - Tokens de autenticação
- **jwt-decode** - Decodificação de tokens no cliente
- **bcryptjs** - Hash de senhas (compatibilidade)

### PWA (Progressive Web App)
- **next-pwa 5.6.0** - Transforma o app em PWA
- Service Worker para funcionamento offline
- Cache de recursos
- Instalável no smartphone

### Visualização de Dados
- **Recharts 3.4.1** - Gráficos e visualizações
  - Gráfico evolutivo de desempenho
  - Estatísticas de partidas

### Utilitários
- **date-fns 4.1.0** - Manipulação de datas
- **uuid 13.0.0** - Geração de IDs únicos
- **browser-image-compression** - Compressão de imagens no cliente

### Desenvolvimento
- **ESLint 9** - Linter de código
- **Sharp 0.34.5** - Processamento de imagens
- **Node.js 18+** - Runtime necessário

### Banco de Dados (Compatibilidade)
- **pg 8.16.3** - Cliente PostgreSQL (mantido para compatibilidade, mas não usado neste frontend)

---

## 📁 Estrutura do Projeto

```
appatleta/
├── src/
│   ├── app/                    # Páginas e rotas (App Router)
│   │   ├── app/atleta/         # Área do atleta
│   │   │   ├── dashboard/      # Dashboard principal
│   │   │   ├── agendamentos/   # Gerenciamento de agendamentos
│   │   │   ├── jogos/          # Partidas e jogos
│   │   │   └── perfil/         # Perfil do atleta
│   │   ├── login/              # Página de login
│   │   ├── criar-conta/        # Página de registro
│   │   └── api/                # Rotas API (proxy/legado)
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes UI base
│   │   ├── Menu.tsx            # Menu de navegação
│   │   ├── MinhasPartidas.tsx  # Lista de partidas
│   │   ├── GraficoEvolutivo.tsx # Gráfico de desempenho
│   │   └── ...                 # Outros componentes
│   ├── lib/                    # Utilitários e serviços
│   │   ├── api.ts              # Cliente de API (consome API externa)
│   │   ├── auth.ts             # Utilitários de autenticação
│   │   └── ...                 # Outros utilitários
│   ├── services/               # Serviços de negócio
│   │   ├── agendamentoService.ts
│   │   ├── atletaService.ts
│   │   └── partidaService.ts
│   ├── context/                # Context API
│   │   └── AuthContext.tsx     # Context de autenticação
│   └── types/                  # Tipos TypeScript
│       ├── agendamento.ts
│       └── domain.ts
├── public/                     # Arquivos estáticos
│   ├── manifest.json          # Manifest do PWA
│   ├── icon-*.png             # Ícones do PWA
│   └── ...
├── next.config.ts             # Configuração do Next.js
├── vercel.json                # Configuração do Vercel
├── package.json               # Dependências do projeto
└── tsconfig.json              # Configuração TypeScript
```

---

## 🔌 Arquitetura

### Tipo de Aplicação
- **Frontend-Only**: Não possui banco de dados próprio
- **SPA (Single Page Application)**: Navegação client-side
- **PWA**: Funciona offline e pode ser instalado

### Integração com API Externa
- Consome API REST externa via `NEXT_PUBLIC_API_URL`
- Autenticação via JWT Bearer Token
- Todas as operações de dados vêm da API externa
- Proxy local para desenvolvimento (evita CORS)

### Autenticação
- **JWT (JSON Web Token)**: Método principal
- Tokens armazenados no `localStorage`
- Headers: `Authorization: Bearer <token>`
- Fallback para Basic Auth (compatibilidade)

---

## 📱 Funcionalidades Principais

### 1. Autenticação
- ✅ Login de usuário
- ✅ Registro de nova conta
- ✅ Gerenciamento de sessão
- ✅ Proteção de rotas

### 2. Dashboard
- ✅ Visão geral do atleta
- ✅ Estatísticas rápidas
- ✅ Próximos agendamentos
- ✅ Partidas recentes

### 3. Agendamentos
- ✅ Listar agendamentos
- ✅ Criar novo agendamento
- ✅ Editar agendamento
- ✅ Cancelar agendamento
- ✅ Visualizar quadras disponíveis

### 4. Partidas
- ✅ Listar partidas
- ✅ Criar nova partida
- ✅ Visualizar detalhes da partida
- ✅ Atualizar placar
- ✅ Gráfico evolutivo de desempenho

### 5. Perfil
- ✅ Visualizar perfil
- ✅ Editar perfil
- ✅ Upload de foto
- ✅ Preencher dados do atleta

---

## ⚙️ Configuração

### Variáveis de Ambiente Obrigatórias

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**Onde configurar:**
- **Desenvolvimento**: Arquivo `.env.local` na raiz
- **Produção (Vercel)**: Settings → Environment Variables

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento (porta 3001)
npm run build    # Build de produção
npm run start    # Inicia servidor de produção (porta 3001)
npm run lint     # Executa ESLint
```

---

## 🌐 Deploy

### Plataforma Recomendada
- **Vercel** - Deploy automático via GitHub
- Suporte nativo para Next.js
- Deploy automático a cada push

### Requisitos para Deploy
1. ✅ Código no GitHub
2. ✅ Projeto criado no Vercel
3. ✅ Variável `NEXT_PUBLIC_API_URL` configurada
4. ✅ API externa acessível e com CORS configurado

---

## 📊 Características Técnicas

### Performance
- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG) quando possível
- ✅ Code Splitting automático
- ✅ Lazy Loading de componentes
- ✅ Cache de recursos via PWA

### Mobile-First
- ✅ Design responsivo
- ✅ Touch-friendly
- ✅ PWA instalável
- ✅ Funciona offline (com cache)

### Segurança
- ✅ Autenticação JWT
- ✅ Proteção de rotas
- ✅ Validação de dados
- ✅ HTTPS obrigatório em produção

---

## 🔗 Endpoints da API Externa Consumidos

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /auth/me` - Usuário logado

### Atleta
- `GET /atleta/me/atleta` - Dados do atleta
- `POST /atleta/criarAtleta` - Criar perfil de atleta
- `PUT /atleta/[id]` - Atualizar atleta

### Agendamentos
- `GET /agendamento` - Listar agendamentos
- `POST /agendamento` - Criar agendamento
- `PUT /agendamento/[id]` - Editar agendamento
- `DELETE /agendamento/[id]` - Cancelar agendamento

### Partidas
- `GET /partida/listarPartidas` - Listar partidas
- `POST /partida/criarPartida` - Criar partida
- `PUT /partida/[id]` - Atualizar partida

### Arenas/Points
- `GET /point` - Listar arenas
- `GET /point/[id]` - Detalhes da arena

### Quadras
- `GET /quadra` - Listar quadras
- `GET /quadra/[id]` - Detalhes da quadra

---

## 📚 Documentação Disponível

- `README.md` - Documentação geral
- `GUIA_DEPLOY_VERCEL.md` - Guia completo de deploy
- `DEPLOY_VERCEL_FRONTEND.md` - Deploy específico
- `CONFIGURACAO_API_EXTERNA.md` - Integração com API
- `VARIAVEIS_AMBIENTE_FRONTEND.md` - Variáveis de ambiente
- `ESTADO_ATUAL.md` - Status do projeto

---

## ✅ Status do Projeto

- ✅ Estrutura completa implementada
- ✅ Páginas principais funcionando
- ✅ Componentes UI criados
- ✅ Integração com API configurada
- ✅ PWA configurado
- ✅ Pronto para deploy

**Próximo passo:** Configurar `NEXT_PUBLIC_API_URL` e fazer deploy no Vercel.

---

## 🎯 Resumo Técnico Rápido

| Aspecto | Tecnologia |
|---------|-----------|
| **Framework** | Next.js 16 |
| **UI Library** | React 19 |
| **Linguagem** | TypeScript |
| **Estilos** | Tailwind CSS 4 |
| **PWA** | next-pwa |
| **Gráficos** | Recharts |
| **Autenticação** | JWT |
| **Deploy** | Vercel |
| **Tipo** | Frontend-Only (SPA) |
| **Target** | Mobile-First |

---

**Versão:** 0.1.0  
**Última atualização:** 2024

