import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import Footer from '../components/Footer';
import BackgroundOrnaments from '../components/BackgroundOrnaments';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});
  const [searchParams] = useSearchParams();

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, categories(name)')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (filters.Category) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('name', filters.Category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (filters.Size) {
      query = query.contains('sizes', [filters.Size]);
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const initialFilters = catParam ? { Category: catParam } : {};
    setActiveFilters(initialFilters);
    fetchProducts(initialFilters);
  }, [searchParams, fetchProducts]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    fetchProducts(filters);
  };

  return (
    <div className="shop floral-bg page-enter">
      <div className="shop__header" style={{ position: 'relative', overflow: 'hidden' }}>
        <BackgroundOrnaments />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <span className="section-subtitle" style={{ color: 'var(--sage-pale)' }}>Browse All</span>
          <h1 className="section-title" style={{ color: 'var(--warm-white)' }}>Our Collection</h1>
        </div>
      </div>

      <FilterBar onFilterChange={handleFilterChange} />

      <div className="container">
        <div className="shop__meta">
          {!loading && (
            <span className="shop__count">
              Showing <strong>{products.length}</strong> {products.length === 1 ? 'dress' : 'dresses'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-center" style={{ minHeight: 400 }}>
            <div className="spinner" />
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No dresses found</h3>
            <p>Try clearing your filters to see all available dresses.</p>
          </div>
        ) : (
          <div className="shop__grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
