import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, UserSquare2, CalendarClock, ReceiptText, User } from 'lucide-react';

export default function MainLayout() {
  const { user, token, logout, loading } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return <div className="app-layout"><div className="empty-state">Memuat aplikasi...</div></div>;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  const isAdmin = user?.role === 'admin';

  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Jabatan', path: '/admin/jabatan', icon: <UserSquare2 size={20} /> },
    { name: 'Pegawai', path: '/admin/pegawai', icon: <Users size={20} /> },
    { name: 'Presensi', path: '/admin/presensi', icon: <CalendarClock size={20} /> },
    { name: 'Rekap Gaji', path: '/admin/rekap-gaji', icon: <ReceiptText size={20} /> },
  ];

  const userMenu = [
    { name: 'Dashboard', path: '/user/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Profil', path: '/user/profil', icon: <User size={20} /> },
    { name: 'Presensi Saya', path: '/user/presensi', icon: <CalendarClock size={20} /> },
    { name: 'Gaji Saya', path: '/user/gaji', icon: <ReceiptText size={20} /> },
  ];

  const menu = isAdmin ? adminMenu : userMenu;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          PT Maju Jaya Teknologi
        </div>
        <nav className="sidebar-nav">
          {menu.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          <button 
            onClick={logout} 
            className="sidebar-link" 
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', marginTop: 'auto' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>
      
      <div className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 500 }}>{user?.name}</span>
            <span className={`badge ${isAdmin ? 'badge-primary' : 'badge-muted'}`}>
              {user?.role}
            </span>
          </div>
        </header>
        
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
