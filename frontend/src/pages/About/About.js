import React from "react";
import { FiUsers, FiTarget, FiAward, FiCheckCircle } from "react-icons/fi";
import NavbarComp from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./About.css";

const About = () => {
  return (
    <div className="page-wrapper">
      <NavbarComp />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Building Visions, Connecting Professionals</h1>
          <p>
            Construction Professionals Nepal is the premier platform connecting
            clients with top-tier architects, engineers, and construction experts
            to bring dream projects to life.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                To revolutionize the construction industry in Nepal by creating a
                transparent, efficient, and reliable digital ecosystem. We aim to
                bridge the gap between visionary clients and skilled professionals,
                ensuring every project is built on a foundation of trust and quality.
              </p>
              <ul className="mission-points">
                <li><FiCheckCircle /> Verified Professionals</li>
                <li><FiCheckCircle /> Seamless Communication</li>
                <li><FiCheckCircle /> Quality Assurance</li>
                <li><FiCheckCircle /> Transparent Processes</li>
              </ul>
            </div>
            <div className="mission-image">
              <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Construction Site" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FiUsers /></div>
              <h3>500+</h3>
              <p>Active Professionals</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FiCheckCircle /></div>
              <h3>1000+</h3>
              <p>Completed Projects</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FiTarget /></div>
              <h3>50+</h3>
              <p>Cities Covered</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><FiAward /></div>
              <h3>98%</h3>
              <p>Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team/Vision Section */}
      <section className="about-vision">
        <div className="container">
          <div className="vision-content">
            <h2>Why Choose Us?</h2>
            <p>
              We understand that construction is more than just bricks and mortar; it's about building dreams.
              Our platform ensures you have access to the best minds in the industry, whether you need
              a complex architectural design, structural engineering, or interior planning.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
