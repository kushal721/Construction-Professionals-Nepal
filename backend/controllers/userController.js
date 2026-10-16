import UserModel, { PUBLIC_USER_FIELDS } from "../models/User.js";
import Design from "../models/Design.js";
import Favorite from "../models/Favorite.js";
import ProfessionalModel from "../models/Professional.js";
import { Appointment, Booking } from "../models/Appointment.js";
import { removeUpload } from "../middlewares/upload.js";
import { HttpError, asyncHandler, assertObjectId, escapeRegex } from "../utils/http.js";

// Admin: list users with optional role filter and search.
export const listUsers = asyncHandler(async (req, res) => {
  const { role, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ username: rx }, { email: rx }, { location: rx }];
  }
  const users = await UserModel.find(filter).select("-password").sort({ createdAt: -1 });
  res.json(users);
});

export const getUser = asyncHandler(async (req, res) => {
  assertObjectId(req.params.userId, "User");
  const user = await UserModel.findById(req.params.userId).select(PUBLIC_USER_FIELDS);
  if (!user) throw new HttpError(404, "User not found");
  res.json(user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const uploaded = req.files?.[0]?.path;
  const user = await UserModel.findById(req.user._id);
  const { username, email, contactNumber, location } = req.body;

  if (email && email.toLowerCase().trim() !== user.email) {
    const taken = await UserModel.exists({ email: email.toLowerCase().trim(), _id: { $ne: user._id } });
    if (taken) {
      removeUpload(uploaded);
      throw new HttpError(409, "That email is already in use");
    }
    user.email = email;
  }
  if (username) user.username = username;
  if (contactNumber !== undefined) user.contactNumber = contactNumber;
  if (location !== undefined) user.location = location;
  if (uploaded) {
    removeUpload(user.profile);
    user.profile = uploaded;
  }
  await user.save();

  if (username) {
    await Design.updateMany({ user_id: user._id }, { designer_name: user.username });
  }
  res.json({ message: "Profile updated", user: user.toJSON() });
});

// Admin: delete a user and everything they own.
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  assertObjectId(userId, "User");
  if (userId === req.user._id.toString()) {
    throw new HttpError(400, "You cannot delete your own admin account");
  }
  const user = await UserModel.findByIdAndDelete(userId);
  if (!user) throw new HttpError(404, "User not found");

  const designs = await Design.find({ user_id: userId }).select("_id designImages");
  designs.forEach((d) => d.designImages.forEach(removeUpload));
  await Promise.all([
    Design.deleteMany({ user_id: userId }),
    Favorite.deleteMany({
      $or: [{ userId }, { designId: { $in: designs.map((d) => d._id.toString()) } }],
    }),
    ProfessionalModel.deleteOne({ professionalId: userId }),
    Appointment.deleteMany({ professional: userId }),
    Booking.deleteMany({ $or: [{ client: userId }, { professional: userId }] }),
  ]);
  removeUpload(user.profile);
  res.json({ message: "User deleted" });
});
