const reportService = require('../services/reportService');

exports.createReport = async (req, res) => {
    try {
        const reporteCompleto = await reportService.createReport(req.body);

        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Reporte criado com sucesso', 
            reporte: reporteCompleto
        });
    } catch (err) {
        console.error('Erro ao criar reporte:', err);
        res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reportes = await reportService.getReports();
        res.status(200).json({ reportes });
    } catch (err) {
        console.error('Erro ao buscar reportes:', err);
        res.status(500).json({ error: 'Erro ao buscar no banco de dados' });
    }
};

exports.denunciarReport = async (req, res) => {
    const { id } = req.params;
    const { id_usuario } = req.body;

    try {
        const resultado = await reportService.denunciarReport(id, id_usuario);

        if (!resultado) {
            return res.status(404).json({ error: 'Reporte não encontrado' });
        }

        res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Reporte denunciado com sucesso', 
            reporte: resultado
        });
    } catch (err) {
        console.error('Erro ao denunciar reporte:', err);
        res.status(500).json({ error: 'Erro ao atualizar banco de dados' });
    }
};

exports.atualizarReporteStatus = async (req, res) => {
    const { id } = req.params;
    const { id_usuario, tipo_contribuicao, imagem } = req.body;

    const reporteId = parseInt(id, 10);
    const usuarioId = parseInt(id_usuario, 10);

    if (!reporteId || !usuarioId || !tipo_contribuicao) {
        return res.status(400).json({ error: 'id_usuario, id_reporte e tipo_contribuicao são obrigatórios.' });
    }

    try {
        const { novoStatus, contagem } = await reportService.atualizarStatus(reporteId, usuarioId, tipo_contribuicao, imagem);

        res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Voto registrado com sucesso',
            novoStatusGeral: novoStatus,
            contagem
        });
    } catch (err) {
        console.error('Erro ao atualizar reporte status:', err);
        res.status(500).json({ error: 'Erro ao registrar voto.' });
    }
};

exports.getAtualizacoesReporte = async (req, res) => {
    const { id } = req.params;
    try {
        const atualizacoes = await reportService.getAtualizacoes(id);
        res.status(200).json({ atualizacoes });
    } catch (err) {
        console.error('Erro ao buscar agregados:', err);
        res.status(500).json({ error: 'Erro ao buscar atualizações' });
    }
};
