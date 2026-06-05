const sql = require('../config/db');

class AcaoRepository {
    async criarAcao(dados) {
        const { id_criador, titulo, descricao, categoria, local, data_acao, hora_acao, imagem } = dados;
        return await sql.begin(async sql => {
            // cria a acao
            const [acao] = await sql`
                INSERT INTO acoes_comunitarias (id_criador, titulo, descricao, categoria, local, data_acao, hora_acao, imagem)
                VALUES (${id_criador}, ${titulo}, ${descricao}, ${categoria}, ${local}, ${data_acao}, ${hora_acao}, ${imagem || null})
                RETURNING *
            `;
            // o criador ja entra como participante
            await sql`
                INSERT INTO acao_participantes (id_acao, id_usuario)
                VALUES (${acao.id_acao}, ${id_criador})
                ON CONFLICT (id_acao, id_usuario) DO NOTHING
            `;
            return acao;
        });
    }

    async listarAcoes() {
        return await sql`
            SELECT a.*, u.nome_completo AS criador,
                   (SELECT COUNT(*) FROM acao_participantes p WHERE p.id_acao = a.id_acao) AS participantes
            FROM acoes_comunitarias a
            JOIN usuario u ON a.id_criador = u.id_usuario
            ORDER BY a.data_criacao DESC
        `;
    }

    async getAcao(id_acao) {
        const [acao] = await sql`
            SELECT * FROM acoes_comunitarias WHERE id_acao = ${id_acao}
        `;
        return acao;
    }

    async ingressar(id_acao, id_usuario) {
        await sql`
            INSERT INTO acao_participantes (id_acao, id_usuario)
            VALUES (${id_acao}, ${id_usuario})
            ON CONFLICT (id_acao, id_usuario) DO NOTHING
        `;
    }

    async sair(id_acao, id_usuario) {
        await sql`
            DELETE FROM acao_participantes
            WHERE id_acao = ${id_acao} AND id_usuario = ${id_usuario}
        `;
    }

    async participantesDoUsuario(id_usuario) {
        const rows = await sql`
            SELECT id_acao FROM acao_participantes WHERE id_usuario = ${id_usuario}
        `;
        return rows.map(r => r.id_acao);
    }

    async concluirAcao(id_acao) {
        await sql`
            UPDATE acoes_comunitarias SET status = 'concluida'
            WHERE id_acao = ${id_acao}
        `;
    }

    async deletarAcao(id_acao) {
        return await sql.begin(async sql => {
            await sql`DELETE FROM acao_participantes WHERE id_acao = ${id_acao}`;
            await sql`DELETE FROM acoes_comunitarias WHERE id_acao = ${id_acao}`;
        });
    }
}

module.exports = new AcaoRepository();
