import React, { useState } from "react";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./AddInformation.css"; // Create a CSS file for styling
import { toast } from "react-toastify"; // Import toast for notifications

const AddInformation = () => {
  const { user } = useAuthContext();
  // State variable to hold form data
  const [formData, setFormData] = useState({
    specialization: "",
    experience: "",
    description: "",
    skills: "",
    education: "",
  });
  console.log("user u", user);

  // Function to handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the server to add professional information
      const response = await fetch(
        "http://localhost:4000/api/userr/addProfessionalDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const res = await response.json();
      if (!response.ok) {
        console.log(res.message);
        toast.error(res.message);
      }

      toast.success(res.message); // Display success toast
      console.log(res.message);
      // Optionally, you can redirect the user or show a success message
    } catch (error) {
      console.error("Error adding professional information:", error);
      // toast.error("Failed to add professional information"); // Display error toast
      // Optionally, you can show an error message to the user
    }
  };

  return (
    <div className="add-info-container">
      <h2 className="section-title">Add Information</h2>
      <form className="form" onSubmit={handleSubmit}>
        <div className="left-form-group">
          <div className="form-group">
            <label htmlFor="specialization" className="label">
              Specialization:
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              className="input-field"
              value={formData.specialization}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="experience" className="label">
              Experience:
            </label>
            <input
              type="text"
              id="experience"
              name="experience"
              className="input-field"
              value={formData.experience}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills" className="label">
              Skills:
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              className="input-field"
              value={formData.skills}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="right-form-group">
          <div className="form-group">
            <label htmlFor="education" className="label">
              Education:
            </label>
            <input
              type="text"
              id="education"
              name="education"
              className="input-field"
              value={formData.education}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="label">
              Description:
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="input-field"
              value={formData.description}
              onChange={handleInputChange}
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary submit-btn"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddInformation;
