import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../components/Topbar';
import FilterChips from '../components/FilterChips';
import ReportPopup from '../components/ReportPopup';
import MapViewer from '../components/map/MapViewer';
import ReportDetailsSheet from '../components/report/ReportDetailsSheet';
import Sidebar from '../components/Sidebar';
import NotificationsPopup from '../components/NotificationsPopup';
import { api } from '../services/api';
import '../styles/mapa.css';

const PUC_CAMPINAS = { lng: -47.0485, lat: -22.8342 };

const MapaPage = () => {
    const navigate = useNavigate();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('todos');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locateTrigger, setLocateTrigger] = useState(0);

    const [viewState, setViewState] = useState({
        longitude: PUC_CAMPINAS.lng,
        latitude: PUC_CAMPINAS.lat,
        zoom: 15,
        pitch: 45,
        bearing: 0
    });

    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    // puxa reportes
    useEffect(() => {
        api.getReports()
            .then(data => setReports(data.reportes || []))
            .catch(err => console.error("Erro ao carregar reportes:", err));
    }, []);

    // pega GPS do usuario e centraliza o mapa nele
    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                setViewState(prev => ({
                    ...prev,
                    latitude: loc.lat,
                    longitude: loc.lng,
                    zoom: 16
                }));
            },
            (err) => console.warn('GPS negado, usando PUC:', err.message),
            { enableHighAccuracy: true, timeout: 10000 }
        );

        // atualiza posicao do boneco em tempo real
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {},
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    const displayReports = activeFilter === 'todos'
        ? reports
        : reports.filter(r => r.categoria === activeFilter);

    // lugar selecionado na busca
    const handlePlaceSelected = useCallback((coords) => {
        setViewState(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng,
            zoom: 17
        }));
    }, []);

    // cria reporte
    const handleReportSubmit = useCallback(async (data) => {
        try {
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;

            // usa coords do google se tiver
            const lat = data.lat || viewState.latitude;
            const lng = data.lng || viewState.longitude;

            const payload = {
                id_usuario: idUsuario,
                motivo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria,
                latitude: lat,
                longitude: lng,
                endereco: data.endereco || ''
            };

            const response = await api.createReport(payload);
            setReports(prev => [response.reporte, ...prev]);
        } catch (error) {
            console.error("Erro ao criar reporte:", error);
        }
    }, [viewState.latitude, viewState.longitude]);

    const handleDenunciarReport = useCallback(async (id_reporte) => {
        try {
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;
            await api.denunciarReport(id_reporte, idUsuario);
            setReports(prev => prev.filter(r => r.id_reporte !== id_reporte));
            setSelectedReport(null);
        } catch (error) {
            console.error('Erro ao denunciar:', error);
        }
    }, []);

    const handleStatusUpdated = useCallback((id_reporte, novoStatus) => {
        setReports(prev => prev.map(r =>
            r.id_reporte === id_reporte ? { ...r, status: novoStatus } : r
        ));
        setSelectedReport(prev =>
            prev && prev.id_reporte === id_reporte ? { ...prev, status: novoStatus } : prev
        );
    }, []);

    // botao de localizar
    const handleLocate = useCallback(() => {
        const centralizar = (loc) => {
            setUserLocation(loc);
            setViewState(prev => ({
                ...prev,
                latitude: loc.lat,
                longitude: loc.lng,
                zoom: 17
            }));
            setLocateTrigger(prev => prev + 1);
        };

        if (userLocation) {
            centralizar(userLocation);
            return;
        }

        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                centralizar({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            },
            (err) => console.warn('GPS indisponível:', err.message),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [userLocation]);

    return (
        <>
            <Topbar
                onMenuClick={() => setSidebarOpen(true)}
                onProfileClick={() => setNotifOpen(true)}
                onPlaceSelected={handlePlaceSelected}
                viewState={viewState}
            />

            <main className="map-container" id="mapArea">
                <MapViewer
                    reports={displayReports}
                    onReportClick={(report) => setSelectedReport(report)}
                    viewState={viewState}
                    onMove={(newViewState) => setViewState(newViewState)}
                    userLocation={userLocation}
                    locateTrigger={locateTrigger}
                />
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
                onFilterChange={(filter) => setActiveFilter(filter)}
            />

            <ReportPopup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                onSubmit={handleReportSubmit}
                viewState={viewState}
            />

            <ReportDetailsSheet
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onDenunciar={handleDenunciarReport}
                onStatusUpdated={handleStatusUpdated}
            />

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <NotificationsPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </>
    );
};

export default MapaPage;
