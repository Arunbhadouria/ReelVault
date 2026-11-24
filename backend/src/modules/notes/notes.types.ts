import type { z } from "zod";
import type {
  createNoteSchema,
  updateNoteSchema,
} from "./notes.validation.js";

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

export interface NoteRecord {
  id: string;
  reelId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
