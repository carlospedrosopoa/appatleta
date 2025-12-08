# ✅ Implementação: Guardar URL do Card no Banco de Dados

## 📋 Resumo

Implementação completa do sistema de cache de cards usando Google Cloud Storage e banco de dados.

---

## 🎯 O que foi implementado

### 1. **Serviço Google Cloud Storage** (`src/lib/gcsService.ts`)
- ✅ Funções para salvar, baixar, verificar e deletar arquivos no GCS
- ✅ Verificação automática se GCS está configurado
- ✅ Tratamento de erros robusto

### 2. **Serviço de Cards** (`src/lib/cardService.ts`)
- ✅ `obterCardPartida()`: Busca card do cache ou gera novo
- ✅ `invalidarCardPartida()`: Invalida card quando placar muda
- ✅ Integração com GCS e banco de dados

### 3. **Endpoint de Card** (`src/app/api/card/partida/[id]/route.ts`)
- ✅ `GET /api/card/partida/[id]`: Retorna card da partida
- ✅ Verifica cache antes de gerar
- ✅ Retorna imagem PNG com headers apropriados

### 4. **Endpoint de Atualização** (`src/app/api/partida/[id]/route.ts`)
- ✅ `PUT /api/partida/[id]`: Atualiza partida (principalmente placar)
- ✅ Invalida card automaticamente ao atualizar placar

### 5. **Atualização do Serviço de Partida** (`src/lib/partidaService.ts`)
- ✅ `atualizarPlacar()`: Invalida card ao atualizar placar
- ✅ `listarPartidas()` e `criarPartida()`: Já retornam `cardUrl` (via SELECT p.*)

---

## 🔄 Fluxo de Funcionamento

### Criar Partida
```
1. Usuário cria partida
   → cardUrl = NULL (card ainda não existe)

2. Usuário visualiza card pela primeira vez
   → Backend: cardUrl é NULL → Gera card → Salva no GCS → Atualiza DB
   → DB: cardUrl = 'https://storage.googleapis.com/.../partida-123.png'
```

### Visualizar Card (Cache Hit)
```
1. Usuário visualiza card novamente
   → Backend: cardUrl existe → Verifica GCS → Retorna do cache (rápido!)
```

### Atualizar Placar
```
1. Usuário atualiza placar
   → Backend: PUT /api/partida/[id]
   → Invalida card (deleta do GCS + cardUrl = NULL no DB)

2. Usuário visualiza card novamente
   → Backend: cardUrl é NULL → Regenera com novo placar → Salva no GCS → Atualiza DB
```

---

## 📦 Dependências Necessárias

### Google Cloud Storage SDK
```bash
npm install @google-cloud/storage
```

### Variáveis de Ambiente
Adicione ao `.env.local`:
```env
GOOGLE_CLOUD_PROJECT_ID=seu-project-id
GOOGLE_CLOUD_BUCKET_NAME=seu-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
```

**Ou** configure via variáveis de ambiente do Google Cloud (recomendado para produção).

---

## 🗄️ Migração do Banco de Dados

Execute o script SQL:
```bash
# Execute MIGRACAO_CARD_URL.sql no seu banco de dados
```

Isso adiciona:
- `cardUrl` (TEXT): URL do card no GCS
- `cardGeradoEm` (TIMESTAMP): Quando foi gerado
- `cardVersao` (INTEGER): Versão do card

---

## 🎨 Geração de Card (TODO)

A função `gerarCardBuffer()` em `src/lib/cardService.ts` ainda precisa ser implementada.

**Opções de bibliotecas:**
1. **Canvas** (`canvas`): Para Node.js, similar ao HTML5 Canvas
2. **Sharp** (`sharp`): Processamento de imagens rápido
3. **Jimp** (`jimp`): Processamento de imagens puro JavaScript

**Exemplo com Canvas:**
```typescript
import { createCanvas, loadImage } from 'canvas';

async function gerarCardBuffer(partida: any): Promise<Buffer> {
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // Desenhar fundo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1200, 630);
  
  // Adicionar informações da partida
  ctx.fillStyle = '#000000';
  ctx.font = '48px Arial';
  ctx.fillText(`Partida: ${partida.local}`, 50, 100);
  
  // Adicionar fotos dos atletas (baixar do GCS)
  // const foto1 = await loadImage(partida.atleta1FotoUrl);
  // ctx.drawImage(foto1, 100, 200, 200, 200);
  
  // Exportar como PNG
  return canvas.toBuffer('image/png');
}
```

---

## ✅ Checklist de Implementação

- [x] Criar `gcsService.ts` com funções de GCS
- [x] Criar `cardService.ts` com lógica de cache
- [x] Criar endpoint `GET /api/card/partida/[id]`
- [x] Criar endpoint `PUT /api/partida/[id]`
- [x] Atualizar `atualizarPlacar()` para invalidar card
- [x] Adicionar campos no banco de dados (SQL)
- [x] Atualizar tipos TypeScript (`Partida` interface)
- [ ] **PENDENTE**: Implementar `gerarCardBuffer()` (geração real do card)
- [ ] **PENDENTE**: Configurar Google Cloud Storage
- [ ] **PENDENTE**: Instalar `@google-cloud/storage`

---

## 🚀 Próximos Passos

1. **Instalar dependência:**
   ```bash
   npm install @google-cloud/storage
   ```

2. **Configurar Google Cloud Storage:**
   - Criar bucket no GCS
   - Criar service account
   - Configurar variáveis de ambiente

3. **Implementar geração de card:**
   - Escolher biblioteca (Canvas/Sharp/Jimp)
   - Implementar `gerarCardBuffer()` em `cardService.ts`
   - Testar geração de card

4. **Testar fluxo completo:**
   - Criar partida
   - Visualizar card (deve gerar)
   - Visualizar card novamente (deve usar cache)
   - Atualizar placar
   - Visualizar card (deve regenerar)

---

## 📝 Notas Importantes

1. **GCS não configurado**: O sistema funciona mesmo sem GCS configurado, mas sempre regenera o card (sem cache).

2. **Geração de card**: A função `gerarCardBuffer()` lança erro se não estiver implementada. Implemente antes de usar em produção.

3. **Performance**: Com GCS configurado, cards são servidos do cache (muito rápido). Sem GCS, sempre regenera (mais lento).

4. **Invalidação**: Cards são invalidados automaticamente quando placar é atualizado.

---

## 🔍 Testando

### Teste 1: Criar Partida
```bash
POST /api/partida/criarPartida
# cardUrl deve ser null
```

### Teste 2: Visualizar Card (Primeira Vez)
```bash
GET /api/card/partida/{id}
# Deve gerar card e retornar PNG
# Verificar DB: cardUrl deve estar preenchido
```

### Teste 3: Visualizar Card (Cache)
```bash
GET /api/card/partida/{id}
# Deve retornar do cache (rápido)
```

### Teste 4: Atualizar Placar
```bash
PUT /api/partida/{id}
{
  "gamesTime1": 6,
  "gamesTime2": 4
}
# Verificar DB: cardUrl deve ser NULL
```

### Teste 5: Visualizar Card Após Atualizar
```bash
GET /api/card/partida/{id}
# Deve regenerar card com novo placar
```

---

**Status:** ✅ Estrutura completa implementada. Pendente: Configurar GCS e implementar geração de card.

