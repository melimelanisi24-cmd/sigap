import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardWarga from './pages/DashboardWarga';
import DashboardAdmin from './pages/DashboardAdmin';
import FormPengaduan from './pages/FormPengaduan';
import FormAspirasi from './pages/FormAspirasi';
import DetailPengaduan from './pages/DetailPengaduan';
import ProfilWarga from './pages/ProfilWarga';
import PengaduanWargaPage from './pages/PengaduanWargaPage';
import NotFound from './pages/NotFound';

function ProtectedRoute({ allowedRole, children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Warga */}
      <Route path="/dashboard" element={<ProtectedRoute allowedRole="warga"><DashboardWarga /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan/baru" element={<ProtectedRoute allowedRole="warga"><FormPengaduan /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan/:id" element={<ProtectedRoute allowedRole="warga"><DetailPengaduan /></ProtectedRoute>} />
      <Route path="/dashboard/aspirasi/baru" element={<ProtectedRoute allowedRole="warga"><FormAspirasi /></ProtectedRoute>} />
      <Route path="/dashboard/profil" element={<ProtectedRoute allowedRole="warga"><ProfilWarga /></ProtectedRoute>} />
      <Route path="/pengaduan-warga" element={<ProtectedRoute allowedRole="warga"><PengaduanWargaPage /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan-warga" element={<ProtectedRoute allowedRole="warga"><PengaduanWargaPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/*" element={<ProtectedRoute allowedRole="admin"><DashboardAdmin /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
