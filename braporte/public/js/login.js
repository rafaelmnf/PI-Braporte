document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        limparErros();

        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha').value.trim();
        const cpf = document.getElementById('cpf').value.trim();

        let valido = true;

        if (!validarEmail(email)) {
            mostrarErro('email', 'E-mail inválido.');
            valido = false;
        }

        if (senha.length < 6) {
            mostrarErro('senha', 'Senha deve ter no mínimo 6 caracteres.');
            valido = false;
        }

        if (!validarCPF(cpf)) {
            mostrarErro('cpf', 'CPF inválido.');
            valido = false;
        }

        if (valido) {
            // chamar /api/login quando backend estiver pronto
            window.location.href = '/mapa';
        }
    });

    // Máscara de CPF
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
        else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
        e.target.value = v;
    });
});

function validarEmail(email) {
    const partes = email.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1];
    if (!dominio.includes('.')) return false;
    return dominio.split('.').pop().length > 0;
}

function validarCPF(cpf) {
    const numeros = cpf.replace(/\D/g, '');
    return numeros.length === 11;
}

function mostrarErro(campo, msg) {
    const input = document.getElementById(campo);
    const erroSpan = document.getElementById(campo + '-erro');
    if (input) input.classList.add('has-error');
    if (erroSpan) erroSpan.textContent = msg;
}

function limparErros() {
    document.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
}
