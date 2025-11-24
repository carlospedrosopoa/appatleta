# 🧪 Guia de Testes no Postman

Este guia mostra como testar as APIs do sistema usando o Postman.

## 📋 Pré-requisitos

- Postman instalado
- Servidor rodando localmente (`npm run dev`)
- Banco de dados configurado e acessível
- Um usuário criado no banco de dados

---

## 🔐 1. Testar Login

### Configuração da Requisição

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`

### Headers
```
Content-Type: application/json
```

### Body (raw JSON)
```json
{
  "email": "admin@exemplo.com",
  "password": "senha123"
}
```

### Resposta de Sucesso (200)
```json
{
  "usuario": {
    "id": "uuid-do-usuario",
    "nome": "Nome do Usuário",
    "email": "admin@exemplo.com",
    "role": "ADMIN"
  },
  "user": {
    "id": "uuid-do-usuario",
    "nome": "Nome do Usuário",
    "email": "admin@exemplo.com",
    "role": "ADMIN"
  }
}
```

### Respostas de Erro
- **400**: `{ "mensagem": "Informe email e senha." }`
- **401**: `{ "mensagem": "Usuário não encontrado" }` ou `{ "mensagem": "Senha incorreta" }`

---

## 🔒 2. Testar Rotas Protegidas (Basic Auth)

Todas as rotas protegidas usam **Basic Authentication**. Você precisa configurar isso no Postman.

### Opção 1: Usando a aba Authorization do Postman (Recomendado)

1. Na requisição, vá para a aba **Authorization**
2. Selecione **Type: Basic Auth**
3. Preencha:
   - **Username**: Seu email (ex: `admin@exemplo.com`)
   - **Password**: Sua senha (ex: `senha123`)
4. O Postman automaticamente adiciona o header `Authorization: Basic <base64>`

### Opção 2: Manualmente no Header

1. Vá para a aba **Headers**
2. Adicione:
   - **Key**: `Authorization`
   - **Value**: `Basic <base64(email:senha)>`
   
   Para gerar o base64, você pode usar:
   - Online: https://www.base64encode.org/
   - No terminal: `echo -n "email:senha" | base64`

---

## 📝 Exemplos de Rotas Protegidas

### 2.1. Listar Usuários (apenas ADMIN)

**Método:** `GET`  
**URL:** `http://localhost:3000/api/user/list`  
**Authorization:** Basic Auth (email e senha de um ADMIN)

**Resposta (200):**
```json
[
  {
    "id": "uuid",
    "name": "Nome",
    "email": "email@exemplo.com",
    "role": "ADMIN",
    "pointIdGestor": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 2.2. Atualizar Usuário (apenas ADMIN)

**Método:** `PUT`  
**URL:** `http://localhost:3000/api/user/{id}`  
**Authorization:** 
- **JWT (Recomendado):** `Bearer <token>` (obtido no login)
- **Basic Auth (Fallback):** Basic Auth (email e senha de um ADMIN)

**Exemplo de URL:**
```
http://localhost:3000/api/user/123e4567-e89b-12d3-a456-426614174000
```

#### Exemplo 1: Atualizar apenas a senha

**Body (raw JSON):**
```json
{
  "password": "novaSenha123"
}
```

#### Exemplo 2: Atualizar nome e senha

**Body (raw JSON):**
```json
{
  "name": "Novo Nome",
  "password": "novaSenha123"
}
```

#### Exemplo 3: Atualizar todos os campos

**Body (raw JSON):**
```json
{
  "name": "Novo Nome",
  "email": "novo-email@exemplo.com",
  "role": "USER",
  "password": "novaSenha123",
  "pointIdGestor": null
}
```

#### Exemplo 4: Atualizar sem alterar senha (deixar senha em branco)

**Body (raw JSON):**
```json
{
  "name": "Novo Nome",
  "email": "novo-email@exemplo.com",
  "role": "ADMIN"
}
```
*Nota: Se não enviar o campo `password` ou enviar vazio, a senha não será alterada.*

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Novo Nome",
  "email": "novo-email@exemplo.com",
  "role": "USER",
  "pointIdGestor": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z"
}
```

**Respostas de Erro:**
- **400**: `{ "mensagem": "Este email já está em uso por outro usuário" }`
- **401**: `{ "mensagem": "Não autorizado" }`
- **403**: `{ "mensagem": "Acesso negado. Apenas administradores podem atualizar usuários." }`
- **404**: `{ "mensagem": "Usuário não encontrado" }`

---

### 📋 Passo a Passo para Testar Troca de Senha

1. **Faça login como ADMIN** para obter o token JWT:
   ```
   POST http://localhost:3000/api/auth/login
   Body: { "email": "admin@exemplo.com", "password": "senhaAtual" }
   ```
   Copie o `token` da resposta.

2. **Liste os usuários** para obter o ID do usuário que deseja editar:
   ```
   GET http://localhost:3000/api/user/list
   Authorization: Bearer <token-do-passo-1>
   ```
   Copie o `id` do usuário desejado.

3. **Atualize a senha do usuário**:
   ```
   PUT http://localhost:3000/api/user/{id-do-usuario}
   Authorization: Bearer <token-do-passo-1>
   Body: { "password": "novaSenha123" }
   ```

4. **Teste o login com a nova senha**:
   ```
   POST http://localhost:3000/api/auth/login
   Body: { "email": "email-do-usuario@exemplo.com", "password": "novaSenha123" }
   ```

---

### 2.3. Listar Agendamentos

**Método:** `GET`  
**URL:** `http://localhost:3000/api/agendamento`  
**Authorization:** Basic Auth

