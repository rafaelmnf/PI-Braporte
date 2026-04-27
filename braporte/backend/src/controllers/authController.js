const db = require('../config/db'); // db agora é nativamente o sql de postgres.js
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Validar campos obrigatórios
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                mensagem: 'E-mail e senha são obrigatórios.'
            });
        }

        // 2. Buscar o usuário
        // Nova sintaxe do postgres.js (Tagged template literal)
        const result = await db`SELECT * FROM USUARIO WHERE email = ${email}`;

        // No postgres.js, result já é uma array com as linhas.
        const user = result[0];

        // Se não retornou ninguém
        if (!user) {
            return res.status(401).json({
                success: false,
                mensagem: 'Credenciais inválidas. Verifique seu e-mail e senha.'
            });
        }

        // 3. Comparar a senha
        const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);

        if (!senhaCorreta) {
            return res.status(401).json({
                success: false,
                mensagem: 'Credenciais inválidas. Verifique seu e-mail e senha.'
            });
        }

        // 4. Gerar JWT
        const token = generateToken(user);

        // 5. Retornar resposta
        res.status(200).json({
            success: true,
            mensagem: 'Login realizado com sucesso!',
            token: token,
            usuario: {
                id_usuario: user.id_usuario,
                nome_completo: user.nome_completo,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro no servidor ao tentar logar:', error);
        res.status(500).json({
            success: false,
            mensagem: 'Ocorreu um erro interno no servidor.'
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { nome, email, cpf, senha, telefone, cep, rua, numero, complemento, cidade, estado } = req.body;

        if (!nome || !email || !cpf || !senha || !telefone || !cep || !rua || !numero || !cidade || !estado) {
            return res.status(400).json({
                success: false,
                mensagem: 'Todos os campos são obrigatórios.'
            });
        }

        const cpfLimpo = cpf.replace(/\D/g, '');
        const telLimpo = telefone.replace(/\D/g, '');
        const cepLimpo = cep.replace(/\D/g, '');

        // Validar e Checar se o id já existe usando o postgres.js
        const checkResult = await db`SELECT id_usuario FROM USUARIO WHERE email = ${email} OR cpf = ${cpfLimpo}`;

        if (checkResult.length > 0) {
            return res.status(400).json({
                success: false,
                mensagem: 'Este e-mail ou CPF já estão cadastrados em nosso sistema.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserção do usuário contendo o telefone
        const insertResult = await db`
            INSERT INTO USUARIO (nome_completo, email, cpf, senha_hash, telefone)
            VALUES (${nome}, ${email}, ${cpfLimpo}, ${senhaHash}, ${telLimpo})
            RETURNING id_usuario, nome_completo, email;
        `;

        const newUser = insertResult[0];

        // Inserção na tabela endereco
        await db`
            INSERT INTO ENDERECO (id_usuario, rua, numero, complemento, cep, cidade, estado)
            VALUES (${newUser.id_usuario}, ${rua}, ${numero}, ${complemento || null}, ${cepLimpo}, ${cidade}, ${estado})
        `;

        res.status(201).json({
            success: true,
            mensagem: 'Conta criada com sucesso!',
            usuario: newUser
        });

    } catch (error) {
        console.error('Erro no servidor ao tentar registrar:', error);
        res.status(500).json({
            success: false,
            mensagem: 'Ocorreu um erro interno no servidor.'
        });
    }
};

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, mensagem: 'E-mail é obrigatório.' });
        }

        // Check if user exists
        const result = await db`SELECT id_usuario, nome_completo FROM USUARIO WHERE email = ${email}`;
        const user = result[0];

        if (!user) {
            // Return success even if not found to prevent email enumeration
            return res.status(200).json({ success: true, mensagem: 'Se o e-mail existir, um código foi enviado.' });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 15 minutes
        const expira_em = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Save OTP to DB
        await db`
            INSERT INTO usuario_tokens (usuario_id, tipo, codigo, expira_em)
            VALUES (${user.id_usuario}, 'reset_senha', ${otp}, ${expira_em})
        `;

        // Send Email via Nodemailer

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Braporte" <no-reply@braporte.com>',
            to: email,
            subject: 'Seu código de recuperação de senha',
            html: `
                <h2>Olá ${user.nome_completo},</h2>
                <p>Você solicitou a redefinição de sua senha.</p>
                <p>Seu código de verificação é: <strong>${otp}</strong></p>
                <p>Este código expira em 15 minutos.</p>
            `
        });

        res.status(200).json({ success: true, mensagem: 'Se o e-mail existir, um código foi enviado.' });

    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor.' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ success: false, mensagem: 'E-mail e código são obrigatórios.' });
        }

        const userResult = await db`SELECT id_usuario FROM USUARIO WHERE email = ${email}`;
        const user = userResult[0];

        if (!user) {
            return res.status(400).json({ success: false, mensagem: 'Código inválido ou expirado.' });
        }

        // Check token
        const tokenResult = await db`
            SELECT id FROM usuario_tokens
            WHERE usuario_id = ${user.id_usuario}
              AND tipo = 'reset_senha'
              AND codigo = ${otp}
              AND usado = FALSE
              AND expira_em > NOW()
            ORDER BY criado_em DESC LIMIT 1
        `;

        if (tokenResult.length === 0) {
            return res.status(400).json({ success: false, mensagem: 'Código inválido ou expirado.' });
        }

        res.status(200).json({ success: true, mensagem: 'Código verificado com sucesso.' });

    } catch (error) {
        console.error('Erro ao verificar código:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, novaSenha } = req.body;
        if (!email || !otp || !novaSenha) {
            return res.status(400).json({ success: false, mensagem: 'Todos os campos são obrigatórios.' });
        }

        const userResult = await db`SELECT id_usuario FROM USUARIO WHERE email = ${email}`;
        const user = userResult[0];

        if (!user) {
            return res.status(400).json({ success: false, mensagem: 'Solicitação inválida.' });
        }

        // Validate token again
        const tokenResult = await db`
            SELECT id FROM usuario_tokens
            WHERE usuario_id = ${user.id_usuario}
              AND tipo = 'reset_senha'
              AND codigo = ${otp}
              AND usado = FALSE
              AND expira_em > NOW()
            ORDER BY criado_em DESC LIMIT 1
        `;

        if (tokenResult.length === 0) {
            return res.status(400).json({ success: false, mensagem: 'Código inválido ou expirado.' });
        }

        const tokenId = tokenResult[0].id;

        // Hash new password
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        // Update password
        await db`
            UPDATE USUARIO
            SET senha_hash = ${senhaHash}
            WHERE id_usuario = ${user.id_usuario}
        `;

        // Mark token as used
        await db`
            UPDATE usuario_tokens
            SET usado = TRUE
            WHERE id = ${tokenId}
        `;

        res.status(200).json({ success: true, mensagem: 'Senha redefinida com sucesso.' });

    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor.' });
    }
};
