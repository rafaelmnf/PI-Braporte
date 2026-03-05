// Initialize Lucide icons
lucide.createIcons();

// Global variables
let map;
let currentUser = null;
let userReports = [];
let reportLocation = { lat: null, lng: null };
let selectionMarker = null;

// Initialize Map
function initMap() {
    // Default to São Paulo
    const defaultLat = -23.5505;
    const defaultLng = -46.6333;

    map = L.map('map').setView([defaultLat, defaultLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add some example markers
    addExampleMarkers();

    // Try to get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 15);
                reportLocation = { lat: latitude, lng: longitude };
                updateLocationDisplay(latitude, longitude);
            },
            () => {
                console.log('Geolocation denied or error');
                reportLocation = { lat: defaultLat, lng: defaultLng };
                updateLocationDisplay(defaultLat, defaultLng);
            }
        );
    }
}

function addExampleMarkers() {
    const examples = [
        { lat: -23.5505, lng: -46.6333, type: 'flood', title: 'Alagamento na Av. Paulista' },
        { lat: -23.5450, lng: -46.6400, type: 'infrastructure', title: 'Buraco na rua' },
        { lat: -23.5580, lng: -46.6250, type: 'sanitation', title: 'Lixo acumulado' },
        { lat: -23.5480, lng: -46.6500, type: 'security', title: 'Iluminação pública queimada' }
    ];

    const icons = {
        flood: { color: '#3B82F6', icon: 'waves' },
        fire: { color: '#EF4444', icon: 'flame' },
        sanitation: { color: '#EAB308', icon: 'trash-2' },
        infrastructure: { color: '#4B5563', icon: 'construction' },
        security: { color: '#A855F7', icon: 'shield-alert' },
        environment: { color: '#22C55E', icon: 'tree-pine' }
    };

    examples.forEach(ex => {
        const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: ${icons[ex.type].color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                            <svg style="width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                           </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        L.marker([ex.lat, ex.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${ex.title}</b><br>Reportado há 2 horas`);
    });
}

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 16);
            L.marker([latitude, longitude]).addTo(map)
                .bindPopup('Você está aqui')
                .openPopup();
        });
    }
}

function resetMap() {
    map.setView([-23.5505, -46.6333], 13);
}

function updateLocationDisplay(lat, lng) {
    const display = document.getElementById('reportLocation');
    if (display) {
        // Reverse geocoding would go here in production
        display.textContent = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

function startLocationSelection() {
    closeReportModal();
    document.getElementById('locationSelectionUI').classList.remove('hidden');

    const center = map.getCenter();
    if (selectionMarker) {
        selectionMarker.setLatLng(center);
    } else {
        selectionMarker = L.marker(center, { draggable: true }).addTo(map);
    }
}

function confirmLocationSelection() {
    const pos = selectionMarker.getLatLng();
    reportLocation = { lat: pos.lat, lng: pos.lng };
    updateLocationDisplay(pos.lat, pos.lng);

    document.getElementById('locationSelectionUI').classList.add('hidden');
    if (selectionMarker) {
        map.removeLayer(selectionMarker);
        selectionMarker = null;
    }
    openReportModal();
    showToast('Localização confirmada!');
}

function cancelLocationSelection() {
    document.getElementById('locationSelectionUI').classList.add('hidden');
    if (selectionMarker) {
        map.removeLayer(selectionMarker);
        selectionMarker = null;
    }
    openReportModal();
}

// User Menu Toggle
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');

    // Close when clicking outside
    if (!dropdown.classList.contains('hidden')) {
        setTimeout(() => {
            document.addEventListener('click', closeUserMenu);
        }, 100);
    }
}

function closeUserMenu(e) {
    const dropdown = document.getElementById('userDropdown');
    const userBtn = document.getElementById('userBtn');

    if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
        document.removeEventListener('click', closeUserMenu);
    }
}

// Auth Modal
function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('userDropdown').classList.add('hidden');
    setTimeout(() => {
        document.querySelector('.modal-enter').classList.add('modal-enter-active');
    }, 10);
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.querySelector('.modal-enter').classList.remove('modal-enter-active');
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginTab.classList.add('tab-active');
        registerTab.classList.remove('tab-active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        loginTab.classList.remove('tab-active');
        registerTab.classList.add('tab-active');
    }
    lucide.createIcons();
}

