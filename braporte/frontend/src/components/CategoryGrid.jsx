import React from 'react';

export const CATEGORIAS = {
    'alagamento':      { id: 'alagamento', emoji: '🌊', nome: 'Alagamento', bg: '#dbeafe', color: '#2563eb' },
    'incendio':        { id: 'incendio', emoji: '🔥', nome: 'Incêndio', bg: '#fee2e2', color: '#dc2626' },
    'saneamento':      { id: 'saneamento', emoji: '🚰', nome: 'Saneamento', bg: '#d1fae5', color: '#059669' },
    'infraestrutura':  { id: 'infraestrutura', emoji: '🚧', nome: 'Infraestrutura', bg: '#fef3c7', color: '#d97706' },
    'seguranca':       { id: 'seguranca', emoji: '🔒', nome: 'Segurança', bg: '#ede9fe', color: '#7c3aed' },
    'meio-ambiente':   { id: 'meio-ambiente', emoji: '🌳', nome: 'Meio Ambiente', bg: '#dcfce7', color: '#16a34a' },
    'transito':        { id: 'transito', emoji: '🚗', nome: 'Trânsito', bg: '#ffedd5', color: '#ea580c' },
    'outros':          { id: 'outros', emoji: '📌', nome: 'Outros', bg: '#f1f5f9', color: '#475569' },
};

const CategoryGrid = ({ onSelectCategory }) => {
    return (
        <div className="category-grid">
            {Object.values(CATEGORIAS).map(cat => (
                <button
                    key={cat.id}
                    className="category-card"
                    data-category={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                >
                    <div className="category-icon" style={{ background: cat.bg, color: cat.color }}>
                        {cat.emoji}
                    </div>
                    <span>{cat.nome}</span>
                </button>
            ))}
        </div>
    );
};

export default CategoryGrid;
