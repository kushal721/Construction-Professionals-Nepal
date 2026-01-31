
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast

export const useSignup = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signup = async ({
    username,
    email,
    password,
    confirm_password,
    role,
    // Optional fields
    profile = null,
    contactNumber = "",
    location = "",
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirm_password", confirm_password);
      formData.append("role", role);

      // Append optional fields only if they exist
      if (profile) formData.append("profile", profile);
      if (contactNumber) formData.append("contactNumber", contactNumber);
      if (location) formData.append("location", location);

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
        toast.error(res.msg || "Registration failed");
        setError(res.msg);
        return false; // Return failure
      }

      if (response.ok) {
        console.log("Signup response:", res);
        toast.success("Registration successful");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
        return true; // Return success
      }
    } catch (error) {
      console.error("Signup Error:", error.message);
      toast.error(error.message);
      setError(error.message);
      return false;
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
