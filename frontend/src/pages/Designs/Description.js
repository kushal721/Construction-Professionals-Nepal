// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import NavbarComp from "../../components/Navbar/Navbar";
// import FooterComp from "../../components/Footer/Footer";
// import { useAuthContext } from "../../hooks/useAuthContext";
// import "./Description.css";
// import RatingComp from "../../components/Rating/RatingComp";
// import { toast } from "react-toastify"; // Import toast from react-toastify
// import "react-toastify/dist/ReactToastify.css";

// const Description = () => {
//   const { user } = useAuthContext();
//   const { id } = useParams();

//   const [designDesc, setDesignDesc] = useState(null);
//   const [addComment, setAddComment] = useState("");
//   const [showRatingPopup, setShowRatingPopup] = useState(false);

//   useEffect(() => {
//     const fetchDesign = async () => {
//       try {
//         const response = await fetch(`http://localhost:4000/api/designs/${id}`);
//         if (response.ok) {
//           const data = await response.json();
//           setDesignDesc(data);
//         } else {
//           console.error("Failed to fetch design");
//         }
//       } catch (error) {
//         console.error("Error fetching design:", error);
//       }
//     };

//     fetchDesign();
//   }, [id]);

//   const addToFavorites = async () => {
// try {
//   const response = await fetch(
//     "http://localhost:4000/api/favorites/addFavorites",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${user?.userId}`,
//       },
//       body: JSON.stringify({ userId: user?.userId, designId: id }),
//     }
//   );
//   const res = await response.json();

//   if (response.ok) {
//     toast.success("Design added to favorites!");
//   } else {
//     const errorMessage = await response.text();
//     toast.error(`Failed to add design to favorites: ${errorMessage}`);
//   }
// } catch (error) {
//   console.error("Error adding design to favorites:", error);
//   toast.error("An error occurred while adding design to favorites");
// }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(
//         `http://localhost:4000/api/designs/${id}/comments`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${user?.token}`,
//           },
//           body: JSON.stringify({
//             content: addComment,
//             createdBy: user?.userId,
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to add comment");
//       }

//       const data = await response.json();
//       toast.success("Comment added successfully");
//       setAddComment(""); // Clear the input field after successful comment addition
//       setDesignDesc({
//         ...designDesc,
//         comments: [...designDesc.comments, data],
//       }); // Add new comment to local state
//     } catch (error) {
//       console.error("Error adding comment:", error);
//       toast.error("An error occurred while adding comment");
//     }
//   };

