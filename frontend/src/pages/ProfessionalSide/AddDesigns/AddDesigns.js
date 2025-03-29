import React, { useCallback, useState } from "react";
import Sidebar from "../../../components/Sidebar/Sidebar";
import "./AddDesigns.css";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";

const AddDesigns = () => {
  const { user } = useAuthContext();
  const [designData, setDesignData] = useState({
    designName: "",
    area: "",
    estimateCost: "",
    designDescription: "",
    designCategory: "",
    designImages: [], // Initialize the array to store uploaded images
  });
  console.log(designData, "designData");
  const [error, setError] = useState("");

  const handleInputChange = (event) => {
    if (event.target.name === "designImages") {
      // Store the selected files in the state
      setDesignData((prevFormData) => ({
        ...prevFormData,
        designImages: event.target.files,
      }));
    } else {
      setDesignData((prevFormData) => ({
        ...prevFormData,
        [event.target.name]: event.target.value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!user) {
        return <Navigate to="/login" />;
      }

      const formData = new FormData();
      formData.append("designName", designData.designName);
      formData.append("area", designData.area);
      formData.append("estimateCost", designData.estimateCost);
      formData.append("designDescription", designData.designDescription);
      formData.append("designCategory", designData.designCategory);

      // Append each image individually with the same key name
      for (let i = 0; i < designData.designImages.length; i++) {
        formData.append("designImages", designData.designImages[i]);
      }

      const response = await fetch(
        "http://localhost:4000/api/designs/adddesign",
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      const res = await response.json();
      console.log("this is res", res);

      if (response.ok) {
        toast.success("Design uploaded successfully!");

        // toast.success("Design uploaded successfully!");
        console.log("Design uploaded successfully!");
      } else {
        console.log(res.message);

        toast.error(res.message || "Failed to upload design");
      }
    } catch (error) {
      console.error("Error uploading designs:", error);
      setError("Failed to upload designs. Please try again.");
    }
  };

  const handleRemovePhoto = useCallback((index) => {
    setDesignData((prevFormData) => {
      const updateddesignImages = [...prevFormData.designImages];
      updateddesignImages.splice(index, 1);
      return {
        ...prevFormData,
        designImages: updateddesignImages,
      };
    });
  }, []);

  return (
    <div className="maindiv">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="adddesign-container">
        <div className="content">
          <div className="page-name">
            <h1 className="page-title">Add New Designs</h1>
          </div>
          <form className="add-design-form" onSubmit={handleSubmit}>
            {/* Design details */}
            <div className="left-column">
              <div className="form-group">
                <label htmlFor="designName">Design Name:</label>
                <input
                  type="text"
                  id="designName"
                  name="designName"
                  value={designData.designName}
                  onChange={handleInputChange}
                  placeholder="Enter design name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="area">Area(sqm):</label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={designData.area}
                  onChange={handleInputChange}
                  placeholder="Enter area"
                />
              </div>
              <div className="form-group">
                <label htmlFor="estimateCost">Estimate Cost(Rs):</label>
                <input
                  type="text"
                  id="estimateCost"
                  name="estimateCost"
                  value={designData.estimateCost}
                  onChange={handleInputChange}
                  placeholder="Enter estimate cost"
                />
              </div>
            </div>
            <div className="right-column">
              <div className="form-group">
                <label htmlFor="designDescription">Design Description:</label>
                <textarea
                  id="designDescription"
                  name="designDescription"
                  value={designData.designDescription}
                  onChange={handleInputChange}
                  placeholder="Enter design description"
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="designCategory">Design Category:</label>
                <select
                  id="designCategory"
                  name="designCategory"
                  value={designData.designCategory}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Single Floor">Single Floor</option>
                  <option value="Multiplex">Multiplex</option>
                  <option value="Mansion">Mansion</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>
              {/* Upload designImages */}
              <div className="form-group">
                <label>Upload designImages:</label>
                <input
                  type="file"
                  className="form-control-file"
                  name="designImages"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                />
              </div>
              {/* Display uploaded designImages */}
              <div className="uploaded-designImages">
                {designData.designImages &&
                  Array.from(designData.designImages).map((file, index) => (
                    <div key={index} className="uploaded-photo">
                      <img src={URL.createObjectURL(file)} alt={`${index}`} />
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            {/* Submit button */}
            <div className="btn-upload">
              <button type="submit" className="upload-button">
                Upload Design
              </button>
            </div>
          </form>
          {/* Error message */}
        </div>
      </div>
    </div>
  );
};

export default AddDesigns;
