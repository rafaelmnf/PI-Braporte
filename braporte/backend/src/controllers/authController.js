const db = require('../config/db'); // Nossa conexão banco de dados
const bcrypt = require('bcrypt'); // Biblioteca para comparar hash
const { generateToken } = require('../config/jwt'); // Nossa função para gerar o JWT

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

        // 2. Buscar o usuário usando uma query parametrizada SEGURA ($1)
        const query = 'SELECT * FROM USUARIO WHERE email = $1';
        const result = await db.query(query, [email]);
        const user = result.rows[0];

        // Se o banco não retornou ninguém, o usuário não existe
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

        // 4. Se a senha confere, geramos o token
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
        const { nome, email, cpf, senha } = req.body;

        if (!nome || !email || !cpf || !senha) {
            return res.status(400).json({
                success: false,
                mensagem: 'Todos os campos são obrigatórios.'
            });
        }

        const checkQuery = 'SELECT id_usuario FROM USUARIO WHERE email = $1 OR cpf = $2';
        // Remove os pontos e hífens do CPF pra caber no CHAR(11) do banco
        const cpfLimpo = cpf.replace(/\D/g, '');

        const checkResult = await db.query(checkQuery, [email, cpfLimpo]);

        if (checkResult.rows.length > 0) {
            return res.status(400).json({
                success: false,
                mensagem: 'Este e-mail ou CPF já estão cadastrados em nosso sistema.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const insertQuery = `
            INSERT INTO USUARIO (nome_completo, email, cpf, senha_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id_usuario, nome_completo, email;
        `;
        
        const insertResult = await db.query(insertQuery, [nome, email, cpfLimpo, senhaHash]);
        const newUser = insertResult.rows[0];

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
