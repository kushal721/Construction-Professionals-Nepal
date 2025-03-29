

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async (
    profile,
    username,
    email,
    contactNumber,
    password,
    confirm_password,
    location,
    role
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("profile", profile);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("contactNumber", contactNumber);
      formData.append("password", password);
      formData.append("confirm_password", confirm_password);
      formData.append("location", location);
      formData.append("role", role);

      const response = await fetch(
        `http://localhost:4000/api/user/user-register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const res = await response.json();

      if (!response.ok) {
        console.log("Signup response:", res.msg);
        // Use toast.error to show errors
        toast.error(res.msg);
        setError(res.msg);
      }

      if (response.ok) {
        console.log("Signup response:", res);
        // Use toast.success for success messages
        toast.success("Registration successful");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Navigate after 2 seconds
      }
    } catch (error) {
      console.error("Signup Error:", error.message);
      // Use toast.error to show errors
      toast.error(error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};

// Add an alert component
export const Alert = ({ message, onClose }) => {
  return (
    <div className="alert">
      <span className="closebtn" onClick={onClose}>
        &times;
      </span>
      {message}
    </div>
  );
};
