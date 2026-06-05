const API_URL = 'http://localhost:3000/api';

export const api = {
    async getUser(id) {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar dados do usuário');
        return response.json();
    },

    async getUserAddress(id) {
        const response = await fetch(`${API_URL}/usuarios/${id}/endereco`);
        if (!response.ok) throw new Error('Erro ao buscar endereço');
        return response.json();
    },

    async updateFotoPerfil(id, imagem) {
        const response = await fetch(`${API_URL}/usuarios/${id}/foto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imagem })
        });
        if (!response.ok) throw new Error('Erro ao atualizar foto');
        return response.json();
    },

    async getFotoPerfil(id) {
        const response = await fetch(`${API_URL}/usuarios/${id}/foto`);
        if (!response.ok) throw new Error('Erro ao buscar foto');
        return response.json();
    },

    async geocode(address) {
        const config = await this.getMapConfig();
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${config.token}&country=br`);
        if (!response.ok) throw new Error('Erro ao geocodificar endereço');
        return response.json();
    },

    async reverseGeocode(lat, lng) {
        const config = await this.getMapConfig();
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${config.token}&types=address,poi`);
        if (!response.ok) throw new Error('Erro ao buscar endereço reverso');
        return response.json();
    },

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

    async forgotPassword(email) {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem || 'Erro ao solicitar redefinição');
        return data;
    },

    async verifyOtp(email, otp) {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem || 'Erro ao verificar código');
        return data;
    },

    async resetPassword(email, otp, novaSenha) {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, novaSenha })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.mensagem || 'Erro ao redefinir senha');
        return data;
    },

    async createReport(dados) {
        const response = await fetch(`${API_URL}/reportes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) {
            // usa a mensagem que o backend mandou (ex: "Esse reporte já existe.")
            let msg = 'Erro ao criar reporte';
            try {
                const erro = await response.json();
                if (erro && erro.error) msg = erro.error;
            } catch { /* mantem a mensagem padrao */ }
            throw new Error(msg);
        }
        return response.json();
    },

    async getReports() {
        const response = await fetch(`${API_URL}/reportes`);
        if (!response.ok) throw new Error('Erro ao buscar reportes');
        return response.json();
    },

    async denunciarReport(id, id_usuario) {
        const response = await fetch(`${API_URL}/reportes/${id}/denunciar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao denunciar reporte');
        return response.json();
    },

    async deletarReporte(id, id_usuario) {
        const response = await fetch(`${API_URL}/reportes/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao excluir reporte');
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

    async getImagens(id) {
        const response = await fetch(`${API_URL}/reportes/${id}/imagens`);
        if (!response.ok) throw new Error('Erro ao buscar imagens');
        return response.json();
    },

    async atualizarStatus(id, id_usuario, tipo_contribuicao, imagem = null) {
        const response = await fetch(`${API_URL}/reportes/${id}/atualizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario, tipo_contribuicao, imagem })
        });
        if (!response.ok) throw new Error('Erro ao atualizar status');
        return response.json();
    },

    async avaliarReporte(id, id_usuario, nota) {
        const response = await fetch(`${API_URL}/reportes/${id}/avaliar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario, nota })
        });
        if (!response.ok) throw new Error('Erro ao avaliar reporte');
        return response.json();
    },

    async getAcoes() {
        const response = await fetch(`${API_URL}/acoes`);
        if (!response.ok) throw new Error('Erro ao buscar ações');
        return response.json();
    },

    async criarAcao(dados) {
        const response = await fetch(`${API_URL}/acoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!response.ok) throw new Error('Erro ao criar ação');
        return response.json();
    },

    async ingressarAcao(id, id_usuario) {
        const response = await fetch(`${API_URL}/acoes/${id}/ingressar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao ingressar na ação');
        return response.json();
    },

    async sairAcao(id, id_usuario) {
        const response = await fetch(`${API_URL}/acoes/${id}/sair`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao sair da ação');
        return response.json();
    },

    async getMinhasParticipacoes(id_usuario) {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}/participacoes`);
        if (!response.ok) throw new Error('Erro ao buscar participações');
        return response.json();
    },

    async concluirAcao(id, id_usuario) {
        const response = await fetch(`${API_URL}/acoes/${id}/concluir`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao concluir ação');
        return response.json();
    },

    async deletarAcao(id, id_usuario) {
        const response = await fetch(`${API_URL}/acoes/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_usuario })
        });
        if (!response.ok) throw new Error('Erro ao excluir ação');
        return response.json();
    }
};
