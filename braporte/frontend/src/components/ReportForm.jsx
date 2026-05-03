import React, { useState, useEffect, useRef } from 'react';
import { CATEGORIAS } from './CategoryGrid';

import { api } from '../services/api';

const ReportForm = ({ categoryId, onChangeCategory, onSubmit, viewState, userLocation }) => {
    const [title, setTitle] = useState('');
    const [address, setAddress] = useState('');
    const [desc, setDesc] = useState('');
    const [titleError, setTitleError] = useState(false);
    const [status, setStatus] = useState('idle');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const selectedCoordsRef = useRef(null);
    const addressInputRef = useRef(null);
    const autocompleteRef = useRef(null);

    const cat = CATEGORIAS[categoryId];

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
        // Reverse geocode user location on mount if available
        if (userLocation && !address) {
            api.reverseGeocode(userLocation.lat, userLocation.lng)
                .then(data => {
                    if (data && data.features && data.features.length > 0) {
                        setAddress(data.features[0].place_name);
                        selectedCoordsRef.current = userLocation;
                    }
                })
                .catch(err => console.error("Erro ao obter endereço reverso:", err));
        }
    }, [userLocation]);

    useEffect(() => {
        const init = () => {
            if (!window.google?.maps?.places || !addressInputRef.current) return;
            if (autocompleteRef.current) return;

            const ac = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                types: ['geocode', 'establishment'],
                componentRestrictions: { country: 'br' },
                fields: ['formatted_address', 'geometry', 'name'],
                bounds: getBoundsFromView(),
                strictBounds: false
            });

            ac.addListener('place_changed', () => {
                const place = ac.getPlace();
                if (!place.geometry) return;
                const fullAddr = place.formatted_address || place.name || '';
                setAddress(fullAddr);
                selectedCoordsRef.current = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                };
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

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
        selectedCoordsRef.current = null;
    };

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
                setImage(reader.result); // Base64 string
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        return () => {
            if (autocompleteRef.current) {
                window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
                autocompleteRef.current = null;
            }
        };
    }, []);

    const handleSubmit = async () => {
        if (!title.trim()) { setTitleError(true); return; }
        setTitleError(false);
        setStatus('submitting');
        
        try {
            await onSubmit({ 
                categoria: categoryId, 
                titulo: title, 
                descricao: desc,
                endereco: address,
                lat: selectedCoordsRef.current?.lat || null,
                lng: selectedCoordsRef.current?.lng || null,
                imagem: image
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
                    onChange={handleAddressChange}
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
                <div 
                    className="photo-upload" 
                    id="photoUpload" 
                    onClick={() => document.getElementById('fileInput').click()}
                    style={imagePreview ? { padding: '0', overflow: 'hidden' } : {}}
                >
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span>Adicionar foto</span>
                        </>
                    )}
                </div>
                <input 
                    type="file" 
                    id="fileInput" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange} 
                />
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
