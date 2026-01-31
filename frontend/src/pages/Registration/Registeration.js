import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUsers, FiBriefcase } from "react-icons/fi";
import { useSignup } from "../../hooks/useSignup";
import { toast } from "react-toastify";
import "./Register.css";

const Registeration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const { signup, error, isLoading } = useSignup();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = await signup({ username, email, password, confirm_password: confirmPassword, role });
    if (success) {
      toast.success("Registration successful!");
      navigate("/login");
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-branding auth-branding-dark">
        <div className="auth-branding-content">
          <Link to="/" className="auth-logo">
            <div className="auth-logo-icon">CP</div>
            <span>ConstructionPro</span>
          </Link>

          <h1 className="auth-branding-title">
            Join Nepal's Leading Construction Platform
          </h1>
          <p className="auth-branding-text">
            Whether you're a homeowner looking for your dream design or a
            professional ready to showcase your work, we've got you covered.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Free to join</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Connect with verified professionals</span>
            </div>
            <div className="auth-feature">
              <span className="feature-icon">✓</span>
              <span>Access premium designs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-section">
        <div className="auth-form-container auth-form-wide">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Join our community today</p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Role Selection */}
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'client' ? 'active' : ''}`}
                onClick={() => setRole('client')}
              >
                <FiUsers className="role-icon" />
                <div className="role-info">
                  <span className="role-label">Client</span>
                  <span className="role-desc">Looking for designs</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'professional' ? 'active' : ''}`}
                onClick={() => setRole('professional')}
              >
                <FiBriefcase className="role-icon" />
                <div className="role-info">
                  <span className="role-label">Professional</span>
                  <span className="role-desc">Showcase your work</span>
                </div>
              </button>
            </div>

            {/* Username Field */}
            <div className="form-field">
              <label htmlFor="username">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your full name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="form-row-2">
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Create password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner-small"></span>
                  Creating account...
                </span>
              ) : (
                <>
                  Create Account
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registeration;
