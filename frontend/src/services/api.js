const API_URL = 'http://localhost:3000/api';

export const api = {
    async login(email, senha, cpf) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, cpf })
        });
        if (!response.ok) throw new Error('Erro no login');
        return response.json();
    },

    async createReport(dados) {
        const response = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar reporte');
        return response.json();
    },

    async getReports() {
        const response = await fetch(`${API_URL}/reportes`);
        if (!response.ok) throw new Error('Erro ao buscar reportes');
        return response.json();
    }
};
