import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./card.css";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css";

const DesignCard = ({ design }) => {
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const { user } = useAuthContext(); // Access the user authentication state

  const addToFavorites = async () => {
    setIsAddingToFavorites(true);

    try {
      const response = await fetch(
        "http://localhost:4000/api/favorites/addFavorites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`, // Replace YOUR_AUTH_TOKEN with the actual authentication token
          },
          body: JSON.stringify({ userId: user.userId, designId: design._id }), // Replace YOUR_USER_ID with the actual user ID
        }
      );

      if (response.ok) {
        toast.success("Design added to favorites!");
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to add design to favorites: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding design to favorites:", error);
      toast.error("An error occurred while adding design to favorites");
    } finally {
      setIsAddingToFavorites(false);
    }
  };

  return (
    <div>
      <Link to={`/design-desc/${design._id}`} className="card">
        <div className="img-container">
          {design.designImages.length > 0 && (
            <img
              src={`http://localhost:4000/${design.designImages[0]}`}
              alt={``}
            />
          )}
        </div>
        <div className="card-content">
          <div className="header">
            <h5 className="title">{design.designName}</h5>
            <h5 className="title">Category: {design.designCategory}</h5>
            <h5 className="title">Estimate Cost(Rs): {design.estimateCost}</h5>
            <h5 className="title">Area(Sqm): {design.area}</h5>
            <p className="rating">Rating(★) {design.averageRating}</p>
          </div>

          <p className="designer">Designed by {design.designer_name}</p>
        </div>
      </Link>
      <button
        className="fav-btn"
        onClick={addToFavorites}
        disabled={isAddingToFavorites}
      >
        {isAddingToFavorites ? "Adding to Favorites..." : "Add to Favorites"}
      </button>
    </div>
  );
};

export default DesignCard;