// Report Modal
function openReportModal() {
    document.getElementById('reportModal').classList.remove('hidden');
    setTimeout(() => {
        document.querySelector('#reportModal .modal-enter').classList.add('modal-enter-active');
    }, 10);

    if (!reportLocation.lat) {
        const center = map.getCenter();
        reportLocation = { lat: center.lat, lng: center.lng };
        updateLocationDisplay(center.lat, center.lng);
    }
}

function closeReportModal() {
    document.getElementById('reportModal').classList.add('hidden');
    document.querySelector('#reportModal .modal-enter').classList.remove('modal-enter-active');
    document.getElementById('reportForm').reset();
    clearPhoto();
}

function handleReportClick() {
    if (currentUser) {
        openReportModal();
    } else {
        openAuthModal();
    }
}

// Auth Handlers
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;

    // Simulate login (in real app, this would call an API)
    currentUser = {
        name: 'João Silva',
        email: email,
        phone: '(11) 98765-4321',
        address: 'São Paulo, SP',
        cpf: '123.456.789-00',
        credibility: 85
    };
    localStorage.setItem('briporte_user', JSON.stringify(currentUser));

    updateUIForLoggedInUser();
    closeAuthModal();
    showToast('Login realizado com sucesso!');

    // Open report modal after login
    setTimeout(() => {
        openReportModal();
    }, 500);
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const cpf = document.getElementById('regCPF').value;

    currentUser = {
        name: name,
        email: email,
        phone: phone,
        address: address,
        cpf: cpf,
        credibility: 100 // New users start with full credibility
    };
    localStorage.setItem('briporte_user', JSON.stringify(currentUser));

    updateUIForLoggedInUser();
    closeAuthModal();
    showToast('Conta criada com sucesso! Bem-vindo à Braporte!');

    setTimeout(() => {
        openReportModal();
    }, 500);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('briporte_user');
    document.getElementById('loggedOutMenu').classList.remove('hidden');
    document.getElementById('loggedInMenu').classList.add('hidden');
    document.getElementById('userNameDisplay').textContent = 'Entrar';
    document.getElementById('userDropdown').classList.add('hidden');
    showToast('Logout realizado');
}

function updateUIForLoggedInUser() {
    document.getElementById('loggedOutMenu').classList.add('hidden');
    document.getElementById('loggedInMenu').classList.remove('hidden');
    document.getElementById('userNameDisplay').textContent = currentUser.name.split(' ')[0];

    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileAddress').textContent = currentUser.address;
    document.getElementById('profileCPF').textContent = currentUser.cpf;
    document.getElementById('credibilityScore').textContent = currentUser.credibility;
}

// Report Handler
function handleReportSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const category = formData.get('category');
    const description = document.getElementById('reportDescription').value;

    // Create marker on map
    const icons = {
        flood: '#3B82F6',
        fire: '#EF4444',
        sanitation: '#EAB308',
        infrastructure: '#4B5563',
        security: '#A855F7',
        environment: '#22C55E'
    };

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${icons[category]}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); animation: bounce 0.5s;">
                        <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
                       </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    L.marker([reportLocation.lat, reportLocation.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>Seu reporte</b><br>${description.substring(0, 50)}...`)
        .openPopup();

    // Add bounce animation
    const style = document.createElement('style');
    style.textContent = `
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `;
    document.head.appendChild(style);

    closeReportModal();
    showToast('Problema reportado com sucesso! +10 pontos de credibilidade');

    // Update credibility
    if (currentUser) {
        currentUser.credibility += 10;
        localStorage.setItem('briporte_user', JSON.stringify(currentUser));
        document.getElementById('credibilityScore').textContent = currentUser.credibility;
    }
}

// Photo Preview
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('photoPreview').classList.remove('hidden');
            document.getElementById('photoPlaceholder').classList.add('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearPhoto() {
    document.getElementById('reportPhoto').value = '';
    document.getElementById('photoPreview').classList.add('hidden');
    document.getElementById('photoPlaceholder').classList.remove('hidden');
}

// Contact Form
function handleContactSubmit(e) {
    e.preventDefault();
    showToast('Mensagem enviada! Entraremos em contato em breve.');
    e.target.reset();
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.remove('translate-y-full');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-full');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

// Format CPF
function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{0,3})/, '$1.$2');
    }

    input.value = value;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMap();

    // Restore session
    const storedUser = localStorage.getItem('briporte_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateUIForLoggedInUser();
    }

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAuthModal();
            closeReportModal();
        }
    });
});