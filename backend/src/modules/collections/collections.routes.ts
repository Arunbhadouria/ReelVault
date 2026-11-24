import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  listCollectionsHandler,
  createCollectionHandler,
  getCollectionHandler,
  updateCollectionHandler,
  deleteCollectionHandler,
} from "./collections.controller.js";

const router = Router();

// List all collections for the authenticated user
router.get("/", authenticate, listCollectionsHandler);

// Create a new collection
router.post("/", authenticate, createCollectionHandler);

// Retrieve single collection by ID
router.get("/:collectionId", authenticate, getCollectionHandler);

// Update an existing collection
router.patch("/:collectionId", authenticate, updateCollectionHandler);

// Delete a collection
router.delete("/:collectionId", authenticate, deleteCollectionHandler);

export default router;
