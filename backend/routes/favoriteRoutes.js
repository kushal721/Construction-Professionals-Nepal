import express from "express";
import {
  addToFavorites,
  getAllFavorites,
  removeFromFavorites,
} from "../controllers/favoriteController.js";

import requireAuth from "../middlewares/requireAuth.js";

const router = express.Router();

router.post("/addFavorites", addToFavorites);
router.delete("/removeFavorites", removeFromFavorites);
router.get("/getAllFavorites", requireAuth, getAllFavorites);

export default router;
