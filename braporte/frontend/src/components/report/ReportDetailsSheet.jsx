import React, { useEffect } from 'react';
import { CATEGORIAS } from '../CategoryGrid';

const ReportDetailsSheet = ({ report, onClose, onDenunciar }) => {
    
    // Suporte para fechar no ESC
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && report) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [report, onClose]);

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

                    <div className="details-address">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span>{report.endereco || 'Endereço não disponível'}</span>
                    </div>

                    <div className="details-description">
                        <h4>Descrição do problema</h4>
                        <p>{report.descricao || 'Sem detalhes informados.'}</p>
                    </div>

                    {report.imagem && (
                        <div className="details-photo">
                            <img src={report.imagem} alt="Foto do reporte" />
                        </div>
                    )}
                </div>

                <div className="details-footer">
                    <div className="action-buttons-row">
                        <button className="btn-action">
                            Apoiar Reporte
                        </button>
                        <button className="btn-action btn-danger" onClick={() => onDenunciar(report.id_reporte)}>
                            Denunciar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsSheet;
