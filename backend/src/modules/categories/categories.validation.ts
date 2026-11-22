import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Category name is required")
      .max(100, "Category name must not exceed 100 characters"),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Category name is required")
      .max(100, "Category name must not exceed 100 characters"),
  })
  .strict();
