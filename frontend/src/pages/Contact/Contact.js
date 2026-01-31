import React, { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import FooterComp from "../../components/Footer/Footer";
import { toast } from "react-toastify";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-subtitle">
            Have questions? We'd love to hear from you. Send us a message
            and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-main">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2 className="contact-info-title">Contact Information</h2>
              <p className="contact-info-text">
                Fill up the form and our team will get back to you within 24 hours.
              </p>

              <div className="contact-items">
                <div className="contact-item">
                  <div className="contact-item-icon">
                    <FiPhone />
                  </div>
                  <div className="contact-item-content">
                    <span className="contact-item-label">Phone</span>
                    <span className="contact-item-value">+977-1-4XXXXXX</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <FiMail />
                  </div>
                  <div className="contact-item-content">
                    <span className="contact-item-label">Email</span>
                    <span className="contact-item-value">info@constructionpro.np</span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item-icon">
                    <FiMapPin />
                  </div>
                  <div className="contact-item-content">
                    <span className="contact-item-label">Address</span>
                    <span className="contact-item-value">Kathmandu, Nepal</span>
                  </div>
                </div>
              </div>

              <div className="contact-social">
                <span className="social-label">Follow Us</span>
                <div className="social-links">
                  <a href="#" className="social-link"><FiFacebook /></a>
                  <a href="#" className="social-link"><FiTwitter /></a>
                  <a href="#" className="social-link"><FiInstagram /></a>
                  <a href="#" className="social-link"><FiLinkedin /></a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your project..."
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <FooterComp />
    </div>
  );
};

export default Contact;
