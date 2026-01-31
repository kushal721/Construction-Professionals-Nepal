import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiBook, FiMessageSquare, FiCalendar, FiArrowRight } from "react-icons/fi";
import NavbarComp from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./ProfessionalDesc.css";

const ProfessionalDesc = () => {
  const { id } = useParams();
  const { user } = useAuthContext();

  const [professionalPersonalDesc, setProfessionalPersonalDesc] = useState(null);
  const [professionalDesc, setProfessionalDesc] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user object exists before logging userId
  useEffect(() => {
    if (user) {
      console.log(user?.userId, "suid");
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [personalRes, profRes, designsRes] = await Promise.all([
          fetch(`http://localhost:4000/api/userr/professionals/personal/${id}`),
          fetch(`http://localhost:4000/api/userr/professionals/${id}`),
          fetch(`http://localhost:4000/api/designs/${id}/designs`)
        ]);

        if (personalRes.ok) setProfessionalPersonalDesc(await personalRes.json());
        if (profRes.ok) setProfessionalDesc(await profRes.json());
        if (designsRes.ok) setDesigns(await designsRes.json());

        setLoading(false);
      } catch (error) {
        console.error("Error fetching professional details:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleMessageRequest = async () => {
    if (!user) return;
    try {
      await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user.userId, receiverId: id }),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="prof-loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <NavbarComp />

      <div className="prof-profile-container">
        {/* Header Section */}
        <div className="prof-header">
          <div className="header-bg"></div>
          <div className="header-content">
            <div className="profile-img-container">
              {professionalPersonalDesc?.profile ? (
                <img
                  src={`http://localhost:4000/${professionalPersonalDesc.profile}`}
                  alt={professionalPersonalDesc.username}
                  className="profile-img-lg"
                />
              ) : (
                <div className="profile-placeholder-lg">{professionalPersonalDesc?.username?.charAt(0)}</div>
              )}
            </div>

            <div className="profile-identity">
              <h1 className="prof-name">{professionalPersonalDesc?.username}</h1>
              <p className="prof-role">{professionalDesc?.specialization || "Professional"}</p>
              <div className="prof-location">
                <FiMapPin /> {professionalPersonalDesc?.location || "Nepal"}
              </div>
            </div>

            <div className="prof-actions">
              {user ? (
                <>
                  <Link to="/chat" onClick={handleMessageRequest} className="action-btn message-btn">
                    <FiMessageSquare /> Message
                  </Link>
                  <Link to={`/${id}/booking`} className="action-btn book-btn">
                    <FiCalendar /> Book Appointment
                  </Link>
                </>
              ) : (
                <Link to="/login" className="action-btn login-btn">
                  Login to Connect
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="prof-layout-grid">
          {/* Left Column: Details */}
          <div className="prof-sidebar">
            {/* Contact Info */}
            <div className="info-card">
              <h3>Contact Information</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <FiMail />
                  <span>{professionalPersonalDesc?.email}</span>
                </div>
                {professionalPersonalDesc?.contactNumber && (
                  <div className="contact-item">
                    <FiPhone />
                    <span>{professionalPersonalDesc.contactNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="info-card">
              <h3><FiAward /> Skills</h3>
              <div className="skills-tags">
                {professionalDesc?.skills ? (
                  professionalDesc.skills.split(',').map((skill, i) => (
                    <span key={i} className="skill-pill">{skill.trim()}</span>
                  ))
                ) : "No skills listed"}
              </div>
            </div>

            {/* Education */}
            <div className="info-card">
              <h3><FiBook /> Education</h3>
              <p className="edu-text">{professionalDesc?.education || "Not specified"}</p>
            </div>
          </div>

          {/* Right Column: Bio & Portfolio */}
          <div className="prof-main-content">
            {/* About */}
            <div className="content-section">
              <h2 className="section-head"><FiBriefcase /> About Potential</h2>
              <div className="about-text">
                <p>
                  <strong>Experience:</strong> {professionalDesc?.experience || "N/A"}
                </p>
                <p>
                  {professionalDesc?.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Designs Portfolio */}
            <div className="content-section">
              <div className="section-header-row">
                <h2 className="section-head"><FiBriefcase /> Portfolio</h2>
                <span className="count-badge">{designs.length} Designs</span>
              </div>

              {designs.length > 0 ? (
                <div className="portfolio-grid">
                  {designs.map((design) => (
                    <Link to={`/design-desc/${design._id}`} key={design._id} className="portfolio-card">
                      <div className="portfolio-img-wrap">
                        {design.designImages.length > 0 ? (
                          <img src={`http://localhost:4000/${design.designImages[0]}`} alt={design.designName} />
                        ) : (
                          <div className="no-img">No Image</div>
                        )}
                        <div className="overlay">
                          <span><FiArrowRight /> View Details</span>
                        </div>
                      </div>
                      <div className="portfolio-info">
                        <h4>{design.designName}</h4>
                        <div className="portfolio-meta">
                          <span className="rating">★ {design.averageRating || 0}</span>
                          <span className="category">{design.designCategory}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="empty-portfolio">
                  <p>No designs uploaded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfessionalDesc;
