import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineWhatsApp, AiOutlineHeart, AiOutlineEnvironment, AiOutlinePhone } from 'react-icons/ai';
import './Footer.css';

const Footer = () => {
  const whatsappUrl = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`;

  return (
    <footer className="footer">
      <div className="footer__botanical">
        <div className="footer__leaf footer__leaf--1">🌿</div>
        <div className="footer__leaf footer__leaf--2">🌿</div>
      </div>
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo-icon">
              <img src="/logo.jpg" alt="Vaishnavi Collections" className="footer__logo-img" />
            </div>
            <h2 className="footer__name">VAISHNAVI<br/>COLLECTIONS</h2>
            <p className="footer__tagline">Elegance in Every Thread</p>
            <div className="footer__divider"></div>
          </div>

          <div className="footer__info">
            <div className="footer__info-item">
              <AiOutlineEnvironment size={18} />
              <span>Badangpet, Hyderabad</span>
            </div>
            <div className="footer__info-item">
              <AiOutlinePhone size={18} />
              <span>9059899695</span>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="footer__whatsapp-btn">
              <AiOutlineWhatsApp size={20} />
              Chat on WhatsApp
            </a>
          </div>

          <div className="footer__nav">
            <h4 className="footer__nav-title">Explore</h4>
            <Link to="/" className="footer__nav-link">Home</Link>
            <Link to="/shop" className="footer__nav-link">Shop</Link>
            <Link to="/favourites" className="footer__nav-link">Favourites</Link>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Vaishnavi Collections. All rights reserved.</p>
          <p>Made with <AiOutlineHeart style={{ display: 'inline', verticalAlign: 'middle' }} /> in Hyderabad</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
