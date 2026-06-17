import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';

// Import Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminJabatan from './pages/admin/Jabatan';
import AdminPegawai from './pages/admin/Pegawai';
import AdminPresensi from './pages/admin/Presensi';
import AdminRekapGaji from './pages/admin/RekapGaji';

// Import User Pages
import UserDashboard from './pages/user/Dashboard';
import UserProfil from './pages/user/Profil';
import UserPresensi from './pages/user/Presensi';
import UserGaji from './pages/user/Gaji';

const ProtectedRoute = ({ children, role }) => {
  const { user, token, loading } = useAuthContext();
  if (loading) return null;
  if (!token) return <Navigate to="/login" />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="jabatan" element={<AdminJabatan />} />
            <Route path="pegawai" element={<AdminPegawai />} />
            <Route path="presensi" element={<AdminPresensi />} />
            <Route path="rekap-gaji" element={<AdminRekapGaji />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<ProtectedRoute role="user"><MainLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="profil" element={<UserProfil />} />
            <Route path="presensi" element={<UserPresensi />} />
            <Route path="gaji" element={<UserGaji />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
