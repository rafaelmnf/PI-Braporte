import React, { useState, useMemo } from 'react';
import '../styles/comunidade.css';

const ACOES_STORAGE_KEY = 'braporte_acoes';
const PARTICIPOU_KEY = 'braporte_participou';


function getAcoes() {
  const data = localStorage.getItem(ACOES_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAcoes(acoes) {
    localStorage.setItem(ACOES_STORAGE_KEY, JSON.stringify(acoes));
}

function getParticipou() {
    const data = localStorage.getItem(PARTICIPOU_KEY);
    return data ? JSON.parse(data) : [];
}

function addParticipou(id) {
    const list = getParticipou();
    if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem(PARTICIPOU_KEY, JSON.stringify(list));
    }
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
    } catch { return dateStr; }
}


const ComunidadePage = () => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('todas');
    const [acoes, setAcoes] = useState(() => getAcoes());
    const [participou, setParticipou] = useState(() => getParticipou());
    const [selectedEvento, setSelectedEvento] = useState(null);

    const filtered = useMemo(() => {
        let result = acoes;
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(a => 
                a.titulo.toLowerCase().includes(q) || 
                a.local.toLowerCase().includes(q)
            );
        }
        return result;
    }, [acoes, search]);

    const handleParticipar = (id) => {
        if (participou.includes(id)) return;

        const updated = acoes.map(a => {
            if (a.id === id) return { ...a, participantes: a.participantes + 1 };
            return a;
        });
        setAcoes(updated);
        saveAcoes(updated);
        addParticipou(id);
        setParticipou([...participou, id]);
    };

    return (
        <div className="comunidade-page">
            <header className="com-header">
                <h1>Ações Comunitárias</h1>
                <p className="com-subtitle">Transforme sua vizinhança hoje.</p>
            </header>

            <div className="com-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    type="text"
                    placeholder="Buscar ações..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="com-tabs">
                <button className={`com-tab ${activeTab === 'proximas' ? 'active' : ''}`} onClick={() => setActiveTab('proximas')}>
                    Próximo a mim
                </button>
                <button className={`com-tab ${activeTab === 'todas' ? 'active' : ''}`} onClick={() => setActiveTab('todas')}>
                    Todas
                </button>
            </div>

            <div className="com-list">
                {filtered.map(acao => {
                    const jaParticipou = participou.includes(acao.id);

                    return (
                        <div key={acao.id} className={`com-card ${acao.destaque ? 'destaque' : ''}`} onClick={() => setSelectedEvento(acao)}>
                            {acao.destaque && <span className="com-card-destaque-badge">DESTAQUE</span>}
                            
                            <div className="com-card-image">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484f58" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </div>

                            <div className="com-card-body">
                                <h3>{acao.titulo}</h3>
                                <p className="com-card-desc">{acao.descricao}</p>
                                
                                <div className="com-card-meta">
                                    <span>📅 {formatDate(acao.data)}</span>
                                    <span>🕐 {acao.horario}</span>
                                </div>

                                <div className="com-card-footer">
                                    <div className="com-card-people">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                        </svg>
                                        <span>{acao.participantes}</span>
                                    </div>
                                    <button 
                                        className={`com-card-btn ${jaParticipou ? 'participou' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); handleParticipar(acao.id); }}
                                        disabled={jaParticipou}
                                    >
                                        {jaParticipou ? '✓ Participando' : 'Participar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="com-empty"><p>Nenhuma ação encontrada.</p></div>
                )}
            </div>

            {/* Detalhes do evento */}
            {selectedEvento && (
                <div className="evento-detail-overlay">
                    <div className="evento-detail-backdrop" onClick={() => setSelectedEvento(null)} />
                    <div className="evento-detail-panel">
                        <div className="evento-detail-handle" />
                        <div className="evento-detail-header">
                            <button onClick={() => setSelectedEvento(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                            <h3>Detalhes do Evento</h3>
                        </div>
                        <div className="evento-detail-body">
                            <h2>{selectedEvento.titulo}</h2>
                            <div className="ed-meta">
                                <span>📅 {formatDate(selectedEvento.data)}</span>
                                <span>🕐 {selectedEvento.horario}</span>
                            </div>
                            <p className="ed-local">📍 {selectedEvento.local}</p>
                            {selectedEvento.organizador && (
                                <p className="ed-organizador">🏢 Organizado por: {selectedEvento.organizador}</p>
                            )}
                            <div className="ed-desc">
                                <h4>Sobre o evento</h4>
                                <p>{selectedEvento.descricao}</p>
                            </div>
                            <div className="ed-stats">
                                <span>👥 {selectedEvento.participantes} participantes confirmados</span>
                            </div>
                            <button 
                                className={`ed-btn ${participou.includes(selectedEvento.id) ? 'participou' : ''}`}
                                onClick={() => handleParticipar(selectedEvento.id)}
                                disabled={participou.includes(selectedEvento.id)}
                            >
                                {participou.includes(selectedEvento.id) ? '✓ Você já está participando' : 'Participar deste evento'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComunidadePage;
