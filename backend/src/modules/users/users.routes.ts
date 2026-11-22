import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import { getMe, deleteMe } from "./users.controller.js";

const router = Router();

// Retrieve authenticated user's account
router.get("/me", authenticate, getMe);

// Permanently delete authenticated user's account
router.delete("/me", authenticate, deleteMe);

export default router;
