import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const UPLOAD_DIR = "uploads";

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
  },
});

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) return cb(null, true);
  const err = new Error("Only JPG, PNG and WEBP images are supported");
  err.status = 400;
  cb(err, false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export const removeUpload = (p) => {
  if (!p || !p.replace(/\\/g, "/").startsWith(`${UPLOAD_DIR}/`)) return;
  fs.promises.unlink(p).catch(() => {});
};

export default upload;
