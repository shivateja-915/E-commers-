import React, { useState, useEffect } from 'react';
import { AiOutlineFilter, AiOutlineClose } from 'react-icons/ai';
import { supabase } from '../lib/supabase';
import './FilterBar.css';

const FilterBar = ({ onFilterChange }) => {
  const [filters, setFilters] = useState([]);
  const [selected, setSelected] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      const { data } = await supabase
        .from('filters')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order');
      if (data) setFilters(data);
    };
    fetchFilters();
  }, []);

  const handleChange = (filterName, value) => {
    const next = { ...selected, [filterName]: value === 'all' ? undefined : value };
    setSelected(next);
    onFilterChange(next);
  };

  const clearAll = () => {
    setSelected({});
    onFilterChange({});
  };

  const hasFilters = Object.values(selected).some(Boolean);

  const FilterContent = () => (
    <div className="filter-bar__filters">
      {filters.map(f => (
        <div key={f.id} className="filter-bar__group">
          <select
            value={selected[f.filter_name] || 'all'}
            onChange={e => handleChange(f.filter_name, e.target.value)}
            className="filter-bar__select"
          >
            <option value="all">{f.filter_name}</option>
            {(f.filter_values || []).map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      ))}
      {hasFilters && (
        <button className="filter-bar__clear" onClick={clearAll}>
          <AiOutlineClose size={14} /> Clear All
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="filter-bar desktop">
        <div className="container">
          <div className="filter-bar__inner">
            <div className="filter-bar__label">
              <AiOutlineFilter size={16} /> Filter
            </div>
            <FilterContent />
          </div>
        </div>
      </div>

      {/* Mobile Trigger */}
      <div className="filter-bar mobile">
        <div className="container">
          <button className="filter-bar__mobile-btn" onClick={() => setDrawerOpen(true)}>
            <AiOutlineFilter size={18} /> Filters {hasFilters && '•'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="filter-drawer">
          <div className="filter-drawer__backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="filter-drawer__panel">
            <div className="filter-drawer__handle" />
            <div className="filter-drawer__header">
              <h3>Filters</h3>
              <button onClick={() => setDrawerOpen(false)} style={{ padding: 8, color: 'var(--text-mid)' }}><AiOutlineClose size={20} /></button>
            </div>
            <div className="filter-drawer__body">
              {filters.map(f => (
                <div key={f.id} className="filter-drawer__group">
                  <label className="filter-drawer__label">{f.filter_name}</label>
                  <div className="filter-drawer__options">
                    <button
                      className={`filter-drawer__opt ${!selected[f.filter_name] ? 'active' : ''}`}
                      onClick={() => handleChange(f.filter_name, 'all')}
                    >All</button>
                    {(f.filter_values || []).map(v => (
                      <button
                        key={v}
                        className={`filter-drawer__opt ${selected[f.filter_name] === v ? 'active' : ''}`}
                        onClick={() => handleChange(f.filter_name, v)}
                      >{v}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="filter-drawer__footer">
              <button className="btn-outline" onClick={clearAll}>Clear All</button>
              <button className="btn-primary" onClick={() => setDrawerOpen(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterBar;
