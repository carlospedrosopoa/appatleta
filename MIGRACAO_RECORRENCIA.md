# Migration: Adicionar Campos de Recorrência

Este documento descreve como adicionar os campos necessários para suportar agendamentos recorrentes no banco de dados PostgreSQL.

## ⚠️ Importante

Este projeto usa **SQL direto** (biblioteca `pg`) e não Prisma. As migrations devem ser executadas manualmente via SQL.

## Campos a Adicionar

Execute o seguinte SQL no seu banco de dados (pode ser via cliente PostgreSQL, pgAdmin, ou interface do seu provedor como Neon/Supabase):

```sql
-- Adicionar campos de recorrência na tabela Agendamento
ALTER TABLE "Agendamento"
ADD COLUMN IF NOT EXISTS "recorrenciaId" TEXT,
ADD COLUMN IF NOT EXISTS "recorrenciaConfig" JSONB;

-- Criar índice para melhorar performance nas consultas de recorrência
CREATE INDEX IF NOT EXISTS idx_agendamento_recorrencia_id ON "Agendamento"("recorrenciaId");
CREATE INDEX IF NOT EXISTS idx_agendamento_recorrencia_data ON "Agendamento"("recorrenciaId", "dataHora");
```

## Descrição dos Campos

- **recorrenciaId**: ID único que agrupa todos os agendamentos de uma mesma recorrência. Todos os agendamentos gerados a partir de uma configuração de recorrência compartilham o mesmo `recorrenciaId`.
- **recorrenciaConfig**: JSON que armazena a configuração da recorrência:
  ```json
  {
    "tipo": "DIARIO" | "SEMANAL" | "MENSAL",
    "intervalo": 1,  // Para SEMANAL: 1 = toda semana, 2 = a cada 2 semanas, etc.
    "diasSemana": [1, 3, 5],  // Para SEMANAL: [0=domingo, 1=segunda, ..., 6=sábado]
    "diaMes": 15,  // Para MENSAL: dia do mês (1-31)
    "dataFim": "2024-12-31T23:59:59.000Z",  // Data de término (opcional)
    "quantidadeOcorrencias": 12  // Número máximo de ocorrências (opcional)
  }
  ```

## Compatibilidade

O código foi desenvolvido para funcionar mesmo se os campos não existirem no banco de dados. Se os campos não existirem, o sistema funcionará normalmente, mas sem suporte a recorrência. Quando os campos forem adicionados, a funcionalidade de recorrência estará automaticamente disponível.

## Verificação

Para verificar se os campos foram adicionados corretamente:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Agendamento' 
AND column_name IN ('recorrenciaId', 'recorrenciaConfig');
```

Você deve ver duas linhas retornadas com os campos `recorrenciaId` (TEXT) e `recorrenciaConfig` (JSONB).

## Como Executar a Migration

### Opção 1: Via Interface do Provedor (Recomendado)
- **Neon**: Acesse o dashboard → SQL Editor → Cole o SQL e execute
- **Supabase**: Acesse o dashboard → SQL Editor → Cole o SQL e execute
- **Outros**: Use a interface SQL do seu provedor

### Opção 2: Via Cliente PostgreSQL
```bash
psql $DATABASE_URL -f migration.sql
```

### Opção 3: Via Script Node.js (Opcional)
Você pode criar um script temporário para executar a migration:

```javascript
// scripts/migrate-recorrencia.js
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE "Agendamento"
      ADD COLUMN IF NOT EXISTS "recorrenciaId" TEXT,
      ADD COLUMN IF NOT EXISTS "recorrenciaConfig" JSONB;
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_agendamento_recorrencia_id 
      ON "Agendamento"("recorrenciaId");
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_agendamento_recorrencia_data 
      ON "Agendamento"("recorrenciaId", "dataHora");
    `);
    
    console.log('✅ Migration executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migration:', error);
  } finally {
    await pool.end();
  }
}

migrate();
```

Execute com: `node scripts/migrate-recorrencia.js`

