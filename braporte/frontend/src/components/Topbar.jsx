import React, { useState, useEffect, useRef } from 'react';

const Topbar = ({ onMenuClick, onProfileClick, onPlaceSelected, viewState }) => {
    const [searchValue, setSearchValue] = useState('');
    const searchInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const getBoundsFromView = () => {
        if (!window.google?.maps) return null;
        const lat = viewState?.latitude || -22.8342;
        const lng = viewState?.longitude || -47.0485;
        return new window.google.maps.LatLngBounds(
            { lat: lat - 0.03, lng: lng - 0.03 },
            { lat: lat + 0.03, lng: lng + 0.03 }
        );
    };

    useEffect(() => {
        const init = () => {
            if (!window.google?.maps?.places || !searchInputRef.current) return;
            if (autocompleteRef.current) return;

            const ac = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'br' },
                fields: ['formatted_address', 'geometry', 'name'],
                bounds: getBoundsFromView(),
                strictBounds: false
            });

            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (!place.geometry) return;
                setSearchValue(place.name || place.formatted_address || '');
                if (onPlaceSelected) {
                    onPlaceSelected({
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    });
                }
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
    }, []);

    // atualiza busca ao mover mapa
    useEffect(() => {
        if (autocompleteRef.current && window.google?.maps) {
            const bounds = getBoundsFromView();
            if (bounds) autocompleteRef.current.setBounds(bounds);
        }
    }, [viewState?.latitude, viewState?.longitude]);

    useEffect(() => {
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, []);

    return (
        <header className="topbar">
            <button className="topbar-btn" id="menuBtn" aria-label="Menu" onClick={onMenuClick}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
            </button>

            <div className="topbar-search" style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input 
                    type="text" 
                    placeholder="Buscar localização..." 
                    id="searchInput"
                    ref={searchInputRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    autoComplete="off"
                />
            </div>

            <button className="topbar-btn" id="profileBtn" aria-label="Notificações" onClick={onProfileClick}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
            </button>
        </header>
    );
};

export default Topbar;
