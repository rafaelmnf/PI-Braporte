const jwt = require('jsonwebtoken');

// Obtém o secret do arquivo .env

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definida');
}

const JWT_SECRET = process.env.JWT_SECRET;


// Função para gerar o token do usuário
const generateToken = (user) => {
    // Definimos as informações (payload) que vão "dentro" do token.
    // Dica: não coloque dados sensíveis como senha_hash aqui!
    const payload = {
        id: user.id_usuario,
        nome: user.nome_completo,
        email: user.email
    };

    // Assinamos o token e colocamos uma validade (ex: 1 dia)
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};

module.exports = {
    generateToken
};
