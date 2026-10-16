import mongoose from "mongoose";

const favoritesSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    designId: { type: String, required: true },
  },
  { timestamps: true }
);

favoritesSchema.index({ userId: 1, designId: 1 }, { unique: true });

const Favorite = mongoose.model("Favorites", favoritesSchema);

export default Favorite;
