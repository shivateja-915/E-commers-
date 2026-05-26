import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError('Invalid email or password. Please try again.');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-botanical login-botanical--left">🌿</div>
      <div className="login-botanical login-botanical--right">🌿</div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo__v">
            <img src="/logo.jpg" alt="Vaishnavi Collections" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
          </div>
          <div>
            <div className="login-logo__name">VAISHNAVI COLLECTIONS</div>
            <div className="login-logo__sub">Admin Portal</div>
          </div>
        </div>

        <h1 className="login-title">Welcome Back</h1>
        <p className="login-sub">Sign in to manage your boutique</p>

        {error && (
          <div className="alert alert--error">{error}</div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="shivashapure21@gmail.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-admin-primary login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Admin'}
          </button>
        </form>

        <p className="login-footer-note">
          Access restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
