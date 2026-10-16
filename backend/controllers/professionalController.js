import UserModel, { PUBLIC_USER_FIELDS } from "../models/User.js";
import ProfessionalModel from "../models/Professional.js";
import Design from "../models/Design.js";
import { Appointment } from "../models/Appointment.js";
import { HttpError, asyncHandler, assertObjectId, escapeRegex } from "../utils/http.js";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// Per-professional design count and average rating, keyed by user id.
const designStatsFor = async (ids) => {
  const rows = await Design.aggregate([
    { $match: { user_id: { $in: ids } } },
    {
      $group: {
        _id: "$user_id",
        designCount: { $sum: 1 },
        ratingSum: { $sum: { $multiply: ["$averageRating", "$totalRatings"] } },
        ratingCount: { $sum: "$totalRatings" },
      },
    },
  ]);
  return new Map(
    rows.map((r) => [
      r._id.toString(),
      {
        designCount: r.designCount,
        ratingCount: r.ratingCount,
        averageRating: r.ratingCount ? Math.round((r.ratingSum / r.ratingCount) * 10) / 10 : 0,
      },
    ])
  );
};

export const listProfessionals = asyncHandler(async (req, res) => {
  const { q, specialization, location } = req.query;
  const users = await UserModel.find({ role: "professional" })
    .select(PUBLIC_USER_FIELDS)
    .sort({ createdAt: -1 })
    .lean();
  const ids = users.map((u) => u._id);
  const [details, stats] = await Promise.all([
    ProfessionalModel.find({ professionalId: { $in: ids } }).lean(),
    designStatsFor(ids),
  ]);
  const detailsById = new Map(details.map((d) => [d.professionalId.toString(), d]));

  const qRx = q && new RegExp(escapeRegex(q), "i");
  const specRx = specialization && new RegExp(escapeRegex(specialization), "i");
  const locRx = location && new RegExp(escapeRegex(location), "i");

  const result = users
    .map((u) => ({
      ...u,
      details: detailsById.get(u._id.toString()) || null,
      ...(stats.get(u._id.toString()) || { designCount: 0, ratingCount: 0, averageRating: 0 }),
    }))
    .filter((u) => {
      const d = u.details || {};
      if (qRx && ![u.username, u.location, d.specialization, d.skills].some((v) => qRx.test(v || ""))) return false;
      if (specRx && !specRx.test(d.specialization || "")) return false;
      if (locRx && !locRx.test(u.location || "")) return false;
      return true;
    });

  res.json(result);
});

export const getProfessional = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertObjectId(id, "Professional");
  const user = await UserModel.findOne({ _id: id, role: "professional" })
    .select(`${PUBLIC_USER_FIELDS} contactNumber email`)
    .lean();
  if (!user) throw new HttpError(404, "Professional not found");

  const [details, designs, slots, stats] = await Promise.all([
    ProfessionalModel.findOne({ professionalId: id }).lean(),
    Design.find({ user_id: id }).select("-comments -ratings").sort({ createdAt: -1 }).lean(),
    Appointment.find({ professional: id, date: { $gte: startOfToday() } }).sort({ date: 1, startTime: 1 }).lean(),
    designStatsFor([user._id]),
  ]);

  res.json({
    ...user,
    details,
    designs,
    upcomingSlots: slots,
    ...(stats.get(id) || { designCount: 0, ratingCount: 0, averageRating: 0 }),
  });
});

export const getMyDetails = asyncHandler(async (req, res) => {
  const details = await ProfessionalModel.findOne({ professionalId: req.user._id });
  res.json(details);
});

export const upsertMyDetails = asyncHandler(async (req, res) => {
  const fields = ["specialization", "experience", "description", "skills", "education"];
  const update = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = String(req.body[f]).trim();
  });
  const details = await ProfessionalModel.findOneAndUpdate(
    { professionalId: req.user._id },
    { $set: update, $setOnInsert: { professionalId: req.user._id } },
    { new: true, upsert: true }
  );
  res.json({ message: "Professional details saved", details });
});
