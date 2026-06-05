CREATE TABLE IF NOT EXISTS acoes_comunitarias (
    id_acao SERIAL PRIMARY KEY,
    id_criador INT NOT NULL REFERENCES usuario(id_usuario),
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50),
    local VARCHAR(255),
    data_acao DATE,
    hora_acao VARCHAR(10),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS acao_participantes (
    id_participacao SERIAL PRIMARY KEY,
    id_acao INT NOT NULL REFERENCES acoes_comunitarias(id_acao),
    id_usuario INT NOT NULL REFERENCES usuario(id_usuario),
    data_ingresso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_acao, id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_participantes_acao ON acao_participantes(id_acao);
