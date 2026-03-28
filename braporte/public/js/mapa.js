let map;
let geocoder;
let markers = [];
let userMarker = null;
let currentFilter = 'todos';

const REPORT_STORAGE_KEY = 'braporte_reportes';

// ========================
// ÍCONES SVG POR CATEGORIA
// ========================
const categoryIcons = {
    'alagamento':      { emoji: '🌊', color: '#2563eb', bg: '#dbeafe' },
    'incendio':        { emoji: '🔥', color: '#dc2626', bg: '#fee2e2' },
    'saneamento':      { emoji: '🚰', color: '#059669', bg: '#d1fae5' },
    'infraestrutura':  { emoji: '🚧', color: '#d97706', bg: '#fef3c7' },
    'seguranca':       { emoji: '🔒', color: '#7c3aed', bg: '#ede9fe' },
    'meio-ambiente':   { emoji: '🌳', color: '#16a34a', bg: '#dcfce7' },
    'transito':        { emoji: '🚗', color: '#ea580c', bg: '#ffedd5' },
    'outros':          { emoji: '📌', color: '#475569', bg: '#f1f5f9' }
};

// Gera um ícone SVG personalizado para cada categoria
function createCategoryIcon(category) {
    const cat = categoryIcons[category] || categoryIcons['outros'];
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0Z" fill="${cat.color}" filter="url(#shadow)"/>
            <circle cx="20" cy="18" r="12" fill="white"/>
            <text x="20" y="23" text-anchor="middle" font-size="14">${cat.emoji}</text>
        </svg>
    `;
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// ========================
// LOCALSTORAGE
// ========================
function getReportes() {
    const data = localStorage.getItem(REPORT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveReportes(reportes) {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reportes));
}

// ========================
// GOOGLE MAPS INIT
// ========================
function initMap() {
    console.log("API do Google Maps carregada.");

    const pucCampinas = { lat: -22.8342, lng: -47.0485 };

    createMap(pucCampinas);

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
                console.warn("Geolocalização negada. Mantendo PUC-Campinas.");
            }
        );

        navigator.geolocation.watchPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                updateUserMarker(userLocation);
            },
            () => {} // silenciar erro do watch
        );
    }
}

function createMap(centerLocation) {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(mapElement, {
        zoom: 16,
        center: centerLocation,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
        ]
    });

    // Carregar reportes salvos no localStorage
    loadAndRenderMarkers();

    console.log("Mapa criado com sucesso.");
}

// ========================
// MARCADOR DO USUÁRIO (CORRIGIDO)
// ========================
function updateUserMarker(location) {
    if (!map) return;

    if (!userMarker) {
        // Definir a classe CustomMarker uma única vez
        function CustomMarker(latlng, map, element) {
            this.latlng = latlng;
            this.element = element;
            this._ready = false; // flag para saber se onAdd já rodou
            this.setMap(map);
        }

        CustomMarker.prototype = new google.maps.OverlayView();

        CustomMarker.prototype.onAdd = function() {
            const panes = this.getPanes();
            panes.overlayMouseTarget.appendChild(this.element);
            this._ready = true; // agora sim o overlay está pronto
        };

        CustomMarker.prototype.draw = function() {
            if (!this._ready) return; // não desenhar antes de onAdd
            const projection = this.getProjection();
            if (!projection) return;
            const position = projection.fromLatLngToDivPixel(this.latlng);
            if (position) {
                this.element.style.position = 'absolute';
                this.element.style.left = (position.x - 10) + 'px';
                this.element.style.top = (position.y - 10) + 'px';
            }
        };

        CustomMarker.prototype.onRemove = function() {
            if (this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this._ready = false;
        };

        CustomMarker.prototype.setPosition = function(latlng) {
            this.latlng = latlng;
            if (this._ready) this.draw();
        };

        const markerElement = document.createElement('div');
        markerElement.className = 'user-marker';

        userMarker = new CustomMarker(new google.maps.LatLng(location.lat, location.lng), map, markerElement);
    } else {
        userMarker.setPosition(new google.maps.LatLng(location.lat, location.lng));
    }
}

// ========================
// MARCADORES DE REPORTES
// ========================
function clearMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

function loadAndRenderMarkers() {
    clearMarkers();

    const reportes = getReportes();

    const filtered = reportes.filter(r => {
        return currentFilter === 'todos' || r.categoria === currentFilter;
    });

    filtered.forEach(reporte => {
        placeReportMarker(reporte);
    });

    console.log(`Renderizando ${filtered.length} reportes no mapa.`);
}

function placeReportMarker(reporte) {
    // Se tem lat/lng, usa direto
    if (reporte.lat && reporte.lng) {
        createMarkerOnMap(reporte, { lat: reporte.lat, lng: reporte.lng });
    }
    // Se tem endereço mas não tem lat/lng, geocodifica
    else if (reporte.endereco) {
        geocoder.geocode({ address: reporte.endereco, region: 'BR' }, (results, status) => {
            if (status === 'OK') {
                const pos = results[0].geometry.location;
                createMarkerOnMap(reporte, { lat: pos.lat(), lng: pos.lng() });
            } else {
                console.warn(`Geocode falhou para "${reporte.endereco}": ${status}`);
            }
        });
    }
}

function createMarkerOnMap(reporte, position) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: reporte.titulo,
        icon: {
            url: createCategoryIcon(reporte.categoria),
            scaledSize: new google.maps.Size(36, 45),
            anchor: new google.maps.Point(18, 45)
        },
        animation: google.maps.Animation.DROP
    });

    const cat = categoryIcons[reporte.categoria] || categoryIcons['outros'];

    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 1.2rem;">${cat.emoji}</span>
                    <strong style="font-size: 0.95rem; color: #1f2328;">${reporte.titulo}</strong>
                </div>
                ${reporte.descricao ? `<p style="margin: 0 0 6px; font-size: 0.82rem; color: #656d76;">${reporte.descricao}</p>` : ''}
                ${reporte.endereco ? `<p style="margin: 0; font-size: 0.78rem; color: #8b949e;">📍 ${reporte.endereco}</p>` : ''}
            </div>
        `
    });

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });

    markers.push(marker);
}

