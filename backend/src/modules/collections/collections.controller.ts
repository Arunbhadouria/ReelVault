import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getUserCollections,
  createCollection,
  getCollectionById,
  updateCollection,
  deleteCollection,
  addReelToCollection,
  removeReelFromCollection,
} from "./collections.service.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "./collections.validation.js";

const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Lists all collections owned by the user.
 *
 * Route: GET /api/v1/collections
 * Security: Bearer JWT
 */
export async function listCollectionsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const collections = await getUserCollections(userId);

    res.status(200).json({
      collections,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new collection.
 *
 * Route: POST /api/v1/collections
 * Security: Bearer JWT
 */
export async function createCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const result = createCollectionSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
      return;
    }

    const collection = await createCollection(userId, result.data);

    res.status(201).json({
      collection,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single collection by ID.
 *
 * Route: GET /api/v1/collections/:collectionId
 * Security: Bearer JWT
 */
export async function getCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const paramResult = uuidSchema.safeParse(req.params.collectionId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    const collection = await getCollectionById(paramResult.data, userId);

    res.status(200).json({
      collection,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an existing collection.
 *
 * Route: PATCH /api/v1/collections/:collectionId
 * Security: Bearer JWT
 */
export async function updateCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const paramResult = uuidSchema.safeParse(req.params.collectionId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    const bodyResult = updateCollectionSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: bodyResult.error.issues,
      });
      return;
    }

    const collection = await updateCollection(
      paramResult.data,
      userId,
      bodyResult.data,
    );

    res.status(200).json({
      collection,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a collection.
 *
 * Route: DELETE /api/v1/collections/:collectionId
 * Security: Bearer JWT
 */
export async function deleteCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const paramResult = uuidSchema.safeParse(req.params.collectionId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    await deleteCollection(paramResult.data, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Adds a Reel to a Collection.
 *
 * Route: POST /api/v1/reels/:reelId/collections/:collectionId
 * Security: Bearer JWT
 */
export async function assignReelCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const reelIdResult = uuidSchema.safeParse(req.params.reelId);
    const collectionIdResult = uuidSchema.safeParse(req.params.collectionId);

    if (!reelIdResult.success || !collectionIdResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: [
          ...(reelIdResult.success ? [] : reelIdResult.error.issues),
          ...(collectionIdResult.success ? [] : collectionIdResult.error.issues),
        ],
      });
      return;
    }

    await addReelToCollection(
      reelIdResult.data,
      collectionIdResult.data,
      userId,
    );

    res.status(200).json({
      message: "Reel successfully added to collection",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Removes a Reel from a Collection.
 *
 * Route: DELETE /api/v1/reels/:reelId/collections/:collectionId
 * Security: Bearer JWT
 */
export async function removeReelCollectionHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const reelIdResult = uuidSchema.safeParse(req.params.reelId);
    const collectionIdResult = uuidSchema.safeParse(req.params.collectionId);

    if (!reelIdResult.success || !collectionIdResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: [
          ...(reelIdResult.success ? [] : reelIdResult.error.issues),
          ...(collectionIdResult.success ? [] : collectionIdResult.error.issues),
        ],
      });
      return;
    }

    await removeReelFromCollection(
      reelIdResult.data,
      collectionIdResult.data,
      userId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
