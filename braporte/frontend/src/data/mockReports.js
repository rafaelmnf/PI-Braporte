/**
 * @type {import('../types/report').Reporte[]}
 */
export const mockReports = [
    {
        id_reporte: 101,
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
        id_reporte: 102,
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
        id_reporte: 103,
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
        id_reporte: 104,
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
