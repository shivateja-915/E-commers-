import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { AiOutlineDashboard, AiOutlinePlus, AiOutlineUnorderedList, AiOutlineFilter, AiOutlineLogout, AiOutlineHome } from 'react-icons/ai';
import { supabase } from './lib/supabase';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AddDress from './pages/AddDress';
import ManageDresses from './pages/ManageDresses';
import FilterSettings from './pages/FilterSettings';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: <AiOutlineDashboard size={18} />, label: 'Dashboard' },
    { to: '/add', icon: <AiOutlinePlus size={18} />, label: 'Add Dress' },
    { to: '/manage', icon: <AiOutlineUnorderedList size={18} />, label: 'Manage Dresses' },
    { to: '/filters', icon: <AiOutlineFilter size={18} />, label: 'Filter Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <div className="sidebar__logo-v">
            <img src="/logo.jpg" alt="Vaishnavi Collections" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
          </div>
          <div>
            <div className="sidebar__name">VAISHNAVI<br/>COLLECTIONS</div>
            <div className="sidebar__admin-tag">Admin Panel</div>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar__nav-item sidebar__nav-item--store"
        >
          <AiOutlineHome size={18} /> <span>View Store ↗</span>
        </a>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout" onClick={handleLogout}>
          <AiOutlineLogout size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <Sidebar />
    <main className="admin-main">{children}</main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminLayout><AdminDashboard /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/add" element={
          <ProtectedRoute>
            <AdminLayout><AddDress /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/edit/:id" element={
          <ProtectedRoute>
            <AdminLayout><AddDress /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/manage" element={
          <ProtectedRoute>
            <AdminLayout><ManageDresses /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/filters" element={
          <ProtectedRoute>
            <AdminLayout><FilterSettings /></AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
