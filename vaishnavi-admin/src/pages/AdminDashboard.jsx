import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineAppstore, AiOutlineStar, AiOutlineHeart, AiOutlinePlus, AiOutlineUnorderedList, AiOutlineFilter } from 'react-icons/ai';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total: 0, featured: 0, favourites: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        { count: total },
        { count: featured },
        { count: favourites }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_favourite', true),
      ]);
      setStats({ total: total || 0, featured: featured || 0, favourites: favourites || 0 });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const quickLinks = [
    { to: '/add', icon: <AiOutlinePlus size={24} />, label: 'Add New Dress', color: '#edf8f1', iconColor: 'var(--sage-dark)' },
    { to: '/manage', icon: <AiOutlineUnorderedList size={24} />, label: 'Manage Dresses', color: '#f0f4ff', iconColor: '#4361ee' },
    { to: '/filters', icon: <AiOutlineFilter size={24} />, label: 'Filter Settings', color: '#fef9ec', iconColor: 'var(--gold)' },
  ];

  return (
    <div>
      <div className="admin-topbar">
        <h1>Dashboard</h1>
        <div className="admin-topbar__user">
          <div className="admin-topbar__avatar">A</div>
          Admin
        </div>
      </div>

      <div className="admin-content">
        {/* Stats */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--green">
              <AiOutlineAppstore />
            </div>
            <div>
              <div className="stat-card__value">{loading ? '—' : stats.total}</div>
              <div className="stat-card__label">Total Dresses</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--gold">
              <AiOutlineStar />
            </div>
            <div>
              <div className="stat-card__value">{loading ? '—' : stats.featured}</div>
              <div className="stat-card__label">Featured</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--rose">
              <AiOutlineHeart />
            </div>
            <div>
              <div className="stat-card__value">{loading ? '—' : stats.favourites}</div>
              <div className="stat-card__label">Favourites</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--sage-dark)', marginBottom: 20 }}>
            Quick Actions
          </h2>
          <div className="quick-actions-grid">
            {quickLinks.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                padding: '24px 16px',
                background: l.color,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ color: l.iconColor }}>{l.icon}</div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-dark)' }}>{l.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="admin-card">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 12 }}>
            Store Info
          </h2>
          <div className="info-grid">
            {[
              ['Store Name', 'Vaishnavi Collections'],
              ['Location', 'Badangpet, Hyderabad'],
              ['WhatsApp', '+91 9059899695'],
              ['Admin Email', 'sai1411sk@gmail.com'],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '12px 16px', background: 'var(--sage-mist)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)', marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--sage-dark)', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
