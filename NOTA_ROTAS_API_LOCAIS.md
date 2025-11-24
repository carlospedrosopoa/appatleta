# ⚠️ Nota sobre Rotas de API Locais

## 📋 Situação Atual

Este projeto foi duplicado do projeto original de controle de quadras/agendamentos. Como resultado, ainda existem rotas de API locais em `src/app/api/*` que foram mantidas do projeto original.

## 🎯 Objetivo Deste Projeto

Este é um projeto **frontend-only** que consome uma **API externa**. As rotas de API locais em `src/app/api/*` **NÃO devem ser usadas** neste projeto.

## ✅ O Que Usar

Use apenas o cliente de API configurado em `src/lib/api.ts` que consome a API externa através da variável `NEXT_PUBLIC_API_URL`.

### Exemplo Correto:

```typescript
import { api } from '@/lib/api';

// ✅ CORRETO - Consome API externa
const { data } = await api.get('/atleta/me/atleta');
```

### Exemplo Incorreto:

```typescript
// ❌ INCORRETO - Não use rotas locais
const response = await fetch('/api/atleta/me/atleta');
```

## 🔄 Rotas Locais vs API Externa

| Rotas Locais (`src/app/api/*`) | API Externa (`NEXT_PUBLIC_API_URL`) |
|--------------------------------|-------------------------------------|
| ❌ Não devem ser usadas | ✅ Use estas |
| Ainda existem no código | Configurada via variável de ambiente |
| Do projeto original | Consumida pelo frontend |

## 🧹 Limpeza Futura (Opcional)

Se desejar remover as rotas de API locais para manter o projeto mais limpo, você pode:

1. **Remover a pasta `src/app/api/`** (todas as rotas de API locais)
2. **Remover dependências não utilizadas** como:
   - `pg` (PostgreSQL)
   - `bcryptjs` (se não for usado)
   - `jsonwebtoken` (se não for usado para gerar tokens, apenas decodificar)

**Nota:** Antes de remover, certifique-se de que nenhum código está usando essas rotas locais.

## 📚 Documentação

- `CONFIGURACAO_API_EXTERNA.md` - Como configurar e usar a API externa
- `README.md` - Documentação geral do projeto

