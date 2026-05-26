import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineHeart } from 'react-icons/ai';
import { supabase } from '../lib/supabase';
import { useFavourites } from '../context/FavouritesContext';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import './Favourites.css';

const Favourites = () => {
  const { favourites } = useFavourites();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favourites.length === 0) { setProducts([]); setLoading(false); return; }
    supabase
      .from('products')
      .select('*, categories(name)')
      .in('id', favourites)
      .eq('is_available', true)
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, [favourites]);

  return (
    <div className="favourites page-enter">
      <div className="favourites__header">
        <div className="container">
          <span className="section-subtitle">Saved by You</span>
          <h1 className="section-title">Your Favourites</h1>
          {!loading && products.length > 0 && (
            <p className="favourites__count">{products.length} saved {products.length === 1 ? 'item' : 'items'}</p>
          )}
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <AiOutlineHeart size={64} style={{ color: 'var(--sage-pale)', margin: '0 auto 16px', display: 'block' }} />
            <h3>No favourites yet</h3>
            <p>Start exploring our collection and save dresses you love!</p>
            <Link to="/shop" className="btn-primary">Start Exploring</Link>
          </div>
        ) : (
          <div className="favourites__grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favourites;
