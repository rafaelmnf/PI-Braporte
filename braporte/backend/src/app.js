const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
 
const app = express();
 
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
 
// Main API routes
app.use('/api', apiRoutes);
 
// Fallback 404 for unknown endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});
 
module.exports = app;
 