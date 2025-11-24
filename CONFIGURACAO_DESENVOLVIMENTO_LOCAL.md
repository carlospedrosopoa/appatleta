# 🔧 Configuração para Desenvolvimento Local

## 📋 Situação

- **API (projeto original)**: Rodando em `http://localhost:3000`
- **Frontend (appatleta)**: Rodando em `http://localhost:3001`

## ⚙️ Configuração

### 1. Arquivo `.env.local`

Crie ou edite o arquivo `.env.local` na raiz do projeto `appatleta`:

```env
# URL da API Externa (projeto original rodando em localhost:3000)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Porta do Frontend

O frontend está configurado para rodar na porta **3001** para não conflitar com a API.

**Scripts no `package.json`:**
- `npm run dev` - Roda na porta 3001
- `npm start` - Roda na porta 3001 (produção)

### 3. CORS na API

Certifique-se de que a API (projeto original) permite requisições de `http://localhost:3001`.

**No projeto da API**, verifique se o CORS está configurado para permitir:
- `http://localhost:3001` (frontend appatleta)
- `http://localhost:3000` (própria API)

## 🚀 Como Rodar

### 1. Inicie a API (projeto original)
```bash
# No projeto da API
cd /caminho/do/projeto/api
npm run dev
# API rodando em http://localhost:3000
```

### 2. Inicie o Frontend (appatleta)
```bash
# No projeto appatleta
cd C:\carlao-dev\appatleta
npm run dev
# Frontend rodando em http://localhost:3001
```

### 3. Acesse
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000

## ✅ Verificação

1. **API está rodando?**
   - Acesse: http://localhost:3000/api/point (ou outro endpoint)
   - Deve retornar JSON

2. **Frontend está rodando?**
   - Acesse: http://localhost:3001
   - Deve carregar a página

3. **Frontend consegue acessar a API?**
   - Abra DevTools → Network
   - Faça login ou navegue
   - Veja se as requisições vão para `http://localhost:3000/api/*`

## ⚠️ Problemas Comuns

### Erro: "Port 3000 is already in use"
**Solução:** O frontend já está configurado para usar porta 3001. Se ainda der erro, verifique se algo está usando a porta 3001:
```bash
# Windows PowerShell
netstat -ano | findstr :3001
```

### Erro: "Failed to fetch" ou CORS
**Solução:** A API precisa permitir requisições de `http://localhost:3001`. Verifique o CORS no projeto da API.

### Erro: "Cannot connect to API"
**Solução:** 
- Verifique se a API está rodando em `localhost:3000`
- Verifique se `NEXT_PUBLIC_API_URL=http://localhost:3000/api` está no `.env.local`
- Reinicie o servidor do frontend após adicionar/modificar `.env.local`

## 📝 Resumo

| Projeto | Porta | URL |
|---------|-------|-----|
| API (original) | 3000 | http://localhost:3000 |
| Frontend (appatleta) | 3001 | http://localhost:3001 |

**Variável de ambiente:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

