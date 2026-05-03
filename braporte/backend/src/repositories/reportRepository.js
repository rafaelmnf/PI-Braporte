const sql = require('../config/db');

class ReportRepository {
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
        return await sql.begin(async sql => {
            const [reporteAtualizado] = await sql`
                UPDATE reportes
                SET status = 'denunciado'
                WHERE id_reporte = ${id_reporte}
                RETURNING *
            `;

            if (reporteAtualizado) {
                await sql`
                    INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao, data_contribuicao, data_atualizacao)
                    VALUES (${id_usuario}, ${id_reporte}, 'denuncia', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (id_usuario, id_reporte) 
                    DO UPDATE SET 
                        tipo_contribuicao = 'denuncia',
                        data_atualizacao = CURRENT_TIMESTAMP
                `;
            }

            return reporteAtualizado;
        });
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
}

module.exports = new ReportRepository();
