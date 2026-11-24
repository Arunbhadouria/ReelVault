import type { z } from "zod";
import type {
  createCollectionSchema,
  updateCollectionSchema,
} from "./collections.validation.js";

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

export interface CollectionRecord {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  reelsCount?: number;
}
