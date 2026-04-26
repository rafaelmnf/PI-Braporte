const db = require('../config/db');

// Função usada para pegar o endereço do usuário no banco
exports.getUserAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db`SELECT rua, numero, cidade, estado, cep FROM ENDERECO WHERE id_usuario = ${id}`;

        if (result.length === 0) {
            return res.status(404).json({ success: false, mensagem: 'Endereço não encontrado' });
        }

        res.status(200).json({ success: true, endereco: result[0] });
    } catch (error) {
        console.error('Erro ao buscar endereço do usuário:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor' });
    }
};
