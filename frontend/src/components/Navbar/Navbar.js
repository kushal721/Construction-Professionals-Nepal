import { useNavigate, NavLink, Link } from "react-router-dom";
import { useLogout } from "../../hooks/useLogout";
import { useAuthContext } from "../../hooks/useAuthContext";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { FiChevronDown, FiUser, FiSettings, FiLogOut, FiGrid, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import EditProfile from "../../pages/ProfessionalSide/ProfeProfile/EditProfile";
import ChangePasswordComp from "../../components/ChangePassword/ChangePassword"; // Rename import to avoid conflict if any, or just clarity
import "./navbar.css";

function NavbarComp() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const Navigate = useNavigate();
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [userData, setUserData] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/userr/${user?.userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    if (user?.token) {
      fetchUserData();
    }
  }, [user]);

  const handleClick = () => {
    logout();
    Navigate("/");
  };

  const isClient = () => user && user.role === "client";
  const isProfessional = () => user && user.role === "professional";
  const isAdmin = () => user && user.role === "admin";

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo">CP</div>
            <span className="navbar-brand-text">
              Construction<span>Pro</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/designs" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Designs
            </NavLink>
            <NavLink to="/professionals" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Professionals
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
            {isClient() && (
              <>
                <NavLink to="/favorite" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Favorites
                </NavLink>
                <NavLink to="/appointment" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                  Appointments
                </NavLink>
              </>
            )}
            {isProfessional() && (
              <NavLink to="/favorite" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                Favorites
              </NavLink>
            )}
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user && (
              <>
                {/* Chat Icon */}
                <Link to="/chat" className="navbar-icon-btn">
                  <IoChatbubbleEllipsesOutline />
                </Link>

                {/* Dashboard Link */}
                {!isClient() && (
                  <Link
                    to={isAdmin() ? "/dashboard/summary" : "/dashboard/my-designs"}
                    className="navbar-dashboard-link"
                  >
                    <FiGrid />
                    Dashboard
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className={`navbar-profile ${dropdownOpen ? 'open' : ''}`}>
                  <button
                    className="navbar-profile-trigger"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {userData?.profile?.length > 0 ? (
                      <img
                        src={`http://localhost:4000/${userData?.profile}`}
                        alt="Profile"
                        className="navbar-profile-avatar"
                      />
                    ) : (
                      <img
                        src="./profile.png"
                        alt="Profile"
                        className="navbar-profile-avatar"
                      />
                    )}
                    <span className="navbar-profile-name">{userData?.username}</span>
                    <FiChevronDown className="navbar-profile-chevron" />
                  </button>

                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <div className="navbar-dropdown-name">{userData?.username}</div>
                      <div className="navbar-dropdown-email">{userData?.email}</div>
                    </div>

                    <button
                      className="navbar-dropdown-item"
                      onClick={() => {
                        setShowEditProfilePopup(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <FiUser />
                      Edit Profile
                    </button>

                    <button
                      className="navbar-dropdown-item"
                      onClick={() => {
                        setShowChangePasswordPopup(true);
                        setDropdownOpen(false);
                      }}
                    >
                      <FiSettings />
                      Change Password
                    </button>

                    <div className="navbar-dropdown-divider"></div>

                    <button className="navbar-dropdown-item danger" onClick={handleClick}>
                      <FiLogOut />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}

            {!user && (
              <Link to="/login" className="navbar-login-btn">
                Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="navbar-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Edit Profile Popup */}
      {showEditProfilePopup && (
        <div className="profile-popup-overlay" onClick={() => setShowEditProfilePopup(false)}>
          <div className="profile-popup-content" onClick={(e) => e.stopPropagation()}>
            <EditProfile onClose={() => setShowEditProfilePopup(false)} />
            <button
              className="profile-popup-close"
              onClick={() => setShowEditProfilePopup(false)}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* Change Password Popup */}
      {showChangePasswordPopup && (
        <div className="profile-popup-overlay" onClick={() => setShowChangePasswordPopup(false)}>
          <div className="profile-popup-content" onClick={(e) => e.stopPropagation()}>
            <ChangePasswordComp onClose={() => setShowChangePasswordPopup(false)} />
            <button
              className="profile-popup-close"
              onClick={() => setShowChangePasswordPopup(false)}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NavbarComp;
