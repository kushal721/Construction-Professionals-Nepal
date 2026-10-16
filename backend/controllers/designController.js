import Design, { DESIGN_CATEGORIES } from "../models/Design.js";
import Favorite from "../models/Favorite.js";
import { removeUpload } from "../middlewares/upload.js";
import {
  HttpError,
  asyncHandler,
  assertObjectId,
  requireFields,
  escapeRegex,
} from "../utils/http.js";

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "price-asc": { estimateCost: 1 },
  "price-desc": { estimateCost: -1 },
  "area-asc": { area: 1 },
  "area-desc": { area: -1 },
  rating: { averageRating: -1, totalRatings: -1 },
  popular: { totalRatings: -1, averageRating: -1 },
};

const numberRange = (min, max) => {
  const range = {};
  if (min !== undefined && min !== "") range.$gte = Number(min);
  if (max !== undefined && max !== "") range.$lte = Number(max);
  return Object.keys(range).length ? range : undefined;
};

const loadOwnedDesign = async (req) => {
  const { id } = req.params;
  assertObjectId(id, "Design");
  const design = await Design.findById(id);
  if (!design) throw new HttpError(404, "Design not found");
  const isOwner = design.user_id?.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new HttpError(403, "You can only manage your own designs");
  }
  return design;
};

const parseDesignBody = (body) => {
  const out = {};
  ["designName", "designCategory", "designDescription"].forEach((f) => {
    if (body[f] !== undefined) out[f] = String(body[f]).trim();
  });
  ["area", "estimateCost"].forEach((f) => {
    if (body[f] !== undefined && body[f] !== "") {
      const n = Number(body[f]);
      if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `${f} must be a positive number`);
      out[f] = n;
    }
  });
  return out;
};

export const listCategories = (_req, res) => res.json(DESIGN_CATEGORIES);

export const listDesigns = asyncHandler(async (req, res) => {
  const { q, category, minCost, maxCost, minArea, maxArea, designer, sort = "newest" } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(req.query.limit, 10) || 12));

  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ designName: rx }, { designDescription: rx }, { designer_name: rx }, { designCategory: rx }];
  }
  if (category) filter.designCategory = category;
  if (designer) {
    assertObjectId(designer, "Designer");
    filter.user_id = designer;
  }
  const cost = numberRange(minCost, maxCost);
  if (cost) filter.estimateCost = cost;
  const area = numberRange(minArea, maxArea);
  if (area) filter.area = area;

  const [items, total] = await Promise.all([
    Design.find(filter)
      .select("-comments -ratings")
      .sort(SORTS[sort] || SORTS.newest)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Design.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit });
});

export const getDesign = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Design");
  const design = await Design.findById(req.params.id)
    .populate("user_id", "username profile location role createdAt")
    .lean();
  if (!design) throw new HttpError(404, "Design not found");

  const userId = req.user?._id?.toString();
  const myRating = userId ? design.ratings.find((r) => r.ratedBy === userId)?.value || 0 : 0;
  const isFavorite = userId ? Boolean(await Favorite.exists({ userId, designId: req.params.id })) : false;
  const related = await Design.find({
    _id: { $ne: design._id },
    designCategory: design.designCategory,
  })
    .select("-comments -ratings")
    .sort({ averageRating: -1 })
    .limit(4)
    .lean();

  const { ratings, user_id, ...rest } = design;
  res.json({
    ...rest,
    designer: user_id,
    user_id: user_id?._id,
    comments: [...design.comments].reverse(),
    myRating,
    isFavorite,
    related,
  });
});

export const listMyDesigns = asyncHandler(async (req, res) => {
  const designs = await Design.find({ user_id: req.user._id }).select("-ratings").sort({ createdAt: -1 }).lean();
  res.json(designs.map((d) => ({ ...d, commentCount: d.comments.length, comments: undefined })));
});

