import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./EditDesign.css";
import { toast } from "react-toastify";

const EditDesign = ({ designId }) => {
  const { user } = useAuthContext();

  const [designData, setDesignData] = useState({});
  const [formData, setFormData] = useState({
    designName: "",
    area: "",
    estimateCost: "",
    designDescription: "",
    photos: [],
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
            photos: data.photos || [],
          });
        } else {
          console.error("Failed to fetch design data");
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
        [name]: [...prevFormData.photos, ...Array.from(files)],
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  }, []);

  const handleRemovePhoto = useCallback((index) => {
    setFormData((prevFormData) => {
      const updatedPhotos = [...prevFormData.photos];
      updatedPhotos.splice(index, 1);
      return {
        ...prevFormData,
        photos: updatedPhotos,
      };
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = {
        designName: formData.designName,
        area: formData.area,
        estimateCost: formData.estimateCost,
        designDescription: formData.designDescription,
        designCategory: formData.designCategory,
        // photos: formData.photos.map((photo) => photo.name), // Assuming you only need filenames
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
        console.log(res.message);
      } else {
        const errorMessage = await response.text();
        alert(`Failed to update design: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating design:", error);
      alert("An error occurred while updating design");
    }
  };

  return (
    <div className="ed-container">
      <h1 className="h1">Edit Design</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <div className="form-group">
            <label>Design Name:</label>
            <input
              type="text"
              className="form-control"
              name="designName"
              value={formData?.designName}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Area:</label>
            <input
              type="number"
              className="form-control"
              name="area"
              value={formData?.area}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="form-group">
            <label>Design Description:</label>
            <textarea
              className="form-control"
              name="designDescription"
              value={formData?.designDescription}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Estimate Cost:</label>
            <input
              type="number"
              className="form-control"
              name="estimateCost"
              value={formData?.estimateCost}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="designCategory">Design Category:</label>
          <select
            id="designCategory"
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
        {/* <div className="form-group">
          <label>Upload Photos:</label>
          <input
            type="file"
            className="form-control-file"
            name="photos"
            multiple
            onChange={handleInputChange}
          />
        </div> */}
        <div className="uploaded-photos">
          {formData.photos &&
            formData.photos.map((photo, index) => (
              <div key={index} className="uploaded-photo">
                <img src={URL.createObjectURL(photo)} alt={`Photo ${index}`} />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemovePhoto(index)}
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditDesign;
