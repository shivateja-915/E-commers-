import React, { useState, useRef, useCallback } from 'react';
import { getOptimizedUrl, getThumbnailUrl } from '../lib/cloudinary';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Touch / swipe tracking
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);

  const total = images.length;

  // Always reset zoom when changing image
  const goNext = useCallback(() => {
    setZoomed(false);
    setZoomPos({ x: 50, y: 50 });
    setActiveIdx(i => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setZoomed(false);
    setZoomPos({ x: 50, y: 50 });
    setActiveIdx(i => (i - 1 + total) % total);
  }, [total]);

  const goToIdx = useCallback((i) => {
    setZoomed(false);
    setZoomPos({ x: 50, y: 50 });
    setActiveIdx(i);
  }, []);

  /* ── Touch handlers ── */
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  /* ── Mouse drag handlers ── */
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStartX.current;
    isDragging.current = false;
    dragStartX.current = null;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goNext(); else goPrev();
      return; // don't toggle zoom on drag
    }
    // Only toggle zoom if it was a click (tiny movement)
    setZoomed(z => !z);
    if (zoomed) setZoomPos({ x: 50, y: 50 });
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  /* ── Zoom ── */
  const handleZoomMove = (e) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const mainImage = images[activeIdx]
    ? getOptimizedUrl(images[activeIdx], 900, 1200)
    : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop';

  const zoomImage = images[activeIdx]
    ? getOptimizedUrl(images[activeIdx], 1800, 2400)
    : mainImage;

  return (
    <div className="image-gallery">
      {/* Main image with swipe + zoom */}
      <div
        className={`image-gallery__main ${zoomed ? 'zoomed' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleZoomMove}
        style={zoomed ? {
          backgroundImage: `url(${zoomImage})`,
          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          backgroundSize: '220%',
          cursor: 'zoom-out',
        } : { cursor: 'zoom-in' }}
        title={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
      >
        {!zoomed && (
          <img
            key={activeIdx}
            src={mainImage}
            alt={`${productName} - view ${activeIdx + 1}`}
            className="image-gallery__main-img"
            draggable={false}
          />
        )}

        {/* Swipe arrows */}
        {total > 1 && (
          <>
            <button
              className="image-gallery__arrow image-gallery__arrow--prev"
              onClick={e => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous image"
            >‹</button>
            <button
              className="image-gallery__arrow image-gallery__arrow--next"
              onClick={e => { e.stopPropagation(); goNext(); }}
              aria-label="Next image"
            >›</button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="image-gallery__dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`image-gallery__dot ${i === activeIdx ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); goToIdx(i); }}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {total > 1 && (
        <div className="image-gallery__thumbs">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => goToIdx(i)}
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
