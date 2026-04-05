const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');

// Serve a configuração do Mapbox para o Frontend
router.get('/config/mapbox', (req, res) => {
    res.json({ token: process.env.MAPBOX_TOKEN || '' });
});

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/reportes', reportController.createReport);
router.get('/reportes', reportController.getReports);

// Exemplo simples de uso do banco de dados direto na rota
const db = require('../config/db');

router.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW() AS data_atual;');
        res.json({
            status: 'sucesso',
            mensagem: 'Conexão com banco funcionando perfeitamente!',
            dataBanco: result.rows[0].data_atual
        });
    } catch (error) {
        console.error('Erro na rota de teste do DB:', error);
        res.status(500).json({ status: 'erro', mensagem: 'Falha ao conectar no banco' });
    }
});

module.exports = router;
