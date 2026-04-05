const { Pool } = require('pg');

// Como o dotenv já foi carregado no server.js,
// as variáveis de ambiente estarão disponíveis aqui através do process.env
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Testar a conexão logo ao iniciar
pool.query('SELECT NOW()')
  .then(result => {
    console.log('Conectado com PostgreSQL:', result.rows[0]);
  })
  .catch(err => {
    console.error('Erro ao conectar com PostgreSQL:', err);
  });

// Exporta o pool para ser usado nos controllers/models
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool, // Exporta também o pool inteiro para casos onde seja necessário gerenciar transações
};
