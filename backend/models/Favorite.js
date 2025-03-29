
import mongoose from "mongoose";

// favorites schema
const favoritesSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    designId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Favorite = mongoose.model("Favorites", favoritesSchema);

export default Favorite;
