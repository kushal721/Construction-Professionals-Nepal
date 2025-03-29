import { useNavigate, NavLink, Link } from "react-router-dom";
import { Button, Dropdown, Navbar } from "flowbite-react";
import { useLogout } from "../../hooks/useLogout";
import { useAuthContext } from "../../hooks/useAuthContext";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BiReset } from "react-icons/bi";
import { useEffect, useState } from "react";
import EditProfile from "../../pages/ProfessionalSide/ProfeProfile/EditProfile";

function NavbarComp() {
  const { logout } = useLogout();
  const { user } = useAuthContext();
  const Navigate = useNavigate();
  const [showEditProfilePopup, setShowEditProfilePopup] = useState(false);

  const [userData, setUserData] = useState({});
  console.log("fed", userData);

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

  const isClient = () => {
    return user && user.role === "client";
  };
  const isProfessional = () => {
    return user && user.role === "professional";
  };

  return (
    <Navbar
      fluid
      rounded
      className="navbar-container"
      style={{ backgroundColor: "#313438" }}
    >
      <Navbar.Brand as={NavLink} to="/" className="text-center">
        <span
          className="self-center text-2xl font-semibold "
          style={{ color: "white" }}
        >
          Construction Professionals Nepal
        </span>
      </Navbar.Brand>

      <div className="flex md:order-2">
        {user && (
          <>
            <Dropdown
              style={{ height: "60px", width: "13rem" }}
              label={
                <>
                  {userData?.profile?.length > 0 ? (
                    <img
                      src={`http://localhost:4000/${userData?.profile}`}
                      alt="Profile Picture"
                      className="profile-img"
                      style={{
                        height: "55px",
                        width: "55px",
                        // height: "10px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <img
                      src="./profile.png"
                      alt="Profile Picture"
                      className="profile-img"
                      style={{
                        width: "55px",
                        height: "55px",
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                  &nbsp;&nbsp;
                  <span>{userData?.username}</span>
                </>
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{userData?.username}</span>
                <span className="block truncate text-sm font-medium">
                  {userData?.email}
                </span>
              </Dropdown.Header>

              <button
                className="action-button"
                onClick={() => setShowEditProfilePopup(true)} // Show the Edit Profile popup when clicked
              >
                Edit Profile
              </button>
              <Dropdown.Divider />
              <Link to="/changepassword" className="reset-password-link">
                <button className="action-button">Change Password</button>
              </Link>
              {user && (
                <div>
                  <Button
                    style={{ backgroundColor: "blue", margin: "8px 0 0 10px" }}
                    onClick={handleClick}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </Dropdown>
            &nbsp;&nbsp;&nbsp;&nbsp;
          </>
        )}
        &nbsp;
        {!user && (
          <NavLink to="/login">
            <Button style={{ backgroundColor: "blue" }}>Login</Button>
          </NavLink>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link as={NavLink} to="/" exact="true">
          <span className="text-lg " style={{ color: "white" }}>
            Home
          </span>
        </Navbar.Link>
        <Navbar.Link as={NavLink} to="/designs">
          <span className="text-lg" style={{ color: "white" }}>
            Designs
          </span>
        </Navbar.Link>
        <Navbar.Link as={NavLink} to="/professionals">
          <span className="text-lg" style={{ color: "white" }}>
            Professionals
          </span>
        </Navbar.Link>
        <Navbar.Link as={NavLink} to="/contact">
          <span className="text-lg" style={{ color: "white" }}>
            Contact Us
          </span>
        </Navbar.Link>
        {isClient() && (
          <Navbar.Link as={NavLink} to="/favorite">
            <span className="text-lg" style={{ color: "white" }}>
              Favorite
            </span>
          </Navbar.Link>
        )}
        {isProfessional() && (
          <Navbar.Link as={NavLink} to="/favorite">
            <span className="text-lg" style={{ color: "white" }}>
              Favorite
            </span>
          </Navbar.Link>
        )}
        {isClient() && (
          <Navbar.Link as={NavLink} to="/appointment">
            <span className="text-lg" style={{ color: "white" }}>
              Appointments
            </span>
          </Navbar.Link>
        )}
        {user && (
          <>
            <NavLink to="/chat">
              <IoChatbubbleEllipsesOutline
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "white",
                  marginLeft: "8px",
                }}
              />
            </NavLink>
            {!isClient() && (
              <>
                {user.role === "admin" && (
                  <NavLink to="/dashboard/summary">
                    <span className="text-lg" style={{ color: "white" }}>
                      Dashboard
                    </span>
                  </NavLink>
                )}

                {user.role === "professional" && (
                  <NavLink to="/dashboard/my-designs">
                    <span className="text-lg" style={{ color: "white" }}>
                      Dashboard
                    </span>
                  </NavLink>
                )}
              </>
            )}
          </>
        )}

        {/* Edit Profile Popup */}
        {showEditProfilePopup && (
          <div className="edit-profile-popup">
            <EditProfile />
            <button
              className="close-popup-btn"
              onClick={() => setShowEditProfilePopup(false)} // Hide the Edit Profile popup when clicked
            >
              ❌
            </button>
          </div>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarComp;
