import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/menubutton.css';

const MenuButton = () => {
    const [aberta, setAberta] = useState(false);

    return (
        <>
            <button className="menu-button" onClick={() => setAberta(true)} aria-label="Abrir menu">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>
            <div className="menu-button-spacer" />

            <Sidebar isOpen={aberta} onClose={() => setAberta(false)} />
        </>
    );
};

export default MenuButton;
