import { findReelByIdAndUserId } from "../reels/reels.repository.js";
import {
  createNote as createNoteRepo,
  deleteNoteById,
  findNoteByIdAndUserId,
  findNotesByReelId,
  updateNoteById,
} from "./notes.repository.js";
import type {
  CreateNoteInput,
  NoteRecord,
  UpdateNoteInput,
} from "./notes.types.js";

/**
 * Creates a new private note attached to a Reel after verifying Reel ownership.
 */
export async function addNoteToReel(
  reelId: string,
  userId: string,
  input: CreateNoteInput,
): Promise<NoteRecord> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  return createNoteRepo(reelId, input.content);
}

/**
 * Lists all notes for a specific Reel in chronological order after verifying Reel ownership.
 */
export async function getNotesForReel(
  reelId: string,
  userId: string,
): Promise<NoteRecord[]> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  return findNotesByReelId(reelId);
}

/**
 * Updates the content of a note after verifying user ownership via the parent Reel.
 */
export async function updateNote(
  noteId: string,
  userId: string,
  input: UpdateNoteInput,
): Promise<NoteRecord> {
  const existingNote = await findNoteByIdAndUserId(noteId, userId);
  if (!existingNote) {
    throw new Error("Note not found");
  }

  return updateNoteById(noteId, input.content);
}

/**
 * Deletes a note after verifying user ownership via the parent Reel.
 */
export async function deleteNote(
  noteId: string,
  userId: string,
): Promise<void> {
  const existingNote = await findNoteByIdAndUserId(noteId, userId);
  if (!existingNote) {
    throw new Error("Note not found");
  }

  await deleteNoteById(noteId);
}
