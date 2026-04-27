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
        // Garantir que a tabela geolocalizacao exista (o campo id_reporte_unique deve ser adicionado via migração ou DDL)
        await sql`
            CREATE TABLE IF NOT EXISTS geolocalizacao (
                id_geolocalizacao SERIAL PRIMARY KEY,
                id_reporte INT NOT NULL UNIQUE,
                latitude NUMERIC NOT NULL,
                longitude NUMERIC NOT NULL,
                FOREIGN KEY (id_reporte) REFERENCES reportes(id_reporte) ON DELETE CASCADE
            );
        `;

        console.log('Limpando tabelas para evitar duplicatas nos dados de teste...');
        // O CASCADE no TRUNCATE cuidará da geolocalizacao se houver FK
        await sql`TRUNCATE TABLE reportes RESTART IDENTITY CASCADE`;

        console.log('Inserindo os reportes mock...');

        for (const report of mockReports) {
            // 1. Inserir Reporte
            const [novoReporte] = await sql`
                INSERT INTO reportes (
                    id_usuario, status, data_hora, motivo, descricao, categoria, endereco
                ) VALUES (
                    ${report.id_usuario}, ${report.status}, ${report.data_hora}, ${report.motivo},
                    ${report.descricao}, ${report.categoria}, ${report.endereco}
                )
                RETURNING id_reporte
            `;

            // 2. Inserir Geolocalização
            await sql`
                INSERT INTO geolocalizacao (id_reporte, latitude, longitude)
                VALUES (${novoReporte.id_reporte}, ${report.latitude}, ${report.longitude})
            `;

            // 3. (Opcional para seed) Registrar como criador
            await sql`
                INSERT INTO usuario_reporte (id_usuario, id_reporte, tipo_contribuicao)
                VALUES (${report.id_usuario}, ${novoReporte.id_reporte}, 'criador')
                ON CONFLICT DO NOTHING
            `;
        }

        console.log('✅ Seed completado com sucesso! Os reportes de teste foram inseridos com geolocalização separada.');
    } catch (error) {
        console.error('❌ Erro durante o Seed:', error);
    } finally {
        process.exit();
    }
}

seed();
