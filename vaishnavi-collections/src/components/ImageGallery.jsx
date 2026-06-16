import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getOptimizedUrl, getThumbnailUrl } from '../lib/cloudinary';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Touch / swipe tracking (thumbnail strip)
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);

  // Lightbox pan state
  const [panPos, setPanPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const panStart = useRef(null);
  const panOrigin = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  const total = images.length;

  // Close lightbox on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, activeIdx]);

  // Prevent body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  const openLightbox = () => {
    setPanPos({ x: 0, y: 0 });
    setScale(1);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setPanPos({ x: 0, y: 0 });
    setScale(1);
  };

  const goNext = useCallback(() => {
    setPanPos({ x: 0, y: 0 });
    setScale(1);
    setActiveIdx(i => (i + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setPanPos({ x: 0, y: 0 });
    setScale(1);
    setActiveIdx(i => (i - 1 + total) % total);
  }, [total]);

  const goToIdx = useCallback((i) => {
    setPanPos({ x: 0, y: 0 });
    setScale(1);
    setActiveIdx(i);
  }, []);

  /* ── Thumbnail strip touch/drag swipe ── */
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
      return;
    }
    openLightbox();
  };

  /* ── Lightbox pan (mouse) ── */
  const handleLbMouseDown = (e) => {
    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { ...panPos };
  };

  const handleLbMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPanPos({ x: panOrigin.current.x + dx, y: panOrigin.current.y + dy });
  };

  const handleLbMouseUp = () => {
    isPanning.current = false;
  };

  /* ── Lightbox wheel zoom ── */
  const handleLbWheel = (e) => {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(1, s - e.deltaY * 0.001)));
  };

  /* ── Lightbox touch pan/pinch ── */
  const lbTouchStart = useRef([]);
  const lbTouchDist = useRef(null);
  const lbTouchOrigin = useRef({ x: 0, y: 0 });
  const lbPanOrigin = useRef({ x: 0, y: 0 });

  const handleLbTouchStart = (e) => {
    lbTouchStart.current = [...e.touches];
    lbPanOrigin.current = { ...panPos };
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      lbTouchDist.current = Math.hypot(dx, dy);
    } else {
      lbTouchDist.current = null;
    }
  };

  const handleLbTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length === 2 && lbTouchDist.current) {
      // Pinch zoom
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / lbTouchDist.current;
      setScale(s => Math.min(5, Math.max(1, s * ratio)));
      lbTouchDist.current = dist;
    } else if (e.touches.length === 1 && lbTouchStart.current.length > 0) {
      // Pan
      const dx = e.touches[0].clientX - lbTouchStart.current[0].clientX;
      const dy = e.touches[0].clientY - lbTouchStart.current[0].clientY;
      setPanPos({ x: lbPanOrigin.current.x + dx, y: lbPanOrigin.current.y + dy });
    }
  };

  const handleLbTouchEnd = () => {
    lbTouchDist.current = null;
    lbTouchStart.current = [];
  };

  const mainImage = images[activeIdx]
    ? getOptimizedUrl(images[activeIdx], 900, 1200)
    : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&h=1200&fit=crop';

  const fullImage = images[activeIdx]
    ? getOptimizedUrl(images[activeIdx], 2000, 2667)
    : mainImage;

  return (
    <>
      <div className="image-gallery">
        {/* Main image with swipe — click to open lightbox */}
        <div
          className="image-gallery__main"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { isDragging.current = false; }}
          style={{ cursor: 'zoom-in' }}
          title="Click to zoom"
        >
          <img
            key={activeIdx}
            src={mainImage}
            alt={`${productName} - view ${activeIdx + 1}`}
            className="image-gallery__main-img"
            draggable={false}
          />

          {/* Zoom hint */}
          <div className="image-gallery__zoom-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            Tap to zoom
          </div>

          {/* Swipe arrows */}
          {total > 1 && (
            <>
              <button
                className="image-gallery__arrow image-gallery__arrow--prev"
                onClick={e => { e.stopPropagation(); goPrev(); }}
                onMouseDown={e => e.stopPropagation()}
                onMouseUp={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => e.stopPropagation()}
                aria-label="Previous image"
              >‹</button>
              <button
                className="image-gallery__arrow image-gallery__arrow--next"
                onClick={e => { e.stopPropagation(); goNext(); }}
                onMouseDown={e => e.stopPropagation()}
                onMouseUp={e => e.stopPropagation()}
                onTouchStart={e => e.stopPropagation()}
                onTouchEnd={e => e.stopPropagation()}
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

      {/* ── LIGHTBOX OVERLAY ── */}
      {lightboxOpen && (
        <div
          className="lightbox-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}
        >
          {/* Close button */}
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close zoom">✕</button>

          {/* Counter */}
          {total > 1 && (
            <div className="lightbox-counter">{activeIdx + 1} / {total}</div>
          )}

          {/* Prev / Next */}
          {total > 1 && (
            <>
              <button className="lightbox-arrow lightbox-arrow--prev" onClick={(e) => { e.stopPropagation(); goPrev(); }}>‹</button>
              <button className="lightbox-arrow lightbox-arrow--next" onClick={(e) => { e.stopPropagation(); goNext(); }}>›</button>
            </>
          )}

          {/* Zoom hint */}
          <div className="lightbox-hint">
            Scroll to zoom · Drag to pan · Pinch on mobile
          </div>

          {/* Image canvas */}
          <div
            className="lightbox-canvas"
            onMouseDown={handleLbMouseDown}
            onMouseMove={handleLbMouseMove}
            onMouseUp={handleLbMouseUp}
            onMouseLeave={handleLbMouseUp}
            onWheel={handleLbWheel}
            onTouchStart={handleLbTouchStart}
            onTouchMove={handleLbTouchMove}
            onTouchEnd={handleLbTouchEnd}
            style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
          >
            <img
              src={fullImage}
              alt={`${productName} zoomed view ${activeIdx + 1}`}
              className="lightbox-img"
              draggable={false}
              style={{
                transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${scale})`,
                transformOrigin: 'center center',
              }}
              onDoubleClick={() => {
                if (scale > 1) { setScale(1); setPanPos({ x: 0, y: 0 }); }
                else { setScale(2.5); }
              }}
            />
          </div>

          {/* Reset zoom button */}
          {scale !== 1 && (
            <button
              className="lightbox-reset"
              onClick={() => { setScale(1); setPanPos({ x: 0, y: 0 }); }}
            >
              Reset zoom
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
