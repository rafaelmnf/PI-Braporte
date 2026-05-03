-- Script para adicionar colunas de imagem na tabela reportes

ALTER TABLE reportes
ADD COLUMN IF NOT EXISTS imagem BYTEA,
ADD COLUMN IF NOT EXISTS tipo_imagem VARCHAR(5);
