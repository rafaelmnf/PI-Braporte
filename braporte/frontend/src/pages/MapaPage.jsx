import React, { useState } from 'react';
import Topbar from '../components/Topbar';
import FilterChips from '../components/FilterChips';
import ReportPopup from '../components/ReportPopup';
import MapViewer from '../components/map/MapViewer';
import ReportDetailsSheet from '../components/report/ReportDetailsSheet';
import { api } from '../services/api';
import { mockReports } from '../data/mockReports';
import '../styles/mapa.css';

const MapaPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('todos');

    // Estado local da câmera do mapa
    const [viewState, setViewState] = useState({
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 13
    });

    // Mocks e estado local dos reportes
    const [reports, setReports] = useState(mockReports);
    const [selectedReport, setSelectedReport] = useState(null);

    // Filtra localmente apenas para efeito de preview
    const displayReports = activeFilter === 'todos' 
        ? reports 
        : reports.filter(r => r.categoria === activeFilter);

    const handleReportSubmit = async (data) => {
        try {
            await api.createReport(data);
            
            // TODO: Quando integrar banco real, faremos fetch ao backend aqui.
            // Aqui estamos mockando inserção no mapa pra testar evolução:
            const novoReporte = {
                id_reporte: Date.now(),
                id_usuario: 1, // mock
                status: 'aberto',
                data_hora: new Date().toISOString(),
                motivo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria,
                // Associa coordenadas ao centro atual (Futuramente vira selecione por pino)
                latitude: viewState.latitude, 
                longitude: viewState.longitude,
                endereco: 'Pino Manual (TODO)'
            };
            setReports([novoReporte, ...reports]);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Topbar 
                onMenuClick={() => console.log('Menu clicked')} 
                onProfileClick={() => console.log('Profile clicked. TODO: Rota Perfil.')} 
            />

            <main className="map-container" id="mapArea">
                <MapViewer 
                    reports={displayReports}
                    onReportClick={(report) => setSelectedReport(report)}
                    viewState={viewState}
                    onMove={(newViewState) => setViewState(newViewState)}
                />
            </main>

            <div className="fab-container">
                <button 
                    className="fab fab-secondary" 
                    id="locateBtn" 
                    aria-label="Minha localização" 
                    onClick={() => {
                        console.log('TODO: Implementar GPS real via navigator.geolocation');
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>
                    </svg>
                </button>
            
                <button 
                    className="fab fab-primary" 
                    id="reportBtn" 
                    aria-label="Reportar problema" 
                    onClick={() => setIsPopupOpen(true)}
                >
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 9v4m0 4h.01"/>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    </svg>
                </button>
            </div>

            <FilterChips 
                activeFilter={activeFilter} 
                onFilterChange={(filter) => setActiveFilter(filter)} 
            />

            <ReportPopup 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                onSubmit={handleReportSubmit}
            />

            <ReportDetailsSheet 
                report={selectedReport} 
                onClose={() => setSelectedReport(null)} 
            />
        </>
    );
};

export default MapaPage;
