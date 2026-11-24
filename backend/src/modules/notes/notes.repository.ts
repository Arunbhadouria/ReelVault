import { prisma } from "../../database/prisma.js";
import type { NoteRecord } from "./notes.types.js";

/**
 * Creates a new private note attached to a Reel.
 */
export async function createNote(
  reelId: string,
  content: string,
): Promise<NoteRecord> {
  return prisma.note.create({
    data: {
      reelId,
      content,
    },
  });
}

/**
 * Retrieves all notes attached to a specific Reel in chronological order.
 *
 * Backed by index: @@index([reelId, createdAt])
 */
export async function findNotesByReelId(
  reelId: string,
): Promise<NoteRecord[]> {
  return prisma.note.findMany({
    where: { reelId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Retrieves a note by its ID while strictly validating that the parent Reel
 * is owned by the specified userId.
 *
 * This prevents Insecure Direct Object References (IDOR) even though the Note table
 * does not store a redundant userId foreign key.
 */
export async function findNoteByIdAndUserId(
  id: string,
  userId: string,
): Promise<NoteRecord | null> {
  return prisma.note.findFirst({
    where: {
      id,
      reel: {
        userId,
      },
    },
  });
}

/**
 * Updates the text content of a note by its primary key ID.
 */
export async function updateNoteById(
  id: string,
  content: string,
): Promise<NoteRecord> {
  return prisma.note.update({
    where: { id },
    data: { content },
  });
}

/**
 * Permanently deletes a note by its primary key ID.
 */
export async function deleteNoteById(
  id: string,
): Promise<NoteRecord> {
  return prisma.note.delete({
    where: { id },
  });
}
