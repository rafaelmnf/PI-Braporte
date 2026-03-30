import React, { useState, useEffect, useRef, useCallback } from 'react';
import Topbar from '../components/Topbar';
import FilterChips from '../components/FilterChips';
import ReportPopup from '../components/ReportPopup';
import { CATEGORIAS } from '../components/CategoryGrid';
import '../styles/mapa.css';


const REPORT_STORAGE_KEY = 'braporte_reportes';
const PUC_CAMPINAS = { lng: -47.0485, lat: -22.8342 };
const MAPBOX_TOKEN = '';
const MAPBOX_STYLE = 'mapbox://styles/SEU_USUARIO/SEU_ESTILO';

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

function createCategoryMarkerElement(category) {
    const cat = categoryIcons[category] || categoryIcons['outros'];
    
    const el = document.createElement('div');
    el.className = 'mapbox-category-marker';
    el.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="45" viewBox="0 0 40 50">
            <defs>
                <filter id="shadow-${category}" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0Z" fill="${cat.color}" filter="url(#shadow-${category})"/>
            <circle cx="20" cy="18" r="12" fill="white"/>
            <text x="20" y="23" text-anchor="middle" font-size="14">${cat.emoji}</text>
        </svg>
    `;
    el.style.cursor = 'pointer';
    return el;
}


function getReportes() {
    const data = localStorage.getItem(REPORT_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveReportes(reportes) {
    localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reportes));
}


async function geocodeAddress(query) {
    const sessionToken = 'topbar-' + Date.now();
    const suggestUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&language=pt&country=BR&limit=1&session_token=${sessionToken}&access_token=${MAPBOX_TOKEN}`;
    try {
        const suggestRes = await fetch(suggestUrl);
        const suggestData = await suggestRes.json();
        if (!suggestData.suggestions || suggestData.suggestions.length === 0) return null;

        const mapboxId = suggestData.suggestions[0].mapbox_id;
        const name = suggestData.suggestions[0].name || query;


        const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?session_token=${sessionToken}&access_token=${MAPBOX_TOKEN}`;
        const retrieveRes = await fetch(retrieveUrl);
        const retrieveData = await retrieveRes.json();

        if (retrieveData.features && retrieveData.features.length > 0) {
            const [lng, lat] = retrieveData.features[0].geometry.coordinates;
            const fullAddress = retrieveData.features[0].properties.full_address || name;
            return { lng, lat, address: fullAddress };
        }
    } catch (err) {
        console.warn('Erro no geocoding:', err);
    }
    return null;
}


function waitForMapbox(timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (window.mapboxgl) {
            resolve();
            return;
        }
        const start = Date.now();
        const interval = setInterval(() => {
            if (window.mapboxgl) {
                clearInterval(interval);
                resolve();
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('Mapbox GL JS não carregou em ' + timeout + 'ms'));
            }
        }, 100);
    });
}


const MapaPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('todos');
    const [mapReady, setMapReady] = useState(false);
    const mapRef = useRef(null);         
    const mapDivRef = useRef(null);      
    const markersRef = useRef([]);       
    const userMarkerRef = useRef(null);  
    const userLocationRef = useRef(null); 
    const filterRef = useRef('todos');
    const popupsRef = useRef([]);        


    const updateUserMarker = useCallback((location) => {
        if (!mapRef.current) return;

        userLocationRef.current = location;

        if (!userMarkerRef.current) {
            const markerElement = document.createElement('div');
            markerElement.className = 'user-marker';

            userMarkerRef.current = new mapboxgl.Marker({ element: markerElement })
                .setLngLat([location.lng, location.lat])
                .addTo(mapRef.current);
        } else {
            userMarkerRef.current.setLngLat([location.lng, location.lat]);
        }
    }, []);


    const clearMarkers = useCallback(() => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        popupsRef.current.forEach(p => p.remove());
        popupsRef.current = [];
    }, []);

    const createMarkerOnMap = useCallback((reporte, lngLat) => {
        const map = mapRef.current;
        if (!map) return;

        const cat = categoryIcons[reporte.categoria] || categoryIcons['outros'];

        const el = createCategoryMarkerElement(reporte.categoria);

        const popupHTML = `
            <div style="font-family: 'Plus Jakarta Sans', sans-serif; padding: 4px; max-width: 220px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                    <span style="font-size: 1.2rem;">${cat.emoji}</span>
                    <strong style="font-size: 0.95rem; color: #1f2328;">${reporte.titulo}</strong>
                </div>
                ${reporte.descricao ? `<p style="margin: 0 0 6px; font-size: 0.82rem; color: #656d76;">${reporte.descricao}</p>` : ''}
                ${reporte.endereco ? `<p style="margin: 0; font-size: 0.78rem; color: #8b949e;">📍 ${reporte.endereco}</p>` : ''}
            </div>
        `;

        const popup = new mapboxgl.Popup({ offset: [0, -45], maxWidth: '260px' })
            .setHTML(popupHTML);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat([lngLat.lng, lngLat.lat])
            .setPopup(popup)
            .addTo(map);

        markersRef.current.push(marker);
        popupsRef.current.push(popup);
    }, []);

    const placeReportMarker = useCallback(async (reporte) => {
        if (reporte.lat && reporte.lng) {
            createMarkerOnMap(reporte, { lng: reporte.lng, lat: reporte.lat });
        } else if (reporte.endereco) {
            const result = await geocodeAddress(reporte.endereco);
            if (result) {
                createMarkerOnMap(reporte, { lng: result.lng, lat: result.lat });
            }
        }
    }, [createMarkerOnMap]);

    const loadAndRenderMarkers = useCallback((filter) => {
        clearMarkers();
        const reportes = getReportes();
        const f = filter || filterRef.current;
        const filtered = reportes.filter(r => f === 'todos' || r.categoria === f);
        filtered.forEach(r => placeReportMarker(r));
        console.log(`Renderizando ${filtered.length} reportes no mapa.`);
    }, [clearMarkers, placeReportMarker]);


    useEffect(() => {
        let cancelled = false;
        let watchId = null;

        async function initializeMap() {
            try {
                await waitForMapbox();
            } catch (err) {
                console.error('Mapbox GL JS não carregou:', err.message);
                return;
            }

            if (cancelled) return;

            const mapElement = mapDivRef.current;
            if (!mapElement) return;

            mapboxgl.accessToken = MAPBOX_TOKEN;

            const map = new mapboxgl.Map({
                container: mapElement,
                style: MAPBOX_STYLE,
                center: [PUC_CAMPINAS.lng, PUC_CAMPINAS.lat],
                zoom: 16,
                pitch: 45,
                bearing: 0,
                attributionControl: false,
                logoPosition: 'bottom-left'
            });

            map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');

            mapRef.current = map;

            map.on('load', () => {
                if (cancelled) return;
                setMapReady(true);
                console.log("Mapa Mapbox criado com sucesso.");

                loadAndRenderMarkers();
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        if (cancelled) return;
                        const userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        updateUserMarker(userLocation);
                        map.flyTo({
                            center: [userLocation.lng, userLocation.lat],
                            zoom: 16,
                            duration: 1500
                        });
                    },
                    () => console.warn("Geolocalização negada. Mantendo PUC-Campinas.")
                );

                watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        if (cancelled) return;
                        updateUserMarker({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    () => {}
                );
            }
        }

        initializeMap();

        return () => {
            cancelled = true;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);


    const handleFilterChange = useCallback((filter) => {
        setActiveFilter(filter);
        filterRef.current = filter;
        loadAndRenderMarkers(filter);
    }, [loadAndRenderMarkers]);


    const handleReportSubmit = useCallback(async (data) => {
        const pucFallback = PUC_CAMPINAS;
        let lat = pucFallback.lat;
        let lng = pucFallback.lng;

        try {
            const center = mapRef.current && mapRef.current.getCenter();
            if (center) {
                lat = center.lat;
                lng = center.lng;
            }
        } catch (e) {
            console.warn('Não foi possível obter o centro do mapa.');
        }

        const novoReporte = {
            id: Date.now().toString(),
            categoria: data.categoria,
            titulo: data.titulo,
            descricao: data.descricao,
            endereco: data.endereco || '',
            lat: lat,
            lng: lng,
            data: new Date().toISOString()
        };

        const reportes = getReportes();
        reportes.push(novoReporte);
        saveReportes(reportes);

        placeReportMarker(novoReporte);

        console.log('Reporte salvo:', novoReporte);
    }, [placeReportMarker]);


    const handleTopbarSearch = useCallback(async (query) => {
        if (!query || query.length < 3 || !mapRef.current) return;

        const result = await geocodeAddress(query);
        if (result) {
            mapRef.current.flyTo({
                center: [result.lng, result.lat],
                zoom: 16,
                duration: 1500
            });
        } else {
            console.warn('Busca não encontrou resultados para:', query);
        }
    }, []);


    const handleLocate = useCallback(() => {
        if (!mapRef.current) {
            console.warn('Mapa ainda não está pronto.');
            return;
        }

        if (userLocationRef.current) {
            mapRef.current.flyTo({
                center: [userLocationRef.current.lng, userLocationRef.current.lat],
                zoom: 17,
                duration: 1000
            });
            updateUserMarker(userLocationRef.current);
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    mapRef.current.flyTo({
                        center: [pos.lng, pos.lat],
                        zoom: 17,
                        duration: 1000
                    });
                    updateUserMarker(pos);
                },
                (err) => {
                    console.warn('Não foi possível obter localização:', err.message);
                }
            );
        }
    }, [updateUserMarker]);


    return (
        <>
            <Topbar 
                onMenuClick={() => console.log('Menu clicked')} 
                onProfileClick={() => console.log('Profile clicked')}
                onSearch={handleTopbarSearch}
                mapInstance={mapRef}
            />

            <main className="map-container" id="mapArea">
                <div id="map" ref={mapDivRef} style={{ width: '100%', height: '100%' }}></div>
            </main>

            <div className="fab-container">
                <button className="fab fab-secondary" id="locateBtn" aria-label="Minha localização" onClick={handleLocate}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>
                    </svg>
                </button>
            
                <button className="fab fab-primary" id="reportBtn" aria-label="Reportar problema" onClick={() => setIsPopupOpen(true)}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 9v4m0 4h.01"/>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                </button>
            </div>

            <FilterChips 
                activeFilter={activeFilter} 
                onFilterChange={handleFilterChange} 
            />

            <ReportPopup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                onSubmit={handleReportSubmit}
                mapInstance={mapRef}
            />
        </>
    );
};

export default MapaPage;