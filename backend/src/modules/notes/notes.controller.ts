import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  addNoteToReel,
  deleteNote,
  getNotesForReel,
  updateNote,
} from "./notes.service.js";
import {
  createNoteSchema,
  updateNoteSchema,
} from "./notes.validation.js";

const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Retrieves all notes for a specific Reel in chronological order.
 *
 * Route: GET /api/v1/reels/:reelId/notes
 * Security: Bearer JWT
 */
export async function listNotesHandler(
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

    const reelIdValidation = uuidSchema.safeParse(req.params.reelId);
    if (!reelIdValidation.success) {
      res.status(400).json({
        message: "Invalid reel ID parameter",
        errors: reelIdValidation.error.issues,
      });
      return;
    }

    const notes = await getNotesForReel(reelIdValidation.data, userId);

    res.status(200).json({
      notes,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Adds a new private note to a specific Reel.
 *
 * Route: POST /api/v1/reels/:reelId/notes
 * Security: Bearer JWT
 */
export async function createNoteHandler(
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

    const reelIdValidation = uuidSchema.safeParse(req.params.reelId);
    if (!reelIdValidation.success) {
      res.status(400).json({
        message: "Invalid reel ID parameter",
        errors: reelIdValidation.error.issues,
      });
      return;
    }

    const bodyValidation = createNoteSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: bodyValidation.error.issues,
      });
      return;
    }

    const note = await addNoteToReel(
      reelIdValidation.data,
      userId,
      bodyValidation.data,
    );

    res.status(201).json({
      note,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Updates an existing note.
 *
 * Route: PATCH /api/v1/notes/:noteId
 * Security: Bearer JWT
 */
export async function updateNoteHandler(
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

    const noteIdValidation = uuidSchema.safeParse(req.params.noteId);
    if (!noteIdValidation.success) {
      res.status(400).json({
        message: "Invalid note ID parameter",
        errors: noteIdValidation.error.issues,
      });
      return;
    }

    const bodyValidation = updateNoteSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: bodyValidation.error.issues,
      });
      return;
    }

    const note = await updateNote(
      noteIdValidation.data,
      userId,
      bodyValidation.data,
    );

    res.status(200).json({
      note,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a note permanently.
 *
 * Route: DELETE /api/v1/notes/:noteId
 * Security: Bearer JWT
 */
export async function deleteNoteHandler(
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

    const noteIdValidation = uuidSchema.safeParse(req.params.noteId);
    if (!noteIdValidation.success) {
      res.status(400).json({
        message: "Invalid note ID parameter",
        errors: noteIdValidation.error.issues,
      });
      return;
    }

    await deleteNote(noteIdValidation.data, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
