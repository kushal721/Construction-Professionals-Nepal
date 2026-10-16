import mongoose from "mongoose";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wraps an async route handler so thrown errors reach the error middleware.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const assertObjectId = (id, label = "Resource") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, `${label} not found`);
  }
};

export const requireFields = (body, fields) => {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ""
  );
  if (missing.length) {
    throw new HttpError(400, `Missing required fields: ${missing.join(", ")}`);
  }
};

export const isTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value || "");

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Stored upload paths look like "uploads/123.png" (or "uploads\\123.png" from
// older Windows-created records). Normalise to forward slashes.
export const normalizeUploadPath = (p) => (p ? p.replace(/\\/g, "/") : p);
