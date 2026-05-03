import React, { useEffect, useState } from 'react';
import { CATEGORIAS } from '../CategoryGrid';
import { api } from '../../services/api';

const STATUS_LABELS = {
    'ainda_aqui': 'Ainda está aqui',
    'autoridades_c': 'Autoridades a caminho',
    'autoridades_l': 'Autoridades no local',
    'concluido': 'Concluído'
};

const ReportDetailsSheet = ({ report, onClose, onDenunciar, onStatusUpdated }) => {
    const [atualizacoes, setAtualizacoes] = useState([]);
    const [showOptions, setShowOptions] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imagensArray, setImagensArray] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Suporte para fechar no ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && report) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [report, onClose]);

    const fetchAtualizacoes = async () => {
        if (!report) return;
        try {
            const data = await api.getAtualizacoes(report.id_reporte);
            if (data.atualizacoes) setAtualizacoes(data.atualizacoes);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchImagens = async () => {
        if (!report) return;
        try {
            const data = await api.getImagens(report.id_reporte);
            if (data.imagens && data.imagens.length > 0) {
                setImagensArray(data.imagens);
                setCurrentImageIndex(0);
            } else if (report.imagem) {
                setImagensArray([report.imagem]);
                setCurrentImageIndex(0);
            } else {
                setImagensArray([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAtualizacoes();
        fetchImagens();
    }, [report]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validação de tipo
            if (!file.type.startsWith('image/')) {
                alert('Tipo de arquivo não suportado! Por favor, selecione uma imagem (PNG, JPEG, etc).');
                e.target.value = '';
                return;
            }

            const MAX_SIZE = 10 * 1024 * 1024; // 10MB
            if (file.size > MAX_SIZE) {
                alert('A imagem é muito grande! O tamanho máximo permitido é 10MB.');
                e.target.value = ''; // Limpa o input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAtualizarStatus = async (chave) => {
        setIsUpdating(true);
        try {
            // Pegamos o ID do usuário do localStorage
            const userStr = localStorage.getItem('user');
            const idUsuario = userStr ? JSON.parse(userStr).id_usuario : 1;

            console.log("Atualizando status do reporte...");

            const r = await api.atualizarStatus(report.id_reporte, idUsuario, chave, selectedImage);
            
            setSelectedImage(null);
            setImagePreview(null);
            setShowOptions(false);
            fetchAtualizacoes();
            fetchImagens();
            alert("Status atualizado com sucesso!");
            
            // Opcional: Se quiser atualizar o status pai no mapa automaticamente
            if (onStatusUpdated && r.novoStatusGeral) {
                onStatusUpdated(report.id_reporte, r.novoStatusGeral);
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao enviar a atualização.");
        } finally {
            setIsUpdating(false);
        }
    };

    const timeAgo = (dateString) => {
        const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (diff < 1) return 'agora';
        if (diff < 60) return `há ${diff}min`;
        if (diff < 1440) return `há ${Math.floor(diff/60)}h`;
        return `há ${Math.floor(diff/1440)} dias`;
    };

    if (!report) return null;

    const categoryObj = CATEGORIAS[report.categoria] || CATEGORIAS['outros'];
    const dataFormatada = new Date(report.data_hora).toLocaleString('pt-BR');

    // Mapeamento visual das tags de status
    const statusMap = {
        'aberto': { label: 'Aberto', class: 'status-aberto' },
        'em_analise': { label: 'Em Análise', class: 'status-analise' },
        'em_andamento': { label: 'Em Andamento', class: 'status-andamento' },
        'fechado': { label: 'Fechado', class: 'status-fechado' },
        'resolvido': { label: 'Resolvido', class: 'status-resolvido' },
    };
    const statusInfo = statusMap[report.status] || { label: report.status, class: '' };

    return (
        <div className="report-details-overlay open">
            {/* Backdrop para fechar clicando fora */}
            <div className="report-details-backdrop" onClick={onClose}></div>
            
            <div className="report-details-sheet">
                <div className="popup-handle"></div>

                <div className="details-header">
                    <div className="details-category-badge" style={{ background: categoryObj.bg, color: categoryObj.color }}>
                        <span className="emoji">{categoryObj.emoji}</span>
                        {categoryObj.nome}
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="details-content">
                    <h2 className="details-title">{report.motivo}</h2>
                    
                    <div className="details-meta">
                        <span className={`status-badge ${statusInfo.class}`}>{statusInfo.label}</span>
                        <span className="details-date">{dataFormatada}</span>
                    </div>

                    <div className="details-address" style={{ marginTop: '10px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{report.endereco || 'Endereço não disponível'}</span>
                    </div>

                    <div className="details-description" style={{ marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#e0e0e0' }}>Descrição do problema</h4>
                        <p style={{ margin: 0, color: '#aaa', lineHeight: 1.5 }}>{report.descricao || 'Sem detalhes informados.'}</p>
                    </div>

                    {atualizacoes.length > 0 && (
                        <div className="details-aggregates" style={{ marginTop: '20px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#33d17a' }}>Atualizações da Comunidade:</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {atualizacoes.map((item, idx) => (
                                    <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#eee' }}>
                                            <strong>{item.count}</strong> usuário(s): {STATUS_LABELS[item.tipo_contribuicao]}
                                        </span>
                                        <span style={{ color: '#888', fontSize: '0.75rem' }}>{timeAgo(item.last_update)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {imagensArray.length > 0 && (
                        <div className="details-photo" style={{ marginTop: '20px', position: 'relative' }}>
                            <img src={imagensArray[currentImageIndex]} alt="Foto do reporte" style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }} />
                            {imagensArray.length > 1 && (
                                <>
                                    <button 
                                        className="carousel-btn"
                                        style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : imagensArray.length - 1))}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                                    </button>
                                    <button 
                                        className="carousel-btn"
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={() => setCurrentImageIndex((prev) => (prev < imagensArray.length - 1 ? prev + 1 : 0))}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                                    </button>
                                    <div style={{ position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                        {imagensArray.map((_, idx) => (
                                            <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', background: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.4)', transition: 'background 0.3s' }}></div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="details-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', marginTop: '15px' }}>
                    <div className="action-buttons-row" style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ position: 'relative', flex: 3 }}>
                            <button 
                                className="btn-action" 
                                style={{ width: '100%', background: '#33d17a', color: '#000', fontWeight: 'bold' }}
                                onClick={() => setShowOptions(!showOptions)}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Enviando...' : 'Atualizar Status'}
                            </button>
                            
                            {showOptions && (
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '120%', 
                                    left: 0, 
                                    background: '#242424', 
                                    border: '1px solid #444', 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    zIndex: 50, 
                                    width: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '6px',
                                    boxShadow: '0 -4px 12px rgba(0,0,0,0.5)'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: '#aaa', padding: '4px 8px', textAlign: 'center', borderBottom: '1px solid #333', marginBottom: '4px' }}>
                                        O que você viu agora?
                                    </div>
                                    
                                    <div 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '10px', 
                                            padding: '8px', 
                                            background: 'rgba(255,255,255,0.03)', 
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            border: '1px dashed #444'
                                        }}
                                        onClick={() => document.getElementById('updateFileInput').click()}
                                    >
                                        <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                    <circle cx="12" cy="13" r="4"></circle>
                                                </svg>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#eee' }}>
                                            {imagePreview ? 'Foto selecionada' : 'Adicionar foto à atualização'}
                                        </span>
                                        <input 
                                            type="file" 
                                            id="updateFileInput" 
                                            accept="image/*" 
                                            style={{ display: 'none' }} 
                                            onChange={handleFileChange} 
                                        />
                                    </div>

                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <button 
                                            key={key} 
                                            style={{ 
                                                background: 'rgba(255,255,255,0.05)', 
                                                border: 'none', 
                                                color: '#fff', 
                                                textAlign: 'center', 
                                                padding: '10px', 
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                transition: 'background 0.2s'
                                            }} 
                                            onClick={() => handleAtualizarStatus(key)}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            className="btn-action btn-danger" 
                            style={{ flex: 1, padding: '10px', whiteSpace: 'nowrap' }} 
                            onClick={() => onDenunciar(report.id_reporte)}
                        >
                            Denunciar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsSheet;
