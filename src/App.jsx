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
import { getRoleHomePath, STAFF_ROLES } from './utils/roles';

function ProtectedRoute({ allowedRoles, children }) {
  const { user, authLoading } = useApp();
  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-sm text-gray-500" aria-live="polite">
        Memeriksa sesi...
      </main>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
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
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['warga']}><DashboardWarga /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan" element={<ProtectedRoute allowedRoles={['warga']}><DashboardWarga /></ProtectedRoute>} />
      <Route path="/dashboard/aspirasi" element={<ProtectedRoute allowedRoles={['warga']}><DashboardWarga /></ProtectedRoute>} />
      <Route path="/dashboard/pengaturan" element={<ProtectedRoute allowedRoles={['warga']}><ProfilWarga /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan/baru" element={<ProtectedRoute allowedRoles={['warga']}><FormPengaduan /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan/:id" element={<ProtectedRoute allowedRoles={['warga']}><DetailPengaduan /></ProtectedRoute>} />
      <Route path="/dashboard/aspirasi/baru" element={<ProtectedRoute allowedRoles={['warga']}><FormAspirasi /></ProtectedRoute>} />
      <Route path="/dashboard/profil" element={<ProtectedRoute allowedRoles={['warga']}><ProfilWarga /></ProtectedRoute>} />
      <Route path="/pengaduan-warga" element={<ProtectedRoute allowedRoles={['warga']}><PengaduanWargaPage /></ProtectedRoute>} />
      <Route path="/dashboard/pengaduan-warga" element={<ProtectedRoute allowedRoles={['warga']}><PengaduanWargaPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/profil" element={<ProtectedRoute allowedRoles={['admin', 'kepala_desa', 'super_admin']}><ProfilWarga /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><DashboardAdmin /></ProtectedRoute>} />

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
