import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";
import { sendMail } from "../config/emailConfig.js";
import { removeUpload } from "../middlewares/upload.js";
import { HttpError, asyncHandler, requireFields, assertObjectId } from "../utils/http.js";

const MIN_PASSWORD = 8;
const SELF_REGISTER_ROLES = ["client", "professional"];

const authPayload = (user) => ({
  token: user.generateToken(),
  user: user.toJSON(),
});

export const register = asyncHandler(async (req, res) => {
  const uploaded = req.files?.[0]?.path;
  try {
    requireFields(req.body, ["username", "email", "password", "role"]);
    const { username, email, password, contactNumber, location, role } = req.body;

    if (!SELF_REGISTER_ROLES.includes(role)) {
      throw new HttpError(400, "Role must be client or professional");
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "Enter a valid email");
    if (password.length < MIN_PASSWORD) {
      throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
    }
    if (await UserModel.exists({ email: email.toLowerCase().trim() })) {
      throw new HttpError(409, "An account with this email already exists");
    }

    const user = await UserModel.create({
      username,
      email,
      contactNumber,
      location,
      role,
      password: await bcrypt.hash(password, 10),
      profile: uploaded || "",
    });

    res.status(201).json({ message: "Account created", ...authPayload(user) });
  } catch (err) {
    removeUpload(uploaded);
    throw err;
  }
});

export const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email", "password"]);
  const user = await UserModel.findOne({ email: req.body.email.toLowerCase().trim() });
  // Same message for unknown email and wrong password to avoid account enumeration.
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new HttpError(401, "Incorrect email or password");
  }
  res.json({ message: "Signed in", ...authPayload(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["currentPassword", "newPassword"]);
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user._id);
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    throw new HttpError(400, "Current password is incorrect");
  }
  if (newPassword.length < MIN_PASSWORD) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: "Password updated" });
});

// The reset token is signed with the current password hash, so it becomes
// invalid as soon as the password changes (single use).
const resetSecret = (user) => user.password + process.env.JWT_SECRET_KEY;

export const forgotPassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ["email"]);
  const user = await UserModel.findOne({ email: req.body.email.toLowerCase().trim() });
  if (user) {
    const token = jwt.sign({ userId: user._id.toString() }, resetSecret(user), {
      expiresIn: "15m",
    });
    const frontend = process.env.REACT_FRONTEND || "http://localhost:5173";
    const link = `${frontend}/reset-password/${user._id}/${token}`;
    await sendMail({
      to: user.email,
      subject: "Reset your Construction Professionals Nepal password",
      text: `Reset your password (valid for 15 minutes): ${link}`,
      html: `<p>Hi ${user.username},</p><p><a href="${link}">Reset your password</a>. This link is valid for 15 minutes.</p><p>If you didn't request this, you can ignore this email.</p>`,
    });
  }
  // Always respond the same way so the endpoint can't be used to probe emails.
  res.json({ message: "If that email is registered, a reset link is on its way" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { id, token } = req.params;
  assertObjectId(id, "User");
  requireFields(req.body, ["password"]);
  if (req.body.password.length < MIN_PASSWORD) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
  }
  const user = await UserModel.findById(id);
  if (!user) throw new HttpError(400, "Reset link is invalid");
  try {
    jwt.verify(token, resetSecret(user));
  } catch {
    throw new HttpError(400, "Reset link is invalid or has expired");
  }
  user.password = await bcrypt.hash(req.body.password, 10);
  await user.save();
  res.json({ message: "Password reset. You can sign in now." });
});
