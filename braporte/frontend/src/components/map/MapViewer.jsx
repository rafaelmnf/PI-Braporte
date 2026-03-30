import React, { useRef } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CATEGORIAS } from '../CategoryGrid';

// MAPBOX TOKEN: Você precisa gerar um token e colocar em um arquivo .env.local:
// VITE_MAPBOX_TOKEN=pk.seu-token-aqui
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

const MapViewer = ({ reports, onReportClick, viewState, onMove }) => {
    const mapRef = useRef();

    return (
        <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => onMove(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
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
