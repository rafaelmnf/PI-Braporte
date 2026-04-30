import React, { useRef } from 'react';

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

// Arraste horizontal com mouse ou toque
const FilterChips = ({ activeFilter, onFilterChange }) => {
    const ref = useRef(null);
    const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

    const onMouseDown = (e) => {
        drag.current = { active: true, startX: e.pageX, scrollLeft: ref.current.scrollLeft, moved: false };
        ref.current.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
        if (!drag.current.active) return;
        const delta = e.pageX - drag.current.startX;
        if (Math.abs(delta) > 4) drag.current.moved = true;
        ref.current.scrollLeft = drag.current.scrollLeft - delta;
    };

    const onMouseUp = () => {
        drag.current.active = false;
        ref.current.style.cursor = '';
    };

    const handleChipClick = (filterId) => {
        if (!drag.current.moved) onFilterChange(filterId);
    };

    return (
        <div
            className="filter-chips"
            id="filterChips"
            ref={ref}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {FILTERS.map(filter => (
                <button
                    key={filter.id}
                    className={`chip ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => handleChipClick(filter.id)}
                    data-filter={filter.id}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};

export default FilterChips;