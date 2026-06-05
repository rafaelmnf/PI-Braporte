const sql = require('../config/db');

class ReportRepository {
    // verifica se ja existe um reporte da mesma categoria a menos de ~10m
    async existeReportePerto(categoria, latitude, longitude) {
        if (latitude == null || longitude == null) return false;
        // 6371000 = raio da Terra em metros (formula de Haversine no proprio SQL)
        const [achado] = await sql`
            SELECT r.id_reporte
            FROM reportes r
            JOIN geolocalizacao g ON r.id_reporte = g.id_reporte
            WHERE r.categoria = ${categoria}
              AND r.status != 'excluido'
              AND (
                6371000 * acos(
                    LEAST(1, GREATEST(-1,
                        cos(radians(${latitude})) * cos(radians(g.latitude)) *
                        cos(radians(g.longitude) - radians(${longitude})) +
                        sin(radians(${latitude})) * sin(radians(g.latitude))
                    ))
                )
              ) <= 10
            LIMIT 1
        `;
        return !!achado;
    }

    async createReport(reportData) {
        const { id_usuario, motivo, descricao, categoria, latitude, longitude, endereco, imagem, tipo_imagem } = reportData;
        
        return await sql.begin(async sql => {
            const [novoReporte] = await sql`
                INSERT INTO reportes (
                    id_usuario, motivo, descricao, categoria, endereco
                ) VALUES (
                    ${id_usuario}, ${motivo}, ${descricao}, ${categoria}, ${endereco}
                )
                RETURNING *
            `;

            if (imagem) {
                await sql`
                    INSERT INTO imagens (fk_reporte, tipo_imagem, bin_imagem)
                    VALUES (${novoReporte.id_reporte}, ${tipo_imagem}, ${imagem})
                `;
            }

            await sql`
                INSERT INTO geolocalizacao (id_reporte, latitude, longitude)
                VALUES (${novoReporte.id_reporte}, ${latitude}, ${longitude})
            `;

            await sql`
                INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
                VALUES (${id_usuario}, ${novoReporte.id_reporte}, 'criador', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;

            return novoReporte;
        });
    }

    async getReports() {
        return await sql`
            SELECT r.*, g.latitude, g.longitude, i.bin_imagem AS imagem, i.tipo_imagem
            FROM reportes r
            LEFT JOIN geolocalizacao g ON r.id_reporte = g.id_reporte
            LEFT JOIN LATERAL (
                SELECT bin_imagem, tipo_imagem
                FROM imagens
                WHERE fk_reporte = r.id_reporte
                ORDER BY id_imagem DESC
                LIMIT 1
            ) i ON true
            WHERE r.status != 'denunciado' 
            ORDER BY r.data_hora DESC
        `;
    }

    async denunciarReport(id_reporte, id_usuario) {
        const [reporteAtualizado] = await sql`
            UPDATE reportes
            SET status = 'denunciado'
            WHERE id_reporte = ${id_reporte}
            RETURNING *
        `;
        return reporteAtualizado;
    }

    async registrarVoto(usuarioId, reporteId, tipo_contribuicao) {
        await sql`
            INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
            VALUES (${usuarioId}, ${reporteId}, ${tipo_contribuicao}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (id_usuario, id_reporte) 
            DO UPDATE SET 
                tipo_contribuicao = EXCLUDED.tipo_contribuicao,
                data_atualizacao = CURRENT_TIMESTAMP
        `;
    }

    async getVotosReporte(reporteId) {
        return await sql`
            SELECT tipo_contribuicao, COUNT(*) as qtd
            FROM usuario_reporte
            WHERE id_reporte = ${reporteId}
              AND tipo_contribuicao IN ('ainda_aqui', 'autoridades_c', 'autoridades_l', 'concluido')
            GROUP BY tipo_contribuicao
        `;
    }

    async updateStatusReporte(reporteId, novoStatus, imagem, tipo_imagem) {
        await sql`
            UPDATE reportes
            SET status = ${novoStatus}
            WHERE id_reporte = ${reporteId}
        `;

        if (imagem) {
            await sql`
                INSERT INTO imagens (fk_reporte, tipo_imagem, bin_imagem)
                VALUES (${reporteId}, ${tipo_imagem}, ${imagem})
            `;
        }
    }

    async getImagens(id_reporte) {
        return await sql`
            SELECT id_imagem, tipo_imagem, bin_imagem
            FROM imagens
            WHERE fk_reporte = ${id_reporte}
            ORDER BY id_imagem ASC
        `;
    }

    async getAtualizacoes(id_reporte) {
        return await sql`
            SELECT tipo_contribuicao, COUNT(*) as count, MAX(data_atualizacao) as last_update
            FROM usuario_reporte
            WHERE id_reporte = ${id_reporte}
            GROUP BY tipo_contribuicao
        `;
    }

    async avaliarReporte(id_reporte, id_usuario, nota) {
        return await sql.begin(async sql => {
            // grava o voto, ou atualiza se o usuario ja tinha avaliado
            await sql`
                INSERT INTO avaliacoes (id_reporte, id_usuario, nota)
                VALUES (${id_reporte}, ${id_usuario}, ${nota})
                ON CONFLICT (id_reporte, id_usuario)
                DO UPDATE SET nota = EXCLUDED.nota, data_avaliacao = CURRENT_TIMESTAMP
            `;

            // recalcula a media do reporte
            const [media] = await sql`
                SELECT AVG(nota)::numeric(3,2) as media
                FROM avaliacoes WHERE id_reporte = ${id_reporte}
            `;
            await sql`
                UPDATE reportes SET avaliacao = ${media.media}
                WHERE id_reporte = ${id_reporte}
            `;

            // atualiza a credibilidade do autor do reporte
            const [autor] = await sql`
                SELECT id_usuario FROM reportes WHERE id_reporte = ${id_reporte}
            `;
            const [cred] = await sql`
                SELECT AVG(a.nota)::numeric(3,2) as media
                FROM avaliacoes a
                JOIN reportes r ON a.id_reporte = r.id_reporte
                WHERE r.id_usuario = ${autor.id_usuario}
            `;
            await sql`
                UPDATE usuario SET credibilidade = ${cred.media || 0}
                WHERE id_usuario = ${autor.id_usuario}
            `;

            return media.media;
        });
    }

    async deletarReporte(id_reporte, id_usuario) {
        return await sql.begin(async sql => {
            // confirma que o reporte existe e pertence ao usuario
            const [reporte] = await sql`
                SELECT id_usuario FROM reportes WHERE id_reporte = ${id_reporte}
            `;

            if (!reporte) return { naoEncontrado: true };
            if (Number(reporte.id_usuario) !== Number(id_usuario)) return { semPermissao: true };

            // marca o reporte como excluido (mantem o registro para a contagem do perfil)
            await sql`
                UPDATE reportes SET status = 'excluido'
                WHERE id_reporte = ${id_reporte}
            `;

            return { sucesso: true };
        });
    }
}

module.exports = new ReportRepository();
