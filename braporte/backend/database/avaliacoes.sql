CREATE TABLE IF NOT EXISTS avaliacoes (
    id_avaliacao SERIAL PRIMARY KEY,
    id_reporte INT NOT NULL REFERENCES reportes(id_reporte),
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_reporte, id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_reporte ON avaliacoes(id_reporte);
