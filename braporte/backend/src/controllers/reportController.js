const sql = require('../config/db');

exports.createReport = async (req, res) => {
    // Para simplificar, estamos extraindo dados via desestruturação.
    const { id_usuario, motivo, descricao, categoria, latitude, longitude, endereco } = req.body;

    try {
        // Fallback p/ id_usuario se o auth ainda não injetar req.user
        const usuarioLogado = id_usuario || 1; 

        const novoReporte = await sql`
            INSERT INTO reportes (
                id_usuario, motivo, descricao, categoria, latitude, longitude, endereco
            ) VALUES (
                ${usuarioLogado}, ${motivo}, ${descricao}, ${categoria}, ${latitude}, ${longitude}, ${endereco}
            )
            RETURNING *
        `;

        res.status(201).json({ 
            sucesso: true, 
            mensagem: 'Reporte criado com sucesso', 
            reporte: novoReporte[0]
        });
    } catch (err) {
        console.error('Erro ao criar reporte:', err);
        res.status(500).json({ error: 'Erro ao salvar no banco de dados' });
    }
};

exports.getReports = async (req, res) => {
    try {
        const reportes = await sql`SELECT * FROM reportes WHERE status != 'denunciado' ORDER BY data_hora DESC`;
        res.status(200).json({ reportes });
    } catch (err) {
        console.error('Erro ao buscar reportes:', err);
        res.status(500).json({ error: 'Erro ao buscar no banco de dados' });
    }
};

exports.denunciarReport = async (req, res) => {
    const { id } = req.params;

    try {
        const reporteAtualizado = await sql`
            UPDATE reportes
            SET status = 'denunciado'
            WHERE id_reporte = ${id}
            RETURNING *
        `;

        if (reporteAtualizado.length === 0) {
            return res.status(404).json({ error: 'Reporte não encontrado' });
        }

        res.status(200).json({ 
            sucesso: true, 
            mensagem: 'Reporte denunciado com sucesso', 
            reporte: reporteAtualizado[0]
        });
    } catch (err) {
        console.error('Erro ao denunciar reporte:', err);
        res.status(500).json({ error: 'Erro ao atualizar banco de dados' });
    }
};
