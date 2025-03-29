import Favorite from "../models/Favorite.js";
import Design from "../models/Design.js";
import mongoose from "mongoose";

// Controller to add a favorite
const addToFavorites = async (req, res) => {
  try {
    const { userId, designId } = req.body;

    // Check if the favorite already exists
    const existingFavorite = await Favorite.findOne({ userId, designId });
    if (existingFavorite) {
      return res
        .status(400)
        .json({ message: "This item is already in favorites" });
    }

    // Create a new favorite
    const newFavorite = new Favorite({ userId, designId });
    await newFavorite.save();

    res.status(201).json({ message: "Item added to favorites successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//controller to get favorites
const getAllFavorites = async (req, res) => {
  try {
    const userId = req.user._id; // Retrieve user ID from the authenticated user
    console.log("Userrrr ID:", userId);

    const favorites = await Favorite.find({ userId }).populate("designId");

    // Map over favorites and populate design details
    const favoritesWithDesigns = await Promise.all(
      favorites.map(async (favorite) => {
        if (favorite.designId) {
          const design = await Design.findById(favorite.designId);
          return {
            ...favorite.toObject(),
            design: design ? design.toObject() : null, // Add design details if found, otherwise null
          };
        } else {
          return {
            ...favorite.toObject(),
            design: null, // No design found, so set it to null
          };
        }
      })
    );

    res.json(favoritesWithDesigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to remove a favorite
const removeFromFavorites = async (req, res) => {
  try {
    const { userId, designId } = req.body;

    await Favorite.findOneAndDelete({ userId, designId });

    res.json({ message: "Item removed from favorites successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addToFavorites, getAllFavorites, removeFromFavorites };
