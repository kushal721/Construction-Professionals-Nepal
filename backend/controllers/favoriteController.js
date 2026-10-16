import Favorite from "../models/Favorite.js";
import Design from "../models/Design.js";
import { HttpError, asyncHandler, assertObjectId } from "../utils/http.js";

export const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 }).lean();
  const designs = await Design.find({ _id: { $in: favorites.map((f) => f.designId) } })
    .select("-comments -ratings")
    .lean();
  const byId = new Map(designs.map((d) => [d._id.toString(), d]));
  // Preserve "most recently saved first" ordering and drop deleted designs.
  res.json(favorites.map((f) => byId.get(f.designId)).filter(Boolean));
});

export const listFavoriteIds = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user._id.toString() }).select("designId").lean();
  res.json(favorites.map((f) => f.designId));
});

export const addFavorite = asyncHandler(async (req, res) => {
  const { designId } = req.params;
  assertObjectId(designId, "Design");
  if (!(await Design.exists({ _id: designId }))) throw new HttpError(404, "Design not found");
  await Favorite.updateOne(
    { userId: req.user._id.toString(), designId },
    { $setOnInsert: { userId: req.user._id.toString(), designId } },
    { upsert: true }
  );
  res.status(201).json({ message: "Saved to favorites" });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  await Favorite.deleteOne({ userId: req.user._id.toString(), designId: req.params.designId });
  res.json({ message: "Removed from favorites" });
});
