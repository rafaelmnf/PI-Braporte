import React, { useState, useEffect, useRef } from 'react';

const Topbar = ({ onMenuClick, onProfileClick, onSearch, mapInstance }) => {
    const [searchValue, setSearchValue] = useState('');
    const searchInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    useEffect(() => {
        const initAutocomplete = () => {
            if (!window.google?.maps?.places || !searchInputRef.current) return;
            if (autocompleteRef.current) return;

            let bounds;
            try {
                const map = mapInstance?.current;
                if (map && typeof map.getCenter === 'function') {
                    const center = map.getCenter();
                    bounds = new window.google.maps.LatLngBounds(
                        new window.google.maps.LatLng(center.lat - 0.15, center.lng - 0.15),
                        new window.google.maps.LatLng(center.lat + 0.15, center.lng + 0.15)
                    );
                }
            } catch (e) {
            }
            if (!bounds) {
                bounds = new window.google.maps.LatLngBounds(
                    new window.google.maps.LatLng(-22.98, -47.20),
                    new window.google.maps.LatLng(-22.70, -46.90)
                );
            }

            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'br' },
                fields: ['formatted_address', 'geometry', 'name'],
                bounds: bounds,
                strictBounds: false
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;

                setSearchValue(place.name || place.formatted_address || '');

                const map = mapInstance?.current;
                if (map && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    map.flyTo({
                        center: [lng, lat],
                        zoom: 17,
                        duration: 1500
                    });
                }
            });

            autocompleteRef.current = autocomplete;
        };

        if (window.google?.maps?.places) {
            initAutocomplete();
        } else {
            const interval = setInterval(() => {
                if (window.google?.maps?.places) {
                    clearInterval(interval);
                    initAutocomplete();
                }
            }, 200);
            return () => clearInterval(interval);
        }
    }, [mapInstance]);

    useEffect(() => {
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (onSearch && searchValue.trim().length >= 3) {
                onSearch(searchValue.trim());
            }
        }
    };

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
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                />
            </div>

            <button className="topbar-btn" id="profileBtn" aria-label="Perfil" onClick={onProfileClick}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </button>
        </header>
    );
};

export default Topbar;