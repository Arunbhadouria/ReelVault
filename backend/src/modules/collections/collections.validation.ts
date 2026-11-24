import { z } from "zod";

export const createCollectionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Collection name is required")
      .max(150, "Collection name must not exceed 150 characters"),
    description: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();

export const updateCollectionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Collection name is required")
      .max(150, "Collection name must not exceed 150 characters")
      .optional(),
    description: z.string().trim().max(2000).nullable().optional(),
  })
  .strict();
