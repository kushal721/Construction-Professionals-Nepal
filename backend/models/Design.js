import mongoose from "mongoose";

const { Schema } = mongoose;

export const DESIGN_CATEGORIES = [
  "Residential",
  "Commercial",
  "Apartment",
  "Villa",
  "Bungalow",
  "Traditional",
  "Modern",
  "Interior",
  "Landscape",
];

const ratingSchema = new Schema(
  {
    value: { type: Number, min: 1, max: 5, required: true },
    ratedBy: { type: String, required: true },
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    createdBy: { type: String, required: true },
    commenterName: { type: String, required: true },
  },
  { timestamps: true }
);

const designSchema = new Schema(
  {
    designName: { type: String, required: true, trim: true },
    designCategory: { type: String, required: true },
    area: { type: Number, required: true, min: 0 },
    estimateCost: { type: Number, required: true, min: 0 },
    designDescription: { type: String, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "user" },
    designer_name: { type: String, required: true },
    ratings: [ratingSchema],
    totalRatings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    designImages: { type: [String] },
    comments: [commentSchema],
  },
  { timestamps: true }
);

designSchema.index({ designName: "text", designDescription: "text", designer_name: "text" });
designSchema.index({ user_id: 1, createdAt: -1 });

designSchema.methods.recomputeRating = function () {
  const total = this.ratings.length;
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  this.totalRatings = total;
  this.averageRating = total ? Math.round((sum / total) * 100) / 100 : 0;
};

const Design = mongoose.model("Designs", designSchema);

export default Design;
