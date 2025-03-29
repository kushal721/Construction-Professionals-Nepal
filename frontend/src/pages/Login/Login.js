import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./../mix.css";
import NavbarComp from "../../components/Navbar/Navbar";
import Cookies from "js-cookie";
import { useLogin } from "../../hooks/useLogin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [passShow, setPassShow] = useState(false);
  const [inpval, setInpval] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login, error, isLoading } = useLogin();

  const setVal = (e) => {
    const { name, value } = e.target;
    setInpval((prevInpval) => ({ ...prevInpval, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(inpval.email, inpval.password);
    } catch (error) {
      // Use toast.error to show errors
      toast.error(error.message);
    }
  };

  return (
    <>
      <ToastContainer />
      <section className="login-signup-section">
        <div className="form_data">
          <div className="form_heading">
            <h1> Login</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form_input">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                onChange={setVal}
                value={inpval.email}
                name="email"
                id="email"
                placeholder="Enter Email Address"
                required
              />

              <label htmlFor="password">Password</label>
              <div className="two">
                <input
                  type={!passShow ? "password" : "text"}
                  onChange={setVal}
                  value={inpval.password}
                  name="password"
                  id="password"
                  placeholder="Enter Password"
                />
                <div
                  className="showpass"
                  onClick={() => setPassShow(!passShow)}
                >
                  {!passShow ? "Show" : "Hide"}
                </div>
              </div>
            </div>

            <button className="btn" disabled={isLoading}>
              Login
            </button>
            <p>
              Don't have an Account? <NavLink to="/register">Sign Up</NavLink>
            </p>
            <br />
            <NavLink to="/forogt-password">Forgot Password?</NavLink>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </section>
    </>
  );
};

export default Login;
