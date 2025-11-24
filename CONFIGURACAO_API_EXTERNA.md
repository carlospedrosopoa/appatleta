# 🔌 Configuração da API Externa

Este documento explica como configurar este frontend para consumir a API externa do sistema de controle de quadras e agendamentos.

## 📋 Visão Geral

Este é um projeto **frontend-only** que consome uma API externa. Todas as operações de dados (autenticação, agendamentos, partidas, etc.) são feitas através de requisições HTTP para a API externa.

## ⚙️ Configuração

### 1. Variável de Ambiente Obrigatória

Configure a variável `NEXT_PUBLIC_API_URL` apontando para a URL completa da API externa:

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**Exemplos:**

- **Produção**: `https://api.seudominio.com/api`
- **Desenvolvimento local**: `http://localhost:3000/api` (se a API estiver rodando localmente)
- **Vercel/Deploy**: `https://seu-app-api.vercel.app/api`

### 2. Onde Configurar

#### Desenvolvimento Local

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

#### Produção (Vercel)

1. Acesse o painel do Vercel
2. Vá em **Settings → Environment Variables**
3. Adicione a variável `NEXT_PUBLIC_API_URL` com a URL da API
4. Faça um **Redeploy** para aplicar as mudanças

## 🔐 Autenticação

O frontend usa **JWT (JSON Web Tokens)** para autenticação:

1. **Login**: O usuário faz login através de `/auth/login` e recebe um token JWT
2. **Armazenamento**: O token é armazenado no `localStorage` como `accessToken`
3. **Uso**: Todas as requisições subsequentes incluem o header `Authorization: Bearer <token>`
4. **Expiração**: Se o token expirar (401), o usuário é redirecionado para login

### Fluxo de Autenticação

```typescript
// 1. Login
const response = await api.post('/auth/login', { email, password });
const { token, usuario } = response.data;

// 2. Token é automaticamente armazenado e usado em todas as requisições
// O cliente API (src/lib/api.ts) adiciona automaticamente o header Authorization
```

## 🌐 CORS (Cross-Origin Resource Sharing)

A API externa **deve ter CORS configurado** para permitir requisições deste frontend:

### Configuração na API Externa

A API deve permitir requisições do domínio deste frontend. Exemplo de configuração CORS:

```typescript
// Na API externa
const allowedOrigins = [
  'https://appatleta.vercel.app',
  'http://localhost:3000', // desenvolvimento
];

// Headers CORS
Access-Control-Allow-Origin: https://appatleta.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 📡 Cliente de API

O frontend usa um cliente de API customizado em `src/lib/api.ts` que:

- ✅ Gerencia tokens JWT automaticamente
- ✅ Adiciona headers de autenticação em todas as requisições
- ✅ Trata erros de autenticação (401)
- ✅ Suporta métodos GET, POST, PUT, DELETE
- ✅ Compatível com estilo axios

### Exemplo de Uso

```typescript
import { api } from '@/lib/api';

// GET
const { data } = await api.get('/atleta/me/atleta');

// POST
const { data } = await api.post('/agendamento', {
  quadraId: '...',
  data: '2024-01-01',
  horaInicio: '10:00',
  horaFim: '11:00',
});

// PUT
const { data } = await api.put(`/agendamento/${id}`, {
  horaInicio: '11:00',
});

// DELETE
await api.delete(`/agendamento/${id}`);
```

## 🔍 Endpoints Principais

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/register` - Registro de novo usuário
- `GET /auth/me` - Obter usuário logado

### Atleta
- `GET /atleta/me/atleta` - Obter dados do atleta logado
- `GET /atleta/listarAtletas` - Listar atletas
- `POST /atleta/criarAtleta` - Criar novo atleta
- `PUT /atleta/[id]` - Atualizar atleta
- `GET /atleta/[id]` - Obter atleta por ID

### Agendamentos
- `GET /agendamento` - Listar agendamentos (com filtros opcionais)
- `POST /agendamento` - Criar agendamento
- `GET /agendamento/[id]` - Obter agendamento por ID
- `PUT /agendamento/[id]` - Atualizar agendamento
- `POST /agendamento/[id]/cancelar` - Cancelar agendamento
- `DELETE /agendamento/[id]` - Deletar agendamento

### Partidas
- `GET /partida/listarPartidas` - Listar partidas
- `POST /partida/criarPartida` - Criar nova partida

### Points (Arenas)
- `GET /point` - Listar arenas
- `GET /point/[id]` - Obter arena por ID

### Quadras
- `GET /quadra` - Listar quadras (com filtro opcional `?pointId=...`)
- `GET /quadra/[id]` - Obter quadra por ID

## 🧪 Testando a Conexão

Para testar se a API externa está configurada corretamente:

1. **Verifique a variável de ambiente:**
   ```bash
   # No terminal
   echo $NEXT_PUBLIC_API_URL
   ```

2. **Teste uma requisição simples:**
   ```typescript
   // No console do navegador ou em uma página de teste
   const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/point`);
   console.log(await response.json());
   ```

3. **Verifique erros de CORS:**
   - Se aparecer erro de CORS no console, a API não está configurada corretamente
   - Verifique se a API permite requisições do domínio deste frontend

## ⚠️ Troubleshooting

### Erro: "Failed to fetch" ou "Network Error"

- ✅ Verifique se `NEXT_PUBLIC_API_URL` está configurada corretamente
- ✅ Verifique se a API externa está online e acessível
- ✅ Verifique se há problemas de CORS na API

### Erro: "401 Unauthorized"

- ✅ Verifique se o token JWT está sendo enviado corretamente
- ✅ Verifique se o token não expirou (faça login novamente)
- ✅ Verifique se a API está validando o token corretamente

### Erro: "CORS policy"

- ✅ A API externa precisa ter CORS configurado
- ✅ Verifique se o domínio deste frontend está na lista de origens permitidas
- ✅ Verifique se os headers necessários estão sendo enviados

## 📚 Documentação Relacionada

- `README.md` - Documentação geral do projeto
- `src/lib/api.ts` - Código do cliente de API
- `src/context/AuthContext.tsx` - Contexto de autenticação

