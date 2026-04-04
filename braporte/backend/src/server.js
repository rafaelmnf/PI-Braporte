require('dotenv').config({ path: __dirname + '/../.env' });
const app = require('./app');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`\n Braporte Backend rodando na porta ${PORT}\n`);
    console.log(`  Rotas:`);
    console.log(`    POST /api/login`);
    console.log(`    POST /api/reportes`);
    console.log(`    GET  /api/reportes\n`);
});
