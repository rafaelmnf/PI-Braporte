import React, { useState, useEffect } from 'react';
import CategoryGrid from './CategoryGrid';
import ReportForm from './ReportForm';

const ReportPopup = ({ isOpen, onClose, onSubmit, viewState, userLocation }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (!isOpen) setSelectedCategory(null);
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="popup-overlay open">
            <div className="popup-backdrop" onClick={onClose}></div>
            
            <div className="popup-sheet">
                <div className="popup-header">
                    <div className="popup-handle"></div>
                    <h2>{selectedCategory ? 'Detalhes do Reporte' : 'Novo Reporte'}</h2>
                    <p className="popup-subtitle">
                        {selectedCategory ? 'Preencha as informações do problema' : 'Selecione a categoria do problema'}
                    </p>
                </div>

                <div className="popup-body">
                    {!selectedCategory ? (
                        <CategoryGrid onSelectCategory={setSelectedCategory} />
                    ) : (
                        <ReportForm 
                            categoryId={selectedCategory} 
                            onChangeCategory={() => setSelectedCategory(null)}
                            onSubmit={async (data) => {
                                await onSubmit(data);
                                setTimeout(() => onClose(), 1200);
                            }}
                            viewState={viewState}
                            userLocation={userLocation}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPopup;
