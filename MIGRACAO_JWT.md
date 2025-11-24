# 🔐 Migração para JWT - Documentação

## ✅ Implementação Concluída

A migração para JWT foi implementada com sucesso, mantendo compatibilidade total com Basic Auth durante a transição.

---

## 📋 O Que Foi Implementado

### 1. **Backend (JWT)**
- ✅ Funções de geração e validação de JWT (`src/lib/jwt.ts`)
- ✅ Rota de login retorna tokens JWT (`accessToken` e `refreshToken`)
- ✅ Middleware de autenticação aceita JWT e Basic Auth
- ✅ Validação automática de tokens expirados

### 2. **Frontend (JWT)**
- ✅ Cliente API usa JWT Bearer Token como método preferido
- ✅ AuthContext atualizado para trabalhar com JWT
- ✅ Decodificação de tokens no cliente (jwt-decode)
- ✅ Verificação de expiração de tokens
- ✅ Migração automática de tokens antigos

### 3. **Compatibilidade**
- ✅ Basic Auth ainda funciona como fallback
- ✅ Migração automática de tokens antigos
- ✅ Sem quebra de funcionalidade existente

---

## 🔧 Configuração

### Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# JWT Secret (OBRIGATÓRIO em produção - use uma chave forte e aleatória)
JWT_SECRET=sua-chave-secreta-super-segura-mude-em-producao

# Tempo de expiração dos tokens (opcional)
JWT_EXPIRES_IN=7d          # Access token expira em 7 dias
JWT_REFRESH_EXPIRES_IN=30d # Refresh token expira em 30 dias
```

**⚠️ IMPORTANTE:** Em produção, use uma chave secreta forte e aleatória:
```bash
# Gere uma chave segura:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Como Funciona

### Fluxo de Login

1. **Usuário faz login** → `/api/auth/login`
2. **Backend valida credenciais** → Consulta banco de dados
3. **Backend gera tokens JWT**:
   - `accessToken`: Válido por 7 dias (padrão)
   - `refreshToken`: Válido por 30 dias (padrão)
4. **Frontend recebe tokens** → Armazena `accessToken` no localStorage
5. **Próximas requisições** → Usam `Authorization: Bearer <token>`

### Fluxo de Autenticação

1. **Cliente faz requisição** → Adiciona `Authorization: Bearer <token>`
2. **Backend verifica token**:
   - Tenta JWT primeiro (Bearer)
   - Se falhar, tenta Basic Auth (compatibilidade)
3. **Se token válido** → Retorna dados
4. **Se token expirado** → Retorna 401, frontend limpa token

---

## 📝 Estrutura dos Tokens

### Access Token (JWT)

```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "nome": "Nome do Usuário",
  "role": "ADMIN",
  "atletaId": null,
  "pointIdGestor": null,
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Refresh Token

Similar ao access token, mas com `type: 'refresh'` e validade maior.

---

## 🔄 Migração Automática

O sistema migra automaticamente:

1. **Tokens antigos** → Migrados para `accessToken`
2. **Basic Auth** → Funciona como fallback
3. **Dados do usuário** → Extraídos do token JWT

---

## 🧪 Testando

### 1. Login via Postman

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "admin@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "usuario": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Usar Token em Requisições

**GET** `http://localhost:3000/api/user/list`

**Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ Segurança

### ✅ Boas Práticas Implementadas

- Tokens têm expiração automática
- Senha nunca é armazenada no localStorage (apenas token)
- Validação de tokens no backend
- Limpeza automática de tokens expirados
- HTTPS recomendado em produção

### 🔒 Recomendações Adicionais

1. **Use HTTPS em produção** → Tokens trafegam no header
2. **Configure JWT_SECRET forte** → Use variável de ambiente
3. **Implemente refresh token** → Para renovar tokens sem novo login
4. **Considere blacklist** → Para revogar tokens específicos

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Basic Auth | JWT |
|---------|-----------|-----|
| **Segurança** | ❌ Senha no localStorage | ✅ Token sem senha |
| **Performance** | ❌ Consulta DB a cada requisição | ✅ Validação sem DB |
| **Expiração** | ❌ Manual | ✅ Automática |
| **Múltiplos dispositivos** | ❌ Difícil | ✅ Fácil |
| **Revogação** | ❌ Precisa mudar senha | ✅ Pode implementar blacklist |
| **Escalabilidade** | ❌ Limitada | ✅ Excelente |

---

## 🎯 Próximos Passos (Opcional)

1. **Implementar refresh token endpoint** → `/api/auth/refresh`
2. **Adicionar blacklist de tokens** → Para logout forçado
3. **Implementar rate limiting** → Proteção contra brute force
4. **Adicionar 2FA** → Autenticação de dois fatores

---

## 🐛 Troubleshooting

### Token não funciona

1. Verifique se `JWT_SECRET` está configurado
2. Verifique se token não expirou
3. Verifique formato: `Bearer <token>` (com espaço)

### Basic Auth ainda funciona?

Sim! Basic Auth funciona como fallback. O sistema tenta JWT primeiro, depois Basic Auth.

### Como forçar logout?

O logout limpa o token do localStorage. Para revogar token no servidor, implemente uma blacklist.

---

## 📚 Referências

- [JWT.io](https://jwt.io/) - Decodificar e testar tokens
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Documentação da biblioteca
- [jwt-decode](https://github.com/auth0/jwt-decode) - Decodificação no cliente

---

**✅ Migração concluída com sucesso!**

