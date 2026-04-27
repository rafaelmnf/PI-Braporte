const bcrypt = require('bcrypt');


// 10 é o número de rounds do salt. Quanto maior, mais lento para gerar e mais seguro. 10 a 12 é o padrão recomendado.
async function gerarHash() {
    try {
        const senhaPlana = 'minhasenha123'; // senha original
        const saltRounds = 10;

        const hash = await bcrypt.hash(senhaPlana, saltRounds);

        console.log(`\nSenha original: ${senhaPlana}`);
        console.log(`Hash gerado (copie e cole no banco): ${hash}\n`);
    } catch (err) {
        console.error('Erro ao gerar hash:', err);
    }
}

gerarHash();