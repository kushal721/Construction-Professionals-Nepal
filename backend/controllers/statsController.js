import UserModel from "../models/User.js";
import Design from "../models/Design.js";
import Favorite from "../models/Favorite.js";
import ProfessionalModel from "../models/Professional.js";
import { Appointment, Booking } from "../models/Appointment.js";
import { asyncHandler } from "../utils/http.js";

const countBy = async (Model, field, match = {}) => {
  const rows = await Model.aggregate([{ $match: match }, { $group: { _id: `$${field}`, count: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id ?? "unknown", r.count]));
};

// Last 6 calendar months as { label: "Jan", count } for a collection.
const monthlySeries = async (Model, match = {}) => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const rows = await Model.aggregate([
    { $match: { ...match, createdAt: { $gte: from } } },
    { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
  ]);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const row = rows.find((r) => r._id.y === d.getFullYear() && r._id.m === d.getMonth() + 1);
    return { label: d.toLocaleString("en", { month: "short" }), count: row?.count || 0 };
  });
};

export const publicStats = asyncHandler(async (_req, res) => {
  const [designs, professionals, clients, bookings, categories] = await Promise.all([
    Design.countDocuments(),
    UserModel.countDocuments({ role: "professional" }),
    UserModel.countDocuments({ role: "client" }),
    Booking.countDocuments({ status: { $in: ["confirmed", "completed"] } }),
    countBy(Design, "designCategory"),
  ]);
  res.json({ designs, professionals, clients, bookings, categories });
});

export const dashboardStats = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;

  if (role === "admin") {
    const [users, designs, bookings, roles, categories, bookingStatus, userGrowth, designGrowth] =
      await Promise.all([
        UserModel.countDocuments(),
        Design.countDocuments(),
        Booking.countDocuments(),
        countBy(UserModel, "role"),
        countBy(Design, "designCategory"),
        countBy(Booking, "status"),
        monthlySeries(UserModel),
        monthlySeries(Design),
      ]);
    const topDesigns = await Design.find().select("designName designer_name averageRating totalRatings designImages")
      .sort({ averageRating: -1, totalRatings: -1 }).limit(5).lean();
    return res.json({ users, designs, bookings, roles, categories, bookingStatus, userGrowth, designGrowth, topDesigns });
  }

  if (role === "professional") {
    const [designs, bookingStatus, upcomingSlots, ratingAgg, hasDetails, bookingGrowth] = await Promise.all([
      Design.find({ user_id: _id }).select("designName averageRating totalRatings comments designImages").lean(),
      countBy(Booking, "status", { professional: _id }),
      Appointment.countDocuments({ professional: _id, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
      Design.aggregate([
        { $match: { user_id: _id } },
        { $group: { _id: null, sum: { $sum: { $multiply: ["$averageRating", "$totalRatings"] } }, n: { $sum: "$totalRatings" } } },
      ]),
      ProfessionalModel.exists({ professionalId: _id }),
      monthlySeries(Booking, { professional: _id }),
    ]);
    const favorites = await Favorite.countDocuments({ designId: { $in: designs.map((d) => d._id.toString()) } });
    const r = ratingAgg[0];
    return res.json({
      designCount: designs.length,
      commentCount: designs.reduce((a, d) => a + d.comments.length, 0),
      favorites,
      averageRating: r?.n ? Math.round((r.sum / r.n) * 10) / 10 : 0,
      ratingCount: r?.n || 0,
      bookingStatus,
      upcomingSlots,
      profileComplete: Boolean(hasDetails),
      bookingGrowth,
      topDesigns: designs
        .sort((a, b) => b.averageRating - a.averageRating || b.totalRatings - a.totalRatings)
        .slice(0, 5)
        .map(({ comments, ...d }) => ({ ...d, commentCount: comments.length })),
    });
  }

  const [bookingStatus, favorites] = await Promise.all([
    countBy(Booking, "status", { client: _id }),
    Favorite.countDocuments({ userId: _id.toString() }),
  ]);
  res.json({ bookingStatus, favorites });
});

// Admin report: every professional with their profile details and designs.
export const adminReport = asyncHandler(async (_req, res) => {
  const pros = await UserModel.find({ role: "professional" }).select("-password").sort({ username: 1 }).lean();
  const ids = pros.map((p) => p._id);
  const [details, designs, bookings] = await Promise.all([
    ProfessionalModel.find({ professionalId: { $in: ids } }).lean(),
    Design.find({ user_id: { $in: ids } }).select("designName designCategory area estimateCost averageRating totalRatings createdAt user_id").lean(),
    countBy(Booking, "professional"),
  ]);
  res.json(
    pros.map((p) => ({
      professional: p,
      details: details.find((d) => d.professionalId.toString() === p._id.toString()) || null,
      designs: designs.filter((d) => d.user_id?.toString() === p._id.toString()),
      bookingCount: bookings[p._id.toString()] || 0,
    }))
  );
});
