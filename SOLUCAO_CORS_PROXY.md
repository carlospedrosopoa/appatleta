# 🔧 Solução CORS: Proxy Automático

## ✅ Solução Implementada

Foi criada uma rota proxy automática em `/api/proxy/[...path]` que resolve problemas de CORS automaticamente.

### Como Funciona

1. **Detecção Automática**: O cliente API (`src/lib/api.ts`) detecta automaticamente quando a API externa está em `localhost:3000` e o frontend em `localhost:3001`
2. **Proxy Automático**: Quando detectado, todas as requisições são redirecionadas para `/api/proxy/*` que faz proxy para a API externa
3. **Sem CORS**: Como o proxy roda no servidor Next.js, não há problemas de CORS

### Configuração

Certifique-se de que `NEXT_PUBLIC_API_URL` está configurada no `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Exemplo de Uso

Quando você faz:
```typescript
await api.get('/point?apenasAtivos=true');
```

O sistema automaticamente:
1. Detecta que é `localhost:3000` (porta diferente)
2. Redireciona para `/api/proxy/point?apenasAtivos=true`
3. O proxy faz a requisição do servidor para `http://localhost:3000/api/point?apenasAtivos=true`
4. Retorna a resposta sem problemas de CORS

## 🔄 Solução Alternativa: Configurar CORS na API Externa

Se preferir não usar o proxy, você pode configurar CORS diretamente na API externa. Veja `SOLUCAO_CORS_API.md` para instruções detalhadas.

## ⚠️ Nota

O proxy é uma solução temporária para desenvolvimento. Em produção, recomenda-se configurar CORS corretamente na API externa.

