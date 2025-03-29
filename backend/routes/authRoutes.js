import express, { request } from "express";
const router = express.Router();
import UserController from "../controllers/authController.js";

import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import requireAuth from "../middlewares/requireAuth.js";

import {} from "../controllers/professionalController.js";
import upload from "../middlewares/upload.js";

// Public Routes
router.post(
  "/user-register",
  upload.array("profile"),
  UserController.userRegistration
);
//for user login
router.post("/user-login", UserController.userLogin);

//for sending user reset email
router.post(
  "/user-send-reset-password-email",
  UserController.sendUserPasswordResetEmail
);
router.post("/userPasswordReset/:id/:token", UserController.userPasswordReset);

router.get("/forgotPassword/:id/:token", async (req, res) => {
  console.log("ok");

  const { id, token } = req.params;

  const { email } = jwt.decode(token);
  // const decodedtoken = jwt.decode(token);
  // console.log("decodedste", decodedtoken);
  res.render("forgotPassword", { id, token, email, status: "verified" });
});

router.use(requireAuth);
router.put("/user-changePassword", UserController.changePassword);
router.get("/loggedUser", UserController.loggedUser);

export default router;