**Query Parameters (opcionais):**
- `quadraId`: ID da quadra
- `pointId`: ID do point/arena
- `dataInicio`: Data inicial (ISO string)
- `dataFim`: Data final (ISO string)
- `status`: `CONFIRMADO`, `CANCELADO` ou `CONCLUIDO`
- `apenasMeus`: `true` ou `false`

**Exemplo:**
```
http://localhost:3000/api/agendamento?status=CONFIRMADO&apenasMeus=true
```

---

### 2.4. Criar Agendamento

**Método:** `POST`  
**URL:** `http://localhost:3000/api/agendamento`  
**Authorization:** Basic Auth

**Body (raw JSON):**
```json
{
  "quadraId": "uuid-da-quadra",
  "dataHora": "2024-12-25T14:00:00.000Z",
  "duracao": 60,
  "observacoes": "Observações opcionais"
}
```

---

### 2.5. Listar Points/Arenas

**Método:** `GET`  
**URL:** `http://localhost:3000/api/point`  
**Authorization:** Basic Auth

---

### 2.6. Criar Usuário (Registro)

**Método:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`  
**Authorization:** Não necessário

**Body (raw JSON):**
```json
{
  "name": "Nome do Usuário",
  "email": "novo@exemplo.com",
  "password": "senha123"
}
```

**Resposta (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "Nome do Usuário",
    "email": "novo@exemplo.com",
    "role": "USER"
  }
}
```

---

## 🎯 Dicas Importantes

### 1. Criar uma Collection no Postman

Crie uma collection chamada "Carlão BT Online" e organize as requisições por categorias:
- **Auth**: Login, Register
- **Users**: List, Update, Get
- **Agendamentos**: List, Create, Update, Cancel
- **Points**: List, Create, Update
- **Quadras**: List, Create, Update

### 2. Usar Variáveis de Ambiente

No Postman, crie um Environment com variáveis:
- `base_url`: `http://localhost:3000`
- `email`: `admin@exemplo.com`
- `password`: `senha123`

Depois use nas URLs: `{{base_url}}/api/auth/login`

### 3. Salvar Respostas de Login

Após fazer login, você pode salvar o token/credenciais em variáveis de ambiente para usar nas próximas requisições.

### 4. Testar Erros

Teste também casos de erro:
- Email/senha incorretos
- Usuário sem permissão (tentar acessar rota de ADMIN sendo USER)
- Dados inválidos
- Campos obrigatórios faltando

---

## ⚠️ Problemas Comuns

### Erro 401 - Não autorizado
- Verifique se o Basic Auth está configurado corretamente
- Confirme que o email e senha estão corretos
- Certifique-se de que o usuário existe no banco

### Erro 403 - Acesso negado
- A rota requer permissão de ADMIN
- Verifique o `role` do usuário no banco de dados

### Erro 500 - Erro interno
- Verifique se o banco de dados está rodando
- Verifique os logs do servidor (`npm run dev`)
- Confirme que a `DATABASE_URL` está configurada

---

## 📚 Rotas Disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar novo usuário
- `GET /api/auth/me` - Obter usuário logado

### Usuários (ADMIN)
- `GET /api/user/list` - Listar todos os usuários
- `PUT /api/user/{id}` - Atualizar usuário
- `GET /api/user/getUsuarioLogado` - Obter usuário logado

### Agendamentos
- `GET /api/agendamento` - Listar agendamentos
- `POST /api/agendamento` - Criar agendamento
- `GET /api/agendamento/{id}` - Obter agendamento
- `PUT /api/agendamento/{id}` - Atualizar agendamento
- `POST /api/agendamento/{id}/cancelar` - Cancelar agendamento
- `DELETE /api/agendamento/{id}` - Deletar agendamento

### Points/Arenas
- `GET /api/point` - Listar points
- `POST /api/point` - Criar point
- `GET /api/point/{id}` - Obter point
- `PUT /api/point/{id}` - Atualizar point
- `DELETE /api/point/{id}` - Deletar point

### Quadras
- `GET /api/quadra` - Listar quadras
- `POST /api/quadra` - Criar quadra
- `GET /api/quadra/{id}` - Obter quadra
- `PUT /api/quadra/{id}` - Atualizar quadra
- `DELETE /api/quadra/{id}` - Deletar quadra

### Atletas
- `GET /api/atleta/listarAtletas` - Listar atletas
- `POST /api/atleta/criarAtleta` - Criar atleta
- `GET /api/atleta/me/atleta` - Obter atleta do usuário logado

---

## 🚀 Próximos Passos

1. Importe este guia no Postman como documentação
2. Crie uma Collection com todas as rotas
3. Configure variáveis de ambiente
4. Teste todas as rotas seguindo este guia

