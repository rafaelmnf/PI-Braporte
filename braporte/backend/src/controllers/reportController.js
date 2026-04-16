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
        const reportes = await sql`SELECT * FROM reportes ORDER BY data_hora DESC`;
        res.status(200).json({ reportes });
    } catch (err) {
        console.error('Erro ao buscar reportes:', err);
        res.status(500).json({ error: 'Erro ao buscar no banco de dados' });
    }
};
