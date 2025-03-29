import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./../../Designs/Description.css";
import "./MyDesignDesc.css";
import EditDesign from "../../../components/Edit/EditDesign";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MyDesignDesc = ({ match }) => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { id } = useParams();
  const [designDesc, setDesignDesc] = useState();

  const [showEditDesignPopup, setShowEditDesignPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [addComment, setAddComment] = useState("");

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/designs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDesignDesc(data);
        } else {
          console.error("Failed to fetch design");
        }
      } catch (error) {
        console.error("Error fetching design:", error);
      }
    };

    fetchDesign();
  }, [id]);

  const handleRemoveDesign = async () => {
    setShowConfirmationPopup(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/designs/mydesigns/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.ok) {
        const res = await response.json();
        toast.success(res.message);
        navigate("/dashboard/my-designs");
      } else {
        console.error("Failed to remove design");
      }
    } catch (error) {
      console.error("Error removing design:", error);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmationPopup(false);
  };

  const handleEditDesign = () => {
    setShowEditDesignPopup(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:4000/api/designs/${id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({
            content: addComment,
            createdBy: user?.userId,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      const data = await response.json();
      toast.success(data.message);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An error occurred while adding the comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/designs/${id}/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const updatedComments = designDesc.comments.filter(
          (comment) => comment._id !== commentId
        );
        setDesignDesc({ ...designDesc, comments: updatedComments });
        toast.success(data.message);
      } else {
        const data = await response.json();
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting the comment");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: designDesc?.designImages && designDesc.designImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: designDesc?.designImages && designDesc.designImages.length > 1,
    autoplaySpeed: 3000,
    cssEase: "linear",
  };

  return (
    <>
      <div className="maindiv">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="main-container">
          {designDesc && (
            <div className="mydesc-container">
              <div className="left-side">
                {designDesc.designImages.length > 0 && (
                  <Slider {...sliderSettings}>
                    {designDesc.designImages.map((image, index) => (
                      <div key={index} className="design-img">
                        <img
                          src={`http://localhost:4000/${image}`}
                          alt={`Design Image ${index}`}
                        />
                      </div>
                    ))}
                  </Slider>
                )}
              </div>
              <div className="right-side">
                <div className="button-container">
                  <button className="mr-2 btn-black" onClick={handleEditDesign}>
                    Edit Design
                  </button>
                  <button className="btn-danger" onClick={handleRemoveDesign}>
                    Remove Design
                  </button>
                </div>
                <h2>Name: {designDesc?.designName}</h2>
                <h2>Category: {designDesc?.designCategory}</h2>
                <p>Description: {designDesc?.designDescription}</p>
                <p>Area: {designDesc?.area}</p>
                <p>Estimated Cost: ₹{designDesc?.estimateCost}</p>
                <p className="rating">
                  Rating(★): {designDesc?.averageRating}
                  <span>({designDesc?.totalRatings})</span>
                </p>
                <p>Designer: {designDesc?.designer_name}</p>
              </div>
            </div>
          )}
          <div className="review-section">
            <h3>Customer Reviews</h3>
            <div className="cmt-main">
              <form className="cmt-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  id="comment"
                  name="comment"
                  value={addComment}
                  onChange={(e) => setAddComment(e.target.value)}
                  placeholder="Comment here"
                />
                <button type="submit" className="btn-addCmt">
                  Add
                </button>
              </form>
            </div>
            {designDesc?.comments &&
              designDesc.comments.map((comment) => (
                <div key={comment._id} className="review">
                  <h4>Comment by: {comment.commenterName}</h4>
                  <button
                    className="delete-comment-btn"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    ❌
                  </button>
                  <p className="review-content">{comment.content}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
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
      {showEditDesignPopup && (
        <div className="edit-design-popup">
          <EditDesign designId={id} />
          <button
            className="close-popup-btn"
            onClick={() => setShowEditDesignPopup(false)}
          >
            ❌
          </button>
        </div>
      )}
    </>
  );
};

export default MyDesignDesc;
