const authRepository = require('../repositories/authRepository');
const bcrypt = require('bcrypt');
const { generateToken } = require('../config/jwt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class AuthService {
    async login(email, senha) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        const senhaCorreta = await bcrypt.compare(senha, user.senha_hash);
        if (!senhaCorreta) {
            throw new Error('Credenciais inválidas');
        }

        const token = generateToken(user);
        return {
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nome_completo: user.nome_completo,
                email: user.email,
                cpf: user.cpf
            }
        };
    }

    async register(userData) {
        const { nome, email, cpf, senha, telefone, cep, rua, numero, complemento, cidade, estado } = userData;

        const cpfLimpo = cpf.replace(/\D/g, '');
        const telLimpo = telefone.replace(/\D/g, '');
        const cepLimpo = cep.replace(/\D/g, '');

        const existingUser = await authRepository.checkEmailOrCpfExists(email, cpfLimpo);
        if (existingUser.length > 0) {
            throw new Error('E-mail ou CPF já cadastrados');
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        const newUser = await authRepository.createUser(nome, email, cpfLimpo, senhaHash, telLimpo);
        
        await authRepository.createAddress(newUser.id_usuario, rua, numero, complemento, cepLimpo, cidade, estado);

        return newUser;
    }

    async forgotPassword(email) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) return; // Prevent enumeration

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expira_em = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        await authRepository.saveOtp(user.id_usuario, otp, expira_em);

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
    }

    async verifyOtp(email, otp) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new Error('Código inválido ou expirado');

        const tokenResult = await authRepository.getValidToken(user.id_usuario, otp);
        if (tokenResult.length === 0) throw new Error('Código inválido ou expirado');
    }

    async resetPassword(email, otp, novaSenha) {
        const user = await authRepository.findUserByEmail(email);
        if (!user) throw new Error('Solicitação inválida');

        const tokenResult = await authRepository.getValidToken(user.id_usuario, otp);
        if (tokenResult.length === 0) throw new Error('Código inválido ou expirado');

        const tokenId = tokenResult[0].id;
        const senhaHash = await bcrypt.hash(novaSenha, 10);

        await authRepository.updatePassword(user.id_usuario, senhaHash);
        await authRepository.markTokenAsUsed(tokenId);
    }
}

module.exports = new AuthService();
