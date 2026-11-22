import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  saveReelHandler,
  listReelsHandler,
  getReelHandler,
  updateReelHandler,
  deleteReelHandler,
} from "./reels.controller.js";

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

export default router;
