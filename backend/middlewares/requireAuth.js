

import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserModel from "../models/User.js";

const requireAuth = async (req, res, next) => {
  // Verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  // Splitting the Bearer and token which comes from headers
  const token = authorization.split(" ")[1];
  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("Decoded Token:", decodedToken); // Log the decoded token

    // Get the userId and role from the decoded token
    const { userId, role } = decodedToken;

    // Convert userId to ObjectId type
    const userIdObject = new mongoose.Types.ObjectId(userId);
    console.log("User ID Object:", userIdObject);

    // Fetch user from database
    req.user = await UserModel.findOne({ _id: userIdObject }).select(
      "_id username"
    );
    console.log("User:", req.user); // Log the user object

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user's role to req.user
    req.user.role = role;

    next();
  } catch (error) {
    console.log("Error:", error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

export default requireAuth;
