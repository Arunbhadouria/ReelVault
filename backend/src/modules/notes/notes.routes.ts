import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  deleteNoteHandler,
  updateNoteHandler,
} from "./notes.controller.js";

const router = Router();

// Update an existing note
router.patch("/:noteId", authenticate, updateNoteHandler);

// Delete an existing note
router.delete("/:noteId", authenticate, deleteNoteHandler);

export default router;
