import React from 'react';
import '../styles/notifications.css';

const NotificationsPopup = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const notifs = [];

    return (
        <div className="notif-overlay">
            <div className="notif-backdrop" onClick={onClose} />
            <div className="notif-panel">
                <div className="notif-header">
                    <h3>Notificações</h3>
                    <button className="notif-close" onClick={onClose}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>
                <div className="notif-list">
                    {notifs.length === 0 ? (
                        <div className="notif-empty">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484f58" strokeWidth="1.5" strokeLinecap="round">
                                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 01-3.46 0"/>
                            </svg>
                            <p>Sem notificações no momento</p>
                        </div>
                    ) : (
                        notifs.map(n => (
                            <div key={n.id} className="notif-item">
                                <p>{n.texto}</p>
                                <span>{n.tempo}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPopup;
