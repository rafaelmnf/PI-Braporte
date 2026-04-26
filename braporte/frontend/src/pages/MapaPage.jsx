import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import FilterChips from '../components/FilterChips';
import ReportPopup from '../components/ReportPopup';
import MapViewer from '../components/map/MapViewer';
import ReportDetailsSheet from '../components/report/ReportDetailsSheet';
import { api } from '../services/api';
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

    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    // Carregar dados da API e localização do usuário
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // 1. Carregar reportes
                const data = await api.getReports();
                setReports(data.reportes);

                // 2. Tentar buscar o endereço do usuário logado e centralizar o mapa
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    try {
                        const addressResponse = await api.getUserAddress(user.id_usuario);
                        if (addressResponse.success && addressResponse.endereco) {
                            const { rua, numero, cidade, estado } = addressResponse.endereco;
                            const addressString = `${rua}, ${numero}, ${cidade}, ${estado}, Brasil`;
                            
                            const geoData = await api.geocode(addressString);
                            if (geoData.features && geoData.features.length > 0) {
                                const [lng, lat] = geoData.features[0].center;
                                setViewState(prev => ({
                                    ...prev,
                                    latitude: lat,
                                    longitude: lng,
                                    zoom: 15
                                }));
                            }
                        }
                    } catch (geoErr) {
                        console.error("Erro ao buscar endereço ou geolocalizar:", geoErr);
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar reportes:", err);
            }
        };
        fetchInitialData();
    }, []);

    // Filtra localmente apenas para efeito de preview
    const displayReports = activeFilter === 'todos' 
        ? reports 
        : reports.filter(r => r.categoria === activeFilter);

    const handleReportSubmit = async (data) => {
        try {
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;

            const payload = {
                id_usuario: idUsuario,
                motivo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria,
                latitude: viewState.latitude, 
                longitude: viewState.longitude,
                endereco: 'Pino Manual (TODO)'
            };
            
            const response = await api.createReport(payload);
            setReports([response.reporte, ...reports]);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDenunciarReport = async (id_reporte) => {
        try {
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;
            await api.denunciarReport(id_reporte, idUsuario);
            // Remove instantaneamente da interface
            setReports(reports.filter(r => r.id_reporte !== id_reporte));
            setSelectedReport(null); // Fecha o popup
        } catch (error) {
            console.error('Erro ao denunciar o reporte', error);
            alert('Não foi possível denunciar este reporte no momento.');
        }
    };

    const handleStatusUpdated = (id_reporte, novoStatus) => {
        setReports(reports.map(r => 
            r.id_reporte === id_reporte ? { ...r, status: novoStatus } : r
        ));
        if (selectedReport && selectedReport.id_reporte === id_reporte) {
            setSelectedReport({ ...selectedReport, status: novoStatus });
        }
    };

    const handleLocateMe = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setViewState(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        zoom: 16
                    }));
                },
                (error) => {
                    console.error('Erro ao acessar localização:', error);
                    alert('Não foi possível obter a sua localização atual. Verifique as permissões do navegador.');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert('A geolocalização não é suportada por este navegador.');
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
                    onClick={handleLocateMe}
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
                onDenunciar={handleDenunciarReport}
                onStatusUpdated={handleStatusUpdated}
            />
        </>
    );
};

export default MapaPage;
