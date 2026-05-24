const acaoService = require('../services/acaoService');

exports.criarAcao = async (req, res) => {
    const { id_criador, titulo, descricao, categoria, local, data_acao, hora_acao, imagem } = req.body;

    if (!id_criador || !titulo) {
        return res.status(400).json({ error: 'id_criador e titulo são obrigatórios.' });
    }

    try {
        const acao = await acaoService.criarAcao({ id_criador, titulo, descricao, categoria, local, data_acao, hora_acao, imagem });
        res.status(201).json({ sucesso: true, acao });
    } catch (err) {
        console.error('Erro ao criar ação:', err);
        res.status(500).json({ error: 'Erro ao criar ação comunitária' });
    }
};

exports.listarAcoes = async (req, res) => {
    try {
        const acoes = await acaoService.listarAcoes();
        res.status(200).json({ acoes });
    } catch (err) {
        console.error('Erro ao listar ações:', err);
        res.status(500).json({ error: 'Erro ao buscar ações comunitárias' });
    }
};

exports.ingressar = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario é obrigatório.' });
    }

    try {
        await acaoService.ingressar(id, id_usuario);
        res.status(200).json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao ingressar na ação:', err);
        res.status(500).json({ error: 'Erro ao ingressar na ação' });
    }
};

exports.sair = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario é obrigatório.' });
    }

    try {
        await acaoService.sair(id, id_usuario);
        res.status(200).json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao sair da ação:', err);
        res.status(500).json({ error: 'Erro ao sair da ação' });
    }
};

exports.minhasParticipacoes = async (req, res) => {
    try {
        const ids = await acaoService.participantesDoUsuario(req.params.id);
        res.status(200).json({ participacoes: ids });
    } catch (err) {
        console.error('Erro ao buscar participações:', err);
        res.status(500).json({ error: 'Erro ao buscar participações' });
    }
};

exports.concluirAcao = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario é obrigatório.' });
    }

    try {
        const resultado = await acaoService.concluirAcao(id, id_usuario);

        if (resultado.naoEncontrado) {
            return res.status(404).json({ error: 'Ação não encontrada' });
        }
        if (resultado.semPermissao) {
            return res.status(403).json({ error: 'Apenas o criador pode concluir a ação.' });
        }

        res.status(200).json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao concluir ação:', err);
        res.status(500).json({ error: 'Erro ao concluir a ação' });
    }
};

exports.deletarAcao = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario é obrigatório.' });
    }

    try {
        const resultado = await acaoService.deletarAcao(id, id_usuario);

        if (resultado.naoEncontrado) {
            return res.status(404).json({ error: 'Ação não encontrada' });
        }
        if (resultado.semPermissao) {
            return res.status(403).json({ error: 'Apenas o criador pode excluir a ação.' });
        }

        res.status(200).json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao excluir ação:', err);
        res.status(500).json({ error: 'Erro ao excluir a ação' });
    }
};
