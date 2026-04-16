-- ==========================================
-- Schema do Banco de Dados (PostgreSQL / Supabase)
-- ==========================================

-- Tabela: reportes
CREATE TABLE IF NOT EXISTS reportes (
    id_reporte SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    status VARCHAR(50) DEFAULT 'aberto',
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    endereco VARCHAR(255)
);

-- (Opcional) Índices para melhoria de busca por categoria ou status
CREATE INDEX IF NOT EXISTS idx_reportes_categoria ON reportes(categoria);
CREATE INDEX IF NOT EXISTS idx_reportes_status ON reportes(status);
