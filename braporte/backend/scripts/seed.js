require('dotenv').config({ path: __dirname + '/../.env' });
const sql = require('../src/config/db');

// Dados baseados no mockReports.js do frontend
const mockReports = [
    {
        id_usuario: 1,
        status: 'aberto',
        data_hora: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 horas atrás
        motivo: 'Buraco perigoso na via',
        descricao: 'Cratera formada após chuva intensa. Risco grave para motoqueiros.',
        categoria: 'infraestrutura',
        latitude: -23.5505,
        longitude: -46.6333,
        endereco: 'Av. Paulista, 1000 - Bela Vista'
    },
    {
        id_usuario: 2,
        status: 'em_analise',
        data_hora: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 dia atrás
        motivo: 'Vazamento de esgoto',
        descricao: 'Bueiro entupido vazando água suja pela rua toda.',
        categoria: 'saneamento',
        latitude: -23.5555,
        longitude: -46.6433,
        endereco: 'Rua Augusta, 500 - Consolação'
    },
    {
        id_usuario: 3,
        status: 'resolvido',
        data_hora: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 dias atrás
        motivo: 'Lâmpada queimada Poste #45',
        descricao: 'Rua muito escura, facilitando assaltos.',
        categoria: 'seguranca',
        latitude: -23.5480,
        longitude: -46.6280,
        endereco: 'Rua Direita, 20 - Centro'
    },
    {
        id_usuario: 4,
        status: 'em_andamento',
        data_hora: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
        motivo: 'Acúmulo de Lixo',
        descricao: 'Lixo não recolhido há uma semana.',
        categoria: 'meio-ambiente',
        latitude: -23.5600,
        longitude: -46.6350,
        endereco: 'Rua Vinte e Três de Maio, s/n'
    }
];

async function seed() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS reportes (
                id_reporte SERIAL PRIMARY KEY,
                id_usuario INT NOT NULL,
                status VARCHAR(50) DEFAULT 'aberto',
                data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                motivo VARCHAR(255) NOT NULL,
                descricao TEXT,
                categoria VARCHAR(100),
                latitude DOUBLE PRECISION NOT NULL,
                longitude DOUBLE PRECISION NOT NULL,
                endereco VARCHAR(255)
            );
        `;

        console.log('Limpando tabela para evitar duplicatas nos dados de teste...');
        await sql`TRUNCATE TABLE reportes RESTART IDENTITY CASCADE`;

        console.log('Inserindo os reportes mock...');

        for (const report of mockReports) {
            await sql`
                INSERT INTO reportes (
                    id_usuario, status, data_hora, motivo, descricao, categoria, latitude, longitude, endereco
                ) VALUES (
                    ${report.id_usuario}, ${report.status}, ${report.data_hora}, ${report.motivo},
                    ${report.descricao}, ${report.categoria}, ${report.latitude}, ${report.longitude},
                    ${report.endereco}
                )
            `;
        }

        console.log('✅ Seed completado com sucesso! Os reportes de teste foram inseridos no banco PostgreSQL.');
    } catch (error) {
        console.error('❌ Erro durante o Seed:', error);
    } finally {
        process.exit();
    }
}

seed();
