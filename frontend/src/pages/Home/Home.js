import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiUsers, FiMessageSquare, FiArrowRight, FiLayers, FiTool, FiAward } from "react-icons/fi";
import Hero from "../../components/Hero/Hero";
import FooterComp from "../../components/Footer/Footer";
import "./home.css";

const Home = () => {
  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <Hero />

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="section-header">
            <span className="section-badge">Our Services</span>
            <h2 className="section-title">What We Offer</h2>
            <p className="section-subtitle">
              From concept to completion, we provide everything you need
              to build your dream project in Nepal.
            </p>
          </div>

          <div className="services-grid">
            {/* Service 1 */}
            <div className="service-card">
              <div className="service-icon">
                <FiLayers />
              </div>
              <h3 className="service-title">House Designs</h3>
              <p className="service-description">
                Browse hundreds of professional architectural designs
                tailored for Nepali homes and landscapes.
              </p>
              <Link to="/designs" className="service-link">
                Explore Designs <FiArrowRight />
              </Link>
            </div>

            {/* Service 2 */}
            <div className="service-card">
              <div className="service-icon">
                <FiUsers />
              </div>
              <h3 className="service-title">Find Professionals</h3>
              <p className="service-description">
                Connect with verified architects, engineers, and
                contractors to bring your vision to life.
              </p>
              <Link to="/professionals" className="service-link">
                Browse Professionals <FiArrowRight />
              </Link>
            </div>

            {/* Service 3 */}
            <div className="service-card">
              <div className="service-icon">
                <FiMessageSquare />
              </div>
              <h3 className="service-title">Easy Communication</h3>
              <p className="service-description">
                Chat directly with professionals, schedule appointments,
                and manage your project seamlessly.
              </p>
              <Link to="/contact" className="service-link">
                Contact Us <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="featured-section">
        <div className="featured-container">
          <div className="section-header">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">The Smart Way to Build</h2>
            <p className="section-subtitle">
              We make construction simple, transparent, and accessible for everyone.
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <FiAward />
              </div>
              <h3 className="service-title">Verified Professionals</h3>
              <p className="service-description">
                Every professional on our platform is vetted and verified
                for quality and reliability.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <FiTool />
              </div>
              <h3 className="service-title">Quality Designs</h3>
              <p className="service-description">
                Access premium architectural designs created by
                experienced Nepali architects.
              </p>
            </div>

            <div className="service-card">
              <div className="service-icon">
                <FiHome />
              </div>
              <h3 className="service-title">Local Expertise</h3>
              <p className="service-description">
                Work with professionals who understand local building
                codes, materials, and climate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start Your Project?</h2>
          <p className="cta-description">
            Join thousands of happy homeowners who found their perfect
            design and professional through our platform.
          </p>
          <div className="cta-buttons">
            <Link to="/designs" className="cta-btn-primary">
              Browse Designs
            </Link>
            <Link to="/register" className="cta-btn-secondary">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterComp />
    </div>
  );
};

export default Home;