//   return (
//     <div className="main-container">
//       <div>
//         {designDesc ? (
//           <div className="desc-container">
//             <div className="left-side">
//               <div className="design-img">
//                 {designDesc.designImages.length > 0 && (
//                   <img
//                     src={`http://localhost:4000/${designDesc.designImages[0]}`}
//                     alt="Design"
//                   />
//                 )}
//               </div>
//             </div>
//             <div className="right-side">
// <h2>Name: {designDesc.designName}</h2>
// <h2>Category: {designDesc.designCategory}</h2>
// <p>Description: {designDesc.designDescription}</p>
// <p>Area(Sqm): {designDesc.area}</p>
// <p>Estimate Cost(Rs): {designDesc.estimateCost}</p>
// <p className="rating">
//   Rating(★): {designDesc.averageRating}
//   <span>({designDesc.totalRatings})</span>
// </p>
// <p>Designer: {designDesc.designer_name}</p>
// <div className="buttons-container">
//   <button className="fav-btn" onClick={addToFavorites}>
//     Add to Favorites
//   </button>
//   <button
//     style={{ margin: "5px", background: "orange" }}
//     onClick={() => setShowRatingPopup(true)}
//   >
//     Rate Now
//   </button>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <p>Loading design details...</p>
//         )}
//       </div>
//       <div className="review-section">
//         <h3>Customer Reviews</h3>
//         <div className="cmt-main">
//           <form className="cmt-form" onSubmit={handleSubmit}>
//             <input
//               type="text"
//               id="comment"
//               name="comment"
//               value={addComment}
//               onChange={(e) => setAddComment(e.target.value)}
//               placeholder="Comment here"
//             />
//             <div type="submit" className="btn-addCmt">
//               <button>Add</button>
//             </div>
//           </form>
//         </div>
// {designDesc && designDesc.comments && designDesc.comments.length > 0 ? (
//   designDesc.comments.map((comment) => (
//     <div key={comment._id} className="review">
//       <h4>Comment by: {comment.commenterName}</h4>
//       <p>{comment.content}</p>
//     </div>
//   ))
// ) : (
//   <p>No comments yet.</p>
// )}
//       </div>
//       <FooterComp />
// {showRatingPopup && (
//   <div className="rating-popup">
//     <div className="rating-popup-content">
//       <RatingComp
//         designId={id}
//         userId={user?.userId}
//         onClose={() => setShowRatingPopup(false)}
//       />
//       <button
//         className="close-btn"
//         onClick={() => setShowRatingPopup(false)}
//       >
//         ❌
//       </button>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default Description;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import FooterComp from "../../components/Footer/Footer";
import { useAuthContext } from "../../hooks/useAuthContext";
import "./Description.css";
import RatingComp from "../../components/Rating/RatingComp";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Description = () => {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [designDesc, setDesignDesc] = useState(null);
  const [addComment, setAddComment] = useState("");
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/designs/${id}`);
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

  const addToFavorites = async () => {
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
      const res = await response.json();

      if (response.ok) {
        toast.success("Design added to favorites!");
      } else {
        const errorMessage = await response.text();
        toast.error(`Failed to add design to favorites: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding design to favorites:", error);
      toast.error("Design already added to favorites");
    }
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
      toast.success("Comment added successfully");
      setAddComment(""); // Clear the input field after successful comment addition
      setDesignDesc({
        ...designDesc,
        comments: [...designDesc.comments, data],
      }); // Add new comment to local state
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An error occurred while adding comment");
    }
  };

  // Settings for the slider
  const sliderSettings = {
    dots: true,
    infinite: designDesc?.designImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: designDesc?.designImages.length > 1,
    autoplaySpeed: 3000,
    cssEase: "linear",
  };

  return (
    <div className="main-container">
      <div className="desc-container">
        <div className="left-side">
          {designDesc?.designImages.length > 0 && (
            <Slider {...sliderSettings}>
              {designDesc.designImages.map((image, index) => (
                <div key={index} className="design-img">
                  <img
                    src={`http://localhost:4000/${image}`}
                    alt="Design"
                    style={{ width: "100%", objectFit: "contain" }}
                  />
                </div>
              ))}
            </Slider>
          )}
        </div>
        <div className="right-side">
          <h2>Name: {designDesc?.designName}</h2>
          <h2>Category: {designDesc?.designCategory}</h2>
          <p>Description: {designDesc?.designDescription}</p>
          <p>Area(Sqm): {designDesc?.area}</p>
          <p>Estimate Cost(Rs): {designDesc?.estimateCost}</p>
          <p className="rating">
            Rating(★): {designDesc?.averageRating}
            <span>({designDesc?.totalRatings})</span>
          </p>
          <p>Designer: {designDesc?.designer_name}</p>
          <div className="buttons-container">
            <button className="fav-btn" onClick={addToFavorites}>
              Add to Favorites
            </button>
            <button
              style={{ margin: "5px", background: "orange" }}
              onClick={() => setShowRatingPopup(true)}
            >
              Rate Now
            </button>
          </div>
        </div>
      </div>
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
        {designDesc?.comments && designDesc.comments.length > 0 ? (
          designDesc.comments.map((comment) => (
            <div key={comment._id} className="review">
              <h4>Comment by: {comment.commenterName}</h4>
              <p>{comment.content}</p>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      <FooterComp />
      {showRatingPopup && (
        <div className="rating-popup">
          <div className="rating-popup-content">
            <RatingComp
              designId={id}
              userId={user?.userId}
              onClose={() => setShowRatingPopup(false)}
            />
            <button
              className="close-btn"
              onClick={() => setShowRatingPopup(false)}
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Description;
