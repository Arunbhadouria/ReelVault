import { z } from "zod";

export const createNoteSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Note content cannot be empty")
      .max(5000, "Note content must not exceed 5000 characters"),
  })
  .strict();

export const updateNoteSchema = z
  .object({
    content: z
      .string()
      .trim()
      .min(1, "Note content cannot be empty")
      .max(5000, "Note content must not exceed 5000 characters"),
  })
  .strict();
