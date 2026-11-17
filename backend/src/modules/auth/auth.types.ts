import type { z } from "zod";
import type { registerSchema } from "./auth.validation.js";

export type RegisterInput = z.infer<typeof registerSchema>;
