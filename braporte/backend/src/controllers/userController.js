const db = require('../config/db');
const imageService = require('../services/imageService');
const authRepository = require('../repositories/authRepository');

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

// Atualiza a foto de perfil do usuário
exports.updateFotoPerfil = async (req, res) => {
    const { id } = req.params;
    const { imagem } = req.body;

    if (!imagem) {
        return res.status(400).json({ error: 'Imagem é obrigatória' });
    }

    try {
        const decoded = imageService.decodeBase64(imagem);
        if (!decoded) {
            return res.status(400).json({ error: 'Imagem inválida' });
        }
        await authRepository.updateFotoPerfil(id, decoded.buffer);
        res.status(200).json({ sucesso: true });
    } catch (error) {
        console.error('Erro ao atualizar foto de perfil:', error);
        res.status(500).json({ error: 'Erro ao salvar foto' });
    }
};

// Retorna a foto de perfil do usuário
exports.getFotoPerfil = async (req, res) => {
    const { id } = req.params;
    try {
        const buffer = await authRepository.getFotoPerfil(id);
        const foto = buffer ? imageService.encodeBase64(buffer, 'image/jpeg') : null;
        res.status(200).json({ foto });
    } catch (error) {
        console.error('Erro ao buscar foto de perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar foto' });
    }
};
