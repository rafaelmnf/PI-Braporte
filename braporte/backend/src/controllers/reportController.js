exports.createReport = (req, res) => {
    res.status(200).json({ 
        sucesso: true, 
        mensagem: 'Reporte criado' 
    });
};

exports.getReports = (req, res) => {
    res.status(200).json({ reportes: [] });
};
