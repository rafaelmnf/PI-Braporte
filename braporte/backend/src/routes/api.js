const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const userController = require('../controllers/userController');
const acaoController = require('../controllers/acaoController');

// Serve a configuração do Mapbox para o Frontend
router.get('/config/mapbox', (req, res) => {
    res.json({ token: process.env.MAPBOX_TOKEN || '' });
});

router.get('/usuarios/:id', userController.getUser);
router.get('/usuarios/:id/endereco', userController.getUserAddress);
router.post('/usuarios/:id/foto', userController.updateFotoPerfil);
router.get('/usuarios/:id/foto', userController.getFotoPerfil);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

router.post('/reportes', reportController.createReport);
router.get('/reportes', reportController.getReports);
router.patch('/reportes/:id/denunciar', reportController.denunciarReport);
router.delete('/reportes/:id', reportController.deletarReporte);

router.post('/reportes/:id/atualizar', reportController.atualizarReporteStatus);
router.get('/reportes/:id/atualizacoes', reportController.getAtualizacoesReporte);
router.get('/reportes/:id/imagens', reportController.getImagensReporte);
router.post('/reportes/:id/avaliar', reportController.avaliarReporte);

router.get('/acoes', acaoController.listarAcoes);
router.post('/acoes', acaoController.criarAcao);
router.post('/acoes/:id/ingressar', acaoController.ingressar);
router.post('/acoes/:id/sair', acaoController.sair);
router.post('/acoes/:id/concluir', acaoController.concluirAcao);
router.delete('/acoes/:id', acaoController.deletarAcao);
router.get('/usuarios/:id/participacoes', acaoController.minhasParticipacoes);

module.exports = router;
