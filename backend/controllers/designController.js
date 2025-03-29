// import Design from "../models/Design.js"; // Ensure correct path for Design model
// import mongoose from "mongoose";

// // Get all designs
// const getDesigns = async (req, res) => {
//   try {
//     const designs = await Design.find({}).sort({ createdAt: -1 });
//     res.status(200).json(designs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // // Get all designs (for the logged-in user)
// // const getMyDesigns = async (req, res) => {
// //   try {
// //     const designs = await Design.find({ user_id: req.user._id }).sort({
// //       createdAt: -1,
// //     });
// //     res.status(200).json(designs);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // };

// const getMyDesigns = async (req, res) => {
//   try {
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const user_id = req.user._id;
//     console.log(user_id);
//     const designs = await Design.find({ user_id }).sort({ createdAt: -1 });
//     res.status(200).json(designs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single design
// const getDesign = async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "No such dehiugsign" });
//     }
//     const design = await Design.findById(id);
//     if (!design) {
//       return res.status(404).json({ error: "No such desjjjjign" });
//     }
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a design
// const deleteDesign = async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     const design = await Design.findOneAndDelete({ _id: id });
//     if (!design) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add new designs
// const addDesigns = async (req, res) => {
//   try {
//     // Check if user is authenticated
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }

//     const { designName, area, estimateCost, designDescription } = req.body;

//     if (!designName || !area || !estimateCost || !designDescription) {
//       return res.status(400).json({ error: "Please fill in all the fields" });
//     }

