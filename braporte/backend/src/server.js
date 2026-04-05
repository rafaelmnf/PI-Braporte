require('dotenv').config({ path: __dirname + '/../.env' });
const app = require('./app');
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`\n Braporte Backend rodando na porta ${PORT}\n`);
});
