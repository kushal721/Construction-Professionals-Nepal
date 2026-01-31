import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./EditProfile.css";
import { toast } from "react-toastify";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiAward, FiBook, FiSave, FiCamera, FiChevronDown, FiChevronUp } from "react-icons/fi";

const EditProfile = ({ onClose }) => {
  const { user } = useAuthContext();

  const [userData, setUserData] = useState({});
  const [professionalsData, setProfessionalsData] = useState({});
  const [showProfessionalsForm, setShowProfessionalsForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetch(`http://localhost:4000/api/userr/${user?.userId}`)
        .then((response) => response.json())
        .then((data) => {
          setUserData(data);
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });

      if (user?.role === "professional") {
        fetch(`http://localhost:4000/api/userr/professionals/${user?.userId}`)
          .then((response) => response.json())
          .then((data) => {
            setProfessionalsData(data);
          })
          .catch((error) => {
            console.error("Error fetching professionals data: ", error);
          });
      }
    }
  }, [user]);

  const handleUserEdit = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    // Only append if it exists, otherwise backend might receive 'undefined' string
    if (userData.profile instanceof File) {
      formData.append("profile", userData.profile);
    }
    formData.append("username", userData.username || "");
    formData.append("email", userData.email || "");
    formData.append("contactNumber", userData.contactNumber || "");

    fetch(`http://localhost:4000/api/userr/${user?.userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success("Profile updated successfully");
        if (onClose) onClose();
      })
      .catch((error) => {
        console.error("Error updating user data: ", error);
        toast.error("An error occurred while updating profile");
      })
      .finally(() => setLoading(false));
  };

  const handleProfessionalsEdit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch(`http://localhost:4000/api/userr/professionals/${user?.userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify(professionalsData),
    })
      .then((response) => response.json())
      .then((data) => {
        toast.success("Professional details updated");
        if (onClose) onClose(); // Optional: close modal on success if desired, or let user continue editing
      })
      .catch((error) => {
        console.error("Error updating professionals data: ", error);
        toast.error("An error occurred while updating details");
      })
      .finally(() => setLoading(false));
  };

  const isProfessional = () => {
    return user && user?.role === "professional";
  };

  const Content = () => (
    <div className={`edit-profile-container fade-in ${onClose ? 'modal-mode' : ''}`}>

      {/* Personal Details Section */}
      <section className="profile-section">
        <div className="section-header">
          <h3>Personal Information</h3>
          <p>Manage your public profile details</p>
        </div>

        <form onSubmit={handleUserEdit} className="modern-form">
          <div className="profile-upload-container">
            <label htmlFor="profile" className="profile-picture-wrapper">
              {userData.profilePreview || (userData?.profile && userData.profile.length > 0 ? (
                <img
                  src={userData.profile instanceof File ? URL.createObjectURL(userData.profile) : `http://localhost:4000/${userData?.profile}`}
                  alt="Profile"
                  className="profile-img"
                />
              ) : (
                <div className="profile-initial">{userData?.username?.charAt(0) || "U"}</div>
              ))}
              <div className="upload-overlay">
                <FiCamera />
                <span>Change</span>
              </div>
            </label>
            <input
              type="file"
              name="profile"
              id="profile"
              accept=".jpeg, .png, .jpg"
              onChange={(event) => {
                if (event.target.files[0]) {
                  setUserData({ ...userData, profile: event.target.files[0] });
                }
              }}
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  value={userData.username || ""}
                  onChange={(e) => setUserData({ ...userData, username: e.target.value })}
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  value={userData.email || ""}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  type="text"
                  value={userData.contactNumber || ""}
                  onChange={(e) => setUserData({ ...userData, contactNumber: e.target.value })}
                  className="modern-input"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner-small"></span> : <FiSave />} Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* Professional Details Section */}
      {isProfessional() && (
        <section className="profile-section professional-section">
          <div
            className="section-header clickable"
            onClick={() => setShowProfessionalsForm(!showProfessionalsForm)}
          >
            <div className="header-text">
              <h3>Professional Details</h3>
              <p>Showcase your expertise and experience</p>
            </div>
            <button type="button" className="toggle-icon-btn">
              {showProfessionalsForm ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          </div>

          {showProfessionalsForm && (
            <form onSubmit={handleProfessionalsEdit} className="modern-form fade-in">
              <div className="form-grid">
                <div className="form-group">
                  <label>Specialization</label>
                  <div className="input-wrapper">
                    <FiBriefcase className="input-icon" />
                    <input
                      type="text"
                      value={professionalsData.specialization || ""}
                      onChange={(e) => setProfessionalsData({ ...professionalsData, specialization: e.target.value })}
                      className="modern-input"
                      placeholder="e.g. Architect, Interior Designer"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Experience</label>
                  <div className="input-wrapper">
                    <FiAward className="input-icon" />
                    <input
                      type="text"
                      value={professionalsData.experience || ""}
                      onChange={(e) => setProfessionalsData({ ...professionalsData, experience: e.target.value })}
                      className="modern-input"
                      placeholder="e.g. 5 years"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Skills</label>
                  <div className="input-wrapper">
                    <FiBook className="input-icon" />
                    <input
                      type="text"
                      value={professionalsData.skills || ""}
                      onChange={(e) => setProfessionalsData({ ...professionalsData, skills: e.target.value })}
                      className="modern-input"
                      placeholder="e.g. AutoCAD, 3D Modeling, Project Management"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Education</label>
                  <div className="input-wrapper">
                    <FiBook className="input-icon" />
                    <input
                      type="text"
                      value={professionalsData.education || ""}
                      onChange={(e) => setProfessionalsData({ ...professionalsData, education: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    rows="4"
                    value={professionalsData.description || ""}
                    onChange={(e) => setProfessionalsData({ ...professionalsData, description: e.target.value })}
                    className="modern-textarea"
                    placeholder="Tell us about yourself and your work..."
                  ></textarea>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <span className="spinner-small"></span> : <FiSave />} Update Details
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );

  if (onClose) {
    return (
      <div className="modern-modal-content">
        <h2 className="modal-title">Edit Profile</h2>
        <Content />
      </div>
    );
  }

  return (
    <DashboardLayout title="Edit Profile" subtitle="Update your personal and professional information">
      <Content />
    </DashboardLayout>
  );
};

export default EditProfile;
