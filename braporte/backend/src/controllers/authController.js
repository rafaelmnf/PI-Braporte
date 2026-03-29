exports.login = (req, res) => {
    res.status(200).json({ 
        sucesso: true, 
        mensagem: 'Login realizado' 
    });
};
