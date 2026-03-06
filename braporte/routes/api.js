const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    // implementar autenticação real com banco de dados
    // Por enquanto retorna sucesso sempre
    res.json({ sucesso: true, mensagem: 'Login realizado' });
});

router.post('/reportes', (req, res) => {
    const { categoria, descricao, latitude, longitude } = req.body;
    // salvar reporte no banco de dados
    res.json({ sucesso: true, mensagem: 'Reporte criado' });
});

router.get('/reportes', (req, res) => {
    // buscar reportes do banco de dados
    res.json({ reportes: [] });
});

module.exports = router;
