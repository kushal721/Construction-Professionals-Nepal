import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toast } from "react-toastify";
import "./ChangePassword.css";
import { FiLock, FiEye, FiEyeOff, FiSave } from "react-icons/fi";

const ChangePassword = ({ onClose }) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((fData) => ({ ...fData, userId: user.userId }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.currentPassword || !formData.newPassword) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.warning("New password must be at least 6 characters");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:4000/api/user/user-changePassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const res = await response.json();

      if (response.ok) {
        toast.success(res.message || "Password changed successfully");
        setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
      toast.error("An error occurred while changing the password");
    } finally {
      setLoading(false);
    }
  };

  const Content = () => (
    <div className={`change-password-container fade-in ${onClose ? 'modal-mode' : ''}`}>
      <form onSubmit={handleSubmit} className="modern-form">
        <div className="form-section">
          {!onClose && <h3 className="section-title">Change Password</h3>}

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="modern-input"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="newPassword">New Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="modern-input"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span> Updating...
                </>
              ) : (
                <>
                  <FiSave /> Change Password
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  if (onClose) {
    return (
      <div className="modern-modal-content">
        <h2 className="modal-title">Change Password</h2>
        <Content />
      </div>
    );
  }

  return (
    <DashboardLayout title="Security Settings" subtitle="Update your password and secure your account">
      <Content />
    </DashboardLayout>
  );
};

export default ChangePassword;
