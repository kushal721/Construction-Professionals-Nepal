import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./card.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css";

const MyDesignCard = ({ my_design, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  const handleRemoveDesign = async () => {
    setShowConfirmationPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/designs/mydesigns/${my_design._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.ok) {
        console.log("Design removed successfully");
        setShowConfirmationPopup(false);
        onDelete(my_design._id);
        toast.success("Design removed successfully"); // Display success message using toast
      } else {
        console.error("Failed to remove design");
        toast.error("Failed to remove design"); // Display error message using toast
      }
    } catch (error) {
      console.error("Error removing design:", error);
      toast.error("An error occurred while removing the design"); // Display error message using toast
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationPopup(false);
  };
  console.log("my design", my_design.designImages[0]);

  return (
    <div>
      <Link to={`/dashboard/mydesign-desc/${my_design._id}`} className="card">
        {my_design.designImages.length > 0 && (
          <img
            src={`http://localhost:4000/${my_design.designImages[0]}`}
            alt={`Image 0`}
          />
        )}
        <span className="design-name">{my_design.designName}</span> <br />
      </Link>
      <span className="design-actions">
        <button className="btn-danger" onClick={handleRemoveDesign}>
          Delete
        </button>
      </span>

      {showConfirmationPopup && (
        <div className="confirmation-popup">
          <h3>Are you sure you want to delete?</h3>
          <div className="popup-buttons">
            <button className="popup-button" onClick={handleConfirmDelete}>
              Yes
            </button>
            <button className="popup-button" onClick={handleCancelDelete}>
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDesignCard;
