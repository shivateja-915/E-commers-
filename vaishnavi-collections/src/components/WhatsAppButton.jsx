import React, { useState } from 'react';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import './WhatsAppButton.css';

const WhatsAppButton = ({ productId, productName, selectedSize, isOutOfStock }) => {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER;
  const isDisabled = !selectedSize;
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (isDisabled || isOutOfStock) return;
    
    // trigger animation
    setClicked(true);
    setTimeout(() => setClicked(false), 600);

    const message = encodeURIComponent(
      `Hi! I am interested in "${productName}", ID: #${productId}, Size: ${selectedSize}. Can you share more details?`
    );
    // slightly delay opening so animation is visible
    setTimeout(() => {
      window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    }, 200);
  };

  if (isOutOfStock) {
    return (
      <div className="whatsapp-wrap">
        <button 
          className="btn-whatsapp cool-whatsapp-btn" 
          disabled={true} 
          style={{ background: '#f5f5f5', color: '#d93025', boxShadow: 'none' }}
        >
          <span className="cool-whatsapp-content">Out of Stock</span>
        </button>
      </div>
    );
  }

  return (
    <div className="whatsapp-wrap">
      {isDisabled && (
        <p className="whatsapp-hint">Please select a size to continue</p>
      )}
      <button
        className={`btn-whatsapp cool-whatsapp-btn ${clicked ? 'btn-clicked' : ''}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        <span className="cool-whatsapp-bg"></span>
        <span className="cool-whatsapp-content">
          <AiOutlineWhatsApp size={24} className="whatsapp-icon" />
          Contact on WhatsApp
        </span>
      </button>
    </div>
  );
};

export default WhatsAppButton;
