import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  listCategoriesHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from "./categories.controller.js";

const router = Router();

// List all categories for the authenticated user
router.get("/", authenticate, listCategoriesHandler);

// Create a new topic category
router.post("/", authenticate, createCategoryHandler);

// Rename an existing category
router.patch("/:categoryId", authenticate, updateCategoryHandler);

// Delete a category
router.delete("/:categoryId", authenticate, deleteCategoryHandler);

export default router;