//     const design = await Design.create({
//       designName,
//       area,
//       estimateCost,
//       designDescription,
//       user_id: req.user._id,
//     });
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get a single design (for the logged-in user)
// const getMyDesign = async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     const design = await Design.findOne({ _id: id, user_id: req.user._id });
//     if (!design) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Delete a design (for the logged-in user)
// const deleteMyDesign = async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     const design = await Design.findOneAndDelete({
//       _id: id,
//       user_id: req.user._id,
//     });
//     if (!design) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update a design (for the logged-in user)
// const updateMyDesign = async (req, res) => {
//   const { id } = req.params;
//   try {
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     const design = await Design.findOneAndUpdate(
//       { _id: id, user_id: req.user._id },
//       req.body,
//       { new: true }
//     );
//     if (!design) {
//       return res.status(404).json({ error: "No such design" });
//     }
//     res.status(200).json(design);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add product review
// const productReview = async (req, res) => {
//   try {
//     const { comment, rating } = req.body;

//     if (!req.user) {
//       return res
//         .status(401)
//         .json({ success: false, message: "User is not authenticated" });
//     }

//     const design = await Design.findById(req.params.id);
//     if (!design) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Design not found" });
//     }

//     const review = {
//       name: req.user.userName,
//       rating: Number(rating),
//       comment: comment,
//       user: req.user._id,
//     };

//     design.reviews.push(review);
//     design.numReviews = design.reviews.length;

//     const totalRating = design.reviews.reduce(
//       (acc, item) => acc + item.rating,
//       0
//     );
//     design.rating = totalRating / design.reviews.length;

//     await design.save();

//     res
//       .status(200)
//       .json({ success: true, message: "Review added successfully", design });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// export {
//   addDesigns,
//   getDesigns,
//   getDesign,
//   getMyDesigns,
//   getMyDesign,
//   deleteMyDesign,
//   updateMyDesign,
//   productReview,
// };

import Design from "../models/Design.js";
import mongoose from "mongoose";

// add design controller
const addDesigns = async (req, res) => {
  try {
    const {
      designName,
      area,
      estimateCost,
      designDescription,
      designCategory,
    } = req.body;

    // Check if required fields are empty
    if (
      !designName ||
      !area ||
      !estimateCost ||
      !designDescription ||
      !designCategory
    ) {
      return res.status(400).json({
        message: "Please fill all the required fields",
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one image",
      });
    }

    // Save design data to the database
    const design = await Design.create({
      designName,
      designCategory: designCategory,
      area,
      estimateCost,
      designDescription,
      user_id: req.user._id,
      designer_name: req.user.username,
      designImages: req.files.map((file) => file.path), // Save the paths of uploaded images
    });

    res.status(200).json({
      message: "Design added successfully",
      design,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all designs
const getDesigns = async (req, res) => {
  try {
    const designs = await Design.find({}).sort({ createdAt: -1 });
    res.status(200).json(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single design
const getDesign = async (req, res) => {
  const { id } = req.params;
  console.log("idd", id);
  try {
    const design = await Design.findById(id);
    if (!design) {
      return res.status(404).json({ error: "Design not found" });
    }
    res.status(200).json(design);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Import the Professional model

// Controller function to fetch professional designs
const getProfessionalDesigns = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = id;
    console.log("idp", user_id);

    const designs = await Design.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(designs);
    console.log(designs);
  } catch (error) {
    console.error("Error fetching professional designs:", error);
    // If an error occurs, return a 500 response with an error message
    res.status(500).json({ message: "Internal server error" });
  }
};

// };

// Get all designs (for the logged-in user)
const getMyDesigns = async (req, res) => {
  try {
    console.log("user", req.user);
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user_id = req.user._id;
    console.log("user id", user_id);

    console.log(user_id);
    const designs = await Design.find({ user_id }).sort({ createdAt: -1 });
    res.status(200).json(designs);
    console.log(designs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a design by the logged-in user
const deleteMyDesign = async (req, res) => {
  const { id } = req.params;
  try {
    const design = await Design.findOneAndDelete({
      _id: id,
      user_id: req.user._id,
    });
    if (!design) {
      return res.status(404).json({ error: "Design not found" });
    }
    res.status(200).json({ message: "Design deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a design by the logged-in user
const updateMyDesign = async (req, res) => {
  const { designName, area, estimateCost, designDescription } = req.body;
  const { designId } = req.params;
  console.log(designId, "design ididid");
  console.log(req.body, "request body");
  try {
    const design = await Design.findOneAndUpdate({ _id: designId }, req.body, {
      new: true,
    });
    if (!design) {
      return res.status(404).json({ error: "Design not found" });
    }
    res.status(200).json({ design, message: "Design updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to add a rating to a design
const addRating = async (req, res) => {
  try {
    const { _id } = req.user;
    const { star, designId } = req.body;

    // Find the design by ID
    const design = await Design.findById(designId);

    // Check if the user has already rated this design
    let alreadyRatedIndex = design.ratings.findIndex(
      (rating) => rating.postedby.toString() === _id.toString()
    );

    if (alreadyRatedIndex !== -1) {
      // If the user has already rated, update the rating
      design.ratings[alreadyRatedIndex].star = star;
      await design.save();
      res.json({ message: "Rating updated successfully", design });
    } else {
      // If the user has not rated yet, add a new rating
      design.ratings.push({ star, postedby: _id });
      await design.save();
      res.json({ message: "Rating added successfully", design });
    }
  } catch (error) {
    console.error("Error adding rating:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//controller for add rating to desing
const addRatingToDesign = async (req, res) => {
  const { designId, userId, ratingValue } = req.body;

  try {
    // Check if the user has already rated the design
    const existingRating = await Design.findOne({
      _id: designId,
      "ratings.ratedBy": userId,
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ message: "User has already rated this design" });
    }

    const updatedDesign = await Design.findByIdAndUpdate(
      designId,
      { $push: { ratings: { value: ratingValue, ratedBy: userId } } },
      { new: true }
    );

    if (!updatedDesign) {
      return res.status(404).json({ message: "Design not found" });
    }

    // Calculate total rating count and sum of all rating values
    const ratings = updatedDesign.ratings;
    const totalRatings = ratings.length;
    const totalRatingValues = ratings.reduce(
      (acc, rating) => acc + rating.value,
      0
    );

    // Calculate average rating
    const averageRating = (totalRatingValues / totalRatings).toFixed(2);

    // Update the design object with total rating count and average rating
    updatedDesign.totalRatings = totalRatings;
    updatedDesign.averageRating = averageRating;

    await updatedDesign.save(); // Save the updated design document

    res.status(200).json(updatedDesign);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  addRatingToDesign,
  addDesigns,
  getDesigns,
  getDesign,
  getMyDesigns,
 
  deleteMyDesign,
  updateMyDesign,
  getProfessionalDesigns,
  addRating,
};
