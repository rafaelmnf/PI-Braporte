/**
 * Serviço placeholder de mapas (Mapbox)
 * Contém a estrutura para futuras implementações de Geocoding.
 */

// import axios from 'axios';

// O token agora vem do backend via API
export const mapServices = {
    /**
     * Futuro: Buscar sugestões de endereço a partir de texto (Autocomplete)
     * @param {string} query 
     * @returns {Promise<Array>} Lista de locais
     */
    async searchAddress(query) {
        console.log("TODO: Integrar Geocoding API do Mapbox para autocomplete", query);
        return [];
    },

    /**
     * Futuro: Converter Coordenadas -> Endereço formatado (Reverse Geocoding)
     * @param {number} lat 
     * @param {number} lng 
     * @returns {Promise<string>}
     */
    async getAddressFromCoords(lat, lng) {
        console.log("TODO: Integrar Reverse Geocoding via Mapbox", lat, lng);
        return "Endereço fictício resolvido";
    }
};
