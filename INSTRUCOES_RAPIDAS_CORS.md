# ⚡ Instruções Rápidas - Corrigir CORS

## 🔴 Problema

Frontend em `localhost:3001` não consegue acessar API em `localhost:3000` por causa de CORS.

## ✅ Solução Rápida (2 minutos)

### No Projeto da API (localhost:3000)

#### 1. Criar/Editar `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const origin = request.headers.get('origin');
  
  // Permite localhost:3001 (frontend appatleta)
  if (origin === 'http://localhost:3001' || origin === 'http://localhost:3000') {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  // Trata OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

#### 2. Reiniciar Servidor da API

```bash
# No projeto da API
# Pare (Ctrl+C) e inicie novamente
npm run dev
```

#### 3. Testar

Acesse `http://localhost:3001` e teste novamente. O erro de CORS deve desaparecer!

---

## 📝 Alternativa: Usar Variável de Ambiente

Se preferir usar variável de ambiente:

### 1. No `.env.local` da API:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2. No middleware:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
];

if (origin && allowedOrigins.includes(origin)) {
  // ... adiciona headers CORS
}
```

---

**Pronto! Após reiniciar a API, o CORS deve funcionar!** ✅

