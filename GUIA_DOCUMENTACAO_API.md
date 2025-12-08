# 📖 Guia: Como Documentar a API para o Assistente

Este guia explica as diferentes formas de documentar sua API externa para que eu possa entender e ajudar melhor no desenvolvimento.

---

## 🎯 Opções Disponíveis

### ✅ Opção 1: Arquivo de Documentação Manual (JÁ CRIADO)

**Arquivo:** `API_DOCUMENTATION.md`

**Vantagens:**
- ✅ Simples e direto
- ✅ Fácil de manter e atualizar
- ✅ Não requer ferramentas especiais
- ✅ Já está criado e pronto para preencher

**Como usar:**
1. Abra o arquivo `API_DOCUMENTATION.md`
2. Preencha com os endpoints reais da sua API
3. Inclua exemplos de request/response
4. Salve o arquivo

**Exemplo de estrutura:**
```markdown
### POST /partida/criarPartida
Criar nova partida.

**Request Body:**
```json
{
  "data": "2024-01-15T20:00:00Z",
  "local": "Quadra Central",
  ...
}
```

**Response (201):**
```json
{
  "id": "partida-123",
  ...
}
```
```

---

### ✅ Opção 2: OpenAPI/Swagger (Recomendado para APIs grandes)

**Arquivo:** `openapi.yaml` ou `swagger.json`

**Vantagens:**
- ✅ Padrão da indústria
- ✅ Pode gerar documentação interativa
- ✅ Ferramentas de validação automática
- ✅ Suporte a múltiplas linguagens

**Como criar:**

1. **Instalar ferramenta (opcional):**
   ```bash
   npm install -g @apidevtools/swagger-cli
   ```

2. **Criar arquivo `openapi.yaml`:**
   ```yaml
   openapi: 3.0.0
   info:
     title: API App Atleta
     version: 1.0.0
   servers:
     - url: https://api.seudominio.com/api
   paths:
     /partida/criarPartida:
       post:
         summary: Criar nova partida
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 type: object
                 required:
                   - data
                   - local
                   - atleta1Id
                   - atleta2Id
                 properties:
                   data:
                     type: string
                     format: date-time
                   local:
                     type: string
                   atleta1Id:
                     type: string
         responses:
           '201':
             description: Partida criada
   ```

3. **Salvar no projeto:** `openapi.yaml` na raiz

**Ferramentas úteis:**
- [Swagger Editor](https://editor.swagger.io/) - Editor online
- [Swagger UI](https://swagger.io/tools/swagger-ui/) - Visualização interativa

---

### ✅ Opção 3: Compartilhar Código das Rotas

**Vantagens:**
- ✅ Mostra implementação real
- ✅ Inclui validações e lógica
- ✅ Mais preciso

**Como fazer:**
1. Compartilhe os arquivos de rotas da API (ex: `routes/partida.ts`)
2. Ou cole o código diretamente na conversa
3. Eu analiso e entendo a estrutura

**Exemplo:**
```typescript
// routes/partida.ts
router.post('/criarPartida', async (req, res) => {
  const { data, local, atleta1Id, atleta2Id } = req.body;
  // ...
});
```

---

### ✅ Opção 4: Collection do Postman

**Arquivo:** `postman_collection.json`

**Vantagens:**
- ✅ Já tem exemplos de requisições
- ✅ Pode importar no Postman
- ✅ Inclui variáveis e ambientes

**Como criar:**

1. **No Postman:**
   - Crie uma Collection
   - Adicione todas as rotas
   - Configure exemplos de request/response
   - Exporte como JSON

2. **Salvar no projeto:** `postman_collection.json`

3. **Ou compartilhar:** Cole o JSON na conversa

---

### ✅ Opção 5: Documentação em Código (JSDoc/TSDoc)

**Vantagens:**
- ✅ Documentação junto com o código
- ✅ Mantida automaticamente
- ✅ Suporte a autocomplete em IDEs

**Exemplo:**
```typescript
/**
 * Cria uma nova partida
 * 
 * @route POST /partida/criarPartida
 * @access Private
 * @param {string} data - Data e hora da partida (ISO 8601)
 * @param {string} local - Local da partida
 * @param {string} atleta1Id - ID do primeiro atleta (obrigatório)
 * @param {string} atleta2Id - ID do segundo atleta (obrigatório)
 * @param {string} [atleta3Id] - ID do terceiro atleta (opcional)
 * @returns {Object} Partida criada
 */
```

---

## 🎯 Recomendação

### Para Começar Agora (Rápido):
✅ **Use a Opção 1** - Arquivo `API_DOCUMENTATION.md` já criado
- Abra o arquivo
- Preencha com os endpoints reais
- Pronto!

### Para Projeto em Produção:
✅ **Use a Opção 2** - OpenAPI/Swagger
- Padrão da indústria
- Documentação interativa
- Melhor para APIs grandes

### Para Desenvolvimento Rápido:
✅ **Use a Opção 3** - Compartilhar código
- Mais rápido
- Mostra implementação real
- Bom para ajustes rápidos

---

## 📝 O Que Incluir na Documentação

### Informações Essenciais:

1. **Base URL**
   ```
   https://api.seudominio.com/api
   ```

2. **Autenticação**
   ```
   JWT Bearer Token no header Authorization
   ```

3. **Para cada endpoint:**
   - Método HTTP (GET, POST, PUT, DELETE)
   - Caminho completo (`/partida/criarPartida`)
   - Parâmetros (query, path, body)
   - Exemplo de request
   - Exemplo de response
   - Códigos de status possíveis
   - Erros possíveis

4. **Estrutura de dados**
   - Tipos de campos
   - Campos obrigatórios vs opcionais
   - Validações
   - Formatos (data, número, etc.)

---

## 🚀 Próximos Passos

1. **Escolha uma opção** acima
2. **Documente os endpoints** principais:
   - `/auth/login`
   - `/atleta/listarAtletas`
   - `/partida/criarPartida`
   - `/partida/listarPartidas`
   - `/agendamento`
3. **Salve no projeto** ou compartilhe comigo
4. **Atualize quando** adicionar novos endpoints

---

## 💡 Dica Extra

Se você tem acesso ao código da API, posso ajudar a:
- Gerar documentação automaticamente
- Criar arquivo OpenAPI/Swagger
- Validar se os endpoints estão corretos
- Sugerir melhorias na estrutura

**Basta compartilhar o código das rotas!**

---

**Arquivo criado:** `API_DOCUMENTATION.md` - Preencha com os endpoints reais da sua API! 📝

