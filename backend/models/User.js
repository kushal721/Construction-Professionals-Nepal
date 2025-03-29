import mongoose from "mongoose";
import jwt from "jsonwebtoken";

//Schema for All users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  contactNumber: {
    type: String,
  },
  location: {
    type: String,
  },
  role: {
    type: String,
    enum: ["client", "professional", "admin"],
    required: true,
  },
  profile: {
    type: String,
  },
});

//json web token
userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        //payload
        // userId: this._id.toString(),
        userId: this._id,
        username: this.username,
        email: this.email,
        location: this.location,
        contactNumber: this.contactNumber,
        profile: this.profile,
        role: this.role,
      },
      //signature
      process.env.JWT_SECRET_KEY,
      { expiresIn: "5d" }
    );
  } catch (error) {
    console.log(error);
  }
};

//Model

const UserModel = mongoose.model("user", userSchema);

export default UserModel;
