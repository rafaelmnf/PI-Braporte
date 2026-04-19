const API_URL = 'http://localhost:3000/api';

export const api = {
    async login(email, senha) {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        if (!response.ok) throw new Error('Erro no login');
        return response.json();
    },

    async register(nome, email, cpf, senha, telefone, cep, rua, numero, complemento, cidade, estado) {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, cpf, senha, telefone, cep, rua, numero, complemento, cidade, estado })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.mensagem || 'Erro ao registrar conta');
        }
        return data;
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
    },

    async denunciarReport(id) {
        const response = await fetch(`${API_URL}/reportes/${id}/denunciar`, {
            method: 'PATCH'
        });
        if (!response.ok) throw new Error('Erro ao denunciar reporte');
        return response.json();
    },

    async getMapConfig() {
        const response = await fetch(`${API_URL}/config/mapbox`);
        if (!response.ok) throw new Error('Erro ao buscar config do mapa');
        return response.json();
    },

    async getAtualizacoes(id) {
        const response = await fetch(`${API_URL}/reportes/${id}/atualizacoes`);
        if (!response.ok) throw new Error('Erro ao buscar atualizações');
        return response.json();
    },

    async atualizarStatus(id, id_usuario, tipo_contribuicao) {
        const response = await fetch(`${API_URL}/reportes/${id}/atualizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario, tipo_contribuicao })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    }
};
