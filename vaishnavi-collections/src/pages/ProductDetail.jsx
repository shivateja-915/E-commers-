import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft } from 'react-icons/ai';
import { supabase } from '../lib/supabase';
import { useFavourites } from '../context/FavouritesContext';
import ImageGallery from '../components/ImageGallery';
import DescriptionBox from '../components/DescriptionBox';
import WhatsAppButton from '../components/WhatsAppButton';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const { isFavourite, toggleFavourite } = useFavourites();

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', id)
        .single();
      setProduct(data);
      setSelectedSize('');

      if (data?.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('category_id', data.category_id)
          .eq('is_available', true)
          .neq('id', id)
          .limit(3);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '80vh', paddingTop: 80 }}>
      <div className="spinner" />
    </div>
  );

  if (!product) return (
    <div className="container" style={{ paddingTop: 120, textAlign: 'center' }}>
      <h2>Product not found</h2>
      <Link to="/shop" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Back to Shop</Link>
    </div>
  );

  const fav = isFavourite(product.id);

  return (
    <div className="product-detail floral-bg page-enter">
      <div className="product-detail__nav container">
        <Link to="/shop" className="product-detail__back">
          <AiOutlineArrowLeft size={16} /> Back to Shop
        </Link>
        <span className="product-detail__breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
        </span>
      </div>

      <div className="product-detail__main container">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          <ImageGallery images={product.images || []} productName={product.name} />
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          <span className="tag" style={{ background: '#fef9ec', color: 'var(--gold)', fontWeight: 600 }}>ID: #{product.display_id}</span>
          {product.badge_text && (
            <span className="tag" style={{ marginLeft: 8, background: 'var(--gold)', color: 'white' }}>
              {product.badge_text}
            </span>
          )}

          <div className="product-detail__title-row">
            <h1 className="product-detail__name">{product.name}</h1>
            <button
              className={`product-detail__heart ${fav ? 'active' : ''}`}
              onClick={() => toggleFavourite(product.id)}
            >
              {fav ? <AiFillHeart size={24} /> : <AiOutlineHeart size={24} />}
            </button>
          </div>

          <div className="product-detail__divider" />

          {/* Description */}
          {product.description && (
            <div className="product-detail__section">
              <h3 className="product-detail__section-label">Description</h3>
              <DescriptionBox description={product.description} />
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && product.in_stock !== false && (
            <div className="product-detail__section">
              <h3 className="product-detail__section-label">
                Available Sizes
                {selectedSize && <span className="product-detail__selected-size"> — {selectedSize}</span>}
              </h3>
              <div className="product-detail__sizes">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`product-detail__size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size === selectedSize ? '' : size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <WhatsAppButton
            productId={product.display_id}
            productName={product.name}
            selectedSize={selectedSize}
            isOutOfStock={product.in_stock === false}
          />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="product-detail__related">
          <div className="container">
            <span className="section-subtitle">More Like This</span>
            <h2 className="section-title">You May Also Like</h2>
            <div className="divider" />
            <div className="product-detail__related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
