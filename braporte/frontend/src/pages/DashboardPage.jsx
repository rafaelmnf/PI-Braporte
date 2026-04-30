import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIAS } from '../components/CategoryGrid';
import NotificationsPopup from '../components/NotificationsPopup';
import { api } from '../services/api';
import '../styles/dashboard.css';

const STATUS_MAP = {
    'aberto':       { label: 'Aberto', className: 'badge-aberto' },
    'em_analise':   { label: 'Em Análise', className: 'badge-analise' },
    'em_andamento': { label: 'Em Andamento', className: 'badge-andamento' },
    'fechado':      { label: 'Fechado', className: 'badge-fechado' },
    'resolvido':    { label: 'Resolvido', className: 'badge-resolvido' }
};

const FILTERS = [
    { id: 'todos', label: 'Todos' },
    { id: 'meus', label: 'Meus Reportes' },
    { id: 'em_andamento', label: 'Em Andamento' },
];

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) 
             + ', ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
}

const DashboardPage = () => {
    const [reports, setReports] = useState([]);
    const [activeFilter, setActiveFilter] = useState('todos');
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);

    const userId = useMemo(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            return u?.id_usuario || null;
        } catch { return null; }
    }, []);

    useEffect(() => {
        api.getReports()
            .then(data => setReports(data.reportes || []))
            .catch(err => console.error('Falha ao carregar reportes:', err))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let list = [...reports].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));
        if (activeFilter === 'meus' && userId) {
            list = list.filter(r => r.id_usuario === userId);
        } else if (activeFilter === 'em_andamento') {
            list = list.filter(r => r.status === 'em_andamento');
        }
        return list;
    }, [reports, activeFilter, userId]);

    const handleDelete = async (id_reporte) => {
        if (!confirm('Tem certeza que deseja excluir este reporte?')) return;
        try {
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;
            await api.denunciarReport(id_reporte, idUsuario);
            setReports(prev => prev.filter(r => r.id_reporte !== id_reporte));
            setSelectedDetail(null);
        } catch (err) {
            console.error('Erro ao excluir:', err);
        }
    };

    return (
        <div className="dashboard-page">
            <header className="dash-header">
                <div className="dash-header-top">
                    <h1>Seus Reportes</h1>
                    <button className="dash-bell" aria-label="Notificações" onClick={() => setNotifOpen(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                    </button>
                </div>
                <p className="dash-subtitle">Acompanhe a resolução das ocorrências no seu bairro.</p>
            </header>

            <div className="dash-filters">
                {FILTERS.map(f => (
                    <button
                        key={f.id}
                        className={`dash-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="dash-list">
                {loading && <p className="dash-loading">Carregando...</p>}

                {!loading && filtered.length === 0 && (
                    <div className="dash-empty"><p>Nenhum reporte encontrado.</p></div>
                )}

                {filtered.map(r => {
                    const cat = CATEGORIAS[r.categoria] || CATEGORIAS['outros'];
                    const st = STATUS_MAP[r.status] || STATUS_MAP['aberto'];

                    return (
                        <div key={r.id_reporte} className="dash-card" onClick={() => setSelectedDetail(r)}>
                            <div className="dash-card-header">
                                <span className="dash-card-category" style={{ color: cat.color }}>
                                    {cat.nome.toUpperCase()}
                                </span>
                                <span className="dash-card-date">{formatDate(r.data_hora)}</span>
                            </div>
                            <h3 className="dash-card-title">
                                <span className="dash-card-emoji">{cat.emoji}</span>
                                {r.motivo}
                            </h3>
                            {r.endereco && <p className="dash-card-address">📍 {r.endereco}</p>}
                            <span className={`dash-badge ${st.className}`}>{st.label}</span>
                        </div>
                    );
                })}
            </div>

            {selectedDetail && (
                <div className="dash-detail-overlay">
                    <div className="dash-detail-backdrop" onClick={() => setSelectedDetail(null)} />
                    <div className="dash-detail-panel">
                        <div className="dash-detail-handle" />
                        <div className="dash-detail-header">
                            <button onClick={() => setSelectedDetail(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                            <h3>Detalhes do Reporte</h3>
                        </div>
                        <div className="dash-detail-body">
                            <span className={`dash-badge ${(STATUS_MAP[selectedDetail.status] || STATUS_MAP['aberto']).className}`}>
                                {(STATUS_MAP[selectedDetail.status] || STATUS_MAP['aberto']).label}
                            </span>
                            <h2>{selectedDetail.motivo}</h2>
                            <p className="dd-category" style={{ color: (CATEGORIAS[selectedDetail.categoria] || CATEGORIAS['outros']).color }}>
                                {(CATEGORIAS[selectedDetail.categoria] || CATEGORIAS['outros']).emoji} {(CATEGORIAS[selectedDetail.categoria] || CATEGORIAS['outros']).nome}
                            </p>
                            {selectedDetail.endereco && <p className="dd-address">📍 {selectedDetail.endereco}</p>}
                            <p className="dd-date">📅 {formatDate(selectedDetail.data_hora)}</p>
                            <div className="dd-desc-card">
                                <h4>Descrição</h4>
                                <p>{selectedDetail.descricao || 'Sem descrição.'}</p>
                            </div>
                            <button className="dd-btn-delete" onClick={() => handleDelete(selectedDetail.id_reporte)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/>
                                </svg>
                                Excluir Reporte
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NotificationsPopup isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>
    );
};

export default DashboardPage;
