import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  saveReelHandler,
  listReelsHandler,
  getReelHandler,
  updateReelHandler,
  deleteReelHandler,
} from "./reels.controller.js";
import {
  assignReelCategoryHandler,
  removeReelCategoryHandler,
} from "../categories/categories.controller.js";

const router = Router();

// Save a Reel (Idempotent: 201 Created or 200 OK)
router.post("/", authenticate, saveReelHandler);

// List saved Reels library (Paginated, filtered, sorted)
router.get("/", authenticate, listReelsHandler);

// Retrieve single Reel by ID
router.get("/:reelId", authenticate, getReelHandler);

// Update editable Reel fields
router.patch("/:reelId", authenticate, updateReelHandler);

// Delete saved Reel
router.delete("/:reelId", authenticate, deleteReelHandler);

// Category Associations (Many-to-Many junction routes)
router.post(
  "/:reelId/categories/:categoryId",
  authenticate,
  assignReelCategoryHandler,
);
router.delete(
  "/:reelId/categories/:categoryId",
  authenticate,
  removeReelCategoryHandler,
);

export default router;
