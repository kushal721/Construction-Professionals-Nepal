import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    contactNumber: { type: String, trim: true },
    location: { type: String, trim: true },
    role: {
      type: String,
      enum: ["client", "professional", "admin"],
      required: true,
    },
    profile: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 });

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { userId: this._id.toString(), role: this.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
};

// Fields that are safe to expose about any user to anyone.
export const PUBLIC_USER_FIELDS = "username profile location role createdAt";

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
