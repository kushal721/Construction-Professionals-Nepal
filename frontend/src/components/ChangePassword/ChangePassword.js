// import React, { useState } from "react";
// import { useAuthContext } from "../../hooks/useAuthContext";
// import { toast } from "react-toastify"; // Import toast
// import "react-toastify/dist/ReactToastify.css";
// import "./ChangePassword.css";

// const ChangePassword = () => {
//   const { user } = useAuthContext();
//   console.log("USER", user?.userId);

//   const [formData, setFormData] = useState({
//     currentPassword: "",
//     newPassword: "",
//   });
//   console.log("Fd", formData);

//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleToggleCurrentPassword = () => {
//     setShowCurrentPassword(!showCurrentPassword);
//   };

//   const handleToggleNewPassword = () => {
//     setShowNewPassword(!showNewPassword);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(
//         "http://localhost:4000/api/user/user-changePassword",
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             body: { userId: user?.userId, formData },
//             Authorization: `Bearer ${user?.token}`,
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.json();
//         toast.error(errorData.message); // Display error message using toast
//         return;
//       }

//       toast.success("Password changed successfully"); // Display success message using toast
//     } catch (error) {
//       console.error("Error changing password:", error.message);
//       toast.error("An error occurred while changing the password"); // Display error message using toast
//     }
//   };

//   return (
//     <div>
//       <h2 className="change-password-title">Change Password</h2>
//       <div className="change-password-container">
//         <form onSubmit={handleSubmit} className="change-pass-form">
//           <div className="form-group">
//             <label htmlFor="currentPassword" className="label">
//               Current Password:
//             </label>
//             <div className="password-toggle">
//               <input
//                 className="input-field"
//                 type={showCurrentPassword ? "text" : "password"}
//                 id="currentPassword"
//                 name="currentPassword"
//                 value={formData.currentPassword}
//                 onChange={handleChange}
//               />
//               <button
//                 type="button"
//                 onClick={handleToggleCurrentPassword}
//                 className="toggle-btn"
//               >
//                 {showCurrentPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>
//           <div className="form-group">
//             <label htmlFor="newPassword" className="label">
//               New Password:
//             </label>
//             <div className="password-toggle">
//               <input
//                 className="input-field"
//                 type={showNewPassword ? "text" : "password"}
//                 id="newPassword"
//                 name="newPassword"
//                 value={formData.newPassword}
//                 onChange={handleChange}
//               />
//               <button
//                 type="button"
//                 onClick={handleToggleNewPassword}
//                 className="toggle-btn"
//               >
//                 {showNewPassword ? "Hide" : "Show"}
//               </button>
//             </div>
//           </div>
//           <button type="submit" className="btn btn-primary submit-btn">
//             Change Password
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChangePassword;

import React, { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";
import "./ChangePassword.css";

const ChangePassword = () => {
  const { user } = useAuthContext();
  console.log("USER", user);

  const [formData, setFormData] = useState({
    userId: "",
    currentPassword: "",
    newPassword: "",
  });

  // Update formData whenever the user object updates
  useEffect(() => {
    if (user) {
      setFormData((fData) => ({ ...fData, userId: user.userId }));
    }
  }, [user]);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleToggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message); // Display error message using toast
        return;
      }

      toast.success("Password changed successfully"); // Display success message using toast
    } catch (error) {
      console.error("Error changing password:", error.message);
      toast.error("An error occurred while changing the password"); // Display error message using toast
    }
  };

  return (
    <div>
      <h2 className="change-password-title">Change Password</h2>
      <div className="change-password-container">
        <form onSubmit={handleSubmit} className="change-pass-form">
          <div className="form-group">
            <label htmlFor="currentPassword" className="label">
              Current Password:
            </label>
            <div className="password-toggle">
              <input
                className="input-field"
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleToggleCurrentPassword}
                className="toggle-btn"
              >
                {showCurrentPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="newPassword" className="label">
              New Password:
            </label>
            <div className="password-toggle">
              <input
                className="input-field"
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={handleToggleNewPassword}
                className="toggle-btn"
              >
                {showNewPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary submit-btn">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
