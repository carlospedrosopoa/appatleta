# 🔧 Solução: Erro ao Buscar Usuário

## ❌ Problema

O erro "Erro ao buscar usuário" ocorre porque a variável `NEXT_PUBLIC_API_URL` não está configurada no arquivo `.env.local`.

## ✅ Solução

### 1. Adicionar Variável no `.env.local`

Abra o arquivo `.env.local` na raiz do projeto e adicione:

```env
# URL da API Externa
NEXT_PUBLIC_API_URL=https://sua-api-externa.com/api
```

**Substitua `https://sua-api-externa.com/api` pela URL real da sua API externa.**

### 2. Exemplos de URLs

- **Se a API está em produção**: `https://api.seudominio.com/api`
- **Se a API está no Vercel**: `https://seu-app-api.vercel.app/api`
- **Se a API está rodando localmente**: `http://localhost:3000/api` (ou a porta que a API usa)

### 3. Reiniciar o Servidor

Após adicionar a variável, **reinicie o servidor de desenvolvimento**:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

**⚠️ Importante:** Variáveis de ambiente só são carregadas quando o servidor inicia. Você precisa reiniciar!

### 4. Verificar se Funcionou

Após reiniciar, verifique no console do navegador se as requisições estão indo para a URL correta. Você deve ver requisições para a URL configurada em `NEXT_PUBLIC_API_URL`.

---

## 🔍 Como Verificar a Configuração

### No Código (Client-side)

Abra o console do navegador e digite:

```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
```

Deve mostrar a URL da API que você configurou.

### No Terminal

```bash
# Windows PowerShell
$env:NEXT_PUBLIC_API_URL

# Ou verificar o arquivo .env.local
Get-Content .env.local
```

---

## ⚠️ Problemas Comuns

### 1. Variável não está sendo lida

**Solução:**
- Certifique-se de que o nome está correto: `NEXT_PUBLIC_API_URL` (com `NEXT_PUBLIC_` no início)
- Reinicie o servidor após adicionar/modificar
- Verifique se não há espaços extras ou aspas desnecessárias

### 2. Erro de CORS

Se após configurar a URL você receber erro de CORS:

**Solução:**
- A API externa precisa ter CORS configurado
- Verifique se o domínio deste frontend está na lista de origens permitidas da API
- Em desenvolvimento local, a API deve permitir `http://localhost:3000`

### 3. Erro 401 Unauthorized

Se receber erro 401:

**Solução:**
- Faça login novamente para obter um novo token JWT
- Verifique se o token está sendo enviado corretamente
- Verifique se a API está validando o token corretamente

---

## 📝 Exemplo Completo de `.env.local`

```env
# URL da API Externa
NEXT_PUBLIC_API_URL=https://api.seudominio.com/api

# Outras variáveis (se necessário)
# DATABASE_URL=... (não necessário para frontend)
# JWT_SECRET=... (não necessário para frontend)
```

**Nota:** Este frontend não precisa de `DATABASE_URL` ou `JWT_SECRET` - essas são apenas para a API backend.

---

## 🎯 Próximos Passos

1. ✅ Adicione `NEXT_PUBLIC_API_URL` no `.env.local`
2. ✅ Reinicie o servidor (`npm run dev`)
3. ✅ Teste novamente a página de perfil
4. ✅ Se ainda houver erro, verifique se a API externa está online e acessível

---

**Após seguir estes passos, o erro deve ser resolvido!**

