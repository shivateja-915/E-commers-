import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AiOutlineHeart, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { useFavourites } from '../context/FavouritesContext';
import './Navbar.css';

const Navbar = () => {
  const { favourites } = useFavourites();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <img src="/logo.jpg" alt="Vaishnavi Collections" className="navbar__logo-img" />
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">VAISHNAVI</span>
            <span className="navbar__logo-sub">COLLECTIONS</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar__links">
          <NavLink to="/" end className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>Shop</NavLink>
          <NavLink to="/favourites" className={({ isActive }) => `navbar__link navbar__link--heart ${isActive ? 'active' : ''}`}>
            <AiOutlineHeart size={20} />
            {favourites.length > 0 && (
              <span className="badge">{favourites.length}</span>
            )}
          </NavLink>
        </div>

        {/* Mobile Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile ${menuOpen ? 'open' : ''}`}>
        <NavLink to="/" end className="navbar__mobile-link">Home</NavLink>
        <NavLink to="/shop" className="navbar__mobile-link">Shop</NavLink>
        <NavLink to="/favourites" className="navbar__mobile-link">
          Favourites {favourites.length > 0 && `(${favourites.length})`}
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
