import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIAS } from './CategoryGrid';

const ReportForm = ({ categoryId, onChangeCategory, onSubmit, mapInstance }) => {
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [desc, setDesc] = useState('');
    const [titleError, setTitleError] = useState(false);
    const [status, setStatus] = useState('idle'); 

    const addressInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const cat = CATEGORIAS[categoryId];


    useEffect(() => {
        const initAutocomplete = () => {
            if (!window.google?.maps?.places || !addressInputRef.current) return;
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

            const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'br' },
                fields: ['formatted_address', 'geometry', 'name'],
                bounds: bounds,
                strictBounds: false
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.geometry) return;

                const fullAddress = place.formatted_address || place.name || '';
                setAddress(fullAddress);

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

    const handleSubmit = async () => {
        if (!title.trim()) {
            setTitleError(true);
            return;
        }
        setTitleError(false);
        setStatus('submitting');
        
        try {
            await onSubmit({ 
                categoria: categoryId, 
                titulo: title, 
                descricao: desc,
                endereco: address 
            });
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('idle');
        }
    };

    return (
        <div className="report-form" id="reportForm">
            <div className="selected-category" id="selectedCategory">
                <span className="selected-emoji">{cat?.emoji}</span>
                <span className="selected-name">{cat?.nome}</span>
                <button className="change-category" id="changeCategoryBtn" onClick={onChangeCategory}>
                    Trocar
                </button>
            </div>

            <div className="form-field">
                <label htmlFor="reportTitle">Título</label>
                <input
                    type="text"
                    id="reportTitle"
                    placeholder="Ex: Buraco na Av. Brasil"
                    style={titleError ? { borderColor: '#f85149' } : {}}
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (e.target.value.trim()) setTitleError(false);
                    }}
                />
            </div>

            <div className="form-field">
                <label htmlFor="reportAddress">Endereço</label>
                <input
                    type="text"
                    id="reportAddress"
                    ref={addressInputRef}
                    placeholder="Digite o endereço..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="off"
                />
            </div>

            <div className="form-field">
                <label htmlFor="reportDesc">Descrição</label>
                <textarea
                    id="reportDesc"
                    rows="3"
                    placeholder="Descreva o problema com detalhes..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                ></textarea>
            </div>

            <div className="form-field">
                <label>Foto (opcional)</label>
                <div className="photo-upload" id="photoUpload">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Adicionar foto</span>
                </div>
            </div>

            <button
                className="btn-submit"
                id="submitReport"
                onClick={handleSubmit}
                style={status === 'success' ? { background: '#16a34a' } : {}}
                disabled={status === 'submitting'}
            >
                {status === 'success' ? '✓ Enviado!' : 'Enviar Reporte'}
                {status !== 'success' && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                )}
            </button>
        </div>
    );
};

export default ReportForm;