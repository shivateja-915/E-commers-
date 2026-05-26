import React, { useState } from 'react';
import { getOptimizedUrl, getThumbnailUrl } from '../lib/cloudinary';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName }) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const mainImage = images[activeIdx]
    ? getOptimizedUrl(images[activeIdx], 900, 1200)
    : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop';

  return (
    <div className="image-gallery">
      <div className="image-gallery__main">
        <img
          key={activeIdx}
          src={mainImage}
          alt={`${productName} - view ${activeIdx + 1}`}
          className="image-gallery__main-img"
        />
      </div>

      {images.length > 1 && (
        <div className="image-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`image-gallery__thumb ${i === activeIdx ? 'active' : ''}`}
            >
              <img
                src={getThumbnailUrl(img)}
                alt={`${productName} thumbnail ${i + 1}`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
