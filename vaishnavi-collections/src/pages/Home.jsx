import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineArrowRight } from 'react-icons/ai';
import Footer from '../components/Footer';
import BackgroundOrnaments from '../components/BackgroundOrnaments';
import './Home.css';

const Home = () => {
  return (
    <div className="home page-enter">
      {/* HERO */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__overlay" />
          <BackgroundOrnaments />
        </div>
        <div className="hero__content container">
          <span className="section-subtitle">New Collection 2026</span>
          <h1 className="hero__title">
            Elegance in<br />
            <em>Every Thread</em>
          </h1>
          <p className="hero__sub">
            Discover graceful ethnic wear inspired by modern Indian fashion.
          </p>
          <div className="hero__actions">
            <Link to="/shop" className="btn-primary">
              Explore Collection <AiOutlineArrowRight />
            </Link>
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
