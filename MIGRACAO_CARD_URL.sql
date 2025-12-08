-- Migração: Adicionar campo cardUrl na tabela Partida
-- Execute este script no seu banco de dados PostgreSQL

-- Adicionar campo para URL do card no Google Cloud Storage
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardUrl" TEXT;

-- Índice para busca rápida de cards existentes
CREATE INDEX IF NOT EXISTS idx_partida_card_url 
ON "Partida"("cardUrl") 
WHERE "cardUrl" IS NOT NULL;

-- Opcional: Campos adicionais para controle e rastreabilidade
ALTER TABLE "Partida" 
ADD COLUMN IF NOT EXISTS "cardGeradoEm" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "cardVersao" INTEGER DEFAULT 0;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Partida' 
AND column_name IN ('cardUrl', 'cardGeradoEm', 'cardVersao')
ORDER BY column_name;

-- Comentários explicativos
COMMENT ON COLUMN "Partida"."cardUrl" IS 'URL completa do card gerado no Google Cloud Storage (ex: https://storage.googleapis.com/bucket/cards/partida-123.png). NULL quando card ainda não foi gerado ou foi invalidado.';
COMMENT ON COLUMN "Partida"."cardGeradoEm" IS 'Timestamp de quando o card foi gerado/atualizado pela última vez';
COMMENT ON COLUMN "Partida"."cardVersao" IS 'Versão do card (incrementa quando card é regenerado após atualização de placar)';

