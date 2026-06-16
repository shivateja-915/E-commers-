import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit, AiOutlineDelete, AiOutlineSearch, AiOutlinePlus, AiOutlineWarning, AiOutlineStop, AiOutlineCheckCircle } from 'react-icons/ai';
import { supabase } from '../lib/supabase';

const ManageDresses = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
    setProducts(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || String(p.display_id).includes(q));
    }
    if (sort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    setFiltered(list);
  }, [search, sort, products]);

  const handleDelete = async () => {
    setDeleting(true);
    await supabase.from('products').delete().eq('id', deleteId);
    setDeleteId(null);
    setDeleting(false);
    fetchProducts();
  };

  const handleToggleStock = async (id, currentStatus) => {
    await supabase.from('products').update({ in_stock: !currentStatus }).eq('id', id);
    fetchProducts();
  };

  return (
    <div>
      <div className="admin-topbar">
        <h1>Manage Dresses</h1>
        <Link to="/add" className="btn-admin-primary">
          <AiOutlinePlus /> Add New
        </Link>
      </div>

      <div className="admin-content">
        {/* Controls */}
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-input-wrap" style={{ flex: 1, minWidth: 200 }}>
              <AiOutlineSearch size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', background: 'white', cursor: 'pointer' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A–Z</option>
            </select>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              {filtered.length} dresses
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="admin-card admin-card--table">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-light)' }}>
              No dresses found. <Link to="/add" style={{ color: 'var(--sage-dark)', fontWeight: 600 }}>Add your first dress →</Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Sizes</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            style={{ width: 48, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 64, background: 'var(--sage-mist)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👗</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>#{p.display_id}</td>
                      <td style={{ fontWeight: 500, maxWidth: 220 }}>
                        {p.super_heading && (
                          <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--sage-dark)', opacity: 0.6, marginBottom: 2 }}>
                            {p.super_heading}
                          </div>
                        )}
                        {p.name}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{(p.sizes || []).join(', ') || '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--sage-dark)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {p.discount_enabled && p.discount_original_price && p.discount_value ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                              ₹{p.discount_original_price.toLocaleString('en-IN')}
                            </span>
                            <span>
                              ₹{(p.discount_type === 'percentage'
                                ? p.discount_original_price - (p.discount_original_price * p.discount_value / 100)
                                : p.discount_original_price - p.discount_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        ) : p.price != null ? (
                          new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.price)
                        ) : (
                          <span style={{ color: 'var(--text-light)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {p.is_featured
                          ? <span className="status-badge status-badge--gold">⭐ Yes</span>
                          : <span className="status-badge status-badge--gray">No</span>}
                      </td>
                      <td>
                        {p.is_available
                          ? (p.in_stock !== false
                              ? <span className="status-badge status-badge--green">● Active</span>
                              : <span className="status-badge" style={{background: '#fce8e8', color: '#d93025'}}>Out of Stock</span>)
                          : <span className="status-badge status-badge--gray">Hidden</span>}
                      </td>
                      <td>
                        <div className="actions">
                          <Link to={`/edit/${p.id}`} className="btn-admin-secondary">
                            <AiOutlineEdit size={14} /> Edit
                          </Link>
                          <button
                            className="btn-admin-secondary"
                            onClick={() => handleToggleStock(p.id, p.in_stock !== false)}
                            style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, background: p.in_stock !== false ? '#fff0f0' : '#e6f4ea', color: p.in_stock !== false ? '#d32f2f' : '#1e8e3e', borderColor: 'transparent' }}
                          >
                            {p.in_stock !== false ? <><AiOutlineStop size={14} /> Out of Stock</> : <><AiOutlineCheckCircle size={14} /> In Stock</>}
                          </button>
                          <button
                            className="btn-admin-danger"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <AiOutlineDelete size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-md)',
            padding: 32, maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AiOutlineWarning size={28} style={{ color: 'var(--danger)' }} />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--sage-dark)' }}>Delete Dress?</h3>
            </div>
            <p style={{ color: 'var(--text-mid)', marginBottom: 24, lineHeight: 1.5 }}>
              This will permanently delete the dress and all its data. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-admin-secondary" onClick={() => setDeleteId(null)} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button className="btn-admin-danger" onClick={handleDelete} disabled={deleting} style={{ flex: 1, justifyContent: 'center', padding: '10px 16px' }}>
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDresses;
