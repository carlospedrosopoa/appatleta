# 🧪 Guia Postman - Editar Usuário e Troca de Senha

## 📋 Requisições para Testar Edição de Usuário

### 1️⃣ Primeiro: Fazer Login como ADMIN

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@exemplo.com",
  "password": "senhaDoAdmin"
}
```

**Resposta:**
```json
{
  "usuario": {
    "id": "uuid-do-admin",
    "nome": "Admin",
    "email": "admin@exemplo.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**⚠️ IMPORTANTE:** Copie o `token` da resposta para usar nas próximas requisições!

---

### 2️⃣ Listar Usuários (para obter o ID)

**Método:** `GET`  
**URL:** `http://localhost:3000/api/user/list`

**Authorization:**
- **Type:** Bearer Token
- **Token:** `<token-copiado-do-login>`

**Ou manualmente no Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Resposta:**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João Silva",
    "email": "joao@exemplo.com",
    "role": "USER",
    "pointIdGestor": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "987e6543-e21b-34d5-b789-123456789abc",
    "name": "Maria Santos",
    "email": "maria@exemplo.com",
    "role": "USER",
    "pointIdGestor": null,
    "createdAt": "2024-01-02T00:00:00.000Z"
  }
]
```

**⚠️ IMPORTANTE:** Copie o `id` do usuário que deseja editar!

---

### 3️⃣ Atualizar Senha do Usuário

**Método:** `PUT`  
**URL:** `http://localhost:3000/api/user/{id-do-usuario}`

**Exemplo de URL:**
```
http://localhost:3000/api/user/123e4567-e89b-12d3-a456-426614174000
```

**Authorization:**
- **Type:** Bearer Token
- **Token:** `<token-copiado-do-login>`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body (raw JSON) - Apenas Senha:**
```json
{
  "password": "novaSenha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "role": "USER",
  "pointIdGestor": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### 4️⃣ Atualizar Múltiplos Campos (incluindo senha)

**Método:** `PUT`  
**URL:** `http://localhost:3000/api/user/{id-do-usuario}`

**Authorization:** Bearer Token (mesmo token do login)

**Body (raw JSON):**
```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com",
  "role": "USER",
  "password": "novaSenha456",
  "pointIdGestor": null
}
```

---

### 5️⃣ Atualizar SEM Alterar Senha

**Método:** `PUT`  
**URL:** `http://localhost:3000/api/user/{id-do-usuario}`

**Authorization:** Bearer Token

**Body (raw JSON):**
```json
{
  "name": "João Silva Atualizado",
  "email": "joao.novo@exemplo.com",
  "role": "USER"
}
```

*Nota: Como não enviamos o campo `password`, a senha não será alterada.*

---

### 6️⃣ Testar Login com Nova Senha

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

**Body (raw JSON):**
```json
{
  "email": "joao@exemplo.com",
  "password": "novaSenha123"
}
```

**Se funcionar:** Você receberá um novo token JWT.  
**Se não funcionar:** A senha não foi alterada corretamente.

---

## 🎯 Exemplos Completos

### Exemplo 1: Trocar apenas a senha

```http
PUT http://localhost:3000/api/user/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImVtYWlsIjoiYWRtaW5AZXhlbXBsby5jb20iLCJub21lIjoiQWRtaW4iLCJyb2xlIjoiQURNSU4ifQ...
Content-Type: application/json

{
  "password": "minhaNovaSenha123"
}
```

### Exemplo 2: Atualizar nome, email e senha

```http
PUT http://localhost:3000/api/user/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "João da Silva",
  "email": "joao.silva@exemplo.com",
  "password": "novaSenhaSegura123"
}
```

### Exemplo 3: Atualizar role e vincular a uma arena (ORGANIZER)

```http
PUT http://localhost:3000/api/user/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "role": "ORGANIZER",
  "pointIdGestor": "uuid-da-arena",
  "password": "senhaDoOrganizador123"
}
```

---

## ⚠️ Possíveis Erros

### Erro 401 - Não autorizado
```
{
  "mensagem": "Não autorizado"
}
```
**Solução:** Verifique se o token JWT está correto e não expirou. Faça login novamente.

### Erro 403 - Acesso negado
```
{
  "mensagem": "Acesso negado. Apenas administradores podem atualizar usuários."
}
```
**Solução:** Você precisa estar logado como ADMIN.

### Erro 404 - Usuário não encontrado
```
{
  "mensagem": "Usuário não encontrado"
}
```
**Solução:** Verifique se o ID do usuário está correto.

### Erro 400 - Email já em uso
```
{
  "mensagem": "Este email já está em uso por outro usuário"
}
```
**Solução:** O email que você está tentando usar já pertence a outro usuário.

---

## 🔍 Dicas

1. **Use variáveis no Postman:**
   - Crie uma variável `base_url` = `http://localhost:3000`
   - Crie uma variável `token` = `<seu-token-jwt>`
   - Use: `{{base_url}}/api/user/{{user_id}}`

2. **Teste o fluxo completo:**
   - Login → Listar usuários → Editar usuário → Testar login com nova senha

3. **Verifique os logs do servidor:**
   - Se a senha não estiver sendo salva, verifique o console do servidor
   - Procure por mensagens como "Hash de senha gerado" ou "Senha será atualizada"

4. **Senha vazia:**
   - Se enviar `"password": ""` ou não enviar o campo, a senha NÃO será alterada
   - Isso é intencional para permitir atualizar outros campos sem mudar a senha

---

## ✅ Checklist de Teste

- [ ] Fazer login como ADMIN
- [ ] Copiar o token JWT
- [ ] Listar usuários e copiar um ID
- [ ] Atualizar apenas a senha do usuário
- [ ] Verificar resposta 200
- [ ] Fazer login com o email do usuário e a nova senha
- [ ] Confirmar que o login funciona com a nova senha

---

**Pronto para testar! 🚀**

