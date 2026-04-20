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
