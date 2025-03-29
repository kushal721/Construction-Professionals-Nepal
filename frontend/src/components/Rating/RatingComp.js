import React, { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { toast } from "react-toastify"; // Import toast from react-toastify
import "react-toastify/dist/ReactToastify.css";

const RatingComp = ({ designId, onClose }) => {
  const [rating, setRating] = useState(0);
  const { user } = useAuthContext();

  const handleRatingSubmit = async () => {
    try {
      if (!user) {
        console.error("User object does not exist");
        return;
      }

      const response = await fetch(
        "http://localhost:4000/api/designs/addrating",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            designId: designId,
            userId: user.userId,
            ratingValue: rating,
          }),
        }
      );

      if (response.ok) {
        toast.success("Rating submitted successfully!");
        onClose(); // Close the rating popup
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to submit rating: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("An error occurred while submitting rating");
    }
  };

  return (
    <>
      <div>
        <div>
          {[1, 2, 3, 4, 5].map((star) => {
            return (
              <span
                key={star}
                className="star"
                style={{
                  cursor: "pointer",
                  color: rating >= star ? "gold" : "gray",
                  fontSize: `35px`,
                }}
                onClick={() => {
                  setRating(star);
                }}
              >
                ★
              </span>
            );
          })}
        </div>
        <button onClick={handleRatingSubmit} className="btn-submit">
          Submit Rating
        </button>
      </div>
    </>
  );
};

export default RatingComp;
