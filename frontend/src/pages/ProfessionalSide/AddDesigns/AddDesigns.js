import React, { useCallback, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { FiUpload, FiX, FiImage, FiDollarSign, FiGrid } from "react-icons/fi";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../../hooks/useAuthContext";
import { toast } from "react-toastify";
import "./AddDesigns.css";

const AddDesigns = () => {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [designData, setDesignData] = useState({
    designName: "",
    area: "",
    estimateCost: "",
    designDescription: "",
    designCategory: "",
    designImages: [],
  });

  const handleInputChange = (event) => {
    if (event.target.name === "designImages") {
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
    setIsSubmitting(true);

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

      if (response.ok) {
        toast.success("Design uploaded successfully!");
        setDesignData({
          designName: "",
          area: "",
          estimateCost: "",
          designDescription: "",
          designCategory: "",
          designImages: [],
        });
      } else {
        toast.error(res.message || "Failed to upload design");
      }
    } catch (error) {
      console.error("Error uploading designs:", error);
      toast.error("Failed to upload designs. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePhoto = useCallback((index) => {
    setDesignData((prevFormData) => {
      const updateddesignImages = Array.from(prevFormData.designImages);
      updateddesignImages.splice(index, 1);
      return {
        ...prevFormData,
        designImages: updateddesignImages,
      };
    });
  }, []);

  return (
    <DashboardLayout title="Add New Design" subtitle="Upload a new architectural design">
      <div className="add-design-wrapper">
        <form className="add-design-form" onSubmit={handleSubmit}>
          {/* Form Grid */}
          <div className="form-grid">
            {/* Left Column - Basic Info */}
            <div className="form-section">
              <h3 className="section-title">
                <FiGrid />
                Basic Information
              </h3>

              <div className="form-group">
                <label htmlFor="designName">Design Name *</label>
                <input
                  type="text"
                  id="designName"
                  name="designName"
                  value={designData.designName}
                  onChange={handleInputChange}
                  placeholder="Enter design name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="area">Area (sqm) *</label>
                  <input
                    type="number"
                    id="area"
                    name="area"
                    value={designData.area}
                    onChange={handleInputChange}
                    placeholder="e.g., 150"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimateCost">Estimated Cost (Rs) *</label>
                  <div className="input-with-icon">
                    <FiDollarSign className="input-icon" />
                    <input
                      type="number"
                      id="estimateCost"
                      name="estimateCost"
                      value={designData.estimateCost}
                      onChange={handleInputChange}
                      placeholder="e.g., 5000000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="designCategory">Category *</label>
                <select
                  id="designCategory"
                  name="designCategory"
                  value={designData.designCategory}
                  onChange={handleInputChange}
                  required
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

              <div className="form-group">
                <label htmlFor="designDescription">Description *</label>
                <textarea
                  id="designDescription"
                  name="designDescription"
                  value={designData.designDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the design features, style, and specifications..."
                  rows="5"
                  required
                ></textarea>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="form-section">
              <h3 className="section-title">
                <FiImage />
                Design Images
              </h3>

              {/* Upload Area */}
              <div className="upload-area">
                <input
                  type="file"
                  id="designImages"
                  name="designImages"
                  accept="image/*"
                  multiple
                  onChange={handleInputChange}
                  className="upload-input"
                />
                <label htmlFor="designImages" className="upload-label">
                  <FiUpload className="upload-icon" />
                  <span className="upload-text">Click to upload images</span>
                  <span className="upload-hint">PNG, JPG up to 10MB each</span>
                </label>
              </div>

              {/* Preview Grid */}
              {designData.designImages.length > 0 && (
                <div className="preview-grid">
                  {Array.from(designData.designImages).map((file, index) => (
                    <div key={index} className="preview-item">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="form-actions">
            <Link to="/dashboard/my-designs" className="cancel-btn">
              Cancel
            </Link>
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload />
                  Upload Design
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddDesigns;
