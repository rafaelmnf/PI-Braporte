import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import FilterChips from '../components/FilterChips';
import ReportPopup from '../components/ReportPopup';
import { api } from '../services/api';
import '../styles/mapa.css';

const MapaPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('todos');

    const handleReportSubmit = async (data) => {
        try {
            await api.createReport(data);
            console.log('Reporte Enviado:', data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Topbar 
                onMenuClick={() => console.log('Menu clicked')} 
                onProfileClick={() => console.log('Profile clicked')} 
            />

            <main className="map-container" id="mapArea">
                <div className="map-placeholder">
                    <div className="map-grid"></div>
                    <div className="map-center-pin">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#33d17a" strokeWidth="2" strokeLinecap="round">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                            <circle cx="12" cy="9" r="2.5" fill="#33d17a" stroke="none"/>
                        </svg>
                    </div>
                    <span className="map-placeholder-text">Área do Mapa — Google Maps API</span>
                </div>
            </main>

            <div className="fab-container">
                <button className="fab fab-secondary" id="locateBtn" aria-label="Minha localização">
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
                onFilterChange={(filter) => {
                    setActiveFilter(filter);
                    console.log('Filtro selecionado:', filter);
                }} 
            />

            <ReportPopup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                onSubmit={handleReportSubmit}
            />
        </>
    );
};

export default MapaPage;
