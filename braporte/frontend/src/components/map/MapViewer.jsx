import React, { useRef, useState, useEffect, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CATEGORIAS } from '../CategoryGrid';
import { api } from '../../services/api';

const MAPBOX_STYLE = import.meta.env.VITE_MAPBOX_STYLE;

const MapViewer = ({ reports, onReportClick, viewState, onMove, userLocation, locateTrigger }) => {
    const mapRef = useRef();
    const [mapboxToken, setMapboxToken] = useState('');

    useEffect(() => {
        api.getMapConfig()
            .then(data => setMapboxToken(data.token))
            .catch(err => console.error("Erro ao carregar token do mapbox: ", err));
    }, []);

    useEffect(() => {
        if (!locateTrigger || !userLocation || !mapRef.current) return;

        mapRef.current.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 17,
            duration: 800,
            essential: true
        });
    }, [locateTrigger]);

    const processedReports = useMemo(() => {
        if (!reports) return [];
        const locMap = {};
        const result = [];

        reports.forEach(r => {
            const key = `${r.latitude},${r.longitude}`;
            if (!locMap[key]) {
                locMap[key] = [];
            }
            locMap[key].push(r);
        });

        Object.values(locMap).forEach(group => {
            if (group.length === 1) {
                result.push({
                    ...group[0],
                    displayLatitude: Number(group[0].latitude),
                    displayLongitude: Number(group[0].longitude)
                });
            } else {
                // Se tiver mais de um na mesma localização exata, espalha em um círculo
                // Aumentar levemente o raio se tiver muitos marcadores
                const baseRadius = 0.00003;
                const radius = group.length > 5 ? baseRadius * 1.5 : baseRadius;

                group.forEach((r, idx) => {
                    const angle = (idx / group.length) * 2 * Math.PI;
                    result.push({
                        ...r,
                        displayLatitude: Number(r.latitude) + radius * Math.cos(angle),
                        displayLongitude: Number(r.longitude) + radius * Math.sin(angle)
                    });
                });
            }
        });

        return result;
    }, [reports]);

    if (!mapboxToken) return <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Carregando Mapa...</div>;

    return (
        <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => onMove(evt.viewState)}
            mapStyle={MAPBOX_STYLE}
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
        >
            {/* marcador do usuario */}
            {userLocation && (
                <Marker
                    longitude={userLocation.lng}
                    latitude={userLocation.lat}
                    anchor="center"
                >
                    <div style={{
                        width: '18px',
                        height: '18px',
                        background: '#4285f4',
                        border: '3px solid #fff',
                        borderRadius: '50%',
                        boxShadow: '0 0 0 6px rgba(66,133,244,0.25), 0 2px 6px rgba(0,0,0,0.3)',
                    }} />
                </Marker>
            )}

            {/* marcadores dos reportes */}
            {processedReports.map((report) => {
                const cat = CATEGORIAS[report.categoria] || CATEGORIAS['outros'];

                return (
                    <Marker
                        key={report.id_reporte}
                        longitude={report.displayLongitude}
                        latitude={report.displayLatitude}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            onReportClick(report);
                        }}
                    >
                        <div style={{
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            background: '#fff',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `3px solid ${cat.color}`,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            willChange: 'transform',
                            backfaceVisibility: 'hidden'
                        }}>
                            {cat.emoji}
                        </div>
                    </Marker>
                );
            })}
        </Map>
    );
};

export default MapViewer;