// ========================
// BUSCA DE ENDEREÇO COM PLACES AUTOCOMPLETE
// ========================
let addressAutocomplete = null;

function initAddressSearch() {
    const addressInput = document.getElementById('reportAddress');
    if (!addressInput) return;

    // Evitar inicializar duas vezes
    if (addressAutocomplete) return;

    // Verificar se a library Places está disponível
    if (!google.maps.places) {
        console.warn('Places API não disponível. Verifique se está ativa no Google Cloud.');
        return;
    }

    // Pegar o centro atual do mapa para priorizar sugestões próximas
    const center = map.getCenter();
    const bounds = map.getBounds();

    const autocompleteOptions = {
        componentRestrictions: { country: 'br' },
        fields: ['formatted_address', 'geometry', 'name']
        // Sem 'types' para sugerir ruas, bairros, estabelecimentos, etc.
    };

    // Se o mapa tem bounds, usar como bias de localização
    if (bounds) {
        autocompleteOptions.bounds = bounds;
        autocompleteOptions.strictBounds = false; // Prioriza, mas não restringe
    }

    addressAutocomplete = new google.maps.places.Autocomplete(addressInput, autocompleteOptions);

    // Vincular ao mapa para que o bias atualize automaticamente
    addressAutocomplete.bindTo('bounds', map);

    addressAutocomplete.addListener('place_changed', () => {
        const place = addressAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
            console.log('Endereço selecionado:', place.formatted_address);
        }
    });
}

// ========================
// BUSCA NA TOPBAR (GEOCODER)
// ========================
function initTopbarSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query.length < 3) return;

            geocoder.geocode({ address: query + ', Brasil', region: 'BR' }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const pos = results[0].geometry.location;
                    map.setCenter(pos);
                    map.setZoom(16);
                    searchInput.value = results[0].formatted_address;
                    searchInput.blur();
                } else {
                    console.warn('Busca não encontrou resultados para:', query);
                }
            });
        }
    });
}

// ========================
// DOM READY
// ========================
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

    // Inicializar busca da topbar
    initTopbarSearch();

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

        // Inicializar busca de endereço com Places Autocomplete
        setTimeout(() => initAddressSearch(), 200);
    });

    changeCategoryBtn.addEventListener('click', () => {
        categoriaSelecionada = null;
        categoryGrid.style.display = 'grid';
        reportForm.style.display = 'none';
    });

    // Enviar reporte
    submitReport.addEventListener('click', () => {
        const titulo = document.getElementById('reportTitle').value.trim();
        const endereco = document.getElementById('reportAddress').value.trim();
        const descricao = document.getElementById('reportDesc').value.trim();

        if (!titulo) {
            document.getElementById('reportTitle').style.borderColor = '#f85149';
            return;
        }

        // Localização padrão (PUC-Campinas) caso o mapa não tenha carregado
        const pucFallback = { lat: -22.8342, lng: -47.0485 };
        let lat = pucFallback.lat;
        let lng = pucFallback.lng;

        try {
            const center = map && map.getCenter();
            if (center) {
                lat = center.lat();
                lng = center.lng();
            }
        } catch (e) {
            console.warn('Não foi possível obter o centro do mapa. Usando localização padrão.');
        }

        const novoReporte = {
            id: Date.now().toString(),
            categoria: categoriaSelecionada,
            titulo: titulo,
            descricao: descricao,
            endereco: endereco,
            lat: lat,
            lng: lng,
            data: new Date().toISOString()
        };

        // Salvar no localStorage
        const reportes = getReportes();
        reportes.push(novoReporte);
        saveReportes(reportes);

        // Adicionar marcador no mapa imediatamente
        placeReportMarker(novoReporte);

        console.log('Reporte salvo:', novoReporte);

        submitReport.textContent = '✓ Enviado!';
        submitReport.style.background = '#16a34a';

        setTimeout(() => {
            fecharPopup();
            resetForm();
        }, 1200);
    });

    // Filtros
    filterChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;

        filterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        currentFilter = chip.dataset.filter;
        loadAndRenderMarkers();
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
        document.getElementById('reportAddress').value = '';
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
