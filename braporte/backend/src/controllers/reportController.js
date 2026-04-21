const sql = require('../config/db');

exports.createReport = async (req, res) => {
    // Para simplificar, estamos extraindo dados via desestruturação.
    const { id_usuario, motivo, descricao, categoria, latitude, longitude, endereco } = req.body;

    try {
        // Fallback p/ id_usuario se o auth ainda não injetar req.user
        const usuarioLogado = id_usuario || 1; 

        // Usamos uma transação para garantir que ambos os registros sejam criados
        const resultado = await sql.begin(async sql => {
            // 1. Inserir o reporte principal
            const [novoReporte] = await sql`
                INSERT INTO reportes (
                    id_usuario, motivo, descricao, categoria, endereco
                ) VALUES (
                    ${usuarioLogado}, ${motivo}, ${descricao}, ${categoria}, ${endereco}
                )
                RETURNING *
            `;

            // 2. Inserir a geolocalização vinculada
            await sql`
                INSERT INTO geolocalizacao (id_reporte, latitude, longitude)
                VALUES (${novoReporte.id_reporte}, ${latitude}, ${longitude})
            `;

            // 3. Identificar o usuário como criador na tabela associativa
            await sql`
                INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
                VALUES (${usuarioLogado}, ${novoReporte.id_reporte}, 'criador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            return novoReporte;
        });

        // Adicionamos os dados de localização de volta ao objeto para o frontend se manter compatível
        const reporteCompleto = {
            ...resultado,
            latitude,
            longitude
        };

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
        const reportes = await sql`
            SELECT r.*, g.latitude, g.longitude 
            FROM reportes r
            LEFT JOIN geolocalizacao g ON r.id_reporte = g.id_reporte
            WHERE r.status != 'denunciado' 
            ORDER BY r.data_hora DESC
        `;
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
        const usuarioLogado = id_usuario || 1;

        const resultado = await sql.begin(async sql => {
            const [reporteAtualizado] = await sql`
                UPDATE reportes
                SET status = 'denunciado'
                WHERE id_reporte = ${id}
                RETURNING *
            `;

            if (reporteAtualizado) {
                await sql`
                    INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
                    VALUES (${usuarioLogado}, ${id}, 'denuncia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (id_usuario, id_reporte) 
                    DO UPDATE SET 
                        tipo_contribuicao = 'denuncia',
                        data_atualizacao = CURRENT_TIMESTAMP
                `;
            }

            return reporteAtualizado;
        });

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
    const { id_usuario, tipo_contribuicao } = req.body;

    const reporteId = parseInt(id, 10);
    const usuarioId = parseInt(id_usuario, 10);

    if (!reporteId || !usuarioId || !tipo_contribuicao) {
        return res.status(400).json({ error: 'id_usuario, id_reporte e tipo_contribuicao são obrigatórios.' });
    }

    try {
        // 1. UPSERT na tabela usuario_reporte
        await sql`
            INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
            VALUES (${usuarioId}, ${reporteId}, ${tipo_contribuicao}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (id_usuario, id_reporte) 
            DO UPDATE SET 
                tipo_contribuicao = EXCLUDED.tipo_contribuicao,
                data_atualizacao = CURRENT_TIMESTAMP
        `;

        // 2. Agregação e Decisão do Status Pai
        const votos = await sql`
            SELECT tipo_contribuicao, COUNT(*) as qtd
            FROM usuario_reporte
            WHERE id_reporte = ${reporteId}
              AND tipo_contribuicao IN ('ainda_aqui', 'autoridades_c', 'autoridades_l', 'concluido')
            GROUP BY tipo_contribuicao
        `;

        let totalVotosComunidade = 0;
        const contagem = {
            'ainda_aqui': 0,
            'autoridades_c': 0,
            'autoridades_l': 0,
            'concluido': 0
        };

        votos.forEach(voto => {
            const count = parseInt(voto.qtd, 10);
            totalVotosComunidade += count;
            if (contagem[voto.tipo_contribuicao] !== undefined) {
                contagem[voto.tipo_contribuicao] = count;
            }
        });

        let novoStatus = 'aberto';
        
        if (totalVotosComunidade > 0) {
            const percAindaAqui = contagem['ainda_aqui'] / totalVotosComunidade;
            const percConcluido = contagem['concluido'] / totalVotosComunidade;
            const temAutoridades = contagem['autoridades_c'] > 0 || contagem['autoridades_l'] > 0;

            if (percConcluido > 0.7) {
                novoStatus = 'resolvido';
            } else if (temAutoridades) {
                novoStatus = 'em_andamento';
            } else if (percAindaAqui > 0.5) {
                novoStatus = 'aberto';
            } else {
                novoStatus = 'em_andamento'; 
            }
        }

        // 3. Atualizar a tabela principal
        await sql`
            UPDATE reportes
            SET status = ${novoStatus}
            WHERE id_reporte = ${reporteId}
        `;

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
        const result = await sql`
            SELECT tipo_contribuicao, COUNT(*) as count, MAX(data_atualizacao) as last_update
            FROM usuario_reporte
            WHERE id_reporte = ${id}
            GROUP BY tipo_contribuicao
        `;
        res.status(200).json({ atualizacoes: result });
    } catch (err) {
        console.error('Erro ao buscar agregados:', err);
        res.status(500).json({ error: 'Erro ao buscar atualizações' });
    }
};
