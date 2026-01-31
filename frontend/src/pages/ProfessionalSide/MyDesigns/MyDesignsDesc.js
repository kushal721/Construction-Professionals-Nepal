import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../../components/DashboardLayout/DashboardLayout";
import { useAuthContext } from "../../../hooks/useAuthContext";
import "./MyDesignDesc.css";
import EditDesign from "../../../components/Edit/EditDesign";
import { toast } from "react-toastify";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FiEdit2, FiTrash2, FiMaximize2, FiDollarSign, FiStar, FiUser, FiSend, FiX } from "react-icons/fi";

const MyDesignDesc = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { id } = useParams();
  const [designDesc, setDesignDesc] = useState(null);
  const [loading, setLoading] = useState(true);

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
          toast.error("Failed to load design details");
        }
      } catch (error) {
        console.error("Error fetching design:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchDesign();
    }
  }, [id, user]);

  const handleRemoveDesign = () => {
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
        toast.error("Failed to remove design");
      }
    } catch (error) {
      console.error("Error removing design:", error);
      toast.error("An error occurred while removing design");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!addComment.trim()) return;

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

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setAddComment("");
        // Optimistically update comments (or re-fetch)
        // For simplicity, we'll append if the structure matches, or just let the user refresh/reload.
        // Better to re-fetch the design or manually append safely
        setDesignDesc(prev => ({
          ...prev,
          comments: [...(prev.comments || []), {
            _id: Date.now().toString(), // temp ID until refresh
            content: addComment,
            commenterName: user?.username || "You",
            createdBy: user?.userId
          }]
        }));
      } else {
        toast.error(data.message || "Failed to add comment");
      }
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
      const data = await response.json();

      if (response.ok) {
        const updatedComments = designDesc.comments.filter(
          (comment) => comment._id !== commentId
        );
        setDesignDesc({ ...designDesc, comments: updatedComments });
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("An error occurred while deleting the comment");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: designDesc?.designImages?.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
  };

  if (loading) return <DashboardLayout title="Loading..."><div className="loading-spinner"></div></DashboardLayout>;
  if (!designDesc) return <DashboardLayout title="Error"><div className="error-state">Design not found</div></DashboardLayout>;

  return (
    <DashboardLayout title="Design Details" subtitle="View and manage your design entry">
      <div className="fade-in">
        <div className="my-design-desc-container">
          {/* Left Column: Images */}
          <div className="design-gallery">
            {designDesc.designImages && designDesc.designImages.length > 0 ? (
              <Slider {...sliderSettings}>
                {designDesc.designImages.map((image, index) => (
                  <div key={index} className="design-img">
                    <img
                      src={`http://localhost:4000/${image}`}
                      alt={`Design View ${index + 1}`}
                    />
                  </div>
                ))}
              </Slider>
            ) : (
              <div className="no-image-placeholder">No Images Available</div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="design-details-card">
            <div className="design-header">
              <span className="design-category">{designDesc.designCategory}</span>
              <h2 className="design-title">{designDesc.designName}</h2>
              <div className="info-item">
                <span className="info-value"><FiUser className="input-icon" style={{ position: 'static', marginRight: '5px' }} /> {designDesc.designer_name}</span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Estimated Cost</span>
                <span className="info-value"><FiDollarSign /> {designDesc.estimateCost}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Area</span>
                <span className="info-value"><FiMaximize2 /> {designDesc.area}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Rating</span>
                <span className="info-value"><FiStar fill="orange" color="orange" /> {designDesc.averageRating} ({designDesc.totalRatings})</span>
              </div>
            </div>

            <div className="description-section">
              <span className="info-label">Description</span>
              <p className="description-text">{designDesc.designDescription}</p>
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={() => setShowEditDesignPopup(true)}>
                <FiEdit2 /> Edit Design
              </button>
              <button className="btn-danger" onClick={handleRemoveDesign}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3 className="reviews-title">Customer Reviews</h3>
          <form className="comment-form" onSubmit={handleSubmit}>
            <input
              type="text"
              className="comment-input"
              value={addComment}
              onChange={(e) => setAddComment(e.target.value)}
              placeholder="Write a response or comment..."
            />
            <button type="submit" className="btn-post"><FiSend /> Post</button>
          </form>

          <div className="comments-list">
            {designDesc.comments && designDesc.comments.length > 0 ? (
              designDesc.comments.map((comment) => (
                <div key={comment._id} className="comment-card">
                  <div className="comment-header">
                    <span className="comment-author">{comment.commenterName}</span>
                    <button className="comment-delete-btn" onClick={() => handleDeleteComment(comment._id)} title="Delete Comment">
                      <FiX />
                    </button>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-muted">No comments yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Popups */}
      {showConfirmationPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="close-btn" onClick={() => setShowConfirmationPopup(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this design? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowConfirmationPopup(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleConfirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditDesignPopup && (
        <div className="modal-overlay">
          {/* EditDesign component usually has its own modal structure or needs wrapping. 
                 Assuming it renders fully, but usually we prefer to wrap it or fix styling if it's raw.
                 Checking EditDesign logic... it seems to be a form. We'll wrap it in standard modal content. 
             */}
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>Edit Design</h3>
              <button className="close-btn" onClick={() => setShowEditDesignPopup(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <EditDesign designId={id} onClose={() => setShowEditDesignPopup(false)} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyDesignDesc;
