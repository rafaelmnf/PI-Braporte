let map;
let markers = [];
let userMarker = null;

// Função de inicialização do Google Maps
function initMap() {
    console.log("API do Google Maps carregada.");

    // Localização padrão: PUC-Campinas Campus I
    const pucCampinas = { lat: -22.8342, lng: -47.0485 };

    // Criar o mapa imediatamente na PUC-Campinas
    createMap(pucCampinas);

    // Tentar obter localização real do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateUserMarker(userLocation);
                map.setCenter(userLocation);
            },
            () => {
                console.warn("Geolocalização negada ou falhou. Mantendo PUC-Campinas.");
            }
        );

        // Acompanhar movimento do usuário
        navigator.geolocation.watchPosition((position) => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            updateUserMarker(userLocation);
        });
    }
}

function createMap(centerLocation) {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    map = new google.maps.Map(mapElement, {
        zoom: 16,
        center: centerLocation,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }]
            }
        ]
    });

    console.log("Mapa criado na localização:", centerLocation);
}

// Função para criar/atualizar o marcador "bonitinho" do usuário
function updateUserMarker(location) {
    if (!map) return;

    if (!userMarker) {
        // Criar um elemento HTML personalizado para o marcador
        const markerElement = document.createElement('div');
        markerElement.className = 'user-marker';

        // Usar OverlayView para colocar o HTML no mapa
        const CustomMarker = function(latlng, map, element) {
            this.latlng = latlng;
            this.element = element;
            this.setMap(map);
        };

        CustomMarker.prototype = new google.maps.OverlayView();

        CustomMarker.prototype.draw = function() {
            const projection = this.getProjection();
            const position = projection.fromLatLngToDivPixel(this.latlng);

            if (position) {
                this.element.style.position = 'absolute';
                this.element.style.left = (position.x - 10) + 'px';
                this.element.style.top = (position.y - 10) + 'px';
            }
        };

        CustomMarker.prototype.onAdd = function() {
            const panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(this.element);
        };

        CustomMarker.prototype.onRemove = function() {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        };

        CustomMarker.prototype.setPosition = function(latlng) {
            this.latlng = latlng;
            this.draw();
        };

        userMarker = new CustomMarker(new google.maps.LatLng(location.lat, location.lng), map, markerElement);
    } else {
        userMarker.setPosition(new google.maps.LatLng(location.lat, location.lng));
    }
}

document.addEventListener('DOMContentLoaded', () => {

    const reportBtn = document.getElementById('reportBtn');
    const locateBtn = document.getElementById('locateBtn');
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

    // Botão de Localização
    if (locateBtn) {
        locateBtn.addEventListener('click', () => {
            if (navigator.geolocation && map) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    map.setCenter(pos);
                    map.setZoom(17);
                    updateUserMarker(pos);
                });
            }
        });
    }

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

    // Enviar reporte
    submitReport.addEventListener('click', () => {
        const titulo = document.getElementById('reportTitle').value.trim();
        const descricao = document.getElementById('reportDesc').value.trim();

        if (!titulo) {
            document.getElementById('reportTitle').style.borderColor = '#f85149';
            return;
        }

        const center = map.getCenter();
        const reporteData = {
            categoria: categoriaSelecionada,
            titulo,
            descricao,
            lat: center.lat(),
            lng: center.lng()
        };

        console.log('Enviando Reporte:', reporteData);

        new google.maps.Marker({
            position: center,
            map: map,
            title: titulo,
            icon: {
                url: `http://maps.google.com/mapfiles/ms/icons/red-dot.png`
            }
        });

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

window.initMap = initMap;
