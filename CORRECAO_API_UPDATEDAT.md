# 🔧 Correção: Erro updatedAt na Criação de Partida

## 🐛 Problema

Ao criar uma nova partida, ocorre o erro:

```
null value in column "updatedAt" of relation "Partida" violates not-null constraint
```

## 🔍 Causa

O INSERT na função `criarPartida` (arquivo `src/lib/partidaService.ts`) não inclui o campo `updatedAt`, mas o banco de dados exige que esse campo não seja NULL.

**Código atual (linha 28-30):**
```typescript
await query(
  `INSERT INTO "Partida" (id, data, local, "atleta1Id", "atleta2Id", "atleta3Id", "atleta4Id", "gamesTime1", "gamesTime2", "tiebreakTime1", "tiebreakTime2", "createdAt") 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
  [...]
);
```

## ✅ Solução

Adicionar o campo `updatedAt` no INSERT com valor `NOW()`:

**Código corrigido:**
```typescript
await query(
  `INSERT INTO "Partida" (id, data, local, "atleta1Id", "atleta2Id", "atleta3Id", "atleta4Id", "gamesTime1", "gamesTime2", "tiebreakTime1", "tiebreakTime2", "createdAt", "updatedAt") 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
  [
    partidaId,
    new Date(dados.data),
    dados.local,
    dados.atleta1Id,
    dados.atleta2Id,
    dados.atleta3Id || null,
    dados.atleta4Id || null,
    dados.gamesTime1 || null,
    dados.gamesTime2 || null,
    dados.tiebreakTime1 || null,
    dados.tiebreakTime2 || null,
  ]
);
```

**OU** (se preferir usar apenas um NOW() para ambos):

```typescript
const agora = new Date();
await query(
  `INSERT INTO "Partida" (id, data, local, "atleta1Id", "atleta2Id", "atleta3Id", "atleta4Id", "gamesTime1", "gamesTime2", "tiebreakTime1", "tiebreakTime2", "createdAt", "updatedAt") 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)`,
  [
    partidaId,
    new Date(dados.data),
    dados.local,
    dados.atleta1Id,
    dados.atleta2Id,
    dados.atleta3Id || null,
    dados.atleta4Id || null,
    dados.gamesTime1 || null,
    dados.gamesTime2 || null,
    dados.tiebreakTime1 || null,
    dados.tiebreakTime2 || null,
    agora,
    agora,
  ]
);
```

## 📝 Arquivo a Corrigir

**Caminho:** `src/lib/partidaService.ts`  
**Função:** `criarPartida`  
**Linha:** ~28-44

## ⚠️ Importante

Esta correção precisa ser feita na **API externa**, não no frontend. O frontend apenas consome a API e não tem acesso ao código do banco de dados.

## 🧪 Como Testar

Após corrigir na API:

1. Tente criar uma nova partida pelo frontend
2. Verifique se a partida é criada com sucesso
3. Confirme que o campo `updatedAt` foi preenchido corretamente no banco

---

**Status:** ⚠️ Aguardando correção na API externa

