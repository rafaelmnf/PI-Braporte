const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Main API routes
app.use('/api', apiRoutes);

// Fallback 404 for unknown endpoints
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

module.exports = app;
