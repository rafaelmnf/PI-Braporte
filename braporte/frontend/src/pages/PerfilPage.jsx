import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/perfil.css';

const PARTICIPOU_KEY = 'braporte_participou';

const BADGES = [
    { id: 'sentinela',    emoji: '🛡️', nome: 'Sentinela Iniciante', desc: '5+ reportes', min: 5 },
    { id: 'colaborador',  emoji: '🤝', nome: 'Colaborador Frequente', desc: '15+ reportes', min: 15 },
    { id: 'protetor',     emoji: '⭐', nome: 'Protetor do Bairro', desc: '30+ reportes', min: 30 },
    { id: 'elite',        emoji: '🏆', nome: 'Elite Sentinela', desc: '50+ reportes', min: 50 },
];

const PerfilPage = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch { return {}; }
    }, []);

    useEffect(() => {
        if (!user.id_usuario) {
            navigate('/login');
        }
    }, [user, navigate]);   

    const acoesParticipadas = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem(PARTICIPOU_KEY)) || [];
        } catch { return []; }
    }, []);

    useEffect(() => {
        api.getReports()
            .then(data => setReports(data.reportes || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const userId = user.id_usuario;
        const meusReportes = userId ? reports.filter(r => r.id_usuario === userId) : [];
        const total = meusReportes.length;
        const resolvidos = meusReportes.filter(r => r.status === 'resolvido').length;
        // calcula xp
        const xp = (total * 10) + (resolvidos * 5) + (acoesParticipadas.length * 3);
        return { total, resolvidos, xp, acoes: acoesParticipadas.length };
    }, [reports, user, acoesParticipadas]);

    const badgesConquistados = useMemo(() => {
        return BADGES.map(b => ({ ...b, unlocked: stats.total >= b.min }));
    }, [stats.total]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // cpf mascarado
    const cpfMask = user.cpf 
        ? `***.${user.cpf.slice(3,6)}.***-${user.cpf.slice(-2)}` 
        : '***.***.***-**';

    return (
        <div className="perfil-page">
            <div className="perfil-header">
                <div className="perfil-avatar">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <h1 className="perfil-nome">{user.nome || 'Urban Sentinel'}</h1>
                <p className="perfil-cpf">CPF: {cpfMask}</p>
            </div>

            <div className="perfil-score-card">
                <p className="score-label">PONTUAÇÃO DE CREDIBILIDADE</p>
                <div className="score-circle">
                    <span className="score-value">{loading ? '...' : stats.xp}</span>
                    <span className="score-unit">pts</span>
                </div>
            </div>

            <div className="perfil-stats">
                <div className="perfil-stat">
                    <span className="stat-icon">📝</span>
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">REPORTES FEITOS</span>
                </div>
                <div className="perfil-stat">
                    <span className="stat-icon">✅</span>
                    <span className="stat-number">{stats.resolvidos}</span>
                    <span className="stat-label">RESOLVIDOS</span>
                </div>
            </div>

            <div className="perfil-stat-extra">
                <span>🤝 AÇÕES PARTICIPADAS</span>
                <span>{stats.acoes}</span>
            </div>

            <div className="perfil-section">
                <h2>DISTINTIVOS & TÍTULOS</h2>
                <div className="perfil-badges">
                    {badgesConquistados.map(b => (
                        <div key={b.id} className={`perfil-badge ${b.unlocked ? 'unlocked' : 'locked'}`} title={b.desc}>
                            <span className="badge-emoji">{b.emoji}</span>
                            <span className="badge-name">{b.nome}</span>
                        </div>
                    ))}
                </div>

                {(() => {
                    const next = BADGES.find(b => stats.total < b.min);
                    if (!next) return null;
                    const prev = BADGES.filter(b => stats.total >= b.min).pop();
                    const prevMin = prev ? prev.min : 0;
                    const progress = ((stats.total - prevMin) / (next.min - prevMin)) * 100;
                    return (
                        <div className="perfil-progress">
                            <div className="progress-info">
                                <span>Próximo: {next.nome}</span>
                                <span>{stats.total}/{next.min}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                        </div>
                    );
                })()}
            </div>

            <div className="perfil-section">
                <button className="perfil-menu-item" onClick={() => console.log('Configurações')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    <span>Configurações</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>

                <button className="perfil-menu-item logout" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default PerfilPage;
