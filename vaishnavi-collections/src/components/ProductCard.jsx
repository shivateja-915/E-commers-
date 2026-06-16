import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useFavourites } from '../context/FavouritesContext';
import { getOptimizedUrl } from '../lib/cloudinary';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { isFavourite, toggleFavourite } = useFavourites();
  const fav = isFavourite(product.id);

  const imageUrl = product.images?.[0]
    ? getOptimizedUrl(product.images[0], 600, 800)
    : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop';

  // Category removed, display ID instead
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap">
        <img
          src={imageUrl}
          alt={product.name}
          className="product-card__image"
          style={product.in_stock === false ? { filter: 'grayscale(100%) opacity(0.8)' } : {}}
          loading="lazy"
        />
        {product.in_stock === false && (
          <span className="product-card__badge" style={{ background: '#d93025', color: 'white', fontWeight: 600 }}>Out of Stock</span>
        )}
        {product.in_stock !== false && product.badge_text && (
          <span className="product-card__badge">{product.badge_text}</span>
        )}
        {product.in_stock !== false && product.is_featured && !product.badge_text && (
          <span className="product-card__badge product-card__badge--featured">Featured</span>
        )}
        <div className="product-card__overlay">
          <span className="product-card__view">View Details</span>
        </div>
      </Link>

      <button
        className={`product-card__heart ${fav ? 'active' : ''}`}
        onClick={(e) => { e.preventDefault(); toggleFavourite(product.id); }}
        aria-label={fav ? 'Remove from favourites' : 'Add to favourites'}
      >
        {fav ? <AiFillHeart size={20} /> : <AiOutlineHeart size={20} />}
      </button>

      <div className="product-card__info">
        <span className="tag" style={{ background: '#fef9ec', color: 'var(--gold)', fontWeight: 600 }}>ID: #{product.display_id}</span>
        {product.super_heading ? (
          <p className="product-card__super-heading">{product.super_heading}</p>
        ) : (
          <h3 className="product-card__name">{product.name}</h3>
        )}
        {/* Discount price display */}
        {product.discount_enabled && product.discount_original_price && product.discount_value ? (
          <div className="product-card__price-wrap">
            <span className="product-card__price-original">₹{Number(product.discount_original_price).toLocaleString('en-IN')}</span>
            <span className="product-card__price-sale">₹{Number(product.discount_type === 'percentage'
              ? product.discount_original_price - (product.discount_original_price * product.discount_value / 100)
              : product.discount_original_price - product.discount_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="product-card__off-badge">
              {/* Always show % or ₹ calculation — never offer label */}
              {product.discount_type === 'percentage'
                ? `${product.discount_value}% off`
                : `₹${Number(product.discount_value).toLocaleString('en-IN')} off`}
            </span>
          </div>
        ) : (
          /* Standard price display if no discount */
          product.show_price !== false && (product.price != null || product.price_display) && (
            <div className="product-card__price" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: 4 }}>
              {product.price_display || `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(product.price)}`}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProductCard;
