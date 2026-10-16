import express from "express";
import requireAuth, { optionalAuth, requireRole } from "../middlewares/requireAuth.js";
import upload from "../middlewares/upload.js";
import * as auth from "../controllers/authController.js";
import * as users from "../controllers/userController.js";
import * as pros from "../controllers/professionalController.js";
import * as designs from "../controllers/designController.js";
import * as favorites from "../controllers/favoriteController.js";
import * as appts from "../controllers/appointmentController.js";
import * as chat from "../controllers/chatController.js";
import * as stats from "../controllers/statsController.js";
import { sendContactMessage } from "../controllers/contactController.js";

const router = express.Router();
const admin = [requireAuth, requireRole("admin")];
const professional = [requireAuth, requireRole("professional")];

// Auth
router.post("/auth/register", upload.array("profile", 1), auth.register);
router.post("/auth/login", auth.login);
router.post("/auth/forgot-password", auth.forgotPassword);
router.post("/auth/reset-password/:id/:token", auth.resetPassword);
router.get("/auth/me", requireAuth, auth.me);
router.put("/auth/password", requireAuth, auth.changePassword);

// Users
router.put("/users/me", requireAuth, upload.array("profile", 1), users.updateMe);
router.get("/users", ...admin, users.listUsers);
router.get("/users/:userId", users.getUser);
router.delete("/users/:userId", ...admin, users.deleteUser);

// Professionals
router.get("/professionals", pros.listProfessionals);
router.get("/professionals/me/details", ...professional, pros.getMyDetails);
router.put("/professionals/me/details", ...professional, pros.upsertMyDetails);
router.get("/professionals/:id", pros.getProfessional);
router.get("/professionals/:professionalId/slots", appts.listProfessionalSlots);

// Designs
router.get("/designs", designs.listDesigns);
router.get("/designs/categories", designs.listCategories);
router.get("/designs/mine", ...professional, designs.listMyDesigns);
router.get("/designs/:id", optionalAuth, designs.getDesign);
router.post("/designs", ...professional, upload.array("designImages", 10), designs.createDesign);
router.patch("/designs/:id", requireAuth, upload.array("designImages", 10), designs.updateDesign);
router.delete("/designs/:id", requireAuth, designs.deleteDesign);
router.put("/designs/:id/rating", requireAuth, designs.rateDesign);
router.post("/designs/:id/comments", requireAuth, designs.addComment);
router.patch("/designs/:id/comments/:commentId", requireAuth, designs.updateComment);
router.delete("/designs/:id/comments/:commentId", requireAuth, designs.deleteComment);

// Favorites
router.get("/favorites", requireAuth, favorites.listFavorites);
router.get("/favorites/ids", requireAuth, favorites.listFavoriteIds);
router.post("/favorites/:designId", requireAuth, favorites.addFavorite);
router.delete("/favorites/:designId", requireAuth, favorites.removeFavorite);

// Availability & bookings
router.get("/slots/mine", ...professional, appts.listMySlots);
router.post("/slots", ...professional, appts.createSlot);
router.patch("/slots/:id", ...professional, appts.updateSlot);
router.delete("/slots/:id", ...professional, appts.deleteSlot);
router.get("/bookings", requireAuth, appts.listMyBookings);
router.post("/bookings", requireAuth, requireRole("client"), appts.createBooking);
router.patch("/bookings/:id/status", requireAuth, appts.updateBookingStatus);
router.delete("/bookings/:id", requireAuth, appts.deleteBooking);

// Messaging
router.get("/chats", requireAuth, chat.listChats);
router.post("/chats", requireAuth, chat.openChat);
router.get("/chats/:id/messages", requireAuth, chat.listMessages);
router.post("/chats/:id/messages", requireAuth, chat.sendMessage);

// Stats & admin
router.get("/stats/public", stats.publicStats);
router.get("/stats/dashboard", requireAuth, stats.dashboardStats);
router.get("/admin/report", ...admin, stats.adminReport);

// Contact form
router.post("/contact", sendContactMessage);

export default router;
