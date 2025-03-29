import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"; // Import your CSS file

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false); // State to handle loading
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the request starts

    try {
      // Make an API request to your backend to initiate the password reset process
      const response = await fetch(
        "http://localhost:4000/api/user/user-send-reset-password-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        // Password reset link sent successfully
        alert("Password reset link sent successfully. Check your email.");
        navigate("/login"); // Redirect to the login page or another appropriate page
      } else {
        // Handle other possible responses
        console.error("Error sending password reset link");
        alert("Error sending password reset link. Please try again.");
      }
    } catch (error) {
      // Handle network or server errors
      console.error("Error:", error.message);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // Reset loading to false after the request is completed
    }
  };

  return (
    <div className="forgot-password-container">
      <h1>Forgot Password</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label htmlFor="email" className="f-label">
            Email
          </label>
          <input
            className="f-input"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            name="email"
            id="email"
            placeholder="Enter Email Address"
            disabled={loading} // Disable input when loading
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./ForgotPassword.css"; // Import your CSS file

// const ForgotPassword = () => {
//   const [email, setEmail] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // Make an API request to your backend to initiate the password reset process
//       const response = await fetch(
//         "http://localhost:4000/api/user/user-send-reset-password-email",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ email }),
//         }
//       );

//       // Check the response from the server and handle it accordingly
//       if (response.ok) {
//         // Password reset link sent successfully
//         alert("Password reset link sent successfully. Check your email.");
//         navigate("/login"); // Redirect to the login page or another appropriate page
//       } else {
//         // Handle other possible responses
//         console.error("Error sending password reset link");
//         alert("Error sending password reset link. Please try again.");
//       }
//     } catch (error) {
//       // Handle network or server errors
//       console.error("Error:", error.message);
//       alert("An error occurred. Please try again later.");
//     }
//   };

//   return (
//     <div className="forgot-password-container">
//       <h1>Forgot Password</h1>

//       <form onSubmit={handleSubmit}>
//         <div className="form-input">
//           <label htmlFor="email" className="f-label">
//             Email
//           </label>
//           <input
//             className="f-input"
//             type="email"
//             onChange={(e) => setEmail(e.target.value)}
//             value={email}
//             name="email"
//             id="email"
//             placeholder="Enter Email Address"
//           />
//         </div>

//         <button type="submit" className="btn">
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ForgotPassword;
