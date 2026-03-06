document.addEventListener('DOMContentLoaded', () => {

    const reportBtn = document.getElementById('reportBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupBackdrop = document.getElementById('popupBackdrop');
    const categoryGrid = document.querySelector('.category-grid');
    const reportForm = document.getElementById('reportForm');
    const changeCategoryBtn = document.getElementById('changeCategoryBtn');
    const submitReport = document.getElementById('submitReport');
    const filterChips = document.getElementById('filterChips');

    const categorias = {
        'alagamento':      { emoji: '🌊', nome: 'Alagamento' },
        'incendio':        { emoji: '🔥', nome: 'Incêndio' },
        'saneamento':      { emoji: '🚰', nome: 'Saneamento' },
        'infraestrutura':  { emoji: '🚧', nome: 'Infraestrutura' },
        'seguranca':       { emoji: '🔒', nome: 'Segurança' },
        'meio-ambiente':   { emoji: '🌳', nome: 'Meio Ambiente' },
        'transito':        { emoji: '🚗', nome: 'Trânsito' },
        'outros':          { emoji: '📌', nome: 'Outros' },
    };

    let categoriaSelecionada = null;

    reportBtn.addEventListener('click', () => {
        abrirPopup();
    });

    popupBackdrop.addEventListener('click', () => {
        fecharPopup();
    });

    // Selecionar categoria 
    categoryGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (!card) return;

        const cat = card.dataset.category;
        if (!categorias[cat]) return;

        categoriaSelecionada = cat;

        // Mostrar form, esconder grid
        document.querySelector('.selected-emoji').textContent = categorias[cat].emoji;
        document.querySelector('.selected-name').textContent = categorias[cat].nome;
        
        categoryGrid.style.display = 'none';
        reportForm.style.display = 'block';
    });

    changeCategoryBtn.addEventListener('click', () => {
        categoriaSelecionada = null;
        categoryGrid.style.display = 'grid';
        reportForm.style.display = 'none';
    });

    // Enviar reporte (placeholder)
    submitReport.addEventListener('click', () => {
        const titulo = document.getElementById('reportTitle').value.trim();
        const descricao = document.getElementById('reportDesc').value.trim();

        if (!titulo) {
            document.getElementById('reportTitle').style.borderColor = '#f85149';
            return;
        }

        // enviar para /api/reportes
        console.log('Reporte:', { categoria: categoriaSelecionada, titulo, descricao });

        submitReport.textContent = '✓ Enviado!';
        submitReport.style.background = '#16a34a';

        setTimeout(() => {
            fecharPopup();
            resetForm();
        }, 1200);
    });

    // Filter 
    filterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        filterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filtro = chip.dataset.filter;
        console.log('Filtro selecionado:', filtro);
        // filtrar marcadores no mapa
    });

    function abrirPopup() {
        popupOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function fecharPopup() {
        popupOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    function resetForm() {
        categoriaSelecionada = null;
        categoryGrid.style.display = 'grid';
        reportForm.style.display = 'none';
        document.getElementById('reportTitle').value = '';
        document.getElementById('reportDesc').value = '';
        document.getElementById('reportTitle').style.borderColor = '';
        submitReport.innerHTML = 'Enviar Reporte <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        submitReport.style.background = '';
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popupOverlay.classList.contains('open')) {
            fecharPopup();
        }
    });

});
