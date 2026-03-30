const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const reportController = require('../controllers/reportController');

router.post('/login', authController.login);
router.post('/reportes', reportController.createReport);
router.get('/reportes', reportController.getReports);

module.exports = router;
