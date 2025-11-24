# 🔧 Solução: Erro de CORS - Configurar na API

## ❌ Erro Atual

```
Access to fetch at 'http://localhost:3000/api/point' from origin 'http://localhost:3001' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

## ✅ Solução

O problema está no **projeto da API** (que está rodando em `localhost:3000`). Você precisa configurar CORS lá para permitir requisições de `http://localhost:3001`.

---

## 🔧 Passo a Passo para Configurar CORS na API

### Opção 1: Usar Middleware Next.js (Recomendado)

Se a API é um projeto Next.js (como parece ser), configure o middleware:

#### 1. Verificar/Criar `src/middleware.ts` no projeto da API

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Headers CORS
  const response = NextResponse.next();
  
  const origin = request.headers.get('origin');
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:3000',  // Própria API
    'http://localhost:3001',   // Frontend appatleta
    'http://localhost:5173',  // Vite (se usar)
  ];
  
  // Se a origem está na lista de permitidas, adiciona headers CORS
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Trata requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 2. Reiniciar o servidor da API

```bash
# No projeto da API
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

---

### Opção 2: Configurar em Cada Rota da API

Se preferir configurar em cada rota individualmente:

#### Exemplo: `src/app/api/point/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  if (origin === 'http://localhost:3001' || origin === 'http://localhost:3000') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
  
  return new NextResponse(null, { status: 204 });
}

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  // ... sua lógica de busca de points ...
  const data = []; // seus dados
  
  const response = NextResponse.json(data);
  
  // Adiciona headers CORS se necessário
  if (origin === 'http://localhost:3001' || origin === 'http://localhost:3000') {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}
```

**⚠️ Repetir isso em TODAS as rotas da API que precisam ser acessadas pelo frontend.**

---

### Opção 3: Usar Variável de Ambiente (Mais Flexível)

#### 1. No projeto da API, crie/edite `.env.local`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### 2. Use no middleware ou nas rotas:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];
```

---

## 🧪 Testar se Funcionou

### 1. Reinicie o servidor da API

```bash
# No projeto da API
# Pare (Ctrl+C) e inicie novamente
npm run dev
```

### 2. Teste no navegador

1. Abra o frontend: http://localhost:3001
2. Abra DevTools (F12) → Network
3. Tente fazer uma requisição (login, carregar dados, etc.)
4. Verifique se não há mais erro de CORS

### 3. Verificar Headers CORS

Na aba Network do DevTools, clique em uma requisição e veja os headers de resposta:

```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

---

## ⚠️ Importante

### Para Produção

Quando fizer deploy, adicione também o domínio de produção:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://sua-api.vercel.app',      // API em produção
  'https://appatleta.vercel.app',    // Frontend em produção
];
```

Ou use variável de ambiente:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,https://sua-api.vercel.app,https://appatleta.vercel.app
```

---

## 🔍 Troubleshooting

### Ainda dá erro de CORS após configurar?

1. **Verifique se o middleware está sendo executado:**
   - Adicione um `console.log` no middleware para ver se está sendo chamado

2. **Verifique se a rota está dentro do `matcher`:**
   - O `matcher: '/api/:path*'` deve cobrir todas as rotas `/api/*`

3. **Verifique se reiniciou o servidor:**
   - Mudanças no middleware só são aplicadas após reiniciar

4. **Verifique se não há outro middleware conflitante:**
   - Pode haver outro middleware que está sobrescrevendo os headers

5. **Teste com curl:**
   ```bash
   curl -H "Origin: http://localhost:3001" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        http://localhost:3000/api/point \
        -v
   ```
   Deve retornar headers CORS.

---

## ✅ Resumo Rápido

1. **No projeto da API**, configure CORS no middleware ou nas rotas
2. **Permita** `http://localhost:3001` nas origens permitidas
3. **Reinicie** o servidor da API
4. **Teste** o frontend em `http://localhost:3001`

**Após seguir estes passos, o erro de CORS deve ser resolvido!** ✅

