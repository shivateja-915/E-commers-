import React, { useEffect, useState } from 'react';
import { AiOutlinePlus, AiOutlineEdit, AiOutlineDelete, AiOutlineCheck, AiOutlineClose } from 'react-icons/ai';
import { supabase } from '../lib/supabase';

const FilterSettings = () => {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFilter, setNewFilter] = useState({ filter_name: '', filter_values: '' });
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const fetchFilters = async () => {
    const { data } = await supabase.from('filters').select('*').order('sort_order');
    setFilters(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchFilters(); }, []);

  const addFilter = async () => {
    if (!newFilter.filter_name || !newFilter.filter_values) return;
    setSaving(true);
    const values = newFilter.filter_values.split(',').map(v => v.trim()).filter(Boolean);
    await supabase.from('filters').insert([{
      filter_name: newFilter.filter_name,
      filter_values: values,
      is_visible: true,
      sort_order: filters.length + 1,
    }]);
    setNewFilter({ filter_name: '', filter_values: '' });
    setSaving(false);
    setStatus({ type: 'success', msg: 'Filter added!' });
    fetchFilters();
    setTimeout(() => setStatus(null), 2000);
  };

  const toggleVisibility = async (id, current) => {
    await supabase.from('filters').update({ is_visible: !current }).eq('id', id);
    fetchFilters();
  };

  const saveEdit = async (id) => {
    const values = editValues.split(',').map(v => v.trim()).filter(Boolean);
    await supabase.from('filters').update({ filter_values: values }).eq('id', id);
    setEditId(null);
    fetchFilters();
  };

  const deleteFilter = async (id) => {
    if (!window.confirm('Delete this filter?')) return;
    await supabase.from('filters').delete().eq('id', id);
    fetchFilters();
  };

  return (
    <div>
      <div className="admin-topbar">
        <h1>Filter Settings</h1>
      </div>

      <div className="admin-content">
        {status && (
          <div className={`alert alert--${status.type}`}>{status.msg}</div>
        )}

        {/* Add Filter */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--sage-dark)', marginBottom: 20 }}>
            Add New Filter
          </h3>
          <div className="add-filter-grid">
            <div>
              <label className="form-label">Filter Name</label>
              <input
                type="text" className="form-input"
                placeholder="e.g. Color"
                value={newFilter.filter_name}
                onChange={e => setNewFilter({ ...newFilter, filter_name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Values (comma separated)</label>
              <input
                type="text" className="form-input"
                placeholder="e.g. Red, Blue, Green"
                value={newFilter.filter_values}
                onChange={e => setNewFilter({ ...newFilter, filter_values: e.target.value })}
              />
            </div>
            <button className="btn-admin-primary" onClick={addFilter} disabled={saving}>
              <AiOutlinePlus /> Add Filter
            </button>
          </div>
        </div>

        {/* Filters List */}
        <div className="admin-card admin-card--table">
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: '#f9fafb' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--sage-dark)' }}>
              Active Filters ({filters.length})
            </h3>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : filters.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-light)' }}>
              No filters yet. Add your first filter above.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Filter Name</th>
                    <th>Values</th>
                    <th>Visible</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filters.map(f => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: 600, color: 'var(--sage-dark)' }}>{f.filter_name}</td>
                      <td>
                        {editId === f.id ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={editValues}
                              onChange={e => setEditValues(e.target.value)}
                              style={{ maxWidth: 300, padding: '6px 10px' }}
                            />
                            <button className="btn-admin-primary" style={{ padding: '6px 12px' }} onClick={() => saveEdit(f.id)}>
                              <AiOutlineCheck size={14} />
                            </button>
                            <button className="btn-admin-secondary" style={{ padding: '6px 12px' }} onClick={() => setEditId(null)}>
                              <AiOutlineClose size={14} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(f.filter_values || []).map(v => (
                              <span key={v} style={{
                                padding: '3px 10px',
                                background: 'var(--sage-mist)',
                                color: 'var(--sage-dark)',
                                borderRadius: '50px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                              }}>{v}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <label className="toggle-wrap" style={{ gap: 8 }}>
                          <div className="toggle">
                            <input
                              type="checkbox"
                              checked={f.is_visible}
                              onChange={() => toggleVisibility(f.id, f.is_visible)}
                            />
                            <span className="toggle-slider"></span>
                          </div>
                          <span style={{ fontSize: '0.8rem', color: f.is_visible ? 'var(--success)' : 'var(--text-light)' }}>
                            {f.is_visible ? 'Visible' : 'Hidden'}
                          </span>
                        </label>
                      </td>
                      <td>
                        <div className="actions">
                          {editId !== f.id && (
                            <button
                              className="btn-admin-secondary"
                              onClick={() => { setEditId(f.id); setEditValues((f.filter_values || []).join(', ')); }}
                            >
                              <AiOutlineEdit size={14} /> Edit
                            </button>
                          )}
                          <button className="btn-admin-danger" onClick={() => deleteFilter(f.id)}>
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
    </div>
  );
};

export default FilterSettings;
