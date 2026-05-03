const reportRepository = require('../repositories/reportRepository');
const imageService = require('./imageService');

class ReportService {
    async createReport(reportData) {
        // Fallback p/ id_usuario se o auth ainda não injetar req.user
        reportData.id_usuario = reportData.id_usuario || 1; 

        // Processamento da imagem
        if (reportData.imagem) {
            const decoded = imageService.decodeBase64(reportData.imagem);
            if (decoded) {
                reportData.imagem = decoded.buffer;
                reportData.tipo_imagem = decoded.type;
            }
        }

        const novoReporte = await reportRepository.createReport(reportData);

        return {
            ...novoReporte,
            latitude: reportData.latitude,
            longitude: reportData.longitude,
            imagem: imageService.encodeBase64(reportData.imagem, reportData.tipo_imagem)
        };
    }

    async getReports() {
        const reportes = await reportRepository.getReports();
        return reportes.map(r => ({
            ...r,
            imagem: imageService.encodeBase64(r.imagem, r.tipo_imagem)
        }));
    }

    async denunciarReport(id_reporte, id_usuario) {
        const usuarioLogado = id_usuario || 1;
        return await reportRepository.denunciarReport(id_reporte, usuarioLogado);
    }

    async atualizarStatus(reporteId, usuarioId, tipo_contribuicao, imagemBase64) {
        // 1. Registrar voto
        await reportRepository.registrarVoto(usuarioId, reporteId, tipo_contribuicao);

        // 2. Agregação e Decisão do Status Pai
        const votos = await reportRepository.getVotosReporte(reporteId);

        let totalVotosComunidade = 0;
        const contagem = { 'ainda_aqui': 0, 'autoridades_c': 0, 'autoridades_l': 0, 'concluido': 0 };

        votos.forEach(voto => {
            const count = parseInt(voto.qtd, 10);
            totalVotosComunidade += count;
            if (contagem[voto.tipo_contribuicao] !== undefined) {
                contagem[voto.tipo_contribuicao] = count;
            }
        });

        let novoStatus = 'aberto';
        
        if (totalVotosComunidade > 0) {
            const percAindaAqui = contagem['ainda_aqui'] / totalVotosComunidade;
            const percConcluido = contagem['concluido'] / totalVotosComunidade;
            const temAutoridades = contagem['autoridades_c'] > 0 || contagem['autoridades_l'] > 0;

            if (percConcluido > 0.7) {
                novoStatus = 'resolvido';
            } else if (temAutoridades) {
                novoStatus = 'em_andamento';
            } else if (percAindaAqui > 0.5) {
                novoStatus = 'aberto';
            } else {
                novoStatus = 'em_andamento'; 
            }
        }

        // 3. Processamento da nova imagem (se houver)
        let imagemBuffer = null;
        let tipoImagem = null;
        if (imagemBase64) {
            const decoded = imageService.decodeBase64(imagemBase64);
            if (decoded) {
                imagemBuffer = decoded.buffer;
                tipoImagem = decoded.type;
            }
        }

        // 4. Atualizar a tabela principal
        await reportRepository.updateStatusReporte(reporteId, novoStatus, imagemBuffer, tipoImagem);

        return { novoStatus, contagem };
    }

    async getAtualizacoes(id_reporte) {
        return await reportRepository.getAtualizacoes(id_reporte);
    }

    async getImagens(id_reporte) {
        const imagens = await reportRepository.getImagens(id_reporte);
        return imagens.map(img => imageService.encodeBase64(img.bin_imagem, img.tipo_imagem));
    }
}

module.exports = new ReportService();
