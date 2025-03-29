import express from "express";
import { getAllDesignsWithProfessionalDetails } from "../controllers/reportController.js";
const router = express.Router();

router.get("/designs", getAllDesignsWithProfessionalDetails);

export default router;
