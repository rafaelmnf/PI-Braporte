import React, { useRef, useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CATEGORIAS } from '../CategoryGrid';

import { api } from '../../services/api';

const MapViewer = ({ reports, onReportClick, viewState, onMove }) => {
    const mapRef = useRef();
    const [mapboxToken, setMapboxToken] = useState('');

    useEffect(() => {
        api.getMapConfig()
            .then(data => setMapboxToken(data.token))
            .catch(err => console.error("Erro ao carregar token do mapbox: ", err));
    }, []);

    if (!mapboxToken) return <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Carregando Mapa...</div>;

    return (
        <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => onMove(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={mapboxToken}
            style={{ width: '100%', height: '100%' }}
        >
            {/* Renderizando os reportes mockados */}
            {reports.map((report) => {
                const categoryObj = CATEGORIAS[report.categoria] || CATEGORIAS['outros'];

                return (
                    <Marker
                        key={report.id_reporte}
                        longitude={report.longitude}
                        latitude={report.latitude}
                        anchor="bottom"
                        onClick={e => {
                            e.originalEvent.stopPropagation();
                            onReportClick(report);
                        }}
                    >
                        {/* Marcador Estilizado (Não usa o popup padrão nativo) */}
                        <div style={{
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))',
                            transform: 'translateY(10px)',
                            background: '#fff',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: `2px solid ${categoryObj.bg}`
                        }}>
                            {categoryObj.emoji}
                        </div>
                    </Marker>
                );
            })}
        </Map>
    );
};

export default MapViewer;
