import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/sidebar.css';

// raio considerado "proximo" - 1,5 km, media usada em apps urbanos
const RAIO_KM = 1.5;

// distancia entre duas coordenadas em km (formula de Haversine)
function distanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [proximos, setProximos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const goTo = (path) => {
        navigate(path);
        onClose();
    };

    // ao abrir, busca os reportes proximos da localizacao do usuario
    useEffect(() => {
        if (!isOpen) return;
        setCarregando(true);
        setProximos([]);

        let finalizado = false;
        const finalizar = (lista) => {
            if (finalizado) return;
            finalizado = true;
            setProximos(lista);
            setCarregando(false);
        };

        // se a geolocalizacao demorar demais, encerra (evita "Buscando..." infinito)
        const timeout = setTimeout(() => finalizar([]), 8000);

        if (!navigator.geolocation) {
            clearTimeout(timeout);
            finalizar([]);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const data = await api.getReports();
                    const lista = (data.reportes || []).filter(r =>
                        r.status !== 'excluido' &&
                        r.latitude != null && r.longitude != null
                    );
                    const perto = lista
                        .map(r => ({
                            ...r,
                            distancia: distanciaKm(latitude, longitude, Number(r.latitude), Number(r.longitude))
                        }))
                        .filter(r => r.distancia <= RAIO_KM)
                        .sort((a, b) => a.distancia - b.distancia);
                    clearTimeout(timeout);
                    finalizar(perto);
                } catch (err) {
                    console.error('Erro ao buscar reportes próximos:', err);
                    clearTimeout(timeout);
                    finalizar([]);
                }
            },
            (err) => {
                console.warn('Geolocalização indisponível:', err.message);
                clearTimeout(timeout);
                finalizar([]);
            },
            { timeout: 7000, maximumAge: 60000, enableHighAccuracy: false }
        );

        return () => clearTimeout(timeout);
    }, [isOpen]);

    if (!isOpen) return null;

    const navItems = [
        { path: '/mapa', label: 'Mapa', icon: (
            <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>
        ) },
        { path: '/reportes', label: 'Meus Reportes', icon: (
            <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>
        ) },
        { path: '/comunidade', label: 'Comunidade', icon: (
            <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>
        ) },
        { path: '/perfil', label: 'Meu Perfil', icon: (
            <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>
        ) },
    ];

    return (
        <div className="sidebar-overlay">
            <div className="sidebar-backdrop" onClick={onClose} />
            <aside className="sidebar-drawer">
                <div className="sidebar-header">
                    <h2>Braporte</h2>
                    <button className="sidebar-close" onClick={onClose} aria-label="Fechar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <button key={item.path} onClick={() => goTo(item.path)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {item.icon}
                            </svg>
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Reportes proximos da localizacao do usuario */}
                <div className="sidebar-proximos">
                    <h3 className="sidebar-proximos-titulo">Reportes próximos a você</h3>

                    {carregando && (
                        <div className="sidebar-proximos-vazio">
                            <span className="sidebar-spinner" />
                            Buscando reportes...
                        </div>
                    )}

                    {!carregando && proximos.length === 0 && (
                        <p className="sidebar-proximos-vazio">Nenhum reporte num raio de 1,5 km de você.</p>
                    )}

                    {!carregando && proximos.map(r => (
                        <button
                            key={r.id_reporte}
                            className="sidebar-proximo-item"
                            onClick={() => goTo(`/mapa?reporte=${r.id_reporte}`)}
                        >
                            <span className="sidebar-proximo-dot" />
                            <span className="sidebar-proximo-info">
                                <span className="sidebar-proximo-titulo">{r.motivo || 'Reporte'}</span>
                                <span className="sidebar-proximo-cat">{r.categoria || 'Geral'}</span>
                            </span>
                            <span className="sidebar-proximo-dist">
                                {r.distancia < 1
                                    ? `${Math.round(r.distancia * 1000)} m`
                                    : `${r.distancia.toFixed(1)} km`}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <p>Braporte v1.0</p>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;
