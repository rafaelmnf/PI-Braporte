const acaoRepository = require('../repositories/acaoRepository');

class AcaoService {
    async criarAcao(dados) {
        return await acaoRepository.criarAcao(dados);
    }

    async listarAcoes() {
        return await acaoRepository.listarAcoes();
    }

    async ingressar(id_acao, id_usuario) {
        return await acaoRepository.ingressar(id_acao, id_usuario);
    }

    async sair(id_acao, id_usuario) {
        return await acaoRepository.sair(id_acao, id_usuario);
    }

    async participantesDoUsuario(id_usuario) {
        return await acaoRepository.participantesDoUsuario(id_usuario);
    }

    // concluir e deletar verificam se o usuario e o criador da acao
    async concluirAcao(id_acao, id_usuario) {
        const acao = await acaoRepository.getAcao(id_acao);
        if (!acao) return { naoEncontrado: true };
        if (acao.id_criador !== Number(id_usuario)) return { semPermissao: true };
        await acaoRepository.concluirAcao(id_acao);
        return { sucesso: true };
    }

    async deletarAcao(id_acao, id_usuario) {
        const acao = await acaoRepository.getAcao(id_acao);
        if (!acao) return { naoEncontrado: true };
        if (acao.id_criador !== Number(id_usuario)) return { semPermissao: true };
        await acaoRepository.deletarAcao(id_acao);
        return { sucesso: true };
    }
}

module.exports = new AcaoService();
