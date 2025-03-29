
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NavbarComp from "../../components/Navbar/Navbar";
import { useSignup } from "../../hooks/useSignup";
import { ToastContainer, toast } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";
import "./Registration.css";

const Registration = () => {
  const navigate = useNavigate();
  const [passShow, setPassShow] = useState(false);
  const [cpassShow, setCPassShow] = useState(false);
  const { signup, error, isLoading } = useSignup();

  const [inpval, setInpval] = useState({
    profile: null,
    username: "",
    email: "",
    contactNumber: "",
    password: "",
    confirm_password: "",
    location: "Kathmandu",
    role: "client",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    setInpval((prevInpval) => ({
      ...prevInpval,
      [name]: name === "profile" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous errors
    setErrors({});

    if (!inpval.username.trim()) {
      // Use toast.error to show errors
      toast.error("Name is required");
      return;
    }

    if (!inpval.email.trim()) {
      // Use toast.error to show errors
      toast.error("Email is required");
      return;
    } else if (!/^\S+@\S+\.\S+$/.test(inpval.email)) {
      // Use toast.error to show errors
      toast.error("Email is invalid");
      return;
    }

    if (!inpval.contactNumber.trim()) {
      // Use toast.error to show errors
      toast.error("Contact number is required");
      return;
    }

    if (!inpval.password.trim()) {
      // Use toast.error to show errors
      toast.error("Password is required");
      return;
    }

    try {
      await signup(
        inpval.profile,
        inpval.username,
        inpval.email,
        inpval.contactNumber,
        inpval.password,
        inpval.confirm_password,
        inpval.location,
        inpval.role
      );
    } catch (error) {
      console.error("Signup Error:", error.message);
      // Use toast.error to show errors

      toast.error(error.message);
    }
  };

  return (
    <>
      <ToastContainer /> {/* ToastContainer added here */}
      <section className="login-signup-section">
        <div className="form_data">
          <div className="form_heading">
            <h1> Signup</h1>
          </div>

          <form onSubmit={handleSubmit} className="form-signup">
            <div className="left-sec"></div>
            <div>
              <label
                htmlFor="profile"
                className="profile-picture, form_input"
                style={{ height: "30px" }}
              >
                Upload your profile(optional)
                <img
                  src="/profile.png"
                  alt="Profile Preview"
                  className="profile-image"
                  style={{
                    height: "50px",
                    width: "50px",
                    alignContent: "center",
                    textAlign: "center",
                  }}
                />
              </label>
              <input
                type="file"
                name="profile"
                id="profile"
                accept=".jpeg, .png, .jpg"
                onChange={handleInputChange}
                // style={{ display: "none" }}
              />
            </div>

            <div className="form_input">
              <label htmlFor="username">Name</label>
              <input
                type="text"
                onChange={handleInputChange}
                value={inpval.username}
                name="username"
                id="username"
                placeholder="Enter your Name"
                required
              />

              <label htmlFor="email">Email</label>
              <input
                type="email"
                onChange={handleInputChange}
                value={inpval.email}
                name="email"
                id="email"
                placeholder="Enter Email Address"
                required
              />
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                onChange={handleInputChange}
                value={inpval.contactNumber}
                name="contactNumber"
                id="contactNumber"
                placeholder="Enter Contact Number"
                required
              />

              <label htmlFor="password">Password</label>
              <div className="two">
                <input
                  type={!passShow ? "password" : "text"}
                  onChange={handleInputChange}
                  value={inpval.password}
                  name="password"
                  id="password"
                  placeholder="Enter Password"
                  required
                />
                <div
                  className="showpass"
                  onClick={() => setPassShow(!passShow)}
                >
                  {!passShow ? "Show" : "Hide"}
                </div>
              </div>

              <label htmlFor="password">Confirm Password</label>
              <div className="two">
                <input
                  type={!cpassShow ? "password" : "text"}
                  onChange={handleInputChange}
                  value={inpval.confirm_password}
                  name="confirm_password"
                  id="confirm_password"
                  placeholder="Confirm Password"
                  required
                />
                <div
                  className="showpass"
                  onClick={() => setCPassShow(!cpassShow)}
                >
                  {!cpassShow ? "Show" : "Hide"}
                </div>
              </div>
            </div>

            <label>Role:</label>
            <select
              value={inpval.role}
              onChange={handleInputChange}
              name="role"
            >
              <option value="client">Client</option>
              <option value="professional">Professional</option>
            </select>

            <label>Location:</label>
            <select
              value={inpval.location}
              onChange={handleInputChange}
              name="location"
            >
              <option value="Kathmandu">Kathmandu</option>
              <option value="Hetauda">Hetauda</option>
              <option value="Pokhara">Pokhara</option>
            </select>

            {/* <button className="btn" onClick={addUserdata}>
              Signup
            </button> */}
            <button className="btn" disabled={isLoading}>
              Signup
            </button>

            <p>
              Already have an Account? <NavLink to="/login">Login</NavLink>
            </p>
          </form>
        </div>
      </section>
    </>
  );
};

export default Registration;
