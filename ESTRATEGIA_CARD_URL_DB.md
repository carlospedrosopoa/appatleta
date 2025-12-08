# 💾 Estratégia: Guardar URL do Card no Banco de Dados

## 🎯 Proposta

Guardar a URL do card gerado no Google Cloud Storage diretamente na tabela `Partida`.

---

## ✅ Vantagens de Guardar URL no DB

1. **Performance**: Busca rápida (não precisa verificar GCS toda vez)
2. **Simplicidade**: Backend só precisa ler do DB
3. **Rastreabilidade**: Sabe quando card foi gerado/atualizado
4. **Controle**: Pode invalidar/regenerar quando necessário
5. **Histórico**: Pode manter histórico de cards antigos

---

## 📊 Estrutura Sugerida

### Opção 1: Campo Simples (Recomendado)

```sql
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardUrl" TEXT;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_partida_card_url ON "Partida"("cardUrl") WHERE "cardUrl" IS NOT NULL;
```

**Campos:**
- `cardUrl`: URL completa do card no GCS (ex: `https://storage.googleapis.com/bucket/cards/partida-123.png`)

**Quando atualizar:**
- ✅ Quando card é gerado pela primeira vez
- ✅ Quando placar é atualizado (regenera card)
- ✅ NULL quando card ainda não foi gerado

---

### Opção 2: Campos Adicionais (Mais Controle)

```sql
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardUrl" TEXT,
ADD COLUMN IF NOT EXISTS "cardGeradoEm" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "cardVersao" INTEGER DEFAULT 0;
```

**Campos:**
- `cardUrl`: URL do card no GCS
- `cardGeradoEm`: Quando foi gerado/atualizado
- `cardVersao`: Versão do card (incrementa quando regenera)

**Vantagens:**
- ✅ Sabe quando card foi gerado
- ✅ Pode controlar versões
- ✅ Pode invalidar cards antigos

---

## 🔄 Fluxo de Funcionamento

### 1. Criar Partida
```
1. Usuário cria partida (sem placar ainda)
2. cardUrl = NULL (card ainda não existe)
3. Quando usuário visualizar card pela primeira vez → gera e salva URL
```

### 2. Visualizar Card (Primeira Vez)
```
1. Backend verifica: cardUrl existe no DB?
2. Se NÃO existe:
   - Gera card
   - Salva no GCS: cards/partida-{id}.png
   - Atualiza DB: cardUrl = 'https://storage.googleapis.com/...'
   - Retorna card
3. Se EXISTE:
   - Verifica se arquivo existe no GCS (opcional)
   - Retorna URL do GCS ou faz redirect
```

### 3. Atualizar Placar
```
1. Usuário atualiza placar
2. Backend:
   - Atualiza placar no DB
   - cardUrl = NULL (invalida card antigo)
   - OU: cardVersao++ (incrementa versão)
3. Próxima visualização:
   - Detecta que cardUrl é NULL ou versão mudou
   - Regenera card com novo placar
   - Atualiza cardUrl no DB
```

---

## 💻 Implementação Sugerida

### Backend - Endpoint GET /card/partida/[id]

```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const partidaId = params.id;
  
  // 1. Busca partida no DB
  const partida = await query('SELECT *, "cardUrl" FROM "Partida" WHERE id = $1', [partidaId]);
  
  if (!partida) {
    return NextResponse.json({ error: 'Partida não encontrada' }, { status: 404 });
  }
  
  // 2. Verifica se card já existe
  if (partida.cardUrl) {
    // Verifica se arquivo ainda existe no GCS (opcional)
    const fileExists = await verificarArquivoGCS(partida.cardUrl);
    
    if (fileExists) {
      // Opção A: Retorna URL do GCS (redirect ou URL direta)
      return NextResponse.redirect(partida.cardUrl);
      
      // Opção B: Baixa do GCS e retorna (mantém compatibilidade atual)
      const cardBuffer = await baixarDoGCS(partida.cardUrl);
      return new Response(cardBuffer, {
        headers: { 'Content-Type': 'image/png' }
      });
    }
  }
  
  // 3. Card não existe ou foi deletado → Gera novo
  const cardBuffer = await gerarCard(partida);
  const cardUrl = await salvarNoGCS(`cards/partida-${partidaId}.png`, cardBuffer);
  
  // 4. Atualiza URL no DB
  await query('UPDATE "Partida" SET "cardUrl" = $1 WHERE id = $2', [cardUrl, partidaId]);
  
  // 5. Retorna card
  return new Response(cardBuffer, {
    headers: { 'Content-Type': 'image/png' }
  });
}
```

