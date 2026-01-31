import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./EditDesign.css";
import { toast } from "react-toastify";
import { FiType, FiMaximize2, FiDollarSign, FiAlignLeft, FiLayers, FiImage, FiX, FiSave } from "react-icons/fi";

const EditDesign = ({ designId, onClose }) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // We keep photos separated: existing (urls) and new (files) to avoid display issues
  // But the original code mixed them. We will try to handle both.
  const [designData, setDesignData] = useState({});
  const [formData, setFormData] = useState({
    designName: "",
    area: "",
    estimateCost: "",
    designDescription: "",
    designCategory: "",
    photos: [], // This will store File objects for new photos
    existingPhotos: [] // This will store strings (URLs) for existing photos
  });

  useEffect(() => {
    const fetchDesignData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/designs/${designId}`
        );
        if (response.ok) {
          const data = await response.json();
          setDesignData(data);
          setFormData({
            designName: data.designName || "",
            area: data.area || "",
            estimateCost: data.estimateCost || "",
            designDescription: data.designDescription || "",
            designCategory: data.designCategory || "",
            photos: [],
            existingPhotos: data.designImages || [] // Assuming API returns 'designImages' based on other files, or 'photos'
          });
        } else {
          console.error("Failed to fetch design data");
          toast.error("Failed to load design data");
        }
      } catch (error) {
        console.error("Error fetching design data:", error);
      }
    };

    fetchDesignData();
  }, [designId]);

  const handleInputChange = useCallback((e) => {
    const { name, value, files } = e.target;
    if (name === "photos") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        photos: [...prevFormData.photos, ...Array.from(files)],
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  }, []);

  const handleRemovePhoto = useCallback((index, isExisting) => {
    setFormData((prev) => {
      if (isExisting) {
        const updated = [...prev.existingPhotos];
        updated.splice(index, 1);
        return { ...prev, existingPhotos: updated };
      } else {
        const updated = [...prev.photos];
        updated.splice(index, 1);
        return { ...prev, photos: updated };
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // NOTE: If the backend expects JSON, we can't easily upload files without FormData (multipart).
      // The original code sent JSON including 'photos' but commented out the messy part.
      // If we want to support file upload, we need to know how the backend handles it.
      // For now, adhering to the original logic which seemed to send JSON.
      // If the backend doesn't support file upload via JSON (obviously), we might skip new photos or warn the user.
      // Assuming existing backend 'PATCH /designs/:id' expects standard JSON updates.

      const formDataToSend = {
        designName: formData.designName,
        area: formData.area,
        estimateCost: formData.estimateCost,
        designDescription: formData.designDescription,
        designCategory: formData.designCategory,
        // We are sending remaining existing photos. 
        // If the API supports updating the list of images by sending an array of filenames, we do this:
        designImages: formData.existingPhotos,
      };

      const response = await fetch(
        `http://localhost:4000/api/designs/mydesigns/${designId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify(formDataToSend),
        }
      );
      const res = await response.json();
      if (response.ok) {
        toast.success(res.message);
        if (onClose) onClose();
      } else {
        toast.error(res.message || "Failed to update design");
      }
    } catch (error) {
      console.error("Error updating design:", error);
      toast.error("An error occurred while updating design");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-form-container">
      {/* Note: The h1 is removed from here if this is used inside a modal that already has a header. 
          If used standalone, we can keep it. Based on usage in MyDesignDesc, the modal handles the header. 
          But to be safe, we'll leave it out or style it subtly. */}

      <form onSubmit={handleSubmit} className="modern-form compact">
        <div className="form-grid">
          <div className="form-group">
            <label>Design Name</label>
            <div className="input-wrapper">
              <FiType className="input-icon" />
              <input
                type="text"
                className="modern-input"
                name="designName"
                value={formData?.designName}
                onChange={handleInputChange}
                placeholder="e.g. Modern Villa"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="input-wrapper">
              <FiLayers className="input-icon" />
              <select
                className="modern-select"
                name="designCategory"
                value={formData?.designCategory}
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
          </div>

          <div className="form-group half">
            <label>Area (sq ft)</label>
            <div className="input-wrapper">
              <FiMaximize2 className="input-icon" />
              <input
                type="number"
                className="modern-input"
                name="area"
                value={formData?.area}
                onChange={handleInputChange}
                placeholder="1200"
              />
            </div>
          </div>

          <div className="form-group half">
            <label>Est. Cost (₹)</label>
            <div className="input-wrapper">
              <FiDollarSign className="input-icon" />
              <input
                type="number"
                className="modern-input"
                name="estimateCost"
                value={formData?.estimateCost}
                onChange={handleInputChange}
                placeholder="5000000"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <div className="input-wrapper top-align">
              <FiAlignLeft className="input-icon mt-3" />
              <textarea
                className="modern-textarea"
                name="designDescription"
                value={formData?.designDescription}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe your design..."
              />
            </div>
          </div>
        </div>

        {/* Existing Photos Display */}
        {formData.existingPhotos.length > 0 && (
          <div className="photos-section">
            <label>Current Photos</label>
            <div className="photo-grid">
              {formData.existingPhotos.map((photo, index) => (
                <div key={`existing-${index}`} className="photo-preview">
                  <img src={`http://localhost:4000/${photo}`} alt={`Design ${index}`} />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={() => handleRemovePhoto(index, true)}
                    title="Remove photo"
                  >
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions mt-4">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner-small"></span> : <><FiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDesign;
