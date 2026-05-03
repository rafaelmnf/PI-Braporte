const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');
const userController = require('../controllers/userController');

// Serve a configuração do Mapbox para o Frontend
router.get('/config/mapbox', (req, res) => {
    res.json({ token: process.env.MAPBOX_TOKEN || '' });
});

router.get('/usuarios/:id/endereco', userController.getUserAddress);

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

router.post('/reportes', reportController.createReport);
router.get('/reportes', reportController.getReports);
router.patch('/reportes/:id/denunciar', reportController.denunciarReport);

router.post('/reportes/:id/atualizar', reportController.atualizarReporteStatus);
router.get('/reportes/:id/atualizacoes', reportController.getAtualizacoesReporte);
router.get('/reportes/:id/imagens', reportController.getImagensReporte);

module.exports = router;
