/**
 * @typedef {Object} Geolocalizacao
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} [endereco] - Endereço reverso futuro
 */

/**
 * @typedef {'aberto' | 'em_analise' | 'em_andamento' | 'fechado' | 'resolvido'} TipoStatus
 */

/**
 * @typedef {'saneamento' | 'infraestrutura' | 'seguranca' | 'outros' | 'alagamento' | 'incendio' | 'meio-ambiente' | 'transito'} CategoriaReporte
 */

/**
 * Representa a estrutura de um Reporte no Frontend (Espelhando a futura tabela SQL do Backend)
 * 
 * CREATE TABLE REPORTE (
 *    id_reporte SERIAL PRIMARY KEY,
 *    id_usuario INTEGER REFERENCES Usuario(id_usuario),
 *    id_geolocalizacao INTEGER REFERENCES Geolocalizacao(id_geolocalizacao),
 *    status VARCHAR(20) NOT NULL DEFAULT 'aberto',
 *    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
 *    motivo TEXT NOT NULL,
 *    imagem TEXT,
 *    categoria VARCHAR(20) NOT NULL
 * );
 * 
 * @typedef {Object} Reporte
 * @property {number} id_reporte 
 * @property {number} id_usuario 
 * @property {number} [id_geolocalizacao] - ID da tabela Geolocalizacao (banco)
 * @property {TipoStatus} status 
 * @property {string} data_hora - Data ISO
 * @property {string} motivo - Título ou descrição resumida
 * @property {string} [descricao] - Texto detalhado futuro
 * @property {string} [imagem] - URL da imagem opcional
 * @property {CategoriaReporte} categoria
 * 
 * -- Propriedades resolvidas p/ renderização (Mockadas por hora) --
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} [endereco]
 */

export const TiposProntos = true;
