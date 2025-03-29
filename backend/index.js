import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDb from "./config/connectdb.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import { updateAppointmentStatus } from "./controllers/appointmentController.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const port = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;
// CORS policy
const corsOptions = {};
app.use(cors(corsOptions));

// Database connection
connectDb(DATABASE_URL);

// JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.set("view engine", "ejs");

// Load Routes
app.use("/api/user", authRoutes);
app.use("/api/userr", userRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/report", reportRoutes);

app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});
