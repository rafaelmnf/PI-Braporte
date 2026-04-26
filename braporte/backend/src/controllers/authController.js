const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ success: false, mensagem: 'E-mail e senha são obrigatórios.' });
        }

        const authData = await authService.login(email, senha);
        res.status(200).json({
            success: true,
            mensagem: 'Login realizado com sucesso!',
            ...authData
        });
    } catch (error) {
        if (error.message === 'Credenciais inválidas') {
            return res.status(401).json({ success: false, mensagem: 'Credenciais inválidas. Verifique seu e-mail e senha.' });
        }
        console.error('Erro no servidor ao tentar logar:', error);
        res.status(500).json({ success: false, mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};

exports.register = async (req, res) => {
    try {
        const { nome, email, cpf, senha, telefone, cep, rua, numero, cidade, estado } = req.body;
        if (!nome || !email || !cpf || !senha || !telefone || !cep || !rua || !numero || !cidade || !estado) {
            return res.status(400).json({ success: false, mensagem: 'Todos os campos são obrigatórios.' });
        }

        const newUser = await authService.register(req.body);
        res.status(201).json({ success: true, mensagem: 'Conta criada com sucesso!', usuario: newUser });
    } catch (error) {
        if (error.message === 'E-mail ou CPF já cadastrados') {
            return res.status(400).json({ success: false, mensagem: 'Este e-mail ou CPF já estão cadastrados em nosso sistema.' });
        }
        console.error('Erro no servidor ao tentar registrar:', error);
        res.status(500).json({ success: false, mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, mensagem: 'E-mail é obrigatório.' });

        await authService.forgotPassword(email);
        res.status(200).json({ success: true, mensagem: 'Se o e-mail existir, um código foi enviado.' });
    } catch (error) {
        console.error('Erro ao solicitar redefinição de senha:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor.' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, mensagem: 'E-mail e código são obrigatórios.' });

        await authService.verifyOtp(email, otp);
        res.status(200).json({ success: true, mensagem: 'Código verificado com sucesso.' });
    } catch (error) {
        if (error.message === 'Código inválido ou expirado') {
            return res.status(400).json({ success: false, mensagem: error.message });
        }
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

        await authService.resetPassword(email, otp, novaSenha);
        res.status(200).json({ success: true, mensagem: 'Senha redefinida com sucesso.' });
    } catch (error) {
        if (error.message === 'Solicitação inválida' || error.message === 'Código inválido ou expirado') {
            return res.status(400).json({ success: false, mensagem: error.message });
        }
        console.error('Erro ao redefinir senha:', error);
        res.status(500).json({ success: false, mensagem: 'Erro interno no servidor.' });
    }
};
