import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { dispatch } = useAuthContext();
  const navigate = useNavigate(); // Initialize navigate

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:4000/api/user/user-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const res = await response.json();

      if (!response.ok) {
        console.log("Login response:", res.message);
        // Use toast.error to show errors
        toast.error(res.message);
        setIsLoading(false);
        setError(res.error);
        return;
      }

      // Use toast.success for success messages
      toast.success("Login Successful");

      // Save the user to local storage
      localStorage.setItem("user", JSON.stringify(res));

      // Update the auth context
      dispatch({ type: "LOGIN", payload: res });
      console.log("Payload:", res);

      // Check user role and navigate accordingly after a short delay
      setTimeout(() => {
        if (res.role === "professional") {
          navigate("/dashboard/my-designs");
        } else if (res.role === "client") {
          navigate("/");
        } else if (res.role === "admin") {
          navigate("/dashboard/summary");
        }
      }, 1000); // Adjust the delay time
    } catch (error) {
      console.error("Login Error:", error.message);
      // Use toast.error to show errors
      toast.error("An error occurred. Please try again.");
      setError(error.message);
    } finally {
      // Update loading state
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
