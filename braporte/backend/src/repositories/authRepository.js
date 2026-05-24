const db = require('../config/db');

class AuthRepository {
    async findUserByEmail(email) {
        const result = await db`SELECT * FROM USUARIO WHERE email = ${email}`;
        return result[0];
    }

    async checkEmailOrCpfExists(email, cpf) {
        return await db`SELECT id_usuario FROM USUARIO WHERE email = ${email} OR cpf = ${cpf}`;
    }

    async createUser(nome, email, cpf, senhaHash, telefone) {
        const insertResult = await db`
            INSERT INTO USUARIO (nome_completo, email, cpf, senha_hash, telefone)
            VALUES (${nome}, ${email}, ${cpf}, ${senhaHash}, ${telefone})
            RETURNING id_usuario, nome_completo, email;
        `;
        return insertResult[0];
    }

    async createAddress(userId, rua, numero, complemento, cep, cidade, estado) {
        await db`
            INSERT INTO ENDERECO (id_usuario, rua, numero, complemento, cep, cidade, estado)
            VALUES (${userId}, ${rua}, ${numero}, ${complemento || null}, ${cep}, ${cidade}, ${estado})
        `;
    }

    async saveOtp(userId, otp, expira_em) {
        await db`
            INSERT INTO usuario_tokens (usuario_id, tipo, codigo, expira_em)
            VALUES (${userId}, 'reset_senha', ${otp}, ${expira_em})
        `;
    }

    async getValidToken(userId, otp) {
        return await db`
            SELECT id FROM usuario_tokens
            WHERE usuario_id = ${userId}
              AND tipo = 'reset_senha'
              AND codigo = ${otp}
              AND usado = FALSE
              AND expira_em > NOW()
            ORDER BY criado_em DESC LIMIT 1
        `;
    }

    async updatePassword(userId, senhaHash) {
        await db`
            UPDATE USUARIO
            SET senha_hash = ${senhaHash}
            WHERE id_usuario = ${userId}
        `;
    }

    async markTokenAsUsed(tokenId) {
        await db`
            UPDATE usuario_tokens
            SET usado = TRUE
            WHERE id = ${tokenId}
        `;
    }

    async updateFotoPerfil(userId, imagem) {
        await db`
            UPDATE USUARIO
            SET foto_perfil = ${imagem}
            WHERE id_usuario = ${userId}
        `;
    }

    async getFotoPerfil(userId) {
        const result = await db`
            SELECT foto_perfil FROM USUARIO WHERE id_usuario = ${userId}
        `;
        return result[0]?.foto_perfil || null;
    }
}

module.exports = new AuthRepository();
