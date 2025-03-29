

import mongoose from "mongoose";

const Schema = mongoose.Schema;

//  sub-schema for ratings
const ratingSchema = new Schema(
  {
    value: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    ratedBy: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

// sub-schema for comments
const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    commenterName: { type: String, required: true },
  },
  { timestamps: true }
);

// Design model
const designSchema = new Schema(
  {
    designName: {
      type: String,
      required: true,
    },
    designCategory: { type: String, required: true },
    area: {
      type: Number,
      required: true,
    },
    estimateCost: {
      type: Number,
      required: true,
    },
    designDescription: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    designer_name: {
      type: String,
      required: true,
    },
    ratings: [ratingSchema], 
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
   
    designImages: {
      type: [String], 
    },
    comments: [commentSchema], 
  },
  { timestamps: true }
);

const Design = mongoose.model("Designs", designSchema);

export default Design;
