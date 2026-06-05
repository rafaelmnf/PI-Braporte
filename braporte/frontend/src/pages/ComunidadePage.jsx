import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import MenuButton from '../components/MenuButton';
import '../styles/comunidade.css';

function getUser() {
    try {
        return JSON.parse(localStorage.getItem('user')) || {};
    } catch { return {}; }
}

// formata a data com seguranca - evita "Invalid Date"
function formatDate(dateStr) {
    if (!dateStr) return '';
    // o banco devolve a data como "2026-06-16" ou "2026-06-16T00:00:00..."
    const so_data = String(dateStr).slice(0, 10);
    const d = new Date(so_data + 'T00:00:00');
    if (isNaN(d.getTime())) return so_data;
    return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

const ComunidadePage = () => {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState('ativas');
    const [acoes, setAcoes] = useState([]);
    const [participacoes, setParticipacoes] = useState([]);
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [form, setForm] = useState({ titulo: '', descricao: '', categoria: '', local: '', data_acao: '', hora_acao: '', imagem: '' });

    const user = useMemo(() => getUser(), []);

    const localInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    // liga o autocomplete do Google Places ao campo de endereco do formulario
    useEffect(() => {
        if (!showForm) {
            autocompleteRef.current = null;
            return;
        }
        const init = () => {
            if (!window.google?.maps?.places || !localInputRef.current) return;
            if (autocompleteRef.current) return;

            const ac = new window.google.maps.places.Autocomplete(localInputRef.current, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'br' },
                fields: ['formatted_address', 'name']
            });

            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                const endereco = place.formatted_address || place.name || '';
                if (endereco) setForm(f => ({ ...f, local: endereco }));
            });

            autocompleteRef.current = ac;
        };

        if (window.google?.maps?.places) {
            init();
        } else {
            const interval = setInterval(() => {
                if (window.google?.maps?.places) { clearInterval(interval); init(); }
            }, 300);
            return () => clearInterval(interval);
        }
    }, [showForm]);

    const carregar = () => {
        api.getAcoes()
            .then(data => setAcoes(data.acoes || []))
            .catch(err => console.error('Erro ao carregar ações:', err));
        if (user.id_usuario) {
            api.getMinhasParticipacoes(user.id_usuario)
                .then(data => setParticipacoes(data.participacoes || []))
                .catch(() => {});
        }
    };

    useEffect(() => { carregar(); }, []);

    const filtered = useMemo(() => {
        let result = acoes;
        // filtro por aba: ativas mostra todas as nao concluidas;
        // concluidas mostra apenas as que o usuario criou ou participou
        if (activeTab === 'concluidas') {
            result = result.filter(a =>
                a.status === 'concluida' &&
                (a.id_criador === user.id_usuario || participacoes.includes(a.id_acao))
            );
        } else {
            result = result.filter(a => a.status !== 'concluida');
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(a =>
                (a.titulo || '').toLowerCase().includes(q) ||
                (a.local || '').toLowerCase().includes(q)
            );
        }
        return result;
    }, [acoes, search, activeTab, participacoes, user]);

    const handleImagem = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onloadend = () => setForm(f => ({ ...f, imagem: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleCriar = async () => {
        if (salvando) return; // ignora cliques repetidos enquanto salva
        if (!form.titulo.trim()) {
            alert('Informe ao menos o título da ação.');
            return;
        }
        setSalvando(true);
        try {
            await api.criarAcao({ ...form, id_criador: user.id_usuario || 1 });
            setShowForm(false);
            setForm({ titulo: '', descricao: '', categoria: '', local: '', data_acao: '', hora_acao: '', imagem: '' });
            carregar();
            alert('Ação criada com sucesso!');
        } catch (err) {
            console.error(err);
            alert('Erro ao criar a ação.');
        } finally {
            setSalvando(false);
        }
    };

    const handleParticipar = async (id_acao) => {
        try {
            await api.ingressarAcao(id_acao, user.id_usuario || 1);
            setParticipacoes([...participacoes, id_acao]);
            carregar();
        } catch (err) {
            console.error(err);
            alert('Erro ao ingressar na ação.');
        }
    };

    const handleSair = async (id_acao) => {
        try {
            await api.sairAcao(id_acao, user.id_usuario || 1);
            setParticipacoes(participacoes.filter(p => p !== id_acao));
            carregar();
        } catch (err) {
            console.error(err);
            alert('Erro ao sair da ação.');
        }
    };

    const handleConcluir = async (id_acao) => {
        if (salvando) return;
        if (!confirm('Marcar esta ação como concluída?')) return;
        setSalvando(true);
        try {
            await api.concluirAcao(id_acao, user.id_usuario || 1);
            setSelectedEvento(null);
            carregar();
            alert('Ação concluída!');
        } catch (err) {
            console.error(err);
            alert('Erro ao concluir a ação.');
        } finally {
            setSalvando(false);
        }
    };

    const handleExcluir = async (id_acao) => {
        if (salvando) return;
        if (!confirm('Tem certeza que deseja excluir esta ação?')) return;
        setSalvando(true);
        try {
            await api.deletarAcao(id_acao, user.id_usuario || 1);
            setSelectedEvento(null);
            carregar();
            alert('Ação excluída.');
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir a ação.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="comunidade-page">
            <MenuButton />
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

            <button
                onClick={() => setShowForm(true)}
                style={{ width: '100%', padding: '12px', marginBottom: '14px', background: '#238636', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
            >
                + Criar ação comunitária
            </button>

            <div className="com-tabs">
                <button className={`com-tab ${activeTab === 'ativas' ? 'active' : ''}`} onClick={() => setActiveTab('ativas')}>
                    Ativas
                </button>
                <button className={`com-tab ${activeTab === 'concluidas' ? 'active' : ''}`} onClick={() => setActiveTab('concluidas')}>
                    Concluídas
                </button>
            </div>

            <div className="com-list">
                {filtered.map(acao => {
                    const jaParticipou = participacoes.includes(acao.id_acao);

                    return (
                        <div key={acao.id_acao} className="com-card" onClick={() => setSelectedEvento(acao)}>
                            <div className="com-card-image">
                                {acao.imagem ? (
                                    <img src={acao.imagem} alt={acao.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484f58" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                )}
                            </div>

                            <div className="com-card-body">
                                <h3>{acao.titulo}</h3>
                                <p className="com-card-desc">{acao.descricao || 'Sem descrição.'}</p>

                                <div className="com-card-meta">
                                    {acao.data_acao && <span>📅 {formatDate(acao.data_acao)}</span>}
                                    {acao.hora_acao && <span>🕐 {acao.hora_acao}</span>}
                                </div>

                                <div className="com-card-footer">
                                    <div className="com-card-people">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                        </svg>
                                        <span>{acao.participantes}</span>
                                    </div>
                                    {acao.status === 'concluida' ? (
                                        <span style={{ color: '#3fb950', fontWeight: 700, fontSize: '0.8rem' }}>✓ Concluída</span>
                                    ) : (
                                        <button
                                            className={`com-card-btn ${jaParticipou ? 'participou' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                jaParticipou ? handleSair(acao.id_acao) : handleParticipar(acao.id_acao);
                                            }}
                                        >
                                            {jaParticipou ? '✓ Participando' : 'Participar'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="com-empty"><p>Nenhuma ação encontrada.</p></div>
                )}
            </div>

            {/* Formulário de criação */}
            {showForm && (
                <div className="evento-detail-overlay">
                    <div className="evento-detail-backdrop" onClick={() => setShowForm(false)} />
                    <div className="evento-detail-panel">
                        <div className="evento-detail-handle" />
                        <div className="evento-detail-header">
                            <button onClick={() => setShowForm(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                            <h3>Nova Ação Comunitária</h3>
                        </div>
                        <div className="evento-detail-body">
                            {[
                                { campo: 'titulo', label: 'Título', tipo: 'text' },
                                { campo: 'descricao', label: 'Descrição', tipo: 'textarea' },
                                { campo: 'categoria', label: 'Categoria (ex: limpeza, plantio)', tipo: 'text' },
                            ].map(({ campo, label, tipo }) => (
                                <div key={campo} style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '4px' }}>{label}</label>
                                    {tipo === 'textarea' ? (
                                        <textarea
                                            value={form[campo]}
                                            onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                                            style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '8px', minHeight: '70px', resize: 'vertical' }}
                                        />
                                    ) : (
                                        <input
                                            type={tipo}
                                            value={form[campo]}
                                            onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                                            style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '8px' }}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Campo de endereço com autocomplete do Google Places */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '4px' }}>Local / Endereço</label>
                                <input
                                    type="text"
                                    ref={localInputRef}
                                    value={form.local}
                                    onChange={(e) => setForm({ ...form, local: e.target.value })}
                                    placeholder="Digite e selecione o endereço"
                                    style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '8px' }}
                                />
                            </div>

                            {[
                                { campo: 'data_acao', label: 'Data', tipo: 'date' },
                                { campo: 'hora_acao', label: 'Horário', tipo: 'time' },
                            ].map(({ campo, label, tipo }) => (
                                <div key={campo} style={{ marginBottom: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '4px' }}>{label}</label>
                                    <input
                                        type={tipo}
                                        value={form[campo]}
                                        onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                                        style={{ width: '100%', padding: '10px', background: '#0d1117', color: '#c9d1d9', border: '1px solid #30363d', borderRadius: '8px' }}
                                    />
                                </div>
                            ))}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#8b949e', marginBottom: '4px' }}>Imagem (opcional)</label>
                                <input type="file" accept="image/*" onChange={handleImagem} style={{ color: '#c9d1d9', fontSize: '0.8rem' }} />
                                {form.imagem && (
                                    <img src={form.imagem} alt="prévia" style={{ width: '100%', marginTop: '8px', borderRadius: '8px', maxHeight: '140px', objectFit: 'cover' }} />
                                )}
                            </div>
                            <button
                                onClick={handleCriar}
                                disabled={salvando}
                                style={{ width: '100%', padding: '12px', background: salvando ? '#1a4a24' : '#238636', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer' }}
                            >
                                {salvando ? 'Criando...' : 'Criar ação'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            {selectedEvento.imagem && (
                                <img src={selectedEvento.imagem} alt={selectedEvento.titulo} style={{ width: '100%', borderRadius: '10px', marginBottom: '12px', maxHeight: '170px', objectFit: 'cover' }} />
                            )}
                            <h2>{selectedEvento.titulo}</h2>
                            <div className="ed-meta">
                                {selectedEvento.data_acao && <span>📅 {formatDate(selectedEvento.data_acao)}</span>}
                                {selectedEvento.hora_acao && <span>🕐 {selectedEvento.hora_acao}</span>}
                            </div>
                            {selectedEvento.local && <p className="ed-local">📍 {selectedEvento.local}</p>}
                            {selectedEvento.criador && (
                                <p className="ed-organizador">🏢 Organizado por: {selectedEvento.criador}</p>
                            )}
                            <div className="ed-desc">
                                <h4>Sobre o evento</h4>
                                <p>{selectedEvento.descricao || 'Sem descrição.'}</p>
                            </div>
                            <div className="ed-stats">
                                <span>👥 {selectedEvento.participantes} participantes confirmados</span>
                            </div>

                            {selectedEvento.status === 'concluida' ? (
                                <p style={{ textAlign: 'center', color: '#3fb950', fontWeight: 700, marginTop: '10px' }}>✓ Esta ação foi concluída</p>
                            ) : (
                                <>
                                    <button
                                        className={`ed-btn ${participacoes.includes(selectedEvento.id_acao) ? 'participou' : ''}`}
                                        onClick={() => {
                                            participacoes.includes(selectedEvento.id_acao)
                                                ? handleSair(selectedEvento.id_acao)
                                                : handleParticipar(selectedEvento.id_acao);
                                            setSelectedEvento(null);
                                        }}
                                    >
                                        {participacoes.includes(selectedEvento.id_acao) ? '✓ Sair desta ação' : 'Participar deste evento'}
                                    </button>

                                    {/* botoes do criador */}
                                    {selectedEvento.id_criador === user.id_usuario && (
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                            <button
                                                onClick={() => handleConcluir(selectedEvento.id_acao)}
                                                style={{ flex: 1, padding: '11px', background: '#1f6feb', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Concluir
                                            </button>
                                            <button
                                                onClick={() => handleExcluir(selectedEvento.id_acao)}
                                                style={{ flex: 1, padding: '11px', background: 'transparent', color: '#f85149', border: '1px solid #f85149', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComunidadePage;
