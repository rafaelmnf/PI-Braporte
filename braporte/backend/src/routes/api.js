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
router.patch('/reportes/:id/denunciar', reportController.denunciarReport);


module.exports = router;
