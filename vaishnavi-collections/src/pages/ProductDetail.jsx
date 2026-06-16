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

  // Format price — respects show_price flag and optional price_display text override
  const showPrice = product.show_price !== false && (product.price != null || product.price_display);
  const rawPrice = showPrice
    ? (product.price_display || new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(product.price))
    : null;

  // Discount calculations
  const discountEnabled = product.discount_enabled && product.discount_original_price && product.discount_value;
  const discountedPrice = discountEnabled
    ? (product.discount_type === 'percentage'
      ? product.discount_original_price - (product.discount_original_price * product.discount_value / 100)
      : product.discount_original_price - product.discount_value)
    : null;

  return (
    <div className="product-detail floral-bg page-enter">
      <div className="product-detail__nav container">
        {/* Beautiful Back to Shop button */}
        <Link to="/shop" className="product-detail__back">
          <span className="product-detail__back-arrow">
            <AiOutlineArrowLeft size={15} />
          </span>
          <span className="product-detail__back-text">Back to Shop</span>
        </Link>
        <span className="product-detail__breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}
        </span>
      </div>

      <div className="product-detail__main container">
        {/* LEFT: Gallery Column */}
        <div className="product-detail__gallery">

          {/* Title box — at top of gallery, ID pinned to right */}
          <div className="product-detail__title-box">
            {/* ID badge — right top */}
            <span className="product-detail__id-badge">#{product.display_id}</span>

            {/* Badge text if any */}
            {product.badge_text && (
              <span className="product-detail__badge-pill">{product.badge_text}</span>
            )}

            {/* Super heading (subtitle/collection label) */}
            {product.super_heading && (
              <p className="product-detail__super-heading">{product.super_heading}</p>
            )}

            {/* Main product name */}
            <h1 className="product-detail__name">{product.name}</h1>
          </div>

          {/* Image Gallery with swipe + zoom */}
          <ImageGallery images={product.images || []} productName={product.name} />

          {/* Available Sizes — below images, circle style */}
          {product.sizes?.length > 0 && product.in_stock !== false && (
            <div className="product-detail__sizes-panel">
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

          {/* Price + Add to Favourites Row */}
          <div className="product-detail__price-fav-row">
            {/* Left Column: Fav Button + Offer Label */}
            <div className="product-detail__fav-col">
              <button
                className={`product-detail__fav-btn ${fav ? 'active' : ''}`}
                onClick={() => toggleFavourite(product.id)}
                aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
              >
                {fav ? <AiFillHeart size={18} /> : <AiOutlineHeart size={18} />}
                <span>{fav ? 'Saved' : 'Add to Favourites'}</span>
              </button>

              {/* Offer Label — shown below the favourite button */}
              {discountEnabled && product.discount_offer_label && (
                <div className="product-detail__offer-label">
                  🏷️ {product.discount_offer_label}
                </div>
              )}
            </div>

            {/* Price display — right */}
            {rawPrice && !discountEnabled && (
              <div className="product-detail__price-bar">
                <span className="product-detail__price-label">PRICE</span>
                <span className="product-detail__price-value">
                  {!product.price_display && <span className="product-detail__price-rupee">₹</span>}
                  {rawPrice}
                </span>
              </div>
            )}
            {/* Discount price block — Amazon/Myntra style */}
            {discountEnabled && (
              <div className="product-detail__discount-bar">
                <div className="product-detail__discount-top">
                  <span className="product-detail__discount-sale">₹{Number(discountedPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  <span className="product-detail__discount-badge">
                    {/* Badge always shows the % or ₹ calculation */}
                    {product.discount_type === 'percentage'
                      ? `${product.discount_value}% OFF`
                      : `₹${Number(product.discount_value).toLocaleString('en-IN')} OFF`}
                  </span>
                </div>
                <div className="product-detail__discount-mrp">
                  <span className="product-detail__discount-mrp-label">MRP</span>
                  <span className="product-detail__discount-mrp-value">₹{Number(product.discount_original_price).toLocaleString('en-IN')}</span>
                </div>
                <div className="product-detail__discount-save">
                  You save ₹{Number(product.discount_original_price - discountedPrice).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Info Column */}
        <div className="product-detail__info">
          <div className="product-detail__divider" />

          {/* Description */}
          {product.description && (
            <div className="product-detail__section">
              <h3 className="product-detail__section-label">Description</h3>
              <DescriptionBox description={product.description} />
            </div>
          )}

          {/* WhatsApp — after description */}
          <div className="product-detail__whatsapp">
            <WhatsAppButton
              productId={product.display_id}
              productName={product.name}
              selectedSize={selectedSize}
              isOutOfStock={product.in_stock === false}
            />
          </div>
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
