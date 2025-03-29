import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {
  getAllProfessionals,
  getProfessionalById,
  updateProfessionalInfo,
  addProfessionalInfo,
  getProfessionalByProfessionalId,
} from "../controllers/professionalController.js";
import requireAuth from "../middlewares/requireAuth.js";
import upload from "../middlewares/upload.js";

// import authMiddleWare from "../middleware/AuthMiddleware.js";

const router = express.Router();

// public routes
//Route to get specific professional details
router.get("/professionals", getAllProfessionals);

router.get("/professionals/personal/:professionalId", getProfessionalById);

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.put("/:userId", upload.array("profile"), updateUser);
router.delete("/:userId", deleteUser);
// router.post("/uploads", uploadProfile)

//for professional only

//Route to add professional details
router.post("/addProfessionalDetails", requireAuth, addProfessionalInfo);

//Route to get specific professional details
router.get("/professionals/:professionalId", getProfessionalByProfessionalId);

// Route to update professional information
router.put("/professionals/:professionalId", updateProfessionalInfo);

export default router;
