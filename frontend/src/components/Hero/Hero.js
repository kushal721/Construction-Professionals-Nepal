import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiPlay, FiHome, FiUsers } from "react-icons/fi";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Nepal's #1 Construction Platform
          </div>

          <h1 className="hero-title">
            Build Your Dream Home with <span>Expert Professionals</span>
          </h1>

          <p className="hero-description">
            Discover stunning architectural designs and connect with verified
            construction professionals across Nepal. From concept to completion,
            we're here to help you build better.
          </p>

          <div className="hero-buttons">
            <Link to="/designs" className="hero-btn-primary">
              <FiHome />
              Explore Designs
              <FiArrowRight />
            </Link>
            <Link to="/professionals" className="hero-btn-secondary">
              <FiUsers />
              Find Professionals
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">500<span>+</span></div>
              <div className="hero-stat-label">House Designs</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">200<span>+</span></div>
              <div className="hero-stat-label">Professionals</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">1.2K<span>+</span></div>
              <div className="hero-stat-label">Happy Clients</div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image">
          <div className="hero-image-wrapper">
            <img
              src="/r4.png"
              alt="Modern House Design"
              className="hero-image-main"
            />

            {/* Floating Card 1 */}
            <div className="hero-image-card card-1">
              <div className="hero-card-icon">
                <FiHome />
              </div>
              <div className="hero-card-title">New Designs</div>
              <div className="hero-card-value">50+</div>
            </div>

            {/* Floating Card 2 */}
            <div className="hero-image-card card-2">
              <div className="hero-card-icon">
                <FiUsers />
              </div>
              <div className="hero-card-title">Verified Pros</div>
              <div className="hero-card-value">100%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