### Backend - Atualizar Placar

```typescript
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const partidaId = params.id;
  const { gamesTime1, gamesTime2, tiebreakTime1, tiebreakTime2 } = await request.json();
  
  // 1. Atualiza placar
  await query(
    `UPDATE "Partida" 
     SET "gamesTime1" = $1, "gamesTime2" = $2, 
         "tiebreakTime1" = $3, "tiebreakTime2" = $4,
         "cardUrl" = NULL,  -- ← Invalida card antigo
         "updatedAt" = NOW()
     WHERE id = $5`,
    [gamesTime1, gamesTime2, tiebreakTime1, tiebreakTime2, partidaId]
  );
  
  // 2. Opcional: Deleta card antigo do GCS
  const partidaAntiga = await query('SELECT "cardUrl" FROM "Partida" WHERE id = $1', [partidaId]);
  if (partidaAntiga.cardUrl) {
    await deletarDoGCS(partidaAntiga.cardUrl);
  }
  
  return NextResponse.json({ success: true });
}
```

---

## 🎯 Estratégias de Invalidação

### Estratégia 1: NULL quando placar muda (Simples)

```sql
-- Quando placar é atualizado
UPDATE "Partida" SET "cardUrl" = NULL WHERE id = $1;
```

**Vantagens:**
- ✅ Simples
- ✅ Próxima visualização regenera automaticamente

**Desvantagens:**
- ⚠️ Perde histórico (não sabe qual era a URL antiga)

---

### Estratégia 2: Versão (Mais Controle)

```sql
-- Quando placar é atualizado
UPDATE "Partida" 
SET "cardVersao" = "cardVersao" + 1, 
    "cardUrl" = NULL 
WHERE id = $1;
```

**Vantagens:**
- ✅ Mantém controle de versões
- ✅ Pode manter cards antigos no GCS (se quiser)

---

### Estratégia 3: Timestamp (Rastreabilidade)

```sql
-- Quando placar é atualizado
UPDATE "Partida" 
SET "cardUrl" = NULL,
    "cardGeradoEm" = NULL
WHERE id = $1;
```

**Vantagens:**
- ✅ Sabe quando card foi gerado
- ✅ Pode invalidar cards muito antigos

---

## 📝 Migration SQL Sugerida

```sql
-- Adicionar campo cardUrl na tabela Partida
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardUrl" TEXT;

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_partida_card_url 
ON "Partida"("cardUrl") 
WHERE "cardUrl" IS NOT NULL;

-- Opcional: Campos adicionais para controle
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardGeradoEm" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "cardVersao" INTEGER DEFAULT 0;
```

---

## 🔄 Fluxo Completo

### Cenário 1: Criar Partida → Visualizar Card

```
1. Criar partida (sem placar)
   DB: cardUrl = NULL

2. Usuário clica "Ver Card"
   Backend: cardUrl é NULL → Gera card → Salva no GCS → Atualiza DB
   DB: cardUrl = 'https://storage.googleapis.com/.../partida-123.png'

3. Próxima visualização
   Backend: cardUrl existe → Retorna do GCS (rápido!)
```

### Cenário 2: Atualizar Placar

```
1. Usuário atualiza placar
   Backend: Atualiza placar + cardUrl = NULL
   DB: cardUrl = NULL (card antigo invalidado)

2. Usuário visualiza card novamente
   Backend: cardUrl é NULL → Regenera com novo placar → Atualiza DB
   DB: cardUrl = 'https://storage.googleapis.com/.../partida-123.png' (novo)
```

---

## ✅ Recomendação Final

### **Guardar URL no DB + Invalidar quando placar muda**

**Estrutura mínima:**
```sql
ALTER TABLE "Partida" ADD COLUMN "cardUrl" TEXT;
```

**Fluxo:**
1. ✅ Guardar URL quando card é gerado
2. ✅ Invalidar (NULL) quando placar é atualizado
3. ✅ Regenerar na próxima visualização

**Vantagens:**
- ✅ Simples de implementar
- ✅ Performance excelente (busca rápida)
- ✅ Controle sobre quando regenerar
- ✅ Compatível com cache no GCS

---

## 🚀 Próximos Passos

1. **Adicionar campo no DB**: `cardUrl TEXT`
2. **Atualizar endpoint**: Verificar `cardUrl` antes de gerar
3. **Invalidar ao atualizar placar**: `cardUrl = NULL`
4. **Opcional**: Adicionar `cardGeradoEm` para rastreabilidade

---

**Resposta curta:** Sim! Guardar URL no DB é a melhor prática. ✅

