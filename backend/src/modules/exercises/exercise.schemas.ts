import { z } from "zod";

import { exerciseCategories } from "./exercise.types.js";

export const listExercisesQuerySchema = z.object({
  search: z.string().trim().min(1).max(80).optional(),
  trackedOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  category: z.enum(exerciseCategories).optional(),
  muscleId: z.string().trim().min(1).max(80).optional()
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
