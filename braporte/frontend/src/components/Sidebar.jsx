import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const goTo = (path) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

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
                    <button onClick={() => goTo('/mapa')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
                            <line x1="8" y1="2" x2="8" y2="18"/>
                            <line x1="16" y1="6" x2="16" y2="22"/>
                        </svg>
                        Mapa
                    </button>
                    <button onClick={() => goTo('/reportes')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="8" y1="6" x2="21" y2="6"/>
                            <line x1="8" y1="12" x2="21" y2="12"/>
                            <line x1="8" y1="18" x2="21" y2="18"/>
                            <line x1="3" y1="6" x2="3.01" y2="6"/>
                            <line x1="3" y1="12" x2="3.01" y2="12"/>
                            <line x1="3" y1="18" x2="3.01" y2="18"/>
                        </svg>
                        Meus Reportes
                    </button>
                    <button onClick={() => goTo('/comunidade')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                            <path d="M16 3.13a4 4 0 010 7.75"/>
                        </svg>
                        Comunidade
                    </button>
                    <button onClick={() => goTo('/perfil')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Meu Perfil
                    </button>

                    <div className="sidebar-divider" />

                    <button onClick={() => { console.log('Configurações'); onClose(); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                        Configurações
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <p>Braporte v1.0</p>
                </div>
            </aside>
        </div>
    );
};

export default Sidebar;