import { z } from "zod";

export const listExercisesQuerySchema = z.object({
  search: z.string().trim().min(1).max(80).optional(),
  trackedOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
});

export type ListExercisesQuery = z.infer<typeof listExercisesQuerySchema>;
