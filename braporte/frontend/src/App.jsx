import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CadastroPage from './pages/CadastroPage';
import EsqueciSenhaPage from './pages/EsqueciSenhaPage';
import MapaPage from './pages/MapaPage';
import DashboardPage from './pages/DashboardPage';
import ComunidadePage from './pages/ComunidadePage';
import PerfilPage from './pages/PerfilPage';
import BottomNav from './components/BottomNav';

function AppLayout() {
    const location = useLocation();
    const hideNav = ['/', '/login', '/cadastro', '/esqueci-senha'].includes(location.pathname);

    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<CadastroPage />} />
                <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
                <Route path="/mapa" element={<MapaPage />} />
                <Route path="/reportes" element={<DashboardPage />} />
                <Route path="/comunidade" element={<ComunidadePage />} />
                <Route path="/perfil" element={<PerfilPage />} />
            </Routes>
            {!hideNav && <BottomNav />}
        </>
    );
}

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;
