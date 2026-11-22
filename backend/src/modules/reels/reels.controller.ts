import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  saveReel,
  getReelsLibrary,
  getReelById,
  updateReel,
  deleteReel,
} from "./reels.service.js";
import {
  createReelSchema,
  updateReelSchema,
  reelsQuerySchema,
} from "./reels.validation.js";

const uuidSchema = z.string().uuid("Invalid Reel UUID");

/**
 * Saves an Instagram Reel.
 *
 * Route: POST /api/v1/reels
 * Security: Bearer JWT
 * Responses:
 * - 201 Created (new record)
 * - 200 OK (duplicate record)
 */
export async function saveReelHandler(
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

    const result = createReelSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
      return;
    }

    const { reel, isDuplicate } = await saveReel(userId, result.data);

    res.status(isDuplicate ? 200 : 201).json({
      reel,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves the user's saved Reels library with pagination, filtering, and sorting.
 *
 * Route: GET /api/v1/reels
 * Security: Bearer JWT
 */
export async function listReelsHandler(
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

    const result = reelsQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
      return;
    }

    const data = await getReelsLibrary(userId, result.data);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieves a single saved Reel by ID.
 *
 * Route: GET /api/v1/reels/:reelId
 * Security: Bearer JWT
 */
export async function getReelHandler(
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

    const paramResult = uuidSchema.safeParse(req.params.reelId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    const reel = await getReelById(paramResult.data, userId);

    res.status(200).json({
      reel,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates mutable fields of a saved Reel.
 *
 * Route: PATCH /api/v1/reels/:reelId
 * Security: Bearer JWT
 */
export async function updateReelHandler(
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

    const paramResult = uuidSchema.safeParse(req.params.reelId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    const bodyResult = updateReelSchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: bodyResult.error.issues,
      });
      return;
    }

    const reel = await updateReel(paramResult.data, userId, bodyResult.data);

    res.status(200).json({
      reel,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Permanently deletes a saved Reel.
 *
 * Route: DELETE /api/v1/reels/:reelId
 * Security: Bearer JWT
 */
export async function deleteReelHandler(
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

    const paramResult = uuidSchema.safeParse(req.params.reelId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    await deleteReel(paramResult.data, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
