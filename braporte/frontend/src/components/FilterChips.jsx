import React from 'react';

const FILTERS = [
    { id: 'todos', label: 'Todos' },
    { id: 'alagamento', label: '🌊 Alagamento' },
    { id: 'incendio', label: '🔥 Incêndio' },
    { id: 'saneamento', label: '🚰 Saneamento' },
    { id: 'infraestrutura', label: '🚧 Infraestrutura' },
    { id: 'seguranca', label: '🔒 Segurança' },
    { id: 'meio-ambiente', label: '🌳 Meio Ambiente' },
    { id: 'transito', label: '🚗 Trânsito' },
    { id: 'outros', label: '📌 Outros' },
];

const FilterChips = ({ activeFilter, onFilterChange }) => {
    return (
        <div className="filter-chips" id="filterChips">
            {FILTERS.map(filter => (
                <button
                    key={filter.id}
                    className={`chip ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => onFilterChange(filter.id)}
                    data-filter={filter.id}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterChips;
