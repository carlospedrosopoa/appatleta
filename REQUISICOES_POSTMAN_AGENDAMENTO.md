# Requisições Postman - Agendamento

## 🔐 Autenticação

Todas as requisições precisam do header de autenticação:

```
Authorization: Bearer [SEU_TOKEN_JWT]
```

**Como obter o token:**
1. Faça login em `/api/auth/login`
2. Copie o `token` da resposta
3. Use no header `Authorization: Bearer [token]`

---

## 1. Listar Arenas (Points)

**GET** `http://localhost:3000/api/point?apenasAtivos=true`

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_JWT]
Content-Type: application/json
```

**Resposta esperada (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Arena Exemplo",
    "endereco": "Rua Exemplo, 123",
    "telefone": "(11) 99999-9999",
    "email": "contato@arena.com",
    "descricao": "Descrição da arena",
    "logoUrl": "https://...",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "ativo": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 2. Obter Perfil do Atleta (para ver arenas assinantes)

**GET** `http://localhost:3000/api/atleta/me/atleta`

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_JWT]
Content-Type: application/json
```

**Resposta esperada (200):**
```json
{
  "id": "uuid",
  "nome": "Nome do Atleta",
  "dataNascimento": "1990-01-01",
  "genero": "MASCULINO",
  "categoria": "A",
  "fone": "(11) 99999-9999",
  "fotoUrl": "data:image/...",
  "usuarioId": "uuid",
  "pointIdPrincipal": "uuid-da-arena-principal",
  "arenasFrequentes": [
    {
      "id": "uuid-arena-1",
      "nome": "Arena 1",
      "logoUrl": "https://..."
    },
    {
      "id": "uuid-arena-2",
      "nome": "Arena 2",
      "logoUrl": "https://..."
    }
  ],
  "arenaPrincipal": {
    "id": "uuid-arena-principal",
    "nome": "Arena Principal",
    "logoUrl": "https://..."
  }
}
```

**Se não tiver atleta (204):**
- Status: `204 No Content`
- Body: vazio

---

## 3. Listar Agendamentos

**GET** `http://localhost:3000/api/agendamento?apenasMeus=true`

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_JWT]
Content-Type: application/json
```

**Query Parameters (opcionais):**
- `apenasMeus`: `true` para ver apenas seus agendamentos
- `quadraId`: ID da quadra para filtrar
- `status`: `CONFIRMADO`, `CANCELADO`, `CONCLUIDO`
- `dataInicio`: Data inicial (ISO string)
- `dataFim`: Data final (ISO string)

**Resposta esperada (200):**
```json
[
  {
    "id": "uuid",
    "dataHora": "2024-01-15T10:00:00.000Z",
    "duracao": 60,
    "valorCalculado": 100.00,
    "valorNegociado": 100.00,
    "observacoes": "Observações",
    "status": "CONFIRMADO",
    "quadra": {
      "id": "uuid",
      "nome": "Quadra 1",
      "point": {
        "id": "uuid",
        "nome": "Arena Exemplo"
      }
    },
    "usuario": {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com"
    }
  }
]
```

---

## 4. Listar Quadras de uma Arena

**GET** `http://localhost:3000/api/quadra?pointId=[ID_DA_ARENA]`

**Headers:**
```
Authorization: Bearer [SEU_TOKEN_JWT]
Content-Type: application/json
```

**Resposta esperada (200):**
```json
[
  {
    "id": "uuid",
    "nome": "Quadra 1",
    "pointId": "uuid-da-arena",
    "tipo": "SAIBRO",
    "capacidade": 4,
    "ativo": true,
    "point": {
      "id": "uuid-da-arena",
      "nome": "Arena Exemplo"
    }
  }
]
```

---

## 🔍 Diagnóstico do Problema

Se não estiver vindo nenhum point no agendamento, verifique:

### 1. Teste se o endpoint de points está funcionando:
```
GET http://localhost:3000/api/point?apenasAtivos=true
```

### 2. Teste se o atleta tem arenas assinantes:
```
GET http://localhost:3000/api/atleta/me/atleta
```

Verifique se retorna:
- `arenaPrincipal.id` (não nulo)
- `arenasFrequentes` (array com pelo menos uma arena)

### 3. Se o atleta não tiver arenas assinantes:
- O sistema agora mostra **todas as arenas ativas** como fallback
- Mas você deve cadastrar arenas assinantes no perfil do atleta

### 4. Verifique se as arenas estão ativas:
- Campo `ativo: true` no retorno do endpoint `/api/point`

---

## 📝 Exemplo de Requisição Completa no Postman

### Collection: Agendamento

#### 1. Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### 2. Listar Points (com token)
```
GET http://localhost:3000/api/point?apenasAtivos=true
Headers:
  Authorization: Bearer {{token}}
```

#### 3. Ver Perfil do Atleta
```
GET http://localhost:3000/api/atleta/me/atleta
Headers:
  Authorization: Bearer {{token}}
```

#### 4. Listar Agendamentos
```
GET http://localhost:3000/api/agendamento?apenasMeus=true
Headers:
  Authorization: Bearer {{token}}
```

---

## ⚠️ Problemas Comuns

### Erro 401 (Unauthorized)
- Token expirado ou inválido
- Faça login novamente

### Erro 204 (No Content) em `/atleta/me/atleta`
- Usuário não tem perfil de atleta cadastrado
- Sistema mostra todas as arenas como fallback

### Nenhum point retornado
- Verifique se há points cadastrados no banco
- Verifique se `ativo = true`
- Verifique se o filtro `apenasAtivos=true` está funcionando

### Points não aparecem no frontend
- Verifique se o atleta tem `arenaPrincipal` ou `arenasFrequentes` cadastrados
- Se não tiver, o sistema mostra todas as arenas ativas (fallback implementado)



