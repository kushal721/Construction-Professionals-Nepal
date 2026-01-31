import React from "react";
import { Link } from "react-router-dom";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import "./Footer.css";

const FooterComp = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">CP</div>
              <span className="footer-logo-text">ConstructionPro Nepal</span>
            </div>
            <p className="footer-description">
              Nepal's leading platform connecting homeowners with verified
              construction professionals and stunning architectural designs.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link">
                <FiFacebook />
              </a>
              <a href="#" className="footer-social-link">
                <FiTwitter />
              </a>
              <a href="#" className="footer-social-link">
                <FiInstagram />
              </a>
              <a href="#" className="footer-social-link">
                <FiLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/designs">Browse Designs</Link></li>
              <li><Link to="/professionals">Find Professionals</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-column">
            <h4>Services</h4>
            <ul className="footer-links">
              <li><Link to="/designs">House Designs</Link></li>
              <li><Link to="/professionals">Architecture</Link></li>
              <li><Link to="/professionals">Interior Design</Link></li>
              <li><Link to="/professionals">Construction</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-column">
            <h4>Contact Us</h4>
            <div className="footer-contact-item">
              <FiMapPin className="footer-contact-icon" />
              <span>Kathmandu, Nepal</span>
            </div>
            <div className="footer-contact-item">
              <FiPhone className="footer-contact-icon" />
              <span>+977-1-4XXXXXX</span>
            </div>
            <div className="footer-contact-item">
              <FiMail className="footer-contact-icon" />
              <span>info@constructionpro.np</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2024 ConstructionPro Nepal. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComp;
