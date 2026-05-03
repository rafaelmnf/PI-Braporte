-- Script para corrigir as colunas de imagem na tabela reportes

-- 1. Renomear imagem_tipo para tipo_imagem se necessário
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reportes' AND column_name='imagem_tipo') THEN
        ALTER TABLE reportes RENAME COLUMN imagem_tipo TO tipo_imagem;
    END IF;
END $$;

-- 2. Garantir que a coluna tipo_imagem tenha tamanho suficiente
ALTER TABLE reportes ALTER COLUMN tipo_imagem TYPE VARCHAR(50);

-- 3. Adicionar colunas se elas não existirem (caso o passo anterior não tenha sido executado)
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS imagem BYTEA;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS tipo_imagem VARCHAR(50);
