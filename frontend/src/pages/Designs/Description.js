import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiHeart, FiMessageSquare, FiStar, FiUser, FiMaximize2, FiMaximize } from "react-icons/fi";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";
import RatingComp from "../../components/Rating/RatingComp";
import FooterComp from "../../components/Footer/Footer";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./Description.css";

const Description = () => {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [designDesc, setDesignDesc] = useState(null);
  const [addComment, setAddComment] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/designs/${id}`);
        if (response.ok) {
          const data = await response.json();
          setDesignDesc(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching design:", error);
        setLoading(false);
      }
    };

    fetchDesign();
  }, [id]);

  const addToFavorites = async () => {
    if (!user) {
      toast.error("Please login to add favorites");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:4000/api/favorites/addFavorites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.userId}`,
          },
          body: JSON.stringify({ userId: user?.userId, designId: id }),
        }
      );

      if (response.ok) {
        toast.success("Design added to favorites!");
      } else {
        const errorMessage = await response.text();
        toast.error(`Could not add to favorites: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding design to favorites:", error);
      toast.error("An error occurred");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

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
      toast.success("Comment added successfully");
      setAddComment("");
      setDesignDesc({
        ...designDesc,
        comments: [...designDesc.comments, data],
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: designDesc?.designImages?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!designDesc) return <div className="error-container">Design not found</div>;

  return (
    <div className="page-wrapper">
      <div className="description-container">

        {/* Design Header */}
        <div className="design-header">
          <div className="design-title-section">
            <span className="design-category-badge">{designDesc.designCategory}</span>
            <h1 className="design-title">{designDesc.designName}</h1>
            <div className="design-meta">
              <span className="meta-item">
                <FiUser /> {designDesc.designer_name}
              </span>
              <span className="meta-item rating-meta">
                <FiStar className="star-icon" /> {designDesc.averageRating} ({designDesc.totalRatings} reviews)
              </span>
            </div>
          </div>
          <div className="design-actions">
            <button className="action-btn-outline" onClick={addToFavorites}>
              <FiHeart /> Save
            </button>
            <button className="action-btn-primary" onClick={() => setShowRatingPopup(true)}>
              <FiStar /> Rate Design
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="design-content-grid">

          {/* Left Column: Images */}
          <div className="design-gallery">
            {designDesc.designImages.length > 0 ? (
              <div className="slider-wrapper">
                <Slider {...sliderSettings}>
                  {designDesc.designImages.map((image, index) => (
                    <div key={index} className="slide-item">
                      <img
                        src={`http://localhost:4000/${image}`}
                        alt={`Design view ${index + 1}`}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            ) : (
              <div className="no-image-placeholder">No images available</div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="design-info-panel">
            <div className="info-card">
              <h3>Project Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Estimate Cost</label>
                  <span>Rs. {designDesc.estimateCost}</span>
                </div>
                <div className="info-item">
                  <label>Total Area</label>
                  <span>{designDesc.area} sq m</span>
                </div>
              </div>
            </div>

            <div className="info-card description-card">
              <h3>Description</h3>
              <p>{designDesc.designDescription}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>
            <FiMessageSquare /> Discussion & Reviews ({designDesc.comments?.length || 0})
          </h3>

          <div className="comment-form-container">
            <form onSubmit={handleSubmit} className="comment-form">
              <textarea
                value={addComment}
                onChange={(e) => setAddComment(e.target.value)}
                placeholder="Share your thoughts about this design..."
                rows="3"
                required
              />
              <button type="submit" className="submit-comment-btn">
                Post Comment
              </button>
            </form>
          </div>

          <div className="comments-list">
            {designDesc.comments?.length > 0 ? (
              designDesc.comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.commenterName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.commenterName}</span>
                      <span className="comment-date">
                        {new Date(comment.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-comments">
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>

      </div>
      <FooterComp />

      {/* Rating Popup */}
      {showRatingPopup && (
        <div className="modal-overlay">
          <div className="rating-modal">
            <button className="close-modal-btn" onClick={() => setShowRatingPopup(false)}>
              &times;
            </button>
            <RatingComp
              designId={id}
              userId={user?.userId}
              onClose={() => setShowRatingPopup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Description;