export const createDesign = asyncHandler(async (req, res) => {
  const images = (req.files || []).map((f) => f.path);
  try {
    requireFields(req.body, ["designName", "designCategory", "area", "estimateCost", "designDescription"]);
    if (!images.length) throw new HttpError(400, "Upload at least one image");
    const design = await Design.create({
      ...parseDesignBody(req.body),
      user_id: req.user._id,
      designer_name: req.user.username,
      designImages: images,
    });
    res.status(201).json({ message: "Design published", design });
  } catch (err) {
    images.forEach(removeUpload);
    throw err;
  }
});

// Accepts multipart: new images in `designImages`, and `keepImages` (JSON
// array of existing paths to keep). Omitting keepImages keeps all.
export const updateDesign = asyncHandler(async (req, res) => {
  const added = (req.files || []).map((f) => f.path);
  try {
    const design = await loadOwnedDesign(req);
    Object.assign(design, parseDesignBody(req.body));

    let keep = design.designImages;
    if (req.body.keepImages !== undefined) {
      const requested = JSON.parse(req.body.keepImages);
      keep = design.designImages.filter((p) => requested.includes(p));
      design.designImages.filter((p) => !keep.includes(p)).forEach(removeUpload);
    }
    design.designImages = [...keep, ...added];
    if (!design.designImages.length) throw new HttpError(400, "A design needs at least one image");

    await design.save();
    res.json({ message: "Design updated", design });
  } catch (err) {
    added.forEach(removeUpload);
    throw err;
  }
});

export const deleteDesign = asyncHandler(async (req, res) => {
  const design = await loadOwnedDesign(req);
  await design.deleteOne();
  design.designImages.forEach(removeUpload);
  await Favorite.deleteMany({ designId: design._id.toString() });
  res.json({ message: "Design deleted" });
});

export const rateDesign = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Design");
  const value = Number(req.body.value);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new HttpError(400, "Rating must be a whole number from 1 to 5");
  }
  const design = await Design.findById(req.params.id);
  if (!design) throw new HttpError(404, "Design not found");
  if (design.user_id?.toString() === req.user._id.toString()) {
    throw new HttpError(400, "You can't rate your own design");
  }

  const userId = req.user._id.toString();
  const existing = design.ratings.find((r) => r.ratedBy === userId);
  if (existing) existing.value = value;
  else design.ratings.push({ value, ratedBy: userId });
  design.recomputeRating();
  await design.save();

  res.json({
    message: existing ? "Rating updated" : "Thanks for rating",
    averageRating: design.averageRating,
    totalRatings: design.totalRatings,
    myRating: value,
  });
});

export const addComment = asyncHandler(async (req, res) => {
  assertObjectId(req.params.id, "Design");
  requireFields(req.body, ["content"]);
  const design = await Design.findById(req.params.id);
  if (!design) throw new HttpError(404, "Design not found");
  design.comments.push({
    content: req.body.content,
    createdBy: req.user._id.toString(),
    commenterName: req.user.username,
  });
  await design.save();
  res.status(201).json({ message: "Comment posted", comment: design.comments.at(-1) });
});

const loadComment = async (req) => {
  assertObjectId(req.params.id, "Design");
  const design = await Design.findById(req.params.id);
  if (!design) throw new HttpError(404, "Design not found");
  const comment = design.comments.id(req.params.commentId);
  if (!comment) throw new HttpError(404, "Comment not found");
  return { design, comment };
};

export const updateComment = asyncHandler(async (req, res) => {
  requireFields(req.body, ["content"]);
  const { design, comment } = await loadComment(req);
  if (comment.createdBy !== req.user._id.toString()) {
    throw new HttpError(403, "You can only edit your own comments");
  }
  comment.content = req.body.content;
  await design.save();
  res.json({ message: "Comment updated", comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { design, comment } = await loadComment(req);
  const userId = req.user._id.toString();
  const canDelete =
    comment.createdBy === userId ||
    design.user_id?.toString() === userId ||
    req.user.role === "admin";
  if (!canDelete) throw new HttpError(403, "You can't delete this comment");
  comment.deleteOne();
  await design.save();
  res.json({ message: "Comment deleted" });
});
