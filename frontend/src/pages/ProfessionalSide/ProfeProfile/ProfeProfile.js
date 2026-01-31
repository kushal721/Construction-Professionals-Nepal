import React, { useEffect, useState } from "react";
import { FiMail, FiPhone, FiEdit2, FiPlus, FiLock, FiBriefcase, FiBook, FiAward, FiUser, FiX } from "react-icons/fi";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import AddInformation from "./AddInformation";
import EditProfile from "./EditProfile";
import ChangePassword from "../../../components/ChangePassword/ChangePassword";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./ProfeProfile.css";

const ProfeProfile = () => {
  const [showAddInfoPopup, setShowAddInfoPopup] = useState(false);
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [userData, setUserData] = useState({});
  const [professionalData, setProfessionalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user) {
          const response = await fetch(
            `http://localhost:4000/api/userr/${user.userId}`
          );
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const fetchProfessionalData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/professionals/${user?.userId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProfessionalData(data);
        } else {
          console.log("Professional data returned status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching professional data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      Promise.all([fetchUserData(), fetchProfessionalData()]);
    } else if (user === null) {
      // Handle no user case if needed, or wait for auth
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="My Profile" subtitle="Manage your professional profile">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your professional profile">
      <div className="profile-wrapper">
        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-cover"></div>
          <div className="profile-main-info">
            <div className="profile-avatar-wrapper">
              {userData?.profile?.length > 0 ? (
                <img
                  src={`http://localhost:4000/${userData?.profile}`}
                  alt="Profile"
                  className="profile-avatar-lg"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <FiUser />
                </div>
              )}
            </div>
            <div className="profile-text-info">
              <h1 className="profile-name">{userData?.username}</h1>
              <p className="profile-role">{professionalData?.specialization || "Professional"}</p>
              <div className="profile-contacts">
                <span className="contact-pill">
                  <FiMail /> {userData?.email}
                </span>
                <span className="contact-pill">
                  <FiPhone /> {userData?.contactNumber || "No contact info"}
                </span>
              </div>
            </div>
            <div className="profile-actions-top">
              <button
                className="btn-secondary-sm"
                onClick={() => setShowChangePasswordPopup(true)}
              >
                <FiLock /> Change Password
              </button>
              <button
                className="btn-primary-sm"
                onClick={() => setShowEditProfilePopup(true)}
              >
                <FiEdit2 /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="profile-grid">
          {/* Main Column */}
          <div className="profile-col-main">
            {/* Professional Experience */}
            <div className="profile-card">
              <div className="card-header-flex">
                <h3 className="section-title">
                  <FiBriefcase /> Experience & Bio
                </h3>
              </div>
              <div className="card-content">
                <div className="info-block">
                  <label>Professional Bio</label>
                  <p>{professionalData?.description || "No description added yet."}</p>
                </div>
                <div className="info-row">
                  <div className="info-block">
                    <label>Specialization</label>
                    <p className="highlight">{professionalData?.specialization || "Not specified"}</p>
                  </div>
                  <div className="info-block">
                    <label>Years of Experience</label>
                    <p>{professionalData?.experience || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="profile-card">
              <div className="card-header-flex">
                <h3 className="section-title">
                  <FiBook /> Education
                </h3>
              </div>
              <div className="card-content">
                <div className="education-item">
                  <p>{professionalData?.education || "No education details added."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Column */}
          <div className="profile-col-side">
            {/* Skills */}
            <div className="profile-card">
              <div className="card-header-flex">
                <h3 className="section-title">
                  <FiAward /> Skills
                </h3>
                <button
                  className="btn-icon-only"
                  onClick={() => setShowAddInfoPopup(true)}
                  title="Add Skills/Info"
                >
                  <FiPlus />
                </button>
              </div>
              <div className="card-content">
                <div className="skills-container">
                  {professionalData?.skills ? (
                    professionalData.skills.split(',').map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted">No skills listed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddInfoPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowAddInfoPopup(false)}>
              <FiBriefcase /> Back
            </button>
            <AddInformation onClose={() => setShowAddInfoPopup(false)} />
          </div>
        </div>
      )}

      {showEditProfilePopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowEditProfilePopup(false)}>
              <FiX />
            </button>
            <EditProfile onClose={() => setShowEditProfilePopup(false)} />
          </div>
        </div>
      )}

      {showChangePasswordPopup && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close" onClick={() => setShowChangePasswordPopup(false)}>
              <FiX />
            </button>
            <ChangePassword onClose={() => setShowChangePasswordPopup(false)} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ProfeProfile;
