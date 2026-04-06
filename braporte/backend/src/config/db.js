const postgres = require('postgres');

// O postgres.js é super inteligente e recebe o DATABASE_URL automaticamente.
// Definimos o ssl: 'require' para garantir aceite pela rede do Supabase se necessário.
const sql = postgres(process.env.DATABASE_URL, {
    ssl: 'prefer', 
    max: 10,                 
    idle_timeout: 20        
});

// Testar a conexão logo ao iniciar
sql`SELECT NOW() AS now`
  .then(result => {
    console.log('Conectado com o Supabase (via postgres.js):', result[0]);
  })
  .catch(err => {
    console.error('Erro ao conectar com o Supabase:', err);
  });

// Exporta a lib principal para ser importada como 'const db = require('../config/db');'
module.exports = sql;
