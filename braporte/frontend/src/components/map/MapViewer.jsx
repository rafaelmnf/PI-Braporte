import React, { useRef, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { CATEGORIAS } from '../CategoryGrid';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const MAPBOX_STYLE = import.meta.env.VITE_MAPBOX_STYLE;

const MapViewer = ({ reports, onReportClick, viewState, onMove, userLocation, locateTrigger }) => {
    const mapRef = useRef();

    useEffect(() => {
    if (!locateTrigger || !userLocation || !mapRef.current) return;

        mapRef.current.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 17,
            duration: 800,
            essential: true
        });
    }, [locateTrigger]);

    return (
        <Map
            ref={mapRef}
            {...viewState}
            onMove={evt => onMove(evt.viewState)}
            mapStyle={MAPBOX_STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
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
            {reports.map((report) => {
                const cat = CATEGORIAS[report.categoria] || CATEGORIAS['outros'];

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
