import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import multer from "multer";
import connectDb from "./config/connectdb.js";
import apiRoutes from "./routes/index.js";
import { initRealtime } from "./services/realtime.js";

const port = Number(process.env.PORT) || 4000;
const frontendOrigin = (process.env.REACT_FRONTEND || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

if (!process.env.JWT_SECRET_KEY) {
  console.error("JWT_SECRET_KEY is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const app = express();
app.use(cors({ origin: frontendOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", apiRoutes);
app.use("/uploads", express.static("uploads", { maxAge: "7d" }));

app.use("/api", (_req, res) => res.status(404).json({ message: "Endpoint not found" }));

// Central error handler: HttpError/validation errors map to 4xx, everything else 500.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5MB or smaller" : err.message;
    return res.status(400).json({ message });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  }
  if (err.name === "CastError") return res.status(404).json({ message: "Not found" });
  if (err instanceof SyntaxError && "body" in err) return res.status(400).json({ message: "Invalid JSON" });

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Something went wrong on our side" : err.message });
});

const server = http.createServer(app);
initRealtime(server, frontendOrigin);

connectDb(process.env.DATABASE_URL)
  .then(() => server.listen(port, () => console.log(`API + realtime listening on http://localhost:${port}`)))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
